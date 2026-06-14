import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Mail, Lock, User, Cake, ChevronRight, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { AVATARS } from "@/lib/avatars";
import { z } from "zod";

const searchSchema = z.object({ mode: z.enum(["signin", "signup"]).optional() });

export const Route = createFileRoute("/auth")({
  validateSearch: searchSchema,
  head: () => ({
    meta: [
      { title: "Sign in — MindSpark AI" },
      { name: "description", content: "Create your free MindSpark AI account or sign in." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode: initialMode } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode ?? "signup");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // signup state
  const [childName, setChildName] = useState("");
  const [age, setAge] = useState("8");
  const [avatar, setAvatar] = useState("fox");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { child_name: childName, age: Number(age), avatar, companion: avatar },
      },
    });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Account created!");
    navigate({ to: "/onboarding" });
  }

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back!");
    navigate({ to: "/app" });
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
      <div className="blob left-[10%] top-[10%] h-72 w-72 bg-primary/40" />
      <div className="blob right-[10%] bottom-[10%] h-72 w-72 bg-primary-glow/40" />

      <Link to="/" className="absolute left-4 top-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-premium relative w-full max-w-md p-8"
      >
        <div className="flex items-center justify-center gap-2">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-glow)]">
            <Brain className="h-5 w-5" />
          </div>
          <span className="text-xl font-bold tracking-tight">MindSpark AI</span>
        </div>

        <h1 className="mt-6 text-center text-2xl font-extrabold tracking-tight">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          {mode === "signup" ? "Start your brain training adventure" : "Sign in to continue your journey"}
        </p>

        {mode === "signup" && (
          <>
            <p className="mt-6 text-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Choose your avatar
            </p>
            <div className="mt-3 grid grid-cols-4 gap-3">
              {AVATARS.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => setAvatar(a.id)}
                  className={`aspect-square rounded-2xl border-2 p-1 transition-all ${
                    avatar === a.id
                      ? "border-primary bg-accent shadow-[var(--shadow-glow)]"
                      : "border-transparent bg-muted hover:bg-accent"
                  }`}
                >
                  <img src={a.image} alt={a.label} className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          </>
        )}

        <form onSubmit={mode === "signup" ? signUp : signIn} className="mt-6 space-y-3">
          {mode === "signup" && (
            <>
              <Field icon={User} placeholder="Child's name" value={childName} onChange={setChildName} required />
              <Field icon={Cake} type="number" placeholder="Age" value={age} onChange={setAge} required min={4} max={18} />
            </>
          )}
          <Field icon={Mail} type="email" placeholder="Email" value={email} onChange={setEmail} required />
          <Field icon={Lock} type="password" placeholder="Password (min 6 characters)" value={password} onChange={setPassword} required minLength={6} />

          <button
            type="submit"
            disabled={loading}
            className="btn-hero mt-2 inline-flex w-full items-center justify-center gap-1 rounded-2xl px-5 py-3.5 text-sm font-bold disabled:opacity-60"
          >
            {loading ? "..." : mode === "signup" ? "Create Account" : "Sign In"}
            <ChevronRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signup" ? "Already have an account?" : "Don't have one yet?"}{" "}
          <button
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            className="font-semibold text-primary hover:underline"
          >
            {mode === "signup" ? "Sign in" : "Sign up"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}

type FieldProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> & {
  icon: React.ComponentType<{ className?: string }>;
  onChange: (v: string) => void;
  value: string;
};

function Field({ icon: Icon, onChange, value, ...inputProps }: FieldProps) {
  return (
    <label className="flex items-center gap-3 rounded-2xl border border-input bg-background px-4 py-3 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <input
        className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        {...inputProps}
      />
    </label>
  );
}
