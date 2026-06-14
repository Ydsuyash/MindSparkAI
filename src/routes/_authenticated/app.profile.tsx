import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getAvatarImage, AVATARS } from "@/lib/avatars";
import { companions, type CompanionId } from "@/lib/companions";
import { 
  Trophy, Flame, Calendar, Gamepad2, Star, Edit2, X, Heart, 
  Map, Crown, Shield, Zap, Medal, Gift, Award, Brain
} from "lucide-react";
import { BADGES, computeUnlockedBadges } from "@/lib/badges";
import { SKILLS, GAMES } from "@/lib/games";
import { motion } from "framer-motion";

export const Route = createFileRoute("/_authenticated/app/profile")({
  head: () => ({ meta: [{ title: "My Player Profile — MindSpark AI" }] }),
  loader: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return { profile: null, sessions: [], scores: [] };

    const [profileRes, sessionsRes, scoresRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle(),
      supabase.from("game_sessions").select("*").eq("user_id", u.user.id).order('created_at', { ascending: false }),
      supabase.from("adaptive_scores").select("*").eq("user_id", u.user.id),
    ]);

    return {
      profile: profileRes.data,
      sessions: sessionsRes.data ?? [],
      scores: scoresRes.data ?? []
    };
  },
  component: PlayerProfile,
});

