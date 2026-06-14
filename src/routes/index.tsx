import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Brain,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
  Heart,
  ChevronRight,
  Play,
  Star,
  Zap,
  LineChart,
  Users,
} from "lucide-react";

import heroFox from "@/assets/hero-fox.png";
import heroBrain from "@/assets/hero-brain.png";
import owl from "@/assets/companion-owl.png";
import panda from "@/assets/companion-panda.png";
import unicorn from "@/assets/companion-unicorn.png";
import fox from "@/assets/companion-fox.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "MindSpark AI — AI Brain Training for Kids with ADHD" },
      {
        name: "description",
        content:
          "Adaptive cognitive training games that grow with your child. Improve focus, memory, attention and more — powered by AI.",
      },
      { property: "og:title", content: "MindSpark AI — AI Brain Training for Kids" },
      {
        property: "og:description",
        content: "Adaptive, AI-powered brain training games designed for children with ADHD.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <Nav />
      <Hero />
      <SocialProof />
      <Features />
      <HowItWorks />
      <GameShowcase />
      <CompanionPreview />
      <ParentPreview />
      <Testimonials />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="mx-auto mt-4 flex max-w-7xl items-center justify-between rounded-2xl glass px-5 py-3 shadow-[var(--shadow-sm)] mx-4 md:mx-auto md:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-[var(--shadow-glow)]">
            <Brain className="h-5 w-5" />
          </div>
          <span className="text-lg font-bold tracking-tight">MindSpark AI</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#how" className="hover:text-foreground">How it works</a>
          <a href="#games" className="hover:text-foreground">Games</a>
          <a href="#parents" className="hover:text-foreground">For Parents</a>
          <a href="#faq" className="hover:text-foreground">FAQ</a>
        </nav>
        <div className="flex items-center gap-2">
          <Link
            to="/auth"
            className="hidden rounded-xl px-3 py-2 text-sm font-medium text-foreground hover:bg-accent sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            to="/auth"
            search={{ mode: "signup" } as never}
            className="btn-hero inline-flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-semibold"
          >
            Get Started <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}

