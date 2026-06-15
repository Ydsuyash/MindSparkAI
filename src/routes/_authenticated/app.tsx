import { createFileRoute, Link, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Home,
  Gamepad2,
  TrendingUp,
  Award,
  User,
  Settings as SettingsIcon,
  Sparkles,
  LogOut,
  Brain,
  Flame,
  Trophy,
  Users as UsersIcon,
  Menu,
  X,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { speech } from "@/lib/speech";
import { getAvatarImage } from "@/lib/avatars";

export const Route = createFileRoute("/_authenticated/app")({
  head: () => ({ meta: [{ title: "MindSpark AI" }] }),
  loader: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return { profile: null };
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", u.user.id)
      .maybeSingle();
    return { profile };
  },
  component: AppShell,
});

type NavItem = { to: string; label: string; icon: typeof Home; exact?: boolean };
const NAV: NavItem[] = [
  { to: "/app", label: "Home", icon: Home, exact: true },
  { to: "/app/games", label: "Games", icon: Gamepad2 },
  { to: "/app/progress", label: "Progress", icon: TrendingUp },
  { to: "/app/achievements", label: "Achievements", icon: Award },
  { to: "/app/insights", label: "AI Insights", icon: Sparkles },
  { to: "/app/parent", label: "Parent", icon: UsersIcon },
  { to: "/app/profile", label: "Profile", icon: User },
  { to: "/app/settings", label: "Settings", icon: SettingsIcon },
];

function AppShell() {
  const { profile } = Route.useLoaderData();
  const navigate = useNavigate();
  const loc = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (profile && !profile.companion) navigate({ to: "/onboarding" });
  }, [profile, navigate]);

  useEffect(() => setMobileOpen(false), [loc.pathname]);

  async function signOut() {
    speech.stopAll();
    Object.keys(sessionStorage).forEach(k => {
      if (k.startsWith("greeted_") || k === "dashboard_greeted") {
        sessionStorage.removeItem(k);
      }
    });
    await supabase.auth.signOut();
    navigate({ to: "/" });
  }

  const avatarImg = getAvatarImage(profile?.avatar);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — desktop */}
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-5 md:flex">
        <Link to="/app" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-glow)]">
            <Brain className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">MindSpark AI</span>
        </Link>

        {/* Profile Summary at Top */}
        <div className="card-premium mt-6 p-4 flex flex-col items-center text-center">
          <div className="relative">
            <svg className="absolute inset-0 h-16 w-16 -rotate-90 transform" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
              <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth="8" strokeDasharray={`${((profile?.xp ?? 0) % 1000) / 10} 300`} className="text-primary transition-all duration-1000" strokeLinecap="round" />
            </svg>
            <img src={avatarImg} alt="" className="relative h-16 w-16 rounded-full bg-card object-contain p-1 shadow-[var(--shadow-sm)]" />
            <div className="absolute -bottom-2 -right-2 grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-card text-[10px] font-extrabold text-white shadow-sm">
              {profile?.level ?? 1}
            </div>
          </div>
          <div className="mt-3 font-bold truncate w-full">{profile?.child_name ?? "Explorer"}</div>
          <div className="mt-1 flex items-center justify-center gap-3 text-xs font-semibold text-muted-foreground">
            <span className="flex items-center gap-1 text-amber-500"><Flame className="h-3.5 w-3.5" /> {profile?.streak_days ?? 0}</span>
            <span className="flex items-center gap-1 text-primary"><Sparkles className="h-3.5 w-3.5" /> {profile?.xp ?? 0}</span>
          </div>
        </div>

        <nav className="mt-6 flex-1 space-y-1">
          {NAV.map((n) => {
            const active = n.exact ? loc.pathname === n.to : loc.pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to as "/app"}
                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-all ${
                  active
                    ? "bg-gradient-to-r from-primary/15 to-primary-glow/10 text-primary"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-foreground hover:translate-x-1"
                }`}
              >
                <n.icon className={`h-5 w-5 transition-transform ${active ? "scale-110" : "group-hover:scale-110 group-hover:rotate-3"}`} /> 
                {n.label}
                {active && <span className="ml-auto h-2 w-2 rounded-full bg-primary shadow-[var(--shadow-glow)]" />}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={signOut}
          className="mt-5 flex items-center gap-2 rounded-2xl border-2 border-transparent bg-muted/50 px-4 py-3 text-sm font-semibold text-muted-foreground transition-colors hover:border-border hover:bg-muted"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </aside>



      {/* Top user strip — desktop */}
      <div className="flex min-w-0 flex-1 flex-col relative">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-40 flex w-full items-center justify-between border-b border-border bg-card/80 px-4 py-3 backdrop-blur md:hidden">
          <Link to="/app" className="flex items-center gap-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
              <Brain className="h-4 w-4" />
            </div>
            <span className="text-base font-bold">MindSpark</span>
          </Link>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-border bg-card"
            aria-label="Menu"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>

        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute left-0 right-0 top-[57px] z-30 border-b border-border bg-card p-4 md:hidden shadow-lg"
          >
            <div className="grid grid-cols-2 gap-2">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to as "/app"}
                  className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2.5 text-sm font-medium"
                >
                  <n.icon className="h-4 w-4 text-primary" /> {n.label}
                </Link>
              ))}
            </div>
            <button
              onClick={signOut}
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-background px-3 py-2.5 text-sm font-semibold"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          </motion.div>
        )}

        <div className="hidden items-center justify-end gap-3 border-b border-border bg-card/60 px-8 py-3 backdrop-blur md:flex">
          <div className="flex items-center gap-2 rounded-full bg-amber/10 px-3 py-1.5 text-xs font-semibold text-amber">
            <Flame className="h-3.5 w-3.5" /> {profile?.streak_days ?? 0} day streak
          </div>
          <div className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            <Trophy className="h-3.5 w-3.5" /> Level {profile?.level ?? 1}
          </div>
          <div className="flex items-center gap-2 rounded-full bg-teal/10 px-3 py-1.5 text-xs font-semibold text-teal">
            ⚡ {profile?.xp ?? 0} XP
          </div>
        </div>

        <main className="flex-1 px-4 py-6 md:px-10 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
