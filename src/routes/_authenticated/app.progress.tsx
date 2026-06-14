import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from "recharts";
import { Trophy, Clock, Target, Brain, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app/progress")({
  head: () => ({ meta: [{ title: "Progress — MindSpark AI" }] }),
  component: ProgressPage,
});

function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalGames: 0, totalMinutes: 0, avgAccuracy: 0 });
  const [skillData, setSkillData] = useState<{ name: string; level: number; xp: number }[]>([]);
  const [recentSessions, setRecentSessions] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;

      const [sessions, scores] = await Promise.all([
        supabase.from("game_sessions").select("*").eq("user_id", u.user.id).order('created_at', { ascending: false }),
        supabase.from("adaptive_scores").select("skill, difficulty_level").eq("user_id", u.user.id)
      ]);

      if (sessions.data) {
        const total = sessions.data.length;
        const totalSecs = sessions.data.reduce((acc, s) => acc + (s.duration_sec || 0), 0);
        const avgAcc = total > 0 ? sessions.data.reduce((acc, s) => acc + Number(s.accuracy || 0), 0) / total : 0;
        setStats({ totalGames: total, totalMinutes: Math.round(totalSecs / 60), avgAccuracy: Math.round(avgAcc) });
        setRecentSessions(sessions.data.slice(0, 5)); // Latest 5 sessions
      }

      if (scores.data) {
        setSkillData(scores.data.map(s => ({
          name: s.skill.charAt(0).toUpperCase() + s.skill.slice(1),
          level: s.difficulty_level,
          xp: 0
        })));
      }
      setLoading(false);
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const COLORS = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      <header className="card-premium relative overflow-hidden p-6 md:p-8">
        <div className="blob right-[-5%] top-[-30%] h-56 w-56 bg-primary/30" />
        <div className="relative">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Analytics
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">
            Your <span className="text-gradient-brand">Progress</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Track your cognitive growth across all skills.
          </p>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card-premium p-6 transition-transform hover:scale-[1.02]">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-amber-100 p-3 text-amber-600"><Trophy className="h-6 w-6" /></div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Games Played</p>
              <h3 className="text-3xl font-extrabold">{stats.totalGames}</h3>
            </div>
          </div>
        </div>
        <div className="card-premium p-6 transition-transform hover:scale-[1.02]">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-blue-100 p-3 text-blue-600"><Clock className="h-6 w-6" /></div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Time Played</p>
              <h3 className="text-3xl font-extrabold">{stats.totalMinutes} <span className="text-lg text-muted-foreground">min</span></h3>
            </div>
          </div>
        </div>
        <div className="card-premium p-6 transition-transform hover:scale-[1.02]">
          <div className="flex items-center gap-4">
            <div className="rounded-2xl bg-emerald-100 p-3 text-emerald-600"><Target className="h-6 w-6" /></div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground">Avg Accuracy</p>
              <h3 className="text-3xl font-extrabold">{stats.avgAccuracy}%</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="card-premium p-6 md:p-8 md:col-span-2">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Brain className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Skill Levels</h2>
              <p className="text-xs font-medium text-muted-foreground">Your highest level reached per category</p>
            </div>
          </div>
          
          {skillData.length > 0 ? (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={skillData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#64748b', fontSize: 13, fontWeight: 600 }} 
                    dy={10}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: '#94a3b8', fontSize: 12 }} 
                    dx={-10}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(241, 245, 249, 0.4)' }}
                    contentStyle={{ 
                      borderRadius: '1rem', 
                      border: 'none', 
                      boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.1)',
                      fontWeight: 600
                    }}
                    formatter={(value) => [`Level ${value}`, 'Current Level']}
                  />
                  <Bar dataKey="level" radius={[6, 6, 0, 0]} maxBarSize={60}>
                    {skillData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center gap-2 text-muted-foreground">
              <Trophy className="h-8 w-8 opacity-20" />
              <p>Play some games to see your skill chart!</p>
            </div>
          )}
        </div>

        <div className="card-premium p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-orange-100 text-orange-500">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Recent Activity</h2>
              <p className="text-xs font-medium text-muted-foreground">Your latest missions</p>
            </div>
          </div>

          <div className="space-y-4">
            {recentSessions.length > 0 ? recentSessions.map((session, i) => {
              const date = new Date(session.created_at);
              const isToday = new Date().toDateString() === date.toDateString();
              const timeString = isToday ? date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : date.toLocaleDateString(undefined, {month: 'short', day: 'numeric'});
              
              return (
                <div key={i} className="flex items-center gap-4 rounded-2xl bg-muted/50 p-3 transition-colors hover:bg-muted">
                  <div className={`h-2 w-2 rounded-full ${session.accuracy >= 80 ? 'bg-emerald-500' : session.accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`} />
                  <div className="flex-1">
                    <p className="text-sm font-bold capitalize">{session.skill}</p>
                    <p className="text-xs text-muted-foreground">{session.accuracy}% Accuracy</p>
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground">{timeString}</div>
                </div>
              );
            }) : (
              <div className="py-8 text-center text-sm text-muted-foreground">No recent activity yet.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