function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 pt-12 pb-20 md:pt-20 md:pb-32">
      <div className="blob left-[-10%] top-[10%] h-80 w-80 bg-primary/40" />
      <div className="blob right-[-5%] top-[20%] h-72 w-72 bg-primary-glow/40" />
      <div className="blob bottom-0 left-1/3 h-72 w-72 bg-teal/40" />

      <div className="grid items-center gap-12 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            <Sparkles className="h-3.5 w-3.5" /> AI-Powered Brain Training for ADHD Kids
          </span>
          <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] tracking-tight md:text-7xl">
            Stronger Focus.<br />
            <span className="text-gradient-brand">Smarter Mind.</span><br />
            Brighter Future.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-muted-foreground md:text-xl">
            MindSpark AI builds focus, memory and attention through adaptive games that
            grow with your child — backed by real cognitive science and a friendly AI
            companion.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              to="/auth"
              search={{ mode: "signup" } as never}
              className="btn-hero inline-flex items-center gap-2 rounded-2xl px-6 py-3.5 text-base font-semibold"
            >
              Start Your Journey <ChevronRight className="h-5 w-5" />
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-6 py-3.5 text-base font-semibold hover:bg-accent"
            >
              <Play className="h-4 w-4" /> Watch Demo
            </a>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-3 max-w-lg">
            {[
              { icon: Target, label: "Adaptive Learning", sub: "Difficulty fits every child" },
              { icon: Brain, label: "Cognitive Growth", sub: "Focus, memory, attention" },
              { icon: TrendingUp, label: "Parent Insights", sub: "AI reports & analytics" },
            ].map((b) => (
              <div key={b.label} className="card-premium p-4">
                <b.icon className="h-5 w-5 text-primary" />
                <div className="mt-2 text-sm font-semibold">{b.label}</div>
                <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">{b.sub}</div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="relative mx-auto aspect-square w-full max-w-md"
        >
          {/* Main Characters */}
          <img
            src={heroBrain}
            alt="MindSpark brain mascot"
            width={1024}
            height={1024}
            className="floaty absolute left-[10%] top-0 h-[65%] w-[65%] object-contain drop-shadow-[0_30px_50px_oklch(0.55_0.22_295/0.35)]"
          />
          <img
            src={heroFox}
            alt="Finn the fox companion"
            width={1024}
            height={1024}
            className="absolute bottom-0 right-[10%] h-[55%] w-[55%] object-contain drop-shadow-[0_30px_50px_oklch(0.66_0.18_260/0.30)]"
            style={{ animation: "floaty 7s ease-in-out infinite", animationDelay: "1s" }}
          />

          {/* Floating 3D Elements matching the mockup */}
          {[
            { emoji: "🧩", top: "45%", left: "5%", delay: 0, dur: 4, rot: [-10, 10, -10], size: "text-6xl" },
            { emoji: "⭐", top: "60%", left: "20%", delay: 1, dur: 5, rot: [0, 15, 0], size: "text-5xl" },
            { emoji: "🔷", top: "25%", left: "80%", delay: 0.5, dur: 4.5, rot: [10, -10, 10], size: "text-5xl" },
            { emoji: "🏆", top: "50%", left: "85%", delay: 1.5, dur: 5.5, rot: [-5, 5, -5], size: "text-4xl" },
            { emoji: "✨", top: "10%", left: "15%", delay: 2, dur: 3, rot: [0, 0, 0], size: "text-4xl" },
          ].map((item, i) => (
            <motion.div
              key={i}
              className={`absolute ${item.size} drop-shadow-xl`}
              style={{ top: item.top, left: item.left }}
              animate={{ 
                y: [0, -15, 0],
                rotate: item.rot
              }}
              transition={{ 
                duration: item.dur, 
                repeat: Infinity, 
                ease: "easeInOut",
                delay: item.delay 
              }}
            >
              {item.emoji}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

function SocialProof() {
  const stats = [
    { value: "8 cognitive", label: "skills trained" },
    { value: "6 adaptive", label: "training games" },
    { value: "Real-time", label: "AI difficulty engine" },
    { value: "Parent", label: "analytics dashboard" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16">
      <div className="grid gap-4 rounded-3xl gradient-brand p-6 text-primary-foreground md:grid-cols-4 md:p-10">
        {stats.map((s) => (
          <div key={s.label} className="text-center md:text-left">
            <div className="text-3xl font-extrabold tracking-tight md:text-4xl">{s.value}</div>
            <div className="text-sm opacity-90">{s.label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Features() {
  const items = [
    {
      icon: Brain,
      title: "Adaptive AI Engine",
      desc: "Difficulty adjusts after every session based on accuracy, reaction time, and focus. Your child is always in the sweet spot.",
      color: "from-violet-500 to-indigo-600",
    },
    {
      icon: Heart,
      title: "AI Companion",
      desc: "Pick from Fox, Owl, Panda or Unicorn. Each has a unique personality, voice and encouragement style.",
      color: "from-pink-500 to-rose-500",
    },
    {
      icon: Target,
      title: "8 Cognitive Skills",
      desc: "Working memory, attention span, focus, pattern recognition, problem solving, cognitive flexibility & more.",
      color: "from-teal-500 to-emerald-500",
    },
    {
      icon: TrendingUp,
      title: "Parent Insights",
      desc: "Weekly and monthly reports with strengths, weaknesses, and personalized recommendations — written by AI.",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Trophy,
      title: "Streaks & Badges",
      desc: "XP, levels, and 12+ achievements turn consistent practice into a daily habit kids love.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: Sparkles,
      title: "Designed with Care",
      desc: "Built specifically for ADHD: short sessions, clear goals, no overwhelm, calming colors.",
      color: "from-fuchsia-500 to-pink-500",
    },
  ];
  return (
    <section id="features" className="mx-auto max-w-7xl px-4 py-20">
      <SectionHeader
        eyebrow="Why MindSpark"
        title="Built for the way your child thinks"
        subtitle="Six core capabilities that turn practice into real cognitive growth."
      />
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {items.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="card-premium group p-7 transition-shadow hover:shadow-[var(--shadow-lg)]"
          >
            <div
              className={`grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${f.color} text-white shadow-[var(--shadow-md)]`}
            >
              <f.icon className="h-6 w-6" />
            </div>
            <h3 className="mt-5 text-xl font-bold">{f.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      step: "01",
      title: "Create your child's profile",
      desc: "Tell us your child's name, age, and pick an avatar. Takes 30 seconds.",
    },
    {
      step: "02",
      title: "Choose an AI companion",
      desc: "Finn the Fox, Ollie the Owl, Pippa the Panda or Luna the Unicorn — whoever clicks.",
    },
    {
      step: "03",
      title: "Play short daily sessions",
      desc: "5-10 minutes a day. The AI engine fine-tunes every game to your child's level.",
    },
    {
      step: "04",
      title: "Track real growth",
      desc: "See cognitive scores climb in the parent dashboard, with AI-written weekly reports.",
    },
  ];
  return (
    <section id="how" className="mx-auto max-w-7xl px-4 py-20">
      <SectionHeader eyebrow="How it works" title="From signup to growth in 4 steps" />
      <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <motion.div
            key={s.step}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="card-premium relative p-7"
          >
            <span className="text-5xl font-extrabold text-gradient-brand opacity-80">{s.step}</span>
            <h3 className="mt-3 text-lg font-bold">{s.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function GameShowcase() {
  const games = [
    { name: "Memory Match", skill: "Visual Memory", emoji: "🧩", color: "from-violet-500 to-indigo-600" },
    { name: "Smart Shape Sorter", skill: "Logic", emoji: "🔷", color: "from-teal-400 to-emerald-500" },
    { name: "Pattern Grid", skill: "Pattern Recognition", emoji: "🟪", color: "from-fuchsia-500 to-pink-500" },
    { name: "Color Sequence", skill: "Working Memory", emoji: "🎨", color: "from-amber-400 to-orange-500" },
    { name: "Memory Maze", skill: "Spatial Memory", emoji: "🗺️", color: "from-blue-500 to-cyan-500" },
    { name: "Focus Finder", skill: "Selective Attention", emoji: "🔍", color: "from-rose-500 to-red-500" },
  ];
  return (
    <section id="games" className="mx-auto max-w-7xl px-4 py-20">
      <SectionHeader
        eyebrow="The Game Library"
        title="Six adaptive games. Endless cognitive growth."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {games.map((g, i) => (
          <motion.div
            key={g.name}
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="card-premium overflow-hidden p-0"
          >
            <div className={`flex h-40 items-center justify-center bg-gradient-to-br ${g.color} text-7xl`}>
              <span className="drop-shadow-lg">{g.emoji}</span>
            </div>
            <div className="p-5">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">{g.name}</h3>
                <span className="rounded-full bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground">
                  {g.skill}
                </span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                5 adaptive difficulty levels — progress saves automatically.
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function CompanionPreview() {
  const companions = [
    { name: "Finn", img: fox, sub: "Playful & brave" },
    { name: "Ollie", img: owl, sub: "Wise & calm" },
    { name: "Pippa", img: panda, sub: "Kind & gentle" },
    { name: "Luna", img: unicorn, sub: "Magical & fun" },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <SectionHeader
        eyebrow="AI Companions"
        title="Meet the team your child will love"
        subtitle="Each companion has a unique personality, voice, and encouragement style."
      />
      <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {companions.map((c, i) => (
          <motion.div
            key={c.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
            className="card-premium flex flex-col items-center p-6 text-center"
          >
            <div className="aspect-square w-32">
              <img src={c.img} alt={c.name} width={512} height={512} loading="lazy" className="h-full w-full object-contain" />
            </div>
            <div className="mt-3 text-lg font-bold">{c.name}</div>
            <div className="text-xs text-muted-foreground">{c.sub}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function ParentPreview() {
  return (
    <section id="parents" className="mx-auto max-w-7xl px-4 py-20">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
            <LineChart className="h-3.5 w-3.5" /> For Parents
          </span>
          <h2 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">
            Real progress.<br />Beautifully visible.
          </h2>
          <p className="mt-4 max-w-md text-lg text-muted-foreground">
            A premium parent dashboard with attention, memory, focus and reaction analytics —
            plus AI-generated weekly reports written in plain English.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Skill radar across 6 cognitive areas",
              "Weekly and monthly trend reports",
              "AI-powered strengths & improvement areas",
              "Per-game session history with charts",
            ].map((t) => (
              <li key={t} className="flex items-center gap-3 text-sm">
                <div className="grid h-6 w-6 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
                  <Star className="h-3.5 w-3.5" />
                </div>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <div className="card-premium p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Weekly summary</div>
              <div className="text-2xl font-bold">Aarav's Progress</div>
            </div>
            <div className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600">
              ↑ 12% this week
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              { label: "Memory", value: 72, color: "from-violet-500 to-indigo-600" },
              { label: "Focus", value: 68, color: "from-blue-500 to-cyan-500" },
              { label: "Attention", value: 75, color: "from-teal-500 to-emerald-500" },
              { label: "Reaction", value: 65, color: "from-amber-500 to-orange-500" },
            ].map((m) => (
              <div key={m.label} className="rounded-2xl bg-muted p-4">
                <div className="text-xs font-semibold text-muted-foreground">{m.label}</div>
                <div className="mt-1 text-3xl font-extrabold">{m.value}%</div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-background">
                  <div className={`h-full bg-gradient-to-r ${m.color}`} style={{ width: `${m.value}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-2xl bg-gradient-to-br from-primary/10 to-primary-glow/10 p-4 text-sm">
            <span className="font-semibold">AI Note —</span>{" "}
            Aarav's reaction time improved 18% over the past two weeks. Suggested focus this week:
            pattern recognition.
          </div>
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    {
      quote:
        "My son actually asks to do his MindSpark sessions. I've never seen him this engaged with anything educational.",
      name: "Priya M.",
      role: "Parent · Mumbai",
    },
    {
      quote:
        "The AI difficulty engine is a game-changer. It always seems to find the level where my daughter is challenged but not frustrated.",
      name: "James R.",
      role: "Parent · London",
    },
    {
      quote:
        "The parent dashboard finally gives me concrete data to discuss with her therapist. Huge value.",
      name: "Dr. Anika S.",
      role: "Child Psychologist",
    },
  ];
  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <SectionHeader eyebrow="Loved by families" title="Parents are seeing real changes" />
      <div className="mt-12 grid gap-5 md:grid-cols-3">
        {items.map((t, i) => (
          <motion.div
            key={t.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className="card-premium p-7"
          >
            <div className="flex gap-1 text-amber">
              {Array.from({ length: 5 }).map((_, k) => (
                <Star key={k} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <p className="mt-3 text-base leading-relaxed">"{t.quote}"</p>
            <div className="mt-5 text-sm font-semibold">{t.name}</div>
            <div className="text-xs text-muted-foreground">{t.role}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    {
      q: "What age range is MindSpark AI for?",
      a: "Designed for kids aged 5 to 14. The adaptive engine fine-tunes content to each child's level regardless of age.",
    },
    {
      q: "Do I need a separate parent account?",
      a: "No — one account gives you access to your child's training games, progress, and the parent analytics dashboard.",
    },
    {
      q: "How long should sessions be?",
      a: "We recommend 5–10 minutes a day. Short, consistent sessions are how cognitive training works.",
    },
    {
      q: "Is my child's data private?",
      a: "Yes. All data is stored securely and never shared. Only you can see your child's profile and progress.",
    },
    {
      q: "Does it work on phones and tablets?",
      a: "Yes — every screen is fully responsive across mobile, tablet, and desktop.",
    },
  ];
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20">
      <SectionHeader eyebrow="FAQ" title="Questions, answered" />
      <div className="mt-10 space-y-3">
        {items.map((f, i) => (
          <details key={i} className="card-premium group p-5">
            <summary className="flex cursor-pointer items-center justify-between text-base font-semibold">
              {f.q}
              <ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" />
            </summary>
            <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20">
      <div className="relative overflow-hidden rounded-3xl gradient-brand p-10 text-primary-foreground md:p-16">
        <div className="blob right-[-10%] top-[-20%] h-80 w-80 bg-white/30" />
        <div className="relative grid items-center gap-10 md:grid-cols-2">
          <div>
            <h2 className="text-4xl font-extrabold leading-tight md:text-5xl">
              Give your child the gift of focus.
            </h2>
            <p className="mt-4 max-w-md text-lg opacity-95">
              Free to start. No credit card. Set up in under a minute.
            </p>
            <Link
              to="/auth"
              search={{ mode: "signup" } as never}
              className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-7 py-4 text-base font-bold text-primary shadow-[var(--shadow-lg)] hover:translate-y-[-2px] transition-transform"
            >
              Start free <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
          <div className="flex justify-center">
            <img src={heroFox} alt="" width={1024} height={1024} className="floaty h-64 w-64 object-contain" />
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="mx-auto max-w-7xl px-4 pb-10 pt-6">
      <div className="flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-sm text-muted-foreground md:flex-row">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-primary to-primary-glow text-primary-foreground">
            <Brain className="h-4 w-4" />
          </div>
          <span className="font-semibold text-foreground">MindSpark AI</span>
          <span>· © {new Date().getFullYear()}</span>
        </div>
        <div className="flex items-center gap-5">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#parents" className="hover:text-foreground">Parents</a>
          <a href="#faq" className="hover:text-foreground">FAQ</a>
          <Link to="/auth" className="hover:text-foreground">Sign in</Link>
        </div>
      </div>
    </footer>
  );
}

function SectionHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
        <Users className="h-3.5 w-3.5" /> {eyebrow}
      </span>
      <h2 className="mt-4 text-4xl font-extrabold tracking-tight md:text-5xl">{title}</h2>
      {subtitle && <p className="mt-4 text-lg text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
