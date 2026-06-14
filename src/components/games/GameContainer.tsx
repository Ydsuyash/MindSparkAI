import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ArrowRight, Play, RefreshCw, Sparkles, Home, ArrowLeft } from "lucide-react";
import { Link, useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AdaptiveEngine, type AdaptiveSkill, type GamePerformance } from "@/lib/adaptive/engine";
import { speech } from "@/lib/speech";
import { companions, type CompanionId } from "@/lib/companions";

export type GameState = "LOADING" | "TUTORIAL" | "PLAYING" | "SUMMARY" | "REWARD";

export interface TutorialStep {
  text: string;
  visual: React.ReactNode;
}

interface GameContainerProps {
  gameId: string;
  title: string;
  skill: AdaptiveSkill;
  colorClass: string;
  tutorialSteps?: TutorialStep[];
  tutorialContent?: React.ReactNode; // Keep for fallback if needed
  children: (props: {
    level: number;
    onComplete: (stats: { accuracy: number; mistakes: number; reactionMs: number; score: number }) => void;
  }) => React.ReactNode;
}

export function GameContainer({ gameId, title, skill, colorClass, tutorialSteps, tutorialContent, children }: GameContainerProps) {
  const router = useRouter();
  const [gameState, setGameState] = useState<GameState>("LOADING");
  const [level, setLevel] = useState<number>(1);
  const [userId, setUserId] = useState<string | null>(null);
  const [companionId, setCompanionId] = useState<CompanionId>("fox");
  
  // Tutorial State
  const [tutStep, setTutStep] = useState(0);
  
  // Stats
  const [startTime, setStartTime] = useState<number>(0);
  const [results, setResults] = useState<any>(null);
  const [xpEarned, setXpEarned] = useState(0);
  const [nextLevel, setNextLevel] = useState<number>(1);

  useEffect(() => {
    async function init() {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) {
        router.navigate({ to: "/auth" });
        return;
      }
      setUserId(u.user.id);

      const [{ data: prof }, { data: tut }] = await Promise.all([
        supabase.from("profiles").select("companion").eq("id", u.user.id).maybeSingle(),
        supabase.from("tutorial_progress").select("completed").eq("user_id", u.user.id).eq("game_id", gameId).maybeSingle()
      ]);

      if (prof?.companion) setCompanionId(prof.companion as CompanionId);

      const diff = await AdaptiveEngine.getCurrentDifficulty(u.user.id, skill);
      setLevel(diff);

      if (tut?.completed) {
        startGame();
      } else {
        setGameState("TUTORIAL");
      }
    }
    init();
  }, [gameId, skill, router]);

  useEffect(() => {
    if (gameState === "TUTORIAL" && tutorialSteps && tutorialSteps[tutStep]) {
      // Speak the tutorial step text
      speech.speak(tutorialSteps[tutStep].text);
    }
    return () => speech.stopAll();
  }, [gameState, tutStep, tutorialSteps]);

  const completeTutorial = async () => {
    speech.stopAll();
    if (userId) {
      await supabase.from("tutorial_progress").upsert({
        user_id: userId,
        game_id: gameId,
        completed: true,
      }, { onConflict: "user_id, game_id" });
    }
    startGame();
  };

  const nextStep = () => {
    if (tutorialSteps && tutStep < tutorialSteps.length - 1) {
      setTutStep(s => s + 1);
    } else {
      completeTutorial();
    }
  };

  const startGame = () => {
    setStartTime(Date.now());
    setGameState("PLAYING");
  };

  const handleGameComplete = async (stats: { accuracy: number; mistakes: number; reactionMs: number; score: number }) => {
    setGameState("LOADING");
    
    const durationSecs = Math.round((Date.now() - startTime) / 1000);
    const performance: GamePerformance = {
      gameId,
      skill,
      accuracy: stats.accuracy,
      mistakes: stats.mistakes,
      reactionMs: stats.reactionMs,
      durationSecs,
      score: stats.score,
      currentDifficulty: level
    };

    setResults(performance);

    if (userId) {
      const { xpGained, nextDifficulty } = await AdaptiveEngine.submitSession(userId, performance);
      setXpEarned(xpGained);
      setNextLevel(nextDifficulty);
    }

    setGameState("SUMMARY");
  };

  if (gameState === "LOADING") {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const companion = companions[companionId];

  return (
    <div className="relative mx-auto max-w-4xl">
      <AnimatePresence mode="wait">
        
        {/* TUTORIAL STATE */}
        {gameState === "TUTORIAL" && (
          <motion.div
            key="tutorial"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="card-premium overflow-hidden p-0"
          >
            {tutorialSteps ? (
              <div className="flex min-h-[500px] flex-col bg-[#F4F9FF]">
                {/* Header */}
                <div className="flex items-center p-6">
                  <Link to="/app/games" className="inline-flex items-center gap-2 rounded-xl text-sm font-semibold text-muted-foreground hover:bg-black/5 p-2">
                    <ArrowLeft className="h-5 w-5" />
                  </Link>
                </div>
                
                {/* Body */}
                <div className="flex flex-1 flex-col items-center justify-center gap-8 px-8 pb-8 md:flex-row md:items-stretch md:justify-start">
                  {/* Left: Companion & Speech Bubble */}
                  <div className="relative flex flex-1 flex-col items-center justify-end md:items-start md:pl-10">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={tutStep}
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -10 }}
                        className="relative z-10 mb-[-1rem] w-full max-w-[280px] rounded-3xl bg-white p-6 text-sm font-medium leading-relaxed text-slate-700 shadow-xl"
                      >
                        {tutorialSteps[tutStep].text}
                        <div className="absolute -bottom-3 left-1/2 h-6 w-6 -translate-x-1/2 rotate-45 bg-white md:bottom-1/4 md:-right-3 md:left-auto md:translate-x-0" />
                      </motion.div>
                    </AnimatePresence>
                    <img src={companion.image} alt={companion.name} className="h-64 w-64 object-contain md:h-80 md:w-80" />
                  </div>
                  
                  {/* Right: Visual Demonstration */}
                  <div className="flex flex-1 items-center justify-center pt-8 md:pt-0">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={tutStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="relative"
                      >
                        {tutorialSteps[tutStep].visual}
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="flex items-center justify-between border-t border-slate-200 bg-white px-8 py-5">
                  <div className="text-sm font-semibold text-slate-400">
                    {tutStep + 1} / {tutorialSteps.length}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={completeTutorial} className="rounded-2xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50">
                      Skip Tutorial
                    </button>
                    <button onClick={nextStep} className="btn-hero rounded-2xl px-8 py-3 text-sm font-semibold">
                      {tutStep === tutorialSteps.length - 1 ? "Play Now" : "Next"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              // Fallback for games that haven't been migrated to interactive steps yet
              <>
                <div className={`bg-gradient-to-br ${colorClass} p-8 text-white`}>
                  <h2 className="text-3xl font-extrabold">{title} Tutorial</h2>
                  <p className="mt-2 opacity-90">Let's learn how to play!</p>
                </div>
                <div className="p-8">
                  {tutorialContent}
                  <div className="mt-8 flex items-center justify-end gap-3 border-t border-border pt-6">
                    <button onClick={completeTutorial} className="btn-hero inline-flex items-center gap-2 rounded-2xl px-6 py-3 text-sm font-semibold">
                      Got it! Let's play <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {/* PLAYING STATE */}
        {gameState === "PLAYING" && (
          <motion.div
            key="playing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="card-premium min-h-[500px] overflow-hidden p-0"
          >
            <div className={`flex items-center justify-between bg-gradient-to-r ${colorClass} px-6 py-3 text-white`}>
              <div className="font-bold">{title}</div>
              <div className="flex gap-4 text-sm font-semibold">
                <span>Level {level}</span>
              </div>
            </div>
            <div className="relative h-full bg-background p-6">
              {children({ level, onComplete: handleGameComplete })}
            </div>
          </motion.div>
        )}

        {/* SUMMARY & REWARD STATE */}
        {(gameState === "SUMMARY" || gameState === "REWARD") && (
          <motion.div
            key="summary"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="card-premium overflow-hidden p-0 text-center"
          >
            <div className="relative py-16">
              <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-10`} />
              <div className="relative">
                <div className="mx-auto mb-6 grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-[var(--shadow-glow)]">
                  <Star className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-4xl font-extrabold">Amazing!</h2>
                <p className="mt-2 text-lg text-muted-foreground">You completed {title}!</p>
                
                <div className="mx-auto mt-8 flex max-w-sm flex-col items-center justify-center rounded-3xl bg-card p-6 shadow-[var(--shadow-sm)]">
                  <div className="text-sm font-semibold text-muted-foreground">Score</div>
                  <div className={`mt-1 bg-gradient-to-br ${colorClass} bg-clip-text text-6xl font-extrabold text-transparent`}>
                    {results?.score}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 divide-x divide-border border-y border-border bg-muted/30">
              <div className="p-4">
                <div className="text-xs font-semibold text-muted-foreground">Accuracy</div>
                <div className="mt-1 text-2xl font-bold">{Math.round(results?.accuracy || 0)}%</div>
              </div>
              <div className="p-4">
                <div className="text-xs font-semibold text-muted-foreground">Time</div>
                <div className="mt-1 text-2xl font-bold">
                  {Math.floor((results?.durationSecs || 0) / 60)}:
                  {((results?.durationSecs || 0) % 60).toString().padStart(2, '0')}
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs font-semibold text-muted-foreground">XP Earned</div>
                <div className="mt-1 flex items-center justify-center gap-1 text-2xl font-bold text-amber">
                  <Sparkles className="h-5 w-5" /> +{xpEarned}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 p-8">
              <Link to="/app/games" className="inline-flex items-center gap-2 rounded-2xl border border-input bg-background px-6 py-3 text-sm font-semibold hover:bg-accent">
                <Home className="h-4 w-4" /> Back to Games
              </Link>
              <button
                onClick={() => {
                  setLevel(nextLevel);
                  startGame();
                }}
                className="btn-hero inline-flex items-center gap-2 rounded-2xl px-8 py-3 text-sm font-semibold"
              >
                <Play className="h-4 w-4" /> 
                {nextLevel > level ? `Play Level ${nextLevel}` : nextLevel === level ? `Try Level ${level} Again` : `Play Level ${nextLevel}`}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
