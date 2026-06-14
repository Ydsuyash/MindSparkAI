# MindSpark AI — Build Plan

A production-grade ADHD cognitive training platform is ~14 screens, 6 fully-playable games, an adaptive engine, Supabase schema with RLS, and Gemini-powered insights. Shipping all of that in a single pass would produce broken games and shallow screens. I'll build it in 4 stages, each independently usable and reviewable.

## Stack confirmation
- TanStack Start + React 19 + TypeScript + Tailwind v4 (already scaffolded — this template uses TanStack Router, not React Router; functionally equivalent and type-safe)
- **Lovable Cloud** (Supabase under the hood) for auth, Postgres, storage, RLS
- **Lovable AI Gateway** with `google/gemini-3-flash-preview` for insights
- Framer Motion, Recharts, Zustand
- Single account type (no parent/child split) — one user sees Child + Parent + Analytics views

## Stage 1 — Foundation (this turn)
1. Enable Lovable Cloud
2. Premium design system in `src/styles.css`: gradients (#7C3AED → #3B82F6), teal/amber accents, glassmorphism tokens, soft shadows, 24px radii, Plus Jakarta Sans + Inter
3. Database schema + RLS + grants:
   - `profiles` (child_name, age, avatar, xp, level, streak, last_active, companion)
   - `game_sessions` (game_id, accuracy, reaction_ms, mistakes, duration, score, difficulty_level)
   - `adaptive_scores` (per-skill: memory, attention, focus, logic, reaction — global, not per-game)
   - `achievements` (unlocked badges)
   - `tutorial_progress` (per game)
   - `ai_insights` (cached Gemini outputs)
   - `companion_preferences`
4. Auth: email/password + Google, single account type, avatar + companion selection on signup
5. Speech engine singleton with global mute-on-logout (fixes the reported bug)
6. Routing shell: `/`, `/auth`, `/onboarding`, `/app` (home), `/app/games`, `/app/games/$id`, `/app/progress`, `/app/parent`, `/app/insights`, `/app/achievements`, `/app/profile`, `/app/settings`
7. Premium landing page (hero, features, how it works, game showcase, companion preview, parent preview, testimonials, FAQ, footer)

## Stage 2 — Core app shell + adaptive engine
- Home dashboard with all widgets (companion, daily/weekly goal, XP, streak, skill radar, recommendations, training plan)
- Games library with filters and live completion stats
- Global Adaptive Engine module: reads `adaptive_scores`, returns difficulty per skill; updates after each session per the 60/85% rules; persists across sessions
- Tutorial system (shared component, gated by `tutorial_progress`)
- Companion widget with voice (cleanly disposed on logout)

## Stage 3 — Six games
Each game = real gameplay loop, tutorial, result screen, adaptive difficulty pulled from engine, session persisted.
1. Memory Match (6/8/12/16/20 cards)
2. Smart Shape Sorter (real HTML5 drag-and-drop, particles)
3. Pattern Grid (2×2 → 5×5)
4. Color Sequence (Simon-style)
5. Memory Maze (path replay)
6. Focus Finder (target among distractors)

## Stage 4 — Parent + AI Insights + polish
- Parent Dashboard: attention/memory/focus/reaction analytics, weekly/monthly reports, session history, charts (line/bar/radar/heatmap)
- AI Insights page: Gemini-generated strengths/weaknesses/recommendations via a `createServerFn` calling Lovable AI Gateway
- Achievements page (12+ badges), Profile redesign, Settings
- Mobile/tablet/desktop responsive pass, motion polish, empty-state elimination

## Technical notes
- Adaptive engine lives in `src/lib/adaptive/engine.ts` — pure functions + a server fn that reads/writes `adaptive_scores`. All 6 games consume the same engine.
- Gemini calls go through `createServerFn` reading `LOVABLE_API_KEY` server-side; never exposed to client.
- Speech: `src/lib/speech.ts` singleton; `onAuthStateChange('SIGNED_OUT')` calls `speech.stopAll()` and revokes the companion subscription.
- RLS: every table scoped to `auth.uid()`; explicit GRANTs to `authenticated` and `service_role`.

## What I need from you
**Approve this plan and I'll execute Stage 1 immediately**, then check in before Stage 2. Each stage is ~1 message of work. If you want me to compress (e.g. skip landing page polish, ship only 3 games first), tell me now.
