import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Flame, Trophy, Target, Sparkles, ChevronRight, Volume2, VolumeX,
  Calendar, TrendingUp, Brain, Zap, Activity, Clock, Play
} from "lucide-react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  Area, AreaChart, Tooltip, XAxis, YAxis, CartesianGrid
} from "recharts";

import { supabase } from "@/integrations/supabase/client";
import { GAMES, SKILLS } from "@/lib/games";
import { companions, type CompanionId } from "@/lib/companions";
import { speech } from "@/lib/speech";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({ meta: [{ title: "Home — MindSpark AI" }] }),
  loader: async () => {
    const { data: u } = await supabase.auth.getUser();
    const empty = { profile: null as any, sessions: [] as any[], scores: [] as any[] };
    if (!u.user) return empty;
    const [{ data: profile }, { data: sessions }, { data: scores }] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle(),
      supabase.from("game_sessions").select("*").eq("user_id", u.user.id).order("created_at", { ascending: false }).limit(50),
      supabase.from("adaptive_scores").select("*").eq("user_id", u.user.id),
    ]);
    return { profile: profile ?? null, sessions: sessions ?? [], scores: scores ?? [] };
  },
  component: Home,
});

function Home() {
  const { profile, sessions, scores } = Route.useLoaderData();
  const companion = companions[(profile?.companion as CompanionId) ?? "fox"];
  const [voiceOn, setVoiceOn] = useState(true);
  
  // AI Dynamic Greeting
  const aiGreeting = useMemo(() => {
    if (sessions.length === 0) return "Ready to start your first brain training adventure?";
    if (profile?.streak_days > 2) return `You're on a ${profile.streak_days}-day streak! Let's keep the fire burning!`;
    const lastAcc = sessions[0]?.accuracy || 0;
    if (lastAcc > 90) return "You were incredibly accurate yesterday! Let's push for a new high score today.";
    return "Every day is a chance to grow. Let's train your cognitive muscles!";
  }, [sessions, profile]);

  useEffect(() => {
    if (!voiceOn || !profile?.id) return;
    const greetKey = `greeted_${profile.id}`;
    const greeted = sessionStorage.getItem(greetKey);
    if (!greeted) {
      // Small delay ensures the browser's speech synthesis voices have loaded
      const timer = setTimeout(() => {
        speech.speak(`Good morning ${profile.child_name ?? ""}! ${aiGreeting}`);
        sessionStorage.setItem(greetKey, "true");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [voiceOn, aiGreeting, profile?.id, profile?.child_name]);

  // Skill radar
  const radarData = useMemo(() => SKILLS.map((s) => {
    const row = scores.find((sc: any) => sc.skill === s.id);
    return { skill: s.label, value: Number(row?.difficulty_level || 1) * 20 || 30 + Math.random() * 10 };
  }), [scores]);

  // Today's Mission (1 Memory, 1 Focus, 1 Logic)
  const todaysMission = useMemo(() => {
    return [
      GAMES.find(g => g.category === "Memory") || GAMES[0],
      GAMES.find(g => g.category === "Focus") || GAMES[1],
      GAMES.find(g => g.category === "Logic") || GAMES[2]
    ];
  }, []);

  // Skill Analysis
  const skillAnalysis = useMemo(() => {
    if (scores.length === 0) return { best: "Focus", weakest: "Memory", recGame: GAMES[0] };
    const sorted = [...scores].sort((a, b) => (b.difficulty_level || 0) - (a.difficulty_level || 0));
    const bestSkill = SKILLS.find(s => s.id === sorted[0].skill)?.label || "Focus";
    const weakestSkill = SKILLS.find(s => s.id === sorted[sorted.length - 1].skill);
    const recGame = GAMES.find(g => g.skillId === weakestSkill?.id) || GAMES[0];
    return { best: bestSkill, weakest: weakestSkill?.label || "Memory", recGame };
  }, [scores]);

  return (
    <div className="mx-auto max-w-6xl space-y-8 pb-12">
      {/* HERO SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium relative overflow-hidden bg-gradient-to-br from-primary to-primary-glow p-8 text-white shadow-[var(--shadow-xl)]"
      >
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-white/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary-glow/40 blur-3xl" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex-1">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
              Good Morning {profile?.child_name ?? "Explorer"} 🌟
            </h1>
            <div className="mt-4 inline-flex items-center gap-3 rounded-2xl bg-black/20 p-3 backdrop-blur-md border border-white/10">
              <img src={companion.image} alt="Companion" className="h-12 w-12 object-contain drop-shadow-lg" />
              <p className="text-sm font-medium text-white/95 leading-snug">"{aiGreeting}"</p>
            </div>
            
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/app/games/$id" params={{ id: todaysMission[0]?.id || "memory-match" }} className="btn-hero inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-3.5 text-base font-bold text-primary shadow-xl hover:scale-105 transition-transform">
                <Play className="h-5 w-5" /> Start Daily Mission
              </Link>
              <button
                onClick={() => { setVoiceOn(!voiceOn); if (voiceOn) speech.stopAll(); }}
                className="inline-flex items-center gap-2 rounded-2xl bg-white/15 px-5 py-3.5 text-sm font-semibold backdrop-blur hover:bg-white/25 transition-colors"
              >
                {voiceOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                {voiceOn ? "Mute Companion" : "Unmute Companion"}
              </button>
            </div>
          </div>
          
          {/* Hero Stats */}
          <div className="grid grid-cols-2 gap-3 shrink-0">
            <div className="flex flex-col items-center justify-center rounded-3xl bg-black/15 p-5 backdrop-blur border border-white/10 min-w-[120px]">
              <Flame className="h-8 w-8 text-amber-400 drop-shadow-md mb-2" />
              <div className="text-2xl font-black">{profile?.streak_days ?? 0}</div>
              <div className="text-xs font-medium uppercase tracking-wider opacity-80">Day Streak</div>
            </div>
            <div className="flex flex-col items-center justify-center rounded-3xl bg-black/15 p-5 backdrop-blur border border-white/10 min-w-[120px]">
              <Trophy className="h-8 w-8 text-yellow-300 drop-shadow-md mb-2" />
              <div className="text-2xl font-black">{profile?.level ?? 1}</div>
              <div className="text-xs font-medium uppercase tracking-wider opacity-80">Current Level</div>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* LEFT COLUMN: Mission & Recommedations */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* TODAY'S MISSION */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-extrabold flex items-center gap-2">
                <Target className="h-6 w-6 text-primary" /> Today's Mission
              </h2>
              <span className="text-sm font-bold text-muted-foreground">+300 XP Total</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {todaysMission.map((g, i) => (
                <Link key={g.id} to="/app/games/$id" params={{ id: g.id }} className="card-premium group relative overflow-hidden p-5 hover:-translate-y-1 hover:shadow-[var(--shadow-lg)] transition-all">
                  <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br ${g.color} opacity-20 blur-xl group-hover:opacity-40 transition-opacity`} />
                  <div className={`mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${g.color} text-2xl text-white shadow-md`}>
                    {g.emoji}
                  </div>
                  <h3 className="font-bold text-lg leading-tight">{g.title}</h3>
                  <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> 3 mins
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
                    <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-accent-foreground">
                      {g.category}
                    </span>
                    <ChevronRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* AI RECOMMENDATION */}
          <section>
            <div className="card-premium overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-card to-primary/5 p-6 md:p-8">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-3xl bg-gradient-to-br from-primary to-primary-glow text-white shadow-[var(--shadow-glow)]">
                  <Sparkles className="h-10 w-10" />
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-extrabold text-primary">AI Recommended: {skillAnalysis.recGame.title}</h3>
                  <p className="mt-2 text-sm font-medium text-muted-foreground leading-relaxed">
                    Based on your cognitive profile, training your <strong>{skillAnalysis.weakest}</strong> skill today will yield the highest cognitive growth. Jump into {skillAnalysis.recGame.title} to boost your stats!
                  </p>
                </div>
                <Link to="/app/games/$id" params={{ id: skillAnalysis.recGame.id }} className="shrink-0 rounded-2xl bg-primary px-6 py-3 font-bold text-primary-foreground hover:bg-primary/90 transition-colors shadow-[var(--shadow-sm)]">
                  Train Now
                </Link>
              </div>
            </div>
          </section>

          {/* RECENT ACTIVITY */}
          <section>
            <h2 className="mb-4 text-xl font-extrabold flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500" /> Recent Activity
            </h2>
            <div className="card-premium overflow-hidden">
              {sessions.length > 0 ? (
                <div className="divide-y divide-border">
                  {sessions.slice(0, 5).map((s, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                      <div className={`h-3 w-3 rounded-full ${s.accuracy >= 80 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : s.accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate capitalize">{s.game_id.replace('-', ' ')}</p>
                        <p className="text-xs text-muted-foreground">{new Date(s.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{s.accuracy}% Acc</div>
                        <div className="text-xs font-semibold text-primary">+{s.xp_earned || 0} XP</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-32 flex-col items-center justify-center text-sm text-muted-foreground p-6 text-center">
                  <Gamepad2 className="mb-2 h-8 w-8 opacity-20" />
                  Your training history will appear here once you play a game.
                </div>
              )}
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: Radar & Stats */}
        <div className="space-y-8">
          
          {/* COGNITIVE PROFILE RADAR */}
          <section>
            <div className="card-premium p-6">
              <h2 className="text-xl font-extrabold text-center mb-6">Cognitive Profile</h2>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="oklch(0.92 0.012 255)" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: "oklch(0.50 0.03 260)", fontSize: 12, fontWeight: 600 }} />
                    <Radar dataKey="value" stroke="oklch(0.55 0.22 295)" strokeWidth={3} fill="oklch(0.55 0.22 295)" fillOpacity={0.3} />
                    <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: 'var(--shadow-md)', fontWeight: 'bold' }} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </section>

          {/* SKILL IMPROVEMENT SECTION */}
          <section>
            <div className="card-premium p-6">
              <h2 className="text-xl font-extrabold mb-5">Skill Analysis</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-4 border border-emerald-100">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-600">
                      <Zap className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">Strongest</div>
                      <div className="font-extrabold text-emerald-900">{skillAnalysis.best}</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-rose-50 p-4 border border-rose-100">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-100 text-rose-600">
                      <Brain className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-rose-600">Needs Focus</div>
                      <div className="font-extrabold text-rose-900">{skillAnalysis.weakest}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
