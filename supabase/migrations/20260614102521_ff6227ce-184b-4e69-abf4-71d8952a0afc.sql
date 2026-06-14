
-- =========================================
-- PROFILES
-- =========================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  child_name TEXT NOT NULL DEFAULT 'Friend',
  age INT NOT NULL DEFAULT 8 CHECK (age BETWEEN 4 AND 18),
  avatar TEXT NOT NULL DEFAULT 'fox',
  companion TEXT NOT NULL DEFAULT 'fox',
  xp INT NOT NULL DEFAULT 0,
  level INT NOT NULL DEFAULT 1,
  streak_days INT NOT NULL DEFAULT 0,
  last_active_date DATE,
  onboarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- =========================================
-- GAME SESSIONS
-- =========================================
CREATE TABLE public.game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  skill TEXT NOT NULL,
  difficulty_level INT NOT NULL DEFAULT 1,
  accuracy NUMERIC(5,2) NOT NULL DEFAULT 0,
  reaction_ms INT NOT NULL DEFAULT 0,
  mistakes INT NOT NULL DEFAULT 0,
  duration_sec INT NOT NULL DEFAULT 0,
  score INT NOT NULL DEFAULT 0,
  xp_earned INT NOT NULL DEFAULT 0,
  completed BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX game_sessions_user_idx ON public.game_sessions(user_id, created_at DESC);
CREATE INDEX game_sessions_game_idx ON public.game_sessions(user_id, game_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.game_sessions TO authenticated;
GRANT ALL ON public.game_sessions TO service_role;
ALTER TABLE public.game_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own sessions select" ON public.game_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own sessions insert" ON public.game_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =========================================
-- ADAPTIVE SCORES (per skill, global, persistent)
-- =========================================
CREATE TABLE public.adaptive_scores (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill TEXT NOT NULL,
  difficulty_level INT NOT NULL DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  rolling_accuracy NUMERIC(5,2) NOT NULL DEFAULT 0,
  rolling_reaction_ms INT NOT NULL DEFAULT 0,
  sessions_count INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, skill)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.adaptive_scores TO authenticated;
GRANT ALL ON public.adaptive_scores TO service_role;
ALTER TABLE public.adaptive_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own adaptive select" ON public.adaptive_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own adaptive upsert" ON public.adaptive_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own adaptive update" ON public.adaptive_scores FOR UPDATE USING (auth.uid() = user_id);

-- =========================================
-- ACHIEVEMENTS
-- =========================================
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.achievements TO authenticated;
GRANT ALL ON public.achievements TO service_role;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own achievements select" ON public.achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own achievements insert" ON public.achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =========================================
-- TUTORIAL PROGRESS
-- =========================================
CREATE TABLE public.tutorial_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT true,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, game_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tutorial_progress TO authenticated;
GRANT ALL ON public.tutorial_progress TO service_role;
ALTER TABLE public.tutorial_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tut select" ON public.tutorial_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own tut insert" ON public.tutorial_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =========================================
-- COMPANION PREFERENCES
-- =========================================
CREATE TABLE public.companion_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  companion TEXT NOT NULL DEFAULT 'fox',
  voice_enabled BOOLEAN NOT NULL DEFAULT true,
  sound_effects BOOLEAN NOT NULL DEFAULT true,
  background_music BOOLEAN NOT NULL DEFAULT false,
  theme TEXT NOT NULL DEFAULT 'ocean',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.companion_preferences TO authenticated;
GRANT ALL ON public.companion_preferences TO service_role;
ALTER TABLE public.companion_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own prefs select" ON public.companion_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own prefs upsert" ON public.companion_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own prefs update" ON public.companion_preferences FOR UPDATE USING (auth.uid() = user_id);

-- =========================================
-- AI INSIGHTS (cached Gemini outputs)
-- =========================================
CREATE TABLE public.ai_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind TEXT NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX ai_insights_user_kind_idx ON public.ai_insights(user_id, kind, created_at DESC);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ai_insights TO authenticated;
GRANT ALL ON public.ai_insights TO service_role;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own insights select" ON public.ai_insights FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "own insights insert" ON public.ai_insights FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =========================================
-- updated_at trigger
-- =========================================
CREATE OR REPLACE FUNCTION public.touch_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER prefs_touch BEFORE UPDATE ON public.companion_preferences
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER adaptive_touch BEFORE UPDATE ON public.adaptive_scores
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- =========================================
-- Auto-create profile on signup
-- =========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, child_name, age, avatar, companion)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'child_name', 'Friend'),
    COALESCE((NEW.raw_user_meta_data->>'age')::INT, 8),
    COALESCE(NEW.raw_user_meta_data->>'avatar', 'fox'),
    COALESCE(NEW.raw_user_meta_data->>'companion', 'fox')
  );
  INSERT INTO public.companion_preferences (user_id, companion)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'companion', 'fox'));
  -- seed adaptive scores
  INSERT INTO public.adaptive_scores (user_id, skill) VALUES
    (NEW.id, 'memory'), (NEW.id, 'attention'),
    (NEW.id, 'focus'),  (NEW.id, 'logic'),
    (NEW.id, 'reaction'), (NEW.id, 'pattern');
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
