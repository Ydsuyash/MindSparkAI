import { createFileRoute } from "@tanstack/react-router";
import { Award, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { BADGES, computeUnlockedBadges } from "@/lib/badges";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/_authenticated/app/achievements")({
  head: () => ({ meta: [{ title: "Achievements — MindSpark AI" }] }),
  component: Achievements,
});

function Achievements() {
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;

      const [profileRes, sessionsRes, scoresRes] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", u.user.id).maybeSingle(),
        supabase.from("game_sessions").select("*").eq("user_id", u.user.id),
        supabase.from("adaptive_scores").select("*").eq("user_id", u.user.id),
      ]);

      if (profileRes.data) {
        const uSet = computeUnlockedBadges(profileRes.data, sessionsRes.data || [], scoresRes.data || []);
        setUnlocked(uSet);
      }
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <header className="card-premium relative overflow-hidden p-6 md:p-8">
        <div className="blob right-[-5%] top-[-30%] h-56 w-56 bg-amber/40" />
        <div className="relative flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[var(--shadow-md)]">
            <Award className="h-7 w-7" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Your collection
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Achievements</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Unlock badges as you train. {BADGES.length} to discover.
            </p>
          </div>
        </div>
      </header>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {BADGES.map((b) => {
            const isUnlocked = unlocked.has(b.id);
            return (
              <div 
                key={b.id} 
                className={`card-premium flex flex-col items-center p-5 text-center transition-all ${
                  isUnlocked ? "border-transparent shadow-[var(--shadow-md)] hover:-translate-y-1" : "border-border bg-muted/30 opacity-70 grayscale"
                }`}
              >
                {isUnlocked ? (
                  <div className={`grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br ${b.color} text-3xl shadow-inner`}>
                    {b.emoji}
                  </div>
                ) : (
                  <div className="grid h-16 w-16 place-items-center rounded-2xl bg-muted text-3xl opacity-60">
                    <Lock className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                
                <div className="mt-3 text-sm font-bold">{b.label}</div>
                <div className="mt-1 text-[11px] font-medium text-muted-foreground">{b.desc}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