function PlayerProfile() {
  const { profile: initialProfile, sessions, scores } = Route.useLoaderData();
  const [profile, setProfile] = useState<any>(initialProfile);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  useEffect(() => {
    if (profile) {
      setUnlocked(computeUnlockedBadges(profile, sessions, scores));
    }
  }, [profile, sessions, scores]);

  const router = useRouter();

  async function handleAvatarChange(avatarId: string) {
    if (!profile) return;
    
    // Optimistic update for current page
    setProfile({ ...profile, avatar: avatarId, companion: avatarId });
    setShowAvatarModal(false);
    
    // Update DB
    await supabase.from("profiles").update({ avatar: avatarId, companion: avatarId }).eq("id", profile.id);
    
    // Invalidate router so the parent AppShell (sidebar) re-fetches the new avatar
    router.invalidate();
  }

  const avatar = getAvatarImage(profile?.avatar);
  const companion = companions[(profile?.companion as CompanionId)] || companions["fox"];
  const level = profile?.level ?? 1;
  const xp = profile?.xp ?? 0;
  const xpToNext = level * 1000;
  const xpPct = Math.min(100, (xp / xpToNext) * 100);
  const totalGames = sessions.length;
  
  // Companion Friendship
  const friendshipLevel = Math.min(10, Math.floor(totalGames / 5) + 1);
  const interactionCount = totalGames * 2 + 15; // Simulated interaction count

  // Game Stats
  const gameCounts = sessions.reduce((acc: any, s: any) => {
    acc[s.game_id] = (acc[s.game_id] || 0) + 1;
    return acc;
  }, {});
  
  const mostPlayedGameId = Object.keys(gameCounts).sort((a, b) => gameCounts[b] - gameCounts[a])[0];
  const mostPlayedGame = GAMES.find(g => g.id === mostPlayedGameId);
  
  const highestScoreGame = [...sessions].sort((a, b) => (b.score || 0) - (a.score || 0))[0];
  const highestScoringGameDef = GAMES.find(g => g.id === highestScoreGame?.game_id);

  // Character Classes (Ranks)
  const getRank = (skillId: string) => {
    const score = scores.find((s: any) => s.skill === skillId)?.difficulty_level || 1;
    if (score >= 8) return "Legendary";
    if (score >= 5) return "Master";
    if (score >= 3) return "Adept";
    return "Novice";
  };

  const unlockedBadgesList = BADGES.filter(b => unlocked.has(b.id));

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* 1. CHILD HERO SECTION */}
      <section className="card-premium relative overflow-hidden p-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white shadow-[var(--shadow-xl)]">
        <div className="absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-white/20 blur-3xl translate-x-1/3 -translate-y-1/3" />
        <div className="absolute left-0 bottom-0 h-[300px] w-[300px] rounded-full bg-yellow-300/20 blur-3xl -translate-x-1/3 translate-y-1/3" />
        
        <div className="p-8 relative z-10 flex flex-col md:flex-row items-center gap-8">
          <div className="relative group shrink-0">
            <img src={avatar} alt="" className="h-40 w-40 rounded-[2rem] border-8 border-white/20 bg-white object-contain shadow-2xl transition-transform group-hover:scale-105" />
            <button onClick={() => setShowAvatarModal(true)} className="absolute inset-0 grid place-items-center rounded-[2rem] bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <Edit2 className="h-8 w-8 text-white" />
            </button>
            <div className="absolute -bottom-4 -right-4 flex flex-col items-center justify-center h-16 w-16 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-4 border-purple-500 shadow-xl">
              <span className="text-[10px] font-black uppercase tracking-wider text-white/90 leading-none mt-1">Level</span>
              <span className="text-xl font-black text-white leading-none">{level}</span>
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-5xl md:text-6xl font-black tracking-tight drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-r from-white to-white/80">
              {profile?.child_name ?? "Explorer"}
            </h1>
            
            <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 px-5 py-2 text-sm font-bold shadow-sm flex items-center gap-2">
                <Crown className="h-4 w-4 text-yellow-300" /> Age {profile?.age ?? "?"}
              </span>
              <span className="rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 px-5 py-2 text-sm font-bold shadow-sm flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-400" /> {profile?.streak_days ?? 0} Day Streak
              </span>
            </div>
            
            <div className="mt-8 w-full max-w-md bg-black/20 rounded-full p-2 backdrop-blur border border-white/10 shadow-inner">
              <div className="flex justify-between text-sm font-black px-3 mb-1 text-white">
                <span>{xp} XP</span>
                <span className="opacity-90">{xpToNext - xp} XP to Level {level + 1}</span>
              </div>
              <div className="h-4 w-full rounded-full bg-black/30 overflow-hidden border border-black/20">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${xpPct}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-yellow-300 to-amber-500 rounded-full" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* 5. CHARACTER PROGRESSION */}
          <section className="card-premium p-6 md:p-8">
            <h2 className="text-2xl font-black flex items-center gap-3 mb-6">
              <Shield className="h-7 w-7 text-indigo-500" /> Character Classes
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <RankCard title="Focus Hero" rank={getRank("attention")} icon={Zap} color="emerald" />
              <RankCard title="Memory Master" rank={getRank("memory")} icon={Brain} color="violet" />
              <RankCard title="Logic Wizard" rank={getRank("logic")} icon={Star} color="amber" />
              <RankCard title="Speed Ninja" rank={getRank("reaction")} icon={Flame} color="rose" />
            </div>
          </section>

          {/* 4. TROPHY CABINET */}
          <section className="card-premium p-6 md:p-8 bg-gradient-to-b from-card to-amber-50/30">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black flex items-center gap-3">
                <Trophy className="h-7 w-7 text-amber-500" /> Trophy Cabinet
              </h2>
              <span className="bg-amber-100 text-amber-700 font-black px-4 py-1.5 rounded-full text-sm">
                {unlockedBadgesList.length} Unlocked
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {BADGES.slice(0, 8).map(badge => {
                const isUnlocked = unlocked.has(badge.id);
                return (
                  <div key={badge.id} className={`relative flex flex-col items-center p-4 rounded-3xl border-2 transition-transform hover:scale-105 ${
                    isUnlocked ? "bg-white border-amber-200 shadow-[0_8px_30px_rgb(251,191,36,0.2)]" : "bg-muted/50 border-transparent grayscale opacity-50"
                  }`}>
                    <div className={`grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${isUnlocked ? badge.color : "from-gray-300 to-gray-400"} text-3xl shadow-inner mb-3`}>
                      {isUnlocked ? badge.emoji : "🔒"}
                    </div>
                    <div className="text-center">
                      <div className="font-black text-sm leading-tight">{badge.label}</div>
                      <div className="text-[10px] font-bold text-muted-foreground uppercase mt-1 tracking-wider">{badge.category}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 3. FAVORITE GAMES */}
          <section className="card-premium p-6 md:p-8">
            <h2 className="text-2xl font-black flex items-center gap-3 mb-6">
              <Gamepad2 className="h-7 w-7 text-blue-500" /> Gaming Profile
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-4 p-5 rounded-3xl bg-blue-50 border border-blue-100">
                <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${mostPlayedGame?.color || 'from-gray-400 to-gray-500'} text-2xl shadow-sm`}>
                  {mostPlayedGame?.emoji || "🎮"}
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-blue-600 mb-1">Most Played</div>
                  <div className="font-black text-lg">{mostPlayedGame?.title || "Not enough data"}</div>
                  <div className="text-sm font-semibold text-muted-foreground">{mostPlayedGameId ? `${gameCounts[mostPlayedGameId]} sessions` : "Play more to unlock"}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-5 rounded-3xl bg-fuchsia-50 border border-fuchsia-100">
                <div className={`grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br ${highestScoringGameDef?.color || 'from-gray-400 to-gray-500'} text-2xl shadow-sm`}>
                  {highestScoringGameDef?.emoji || "🏆"}
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-fuchsia-600 mb-1">Highest Score</div>
                  <div className="font-black text-lg">{highestScoringGameDef?.title || "Not enough data"}</div>
                  <div className="text-sm font-semibold text-muted-foreground">{highestScoreGame?.score ? `${highestScoreGame.score} points` : "Play more to unlock"}</div>
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-8">
          
          {/* 6. COMPANION RELATIONSHIP */}
          <section className="card-premium p-6 md:p-8 text-center bg-gradient-to-b from-card to-pink-50/50">
            <h2 className="text-xl font-black flex items-center justify-center gap-2 mb-6">
              <Heart className="h-6 w-6 text-pink-500" fill="currentColor" /> Best Friend
            </h2>
            
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 rounded-full bg-pink-400 blur-xl opacity-30 animate-pulse" />
              <img src={companion.image} alt={companion.name} className="relative h-32 w-32 object-contain drop-shadow-xl" />
              <div className="absolute -bottom-3 -right-3 grid h-10 w-10 place-items-center rounded-full bg-pink-500 border-4 border-white text-white font-black shadow-lg">
                Lv{friendshipLevel}
              </div>
            </div>
            
            <h3 className="text-2xl font-black">{companion.name}</h3>
            <p className="text-sm font-bold text-muted-foreground mt-1 mb-6">Your Personal Guide</p>
            
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-border text-left">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-pink-500">Friendship</span>
                <span className="text-xs font-black text-pink-500">{friendshipLevel * 10}%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-pink-100 overflow-hidden mb-4">
                <div className="h-full bg-pink-500 rounded-full" style={{ width: `${friendshipLevel * 10}%` }} />
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-50 p-3 rounded-xl">
                <Gift className="h-4 w-4 text-indigo-500" /> {interactionCount} interactions
              </div>
            </div>
          </section>

          {/* 7. PERSONAL STATISTICS */}
          <section className="card-premium p-6 md:p-8">
            <h2 className="text-xl font-black mb-6">Player Stats</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50">
                <span className="font-bold text-muted-foreground">Total XP</span>
                <span className="font-black text-lg text-primary">{xp}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50">
                <span className="font-bold text-muted-foreground">Games Played</span>
                <span className="font-black text-lg text-primary">{totalGames}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50">
                <span className="font-bold text-muted-foreground">Days Active</span>
                <span className="font-black text-lg text-primary">{Math.max(1, profile?.streak_days || 1)}</span>
              </div>
              <div className="flex justify-between items-center p-4 rounded-2xl bg-slate-50">
                <span className="font-bold text-muted-foreground">Highest Streak</span>
                <span className="font-black text-lg flex items-center gap-1 text-orange-500">
                  {profile?.streak_days || 0} <Flame className="h-4 w-4" />
                </span>
              </div>
            </div>
          </section>

          {/* 8. RECENT ACHIEVEMENTS FEED */}
          <section className="card-premium p-6 md:p-8">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2">
              <Award className="h-5 w-5 text-emerald-500" /> Activity Feed
            </h2>
            <div className="space-y-4">
              {sessions.slice(0, 4).map((s: any, i: number) => {
                const gameDef = GAMES.find(g => g.id === s.game_id);
                return (
                  <div key={i} className="flex gap-3">
                    <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-to-br ${gameDef?.color || 'from-gray-200 to-gray-300'} text-sm shadow-sm mt-1`}>
                      {gameDef?.emoji || "🎮"}
                    </div>
                    <div className="bg-slate-50 p-3 rounded-2xl rounded-tl-none flex-1 border border-slate-100">
                      <div className="font-black text-sm text-slate-800">
                        Played <span className="text-primary">{gameDef?.title || "a game"}</span>
                      </div>
                      <div className="text-xs font-bold text-muted-foreground mt-1">
                        Earned {s.xp_earned || 0} XP • {new Date(s.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              {sessions.length === 0 && (
                <div className="text-center p-6 text-sm font-bold text-muted-foreground bg-slate-50 rounded-2xl">
                  Ready to start your adventure!
                </div>
              )}
            </div>
          </section>

        </div>
      </div>

      {/* Avatar Modal */}
      {showAvatarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="card-premium w-full max-w-lg p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-black">Choose Avatar</h2>
              <button onClick={() => setShowAvatarModal(false)} className="grid h-10 w-10 place-items-center rounded-full bg-muted text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {AVATARS.map(a => (
                <button
                  key={a.id}
                  onClick={() => handleAvatarChange(a.id)}
                  className={`relative flex flex-col items-center gap-3 rounded-3xl border-4 p-4 transition-all hover:scale-105 ${
                    profile?.avatar === a.id ? "border-primary bg-primary/5 shadow-[var(--shadow-glow)]" : "border-transparent bg-muted hover:bg-accent"
                  }`}
                >
                  <img src={a.image} alt={a.label} className="h-16 w-16 object-contain drop-shadow-md" />
                  <span className="font-bold text-sm">{a.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function RankCard({ title, rank, icon: Icon, color }: any) {
  const bgMap: any = {
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    rose: "bg-rose-50 text-rose-600 border-rose-100",
  };
  
  const iconBgMap: any = {
    emerald: "bg-emerald-100",
    violet: "bg-violet-100",
    amber: "bg-amber-100",
    rose: "bg-rose-100",
  };

  return (
    <div className={`flex flex-col items-center text-center p-4 rounded-3xl border ${bgMap[color]}`}>
      <div className={`grid h-12 w-12 place-items-center rounded-2xl ${iconBgMap[color]} mb-3`}>
        <Icon className="h-6 w-6" />
      </div>
      <div className="text-[10px] font-black uppercase tracking-wider opacity-80 mb-1">{title}</div>
      <div className="font-black text-sm">{rank}</div>
    </div>
  );
}
