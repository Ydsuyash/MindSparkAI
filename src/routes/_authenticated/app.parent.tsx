import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, CartesianGrid, Legend
} from "recharts";
import { Download, Brain, Clock, Flame, ChevronRight } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app/parent")({
  head: () => ({ meta: [{ title: "Parent Dashboard — MindSpark AI" }] }),
  loader: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return { sessions: [], scores: [], profile: null };

    const [sessionsRes, scoresRes, profileRes] = await Promise.all([
      supabase.from("game_sessions").select("*").eq("user_id", u.user.id).order("created_at", { ascending: false }).limit(100),
      supabase.from("adaptive_scores").select("*").eq("user_id", u.user.id),
      supabase.from("profiles").select("child_name").eq("id", u.user.id).maybeSingle()
    ]);

    return {
      sessions: sessionsRes.data ?? [],
      scores: scoresRes.data ?? [],
      profile: profileRes.data
    };
  },
  component: ParentDashboard,
});

function ParentDashboard() {
  const { sessions, scores, profile } = Route.useLoaderData();
  const childName = profile?.child_name || "your child";

  // Skill Radar mapping
  const radarData = [
    { subject: "Memory", A: scores.find(s => s.skill === "memory")?.score * 20 || 60, fullMark: 100 },
    { subject: "Focus", A: scores.find(s => s.skill === "focus")?.score * 20 || 55, fullMark: 100 },
    { subject: "Attention", A: scores.find(s => s.skill === "attention")?.score * 20 || 65, fullMark: 100 },
    { subject: "Logic", A: scores.find(s => s.skill === "logic")?.score * 20 || 50, fullMark: 100 },
    { subject: "Reaction", A: scores.find(s => s.skill === "reaction")?.score * 20 || 70, fullMark: 100 },
    { subject: "Pattern", A: scores.find(s => s.skill === "pattern")?.score * 20 || 60, fullMark: 100 },
  ];

  // Weekly trend mapping
  const trendData = sessions.slice(0, 10).reverse().map((s: any, i: number) => ({
    name: `Session ${i + 1}`,
    accuracy: s.accuracy,
    score: s.score / 10
  }));

  const totalTimeSecs = sessions.reduce((acc: number, curr: any) => acc + (curr.duration || 0), 0);
  const totalTimeStr = `${Math.floor(totalTimeSecs / 3600)}h ${Math.floor((totalTimeSecs % 3600) / 60)}m`;

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Parent Dashboard</h1>
          <p className="text-muted-foreground">Detailed analytics & insights for {childName}</p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="card-premium p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Brain className="h-4 w-4 text-violet-500" /> Total Games
          </div>
          <div className="mt-2 text-3xl font-extrabold">{sessions.length}</div>
        </div>
        <div className="card-premium p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Clock className="h-4 w-4 text-blue-500" /> Training Time
          </div>
          <div className="mt-2 text-3xl font-extrabold">{totalTimeStr}</div>
        </div>
        <div className="card-premium p-5">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Flame className="h-4 w-4 text-amber" /> Avg Accuracy
          </div>
          <div className="mt-2 text-3xl font-extrabold">
            {sessions.length > 0 ? Math.round(sessions.reduce((a: number, c: any) => a + c.accuracy, 0) / sessions.length) : 0}%
          </div>
        </div>
        <div className="card-premium flex items-center justify-between p-5 bg-gradient-to-br from-primary/10 to-primary/5">
          <div>
            <div className="text-sm font-semibold text-primary">AI Report Available</div>
            <div className="mt-1 text-xs text-muted-foreground">Generated today</div>
          </div>
          <ChevronRight className="h-5 w-5 text-primary" />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-premium p-6">
          <h3 className="mb-6 text-lg font-bold">Cognitive Profile</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                <PolarGrid stroke="oklch(0.92 0.012 255)" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "oklch(0.50 0.03 260)", fontSize: 12 }} />
                <Radar name={childName} dataKey="A" stroke="oklch(0.55 0.22 295)" fill="oklch(0.55 0.22 295)" fillOpacity={0.4} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-premium p-6">
          <h3 className="mb-6 text-lg font-bold">Performance Trend</h3>
          <div className="h-[300px] w-full">
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="oklch(0.92 0.012 255)" />
                  <XAxis dataKey="name" hide />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-md)' }} />
                  <Line type="monotone" dataKey="accuracy" name="Accuracy %" stroke="oklch(0.55 0.22 295)" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="score" name="Relative Score" stroke="oklch(0.72 0.13 185)" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Not enough data to show trends.</div>
            )}
          </div>
        </div>
      </div>

      <div className="card-premium p-6">
        <h3 className="mb-4 text-lg font-bold">Recent Sessions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 font-semibold text-muted-foreground">Date</th>
                <th className="pb-3 font-semibold text-muted-foreground">Game</th>
                <th className="pb-3 font-semibold text-muted-foreground">Accuracy</th>
                <th className="pb-3 font-semibold text-muted-foreground">Mistakes</th>
                <th className="pb-3 font-semibold text-muted-foreground">Score</th>
              </tr>
            </thead>
            <tbody>
              {sessions.slice(0, 10).map((s: any) => (
                <tr key={s.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3">{new Date(s.created_at).toLocaleDateString()}</td>
                  <td className="py-3 font-medium">{s.game_id.split('-').map((w:string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</td>
                  <td className="py-3">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${
                      s.accuracy >= 85 ? 'bg-emerald-100 text-emerald-700' : s.accuracy >= 60 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {Math.round(s.accuracy)}%
                    </span>
                  </td>
                  <td className="py-3">{s.mistakes}</td>
                  <td className="py-3 font-semibold">{s.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {sessions.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">No sessions recorded yet. Play a game!</div>
          )}
        </div>
      </div>
    </div>
  );
}
