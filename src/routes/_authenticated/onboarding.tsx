import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, ChevronRight } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { companionList, type CompanionId } from "@/lib/companions";

export const Route = createFileRoute("/_authenticated/onboarding")({
  head: () => ({ meta: [{ title: "Pick your companion — MindSpark AI" }] }),
  component: Onboarding,
});

function Onboarding() {
  const navigate = useNavigate();
  const [picked, setPicked] = useState<CompanionId>("fox");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("companion")
        .eq("id", u.user.id)
        .maybeSingle();
      
      // If they already have a companion saved in the DB, skip onboarding
      if (profile?.companion) navigate({ to: "/app" });
    })();
  }, [navigate]);

  async function confirm() {
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return;

    // Use upsert to create the profile row if it doesn't exist yet
    const { error } = await supabase.from("profiles").upsert({ 
      id: u.user.id,
      companion: picked, 
      avatar: picked,
      child_name: u.user.user_metadata?.child_name || "Friend",
      age: u.user.user_metadata?.age || 8
    });

    setSaving(false);
    
    if (error) return toast.error(error.message);
    toast.success("All set! Let's go.");
    navigate({ to: "/app" });
  }

  return (
    <div className="relative min-h-screen px-4 py-10">
      <div className="blob left-[5%] top-[10%] h-72 w-72 bg-primary/40" />
      <div className="blob right-[5%] bottom-[5%] h-72 w-72 bg-teal/40" />

      <div className="relative mx-auto max-w-3xl text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
          <Sparkles className="h-3.5 w-3.5" /> One more step
        </span>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
          Choose your <span className="text-gradient-brand">AI companion</span>
        </h1>
        <p className="mt-3 text-muted-foreground">
          They'll cheer you on, celebrate your wins, and learn alongside you.
        </p>

        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {companionList.map((c) => (
            <motion.button
              key={c.id}
              type="button"
              onClick={() => setPicked(c.id)}
              whileHover={{ y: -4 }}
              className={`card-premium relative flex flex-col items-center p-5 text-center transition-all ${
                picked === c.id ? "ring-4 ring-primary/40 shadow-[var(--shadow-glow)]" : ""
              }`}
            >
              <div className="aspect-square w-32">
                <img src={c.image} alt={c.name} className="h-full w-full object-contain" />
              </div>
              <div className="mt-3 text-base font-bold">{c.name}</div>
              <div className="mt-1 text-xs text-muted-foreground">{c.personality}</div>
              {picked === c.id && (
               <div className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-primary text-primary-foreground">
                  ✓
                </div>
              )}
            </motion.button>
          ))}
        </div>

        <button
          onClick={confirm}
          disabled={saving}
          className="btn-hero mt-10 inline-flex items-center gap-2 rounded-2xl px-7 py-4 text-base font-bold disabled:opacity-60"
        >
          {saving ? "Saving..." : "Start training"} <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
