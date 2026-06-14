import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { GameContainer } from "./GameContainer";
import { audio } from "@/lib/audio";
import { RewardParticles, type RewardEvent } from "./RewardParticles";

const EMOJIS = ["🍎", "🚗", "🧸", "⚽", "📚", "🐶", "🎈", "🍕", "🎸", "🦋", "🍄", "🌻", "🚲", "🚀", "💎"];

interface FocusFinderProps {
  gameId: string;
}

export function FocusFinder({ gameId }: FocusFinderProps) {
  return (
    <GameContainer
      gameId={gameId}
      title="Focus Finder"
      skill="Selective Attention"
      colorClass="from-rose-500 to-red-500"
      tutorialSteps={[
        {
          text: "We will show you a target object to find.",
          visual: (
            <div className="flex flex-col items-center justify-center rounded-2xl bg-rose-50 p-6">
              <div className="text-sm font-semibold uppercase tracking-wide text-rose-500">Find this!</div>
              <motion.div
                className="mt-2 text-6xl"
                animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                🍎
              </motion.div>
            </div>
          )
        },
        {
          text: "Scan the screen and tap the exact match among all the other items.",
          visual: (
            <div className="relative h-48 w-48 rounded-2xl bg-slate-100 overflow-hidden">
              <div className="absolute left-[10%] top-[20%] text-4xl opacity-50">🧸</div>
              <div className="absolute left-[60%] top-[10%] text-4xl opacity-50">🚗</div>
              <div className="absolute left-[20%] top-[60%] text-4xl opacity-50">⚽</div>
              
              <motion.div
                className="absolute left-[50%] top-[50%] text-4xl z-10"
                style={{ x: "-50%", y: "-50%" }}
                whileHover={{ scale: 1.2 }}
              >
                🍎
              </motion.div>
              
              <motion.div
                className="absolute text-2xl z-20"
                animate={{
                  x: [0, 80, 80],
                  y: [0, 80, 80],
                  scale: [1, 1, 0.8]
                }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              >
                👆
              </motion.div>
            </div>
          )
        },
        {
          text: "Be quick and careful — don't tap the wrong ones! Find them all to win.",
          visual: (
            <div className="flex items-center justify-center gap-4">
              <motion.div
                className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-100 text-5xl ring-4 ring-emerald-500"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                ✅
              </motion.div>
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-rose-100 text-5xl opacity-50">
                ❌
              </div>
            </div>
          )
        }
      ]}
    >
      {({ level, onComplete }) => <FocusFinderGame level={level} onComplete={onComplete} />}
    </GameContainer>
  );
}

function FocusFinderGame({ level, onComplete }: { level: number; onComplete: (s: any) => void }) {
  const [target, setTarget] = useState<string>("");
  const [items, setItems] = useState<{ id: number; emoji: string; x: number; y: number; scale: number }[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [round, setRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(3);
  const [startTime, setStartTime] = useState(Date.now());
  const [found, setFound] = useState(false);
  const [rewardEvents, setRewardEvents] = useState<RewardEvent[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMaxRounds(Math.min(15, 3 + Math.floor(level / 2))); // unlimited round scaling
    setMistakes(0);
    setRewardEvents([]);
    setRound(1);
    setStartTime(Date.now());
    generateRound(level);
  }, [level]);

  const generateRound = (lvl: number) => {
    // Unlimited scaling: max 120 items so it doesn't crash, scale gets smaller but clamped
    const numItems = Math.min(120, lvl * 8); 
    const baseScale = Math.max(0.4, 1.2 - (lvl * 0.1)); // gets smaller at higher levels, clamped at 0.4
    
    // Pick target
    const currentTarget = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    setTarget(currentTarget);
    setFound(false);

    // Pick distractors (everything except target)
    const distractors = EMOJIS.filter(e => e !== currentTarget);
    
    const newItems = [];
    
    // 1 target
    newItems.push({
      id: 0,
      emoji: currentTarget,
      x: Math.random() * 80 + 10, // 10% to 90% bounds
      y: Math.random() * 80 + 10,
      scale: baseScale * (0.8 + Math.random() * 0.4) // slight random sizing
    });
    
    // N-1 distractors
    for (let i = 1; i < numItems; i++) {
      newItems.push({
        id: i,
        emoji: distractors[Math.floor(Math.random() * distractors.length)],
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        scale: baseScale * (0.8 + Math.random() * 0.4)
      });
    }

    // Shuffle so target isn't always first
    setItems(newItems.sort(() => Math.random() - 0.5));
  };

  const handleItemClick = (emoji: string, e: React.MouseEvent) => {
    if (found) return;

    if (emoji === target) {
      setFound(true);
      
      audio.playRewardChime();
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setRewardEvents(prev => [...prev, { id: Math.random().toString(), x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }]);

      setTimeout(() => {
        if (round >= maxRounds) {
          handleWin(mistakes);
        } else {
          setRound(r => r + 1);
          generateRound(level);
        }
      }, 500);
    } else {
      audio.playErrorSound();
      setMistakes(m => m + 1);
      // Brief penalty flash could go here
    }
  };

  const handleWin = (totalMistakes: number) => {
    const accuracy = Math.max(0, 100 - (totalMistakes * 10));
    // Time matters more in focus finder
    const timeTaken = (Date.now() - startTime) / 1000;
    const score = Math.max(10, 1000 - (totalMistakes * 50) - (timeTaken * 15));
    
    onComplete({
      accuracy,
      mistakes: totalMistakes,
      reactionMs: Math.round((timeTaken / maxRounds) * 1000), // average reaction per round
      score: Math.round(score)
    });
  };

  return (
    <div className="flex h-full flex-col p-4 relative">
      <RewardParticles events={rewardEvents} />
      <div className="mb-4 flex w-full items-center justify-between text-sm font-semibold text-muted-foreground">
        <div>Round: {round} / {maxRounds}</div>
        <div>Mistakes: {mistakes}</div>
      </div>

      <div className="mb-6 flex flex-col items-center justify-center rounded-2xl bg-rose-50 py-4">
        <div className="text-sm font-semibold uppercase tracking-wide text-rose-500">Find this!</div>
        <div className="mt-1 text-5xl">{target}</div>
      </div>

      <div ref={containerRef} className="relative flex-1 min-h-[400px] rounded-3xl bg-muted/50 overflow-hidden">
        {items.map(item => (
          <button
            key={item.id}
            onClick={(e) => handleItemClick(item.emoji, e)}
            className="absolute grid place-items-center transition-transform hover:scale-110"
            style={{
              left: `${item.x}%`,
              top: `${item.y}%`,
              transform: `translate(-50%, -50%) scale(${item.scale})`,
              fontSize: "2.5rem"
            }}
          >
            {item.emoji}
          </button>
        ))}
        {found && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              className="text-6xl"
            >
              ✅
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
