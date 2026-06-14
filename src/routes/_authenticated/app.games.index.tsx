import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Filter, Star, Lock } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { GAMES } from "@/lib/games";

const CATEGORIES = ["All", "Memory", "Attention", "Focus", "Logic"] as const;

export const Route = createFileRoute("/_authenticated/app/games/")({
  head: () => ({ meta: [{ title: "Games — MindSpark AI" }] }),
  loader: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return { sessions: [] };
    const { data } = await supabase
      .from("game_sessions")
      .select("game_id, accuracy")
      .eq("user_id", u.user.id);
    return { sessions: data ?? [] };
  },
  component: GamesLibrary,
});

function GamesLibrary() {
  const { sessions } = Route.useLoaderData();
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>("All");

  const completionMap = useMemo(() => {
    const m: Record<string, { count: number; avg: number }> = {};
    for (const s of sessions) {
      if (!m[s.game_id]) m[s.game_id] = { count: 0, avg: 0 };
      m[s.game_id].count++;
      m[s.game_id].avg += Number(s.accuracy);
    }
    Object.values(m).forEach((v) => (v.avg = Math.round(v.avg / v.count)));
    return m;
  }, [sessions]);

  const filtered = GAMES.filter((g) => filter === "All" || g.category === filter);

  return (
    <div className="space-y-6">
      <header className="card-premium relative overflow-hidden p-6 md:p-8">
        <div className="blob right-[-5%] top-[-30%] h-56 w-56 bg-primary/30" />
        <div className="relative">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Games Library
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight md:text-4xl">
            Pick your <span className="text-gradient-brand">next challenge</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Six adaptive games — difficulty fine-tunes automatically as you play.
          </p>
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              filter === c
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-md)]"
                : "bg-card text-muted-foreground hover:bg-accent"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((g, i) => {
          const stats = completionMap[g.id];
          return (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link to="/app/games/$id" params={{ id: g.id }} className="card-premium group block overflow-hidden p-0">
                <div className={`flex h-40 items-center justify-center bg-gradient-to-br ${g.color} text-7xl transition-transform group-hover:scale-105`}>
                  <span className="drop-shadow-lg">{g.emoji}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">{g.title}</h3>
                    <span className="rounded-full bg-accent px-2.5 py-1 text-[10px] font-semibold text-accent-foreground">
                      {g.category}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{g.tagline}</p>
                  <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber text-amber" />
                      +{g.xpPerSession} XP
                    </div>
                    <div>{stats ? `${stats.count} plays · ${stats.avg}%` : "Not played yet"}</div>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
