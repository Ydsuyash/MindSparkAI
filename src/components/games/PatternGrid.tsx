import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GameContainer } from "./GameContainer";
import { audio } from "@/lib/audio";
import { RewardParticles, type RewardEvent } from "./RewardParticles";

const SHAPES = ["🔴", "🟦", "🔺", "⭐", "❤️", "🔶"];

interface PatternGridProps {
  gameId: string;
}

export function PatternGrid({ gameId }: PatternGridProps) {
  return (
    <GameContainer
      gameId={gameId}
      title="Pattern Grid"
      skill="Pattern"
      colorClass="from-fuchsia-500 to-pink-500"
      tutorialSteps={[
        {
          text: "Look carefully at the pattern of shapes in the grid.",
          visual: (
            <div className="grid grid-cols-2 gap-2">
              {["🔴", "🟦", "🔴", "❓"].map((shape, i) => (
                <div
                  key={i}
                  className={`flex h-16 w-16 items-center justify-center rounded-2xl text-4xl shadow-sm ${
                    shape === "❓" ? "border-4 border-dashed border-fuchsia-300 bg-fuchsia-50" : "bg-white"
                  }`}
                >
                  {shape}
                </div>
              ))}
            </div>
          )
        },
        {
          text: "One piece is missing. Can you guess what comes next?",
          visual: (
            <div className="flex flex-col items-center gap-4">
              <div className="flex gap-2">
                <motion.div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-4xl shadow-md ring-4 ring-emerald-400"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  🟦
                </motion.div>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-4xl shadow-sm opacity-50">
                  ⭐
                </div>
              </div>
            </div>
          )
        },
        {
          text: "Choose the correct missing piece to complete the pattern!",
          visual: (
            <div className="grid grid-cols-2 gap-2 relative">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-4xl shadow-sm">🔴</div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-4xl shadow-sm">🟦</div>
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-4xl shadow-sm">🔴</div>
              <motion.div
                className="absolute right-0 bottom-0 flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-4xl shadow-md ring-4 ring-emerald-400"
                initial={{ y: 80, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 1 }}
              >
                🟦
              </motion.div>
            </div>
          )
        }
      ]}
    >
      {({ level, onComplete }) => <PatternGridGame level={level} onComplete={onComplete} />}
    </GameContainer>
  );
}

function PatternGridGame({ level, onComplete }: { level: number; onComplete: (s: any) => void }) {
  const [gridSize, setGridSize] = useState(2); // 2x2, 3x3, 4x4, 5x5
  const [grid, setGrid] = useState<string[]>([]);
  const [missingIndex, setMissingIndex] = useState(0);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [options, setOptions] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [round, setRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(3);
  const [startTime, setStartTime] = useState(Date.now());
  const [animating, setAnimating] = useState(false);
  const [rewardEvents, setRewardEvents] = useState<RewardEvent[]>([]);

  useEffect(() => {
    // Determine grid size based on level (max 6x6 to fit on screen)
    const size = Math.min(6, level + 1);
    setGridSize(size);
    // Unlimited scaling via maxRounds
    setMaxRounds(Math.min(15, 3 + Math.floor(level / 2)));
    setMistakes(0);
    setRewardEvents([]);
    setRound(1);
    setStartTime(Date.now());
    generatePattern(size);
  }, [level]);

  const generatePattern = (size: number) => {
    const totalCells = size * size;
    let newGrid: string[] = Array(totalCells).fill("");
    
    // Choose 2 shapes for simple alternating pattern (checkerboard or stripes)
    const shape1 = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    let shape2 = SHAPES[Math.floor(Math.random() * SHAPES.length)];
    while (shape2 === shape1) shape2 = SHAPES[Math.floor(Math.random() * SHAPES.length)];

    const patternType = Math.random() > 0.5 ? "checker" : "stripes";

    for (let i = 0; i < totalCells; i++) {
      const row = Math.floor(i / size);
      const col = i % size;
      
      if (patternType === "checker") {
        newGrid[i] = (row + col) % 2 === 0 ? shape1 : shape2;
      } else {
        newGrid[i] = row % 2 === 0 ? shape1 : shape2;
      }
    }

    // Pick a missing cell
    const mIndex = Math.floor(Math.random() * totalCells);
    const answer = newGrid[mIndex];
    newGrid[mIndex] = "?"; // Placeholder for UI

    // Generate options
    let opts = [answer];
    while (opts.length < Math.min(4, SHAPES.length)) {
      const rand = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      if (!opts.includes(rand)) opts.push(rand);
    }
    
    setGrid(newGrid);
    setMissingIndex(mIndex);
    setCorrectAnswer(answer);
    setOptions(opts.sort(() => Math.random() - 0.5));
    setAnimating(false);
  };

  const handleOptionClick = (opt: string, e: React.MouseEvent) => {
    if (animating) return;

    if (opt === correctAnswer) {
      setAnimating(true);
      
      audio.playRewardChime();
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setRewardEvents(prev => [...prev, { id: Math.random().toString(), x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }]);

      // Fill the grid temporarily
      const newGrid = [...grid];
      newGrid[missingIndex] = opt;
      setGrid(newGrid);

      setTimeout(() => {
        if (round >= maxRounds) {
          handleWin(mistakes);
        } else {
          setRound(r => r + 1);
          generatePattern(gridSize);
        }
      }, 800);
    } else {
      setMistakes(m => m + 1);
      // Brief visual feedback for mistake could be added here
    }
  };

  const handleWin = (totalMistakes: number) => {
    const accuracy = Math.max(0, 100 - (totalMistakes * 10));
    const score = Math.max(10, 1000 - (totalMistakes * 50) - ((Date.now() - startTime) / 1000) * 8);
    
    onComplete({
      accuracy,
      mistakes: totalMistakes,
      reactionMs: 0,
      score: Math.round(score)
    });
  };

  const gridClass = `grid gap-2 ${
    gridSize === 2 ? "grid-cols-2 max-w-[200px]" : 
    gridSize === 3 ? "grid-cols-3 max-w-[300px]" : 
    gridSize === 4 ? "grid-cols-4 max-w-[400px]" : 
    gridSize === 5 ? "grid-cols-5 max-w-[500px]" :
    "grid-cols-6 max-w-[600px]"
  }`;

  return (
    <div className="flex h-full flex-col items-center justify-between p-4 py-8 relative">
      <RewardParticles events={rewardEvents} />
      <div className="flex w-full max-w-md items-center justify-between text-sm font-semibold text-muted-foreground">
        <div>Round: {round} / {maxRounds}</div>
        <div>Mistakes: {mistakes}</div>
      </div>

      <div className={`mx-auto ${gridClass} mt-8`}>
        {grid.map((cell, i) => (
          <div
            key={i}
            className={`flex aspect-square items-center justify-center rounded-2xl text-4xl sm:text-5xl ${
              cell === "?" ? "border-4 border-dashed border-fuchsia-300 bg-fuchsia-50" : "bg-white shadow-[var(--shadow-sm)]"
            }`}
          >
            {cell !== "?" && cell}
          </div>
        ))}
      </div>

      <div className="mt-12 w-full max-w-md rounded-3xl bg-muted p-6">
        <div className="text-center text-sm font-semibold text-muted-foreground mb-4">Choose the missing piece</div>
        <div className="flex justify-center gap-4">
          {options.map((opt, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => handleOptionClick(opt, e)}
              className="grid h-16 w-16 place-items-center rounded-2xl bg-white text-4xl shadow-[var(--shadow-md)]"
            >
              {opt}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
