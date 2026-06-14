import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { GameContainer } from "./GameContainer";
import { audio } from "@/lib/audio";
import { RewardParticles, type RewardEvent } from "./RewardParticles";

const COLORS = [
  { id: "red", bg: "bg-red-500", ring: "ring-red-400" },
  { id: "blue", bg: "bg-blue-500", ring: "ring-blue-400" },
  { id: "green", bg: "bg-green-500", ring: "ring-green-400" },
  { id: "yellow", bg: "bg-yellow-400", ring: "ring-yellow-300" },
];

interface ColorSequenceProps {
  gameId: string;
}

export function ColorSequence({ gameId }: ColorSequenceProps) {
  return (
    <GameContainer
      gameId={gameId}
      title="Color Sequence"
      skill="Working Memory"
      colorClass="from-amber-400 to-orange-500"
      tutorialSteps={[
        {
          text: "Watch the colors light up carefully...",
          visual: (
            <div className="grid grid-cols-2 gap-4">
              {[{ id: "red", bg: "bg-red-500", ring: "ring-red-400", delay: 0 },
                { id: "blue", bg: "bg-blue-500", ring: "ring-blue-400", delay: 2 },
                { id: "green", bg: "bg-green-500", ring: "ring-green-400", delay: 1 },
                { id: "yellow", bg: "bg-yellow-400", ring: "ring-yellow-300", delay: 3 }
              ].map((c) => (
                <motion.div
                  key={c.id}
                  className={`h-16 w-16 rounded-full opacity-50 ${c.bg}`}
                  animate={{ opacity: [0.5, 1, 0.5], scale: [1, 1.1, 1], filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"] }}
                  transition={{ duration: 0.5, delay: c.delay * 1, repeat: Infinity, repeatDelay: 3 }}
                />
              ))}
            </div>
          )
        },
        {
          text: "Remember the exact order they lit up in!",
          visual: (
            <div className="flex flex-col items-center gap-6">
              <div className="flex gap-2">
                <div className="h-4 w-4 rounded-full bg-red-500" />
                <div className="h-4 w-4 rounded-full bg-green-500" />
                <div className="h-4 w-4 rounded-full bg-blue-500" />
                <div className="h-4 w-4 rounded-full bg-yellow-400" />
              </div>
            </div>
          )
        },
        {
          text: "Now it's your turn! Tap the colors in the same order to win.",
          visual: (
            <div className="grid grid-cols-2 gap-4">
              {[{ id: "red", bg: "bg-red-500" },
                { id: "blue", bg: "bg-blue-500" },
                { id: "green", bg: "bg-green-500" },
                { id: "yellow", bg: "bg-yellow-400" }
              ].map((c) => (
                <motion.div
                  key={c.id}
                  className={`h-16 w-16 rounded-full opacity-80 ${c.bg}`}
                  whileHover={{ scale: 1.1, opacity: 1 }}
                />
              ))}
              <motion.div
                className="absolute left-[15%] top-[15%] h-8 w-8"
                animate={{ x: [0, 80, 0, 80], y: [0, 80, 80, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                👆
              </motion.div>
            </div>
          )
        }
      ]}
    >
      {({ level, onComplete }) => <ColorSequenceGame level={level} onComplete={onComplete} />}
    </GameContainer>
  );
}

function ColorSequenceGame({ level, onComplete }: { level: number; onComplete: (s: any) => void }) {
  const [sequence, setSequence] = useState<string[]>([]);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [round, setRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(3);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [rewardEvents, setRewardEvents] = useState<RewardEvent[]>([]);

  const timeoutRef = useRef<any>(null);

  useEffect(() => {
    const seqLength = level + 2;
    // Unlimited scaling via seqLength and round increases
    setMaxRounds(Math.min(10, 3 + Math.floor(level / 3)));
    setMistakes(0);
    setRewardEvents([]);
    setRound(1);
    setStartTime(Date.now());
    generateSequence(seqLength);
    
    return () => clearTimeout(timeoutRef.current);
  }, [level]);

  const generateSequence = (length: number) => {
    const seq: string[] = [];
    for (let i = 0; i < length; i++) {
      seq.push(COLORS[Math.floor(Math.random() * COLORS.length)].id);
    }
    setSequence(seq);
    setPlayerSequence([]);
    
    // Play sequence after a short delay
    timeoutRef.current = setTimeout(() => {
      playSequence(seq);
    }, 1000);
  };

  const playSequence = async (seq: string[]) => {
    setIsPlaying(true);
    for (let i = 0; i < seq.length; i++) {
      setActiveColor(seq[i]);
      await new Promise(r => setTimeout(r, Math.max(150, 600 - (level * 40)))); // gets faster but clamped
      setActiveColor(null);
      await new Promise(r => setTimeout(r, Math.max(50, 200 - (level * 10))));
    }
    setIsPlaying(false);
  };

  const handleColorTap = (colorId: string, e: React.MouseEvent) => {
    if (isPlaying) return;

    setActiveColor(colorId);
    setTimeout(() => setActiveColor(null), 200);

    const newPlayerSeq = [...playerSequence, colorId];
    setPlayerSequence(newPlayerSeq);

    // Check correctness
    const currentIndex = newPlayerSeq.length - 1;
    if (newPlayerSeq[currentIndex] !== sequence[currentIndex]) {
      // Mistake!
      audio.playErrorSound();
      setMistakes(m => m + 1);
      setPlayerSequence([]); // reset this round
      // Replay sequence
      setTimeout(() => playSequence(sequence), 1000);
      return;
    }

    // Correct tap!
    audio.playRewardChime();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setRewardEvents(prev => [...prev, { id: Math.random().toString(), x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }]);

    if (newPlayerSeq.length === sequence.length) {
      // Round won!
      if (round >= maxRounds) {
        handleWin(mistakes);
      } else {
        setTimeout(() => {
          setRound(r => r + 1);
          generateSequence(sequence.length + 1); // get harder each round within the same level
        }, 1000);
      }
    }
  };

  const handleWin = (totalMistakes: number) => {
    const accuracy = Math.max(0, 100 - (totalMistakes * 15));
    const score = Math.max(10, 1000 - (totalMistakes * 50) - ((Date.now() - startTime) / 1000) * 10);
    
    onComplete({
      accuracy,
      mistakes: totalMistakes,
      reactionMs: 0,
      score: Math.round(score)
    });
  };

  return (
    <div className="flex h-full flex-col items-center justify-between p-4 py-8 relative">
      <RewardParticles events={rewardEvents} />
      <div className="flex w-full max-w-sm items-center justify-between text-sm font-semibold text-muted-foreground">
        <div>Round: {round} / {maxRounds}</div>
        <div>Mistakes: {mistakes}</div>
      </div>

      <div className="mt-8 flex justify-center gap-2">
        {sequence.map((_, i) => (
          <div
            key={i}
            className={`h-4 w-4 rounded-full transition-colors ${
              i < playerSequence.length ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      <div className="mt-16 grid grid-cols-2 gap-6">
        {COLORS.map(c => (
          <button
            key={c.id}
            disabled={isPlaying}
            onPointerDown={(e) => handleColorTap(c.id, e as any)}
            className={`h-32 w-32 rounded-full transition-all ${c.bg} ${
              activeColor === c.id ? `scale-105 brightness-150 ring-8 ${c.ring} ring-offset-4` : "opacity-80 hover:opacity-100"
            }`}
          />
        ))}
      </div>
      
      <div className="mt-12 text-sm font-semibold text-muted-foreground">
        {isPlaying ? "Watch the sequence..." : "Your turn!"}
      </div>
    </div>
  );
}
