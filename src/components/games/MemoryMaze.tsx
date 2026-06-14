import { useState, useEffect } from "react";
import { GameContainer } from "./GameContainer";
import { audio } from "@/lib/audio";
import { RewardParticles, type RewardEvent } from "./RewardParticles";
import { motion } from "framer-motion";

interface MemoryMazeProps {
  gameId: string;
}

export function MemoryMaze({ gameId }: MemoryMazeProps) {
  return (
    <GameContainer
      gameId={gameId}
      title="Memory Maze"
      skill="Spatial Memory"
      colorClass="from-blue-500 to-cyan-500"
      tutorialSteps={[
        {
          text: "A path will appear on the grid. Watch it carefully!",
          visual: (
            <div className="grid grid-cols-3 gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                const isPath = [0, 1, 4, 7, 8].includes(i);
                return (
                  <motion.div
                    key={i}
                    className={`h-12 w-12 rounded-xl ${isPath ? "bg-blue-400" : "bg-slate-100"}`}
                    animate={isPath ? { opacity: [1, 1, 0, 0, 1] } : {}}
                    transition={{ duration: 4, repeat: Infinity, times: [0, 0.4, 0.5, 0.9, 1] }}
                  />
                );
              })}
            </div>
          )
        },
        {
          text: "After a few seconds, the path will disappear.",
          visual: (
            <div className="grid grid-cols-3 gap-1">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className={`h-12 w-12 rounded-xl bg-slate-100 ${i === 0 ? "ring-2 ring-blue-500 ring-offset-2" : ""} ${i === 8 ? "ring-2 ring-emerald-500 ring-offset-2" : ""}`} />
              ))}
            </div>
          )
        },
        {
          text: "Retrace the path from Start (S) to End (E) to win the round!",
          visual: (
            <div className="grid grid-cols-3 gap-1 relative">
              {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
                const isPath = [0, 1, 4, 7, 8].includes(i);
                return (
                  <motion.div
                    key={i}
                    className={`h-12 w-12 rounded-xl ${isPath ? "bg-blue-500" : "bg-slate-100"}`}
                    initial={{ opacity: isPath ? 0 : 1 }}
                    animate={{ opacity: 1 }}
                    transition={isPath ? { delay: [0, 1, 4, 7, 8].indexOf(i) * 0.5, duration: 0.2, repeat: Infinity, repeatDelay: 3 } : {}}
                  />
                );
              })}
              <motion.div
                className="absolute h-8 w-8 text-2xl z-10"
                animate={{
                  x: [6, 6 + 52, 6 + 52, 6 + 52, 6 + 104],
                  y: [6, 6, 6 + 52, 6 + 104, 6 + 104],
                  opacity: [1, 1, 1, 1, 1, 0]
                }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
              >
                👆
              </motion.div>
            </div>
          )
        }
      ]}
    >
      {({ level, onComplete }) => <MemoryMazeGame level={level} onComplete={onComplete} />}
    </GameContainer>
  );
}

function MemoryMazeGame({ level, onComplete }: { level: number; onComplete: (s: any) => void }) {
  const [gridSize, setGridSize] = useState(4); // 1=4, 2=5, 3=6, 4=7, 5=8
  const [path, setPath] = useState<number[]>([]);
  const [playerPath, setPlayerPath] = useState<number[]>([]);
  const [phase, setPhase] = useState<"MEMORIZE" | "PLAY" | "RESULT">("MEMORIZE");
  
  const [round, setRound] = useState(1);
  const [maxRounds, setMaxRounds] = useState(3);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [rewardEvents, setRewardEvents] = useState<RewardEvent[]>([]);

  useEffect(() => {
    // Unlimited scaling: cap grid at 8x8, scale up rounds
    const size = Math.min(8, level + 3); 
    setGridSize(size);
    setMaxRounds(Math.min(15, 3 + Math.floor(level / 2)));
    setMistakes(0);
    setRewardEvents([]);
    setRound(1);
    setStartTime(Date.now());
    generateMaze(size);
  }, [level]);

  const generateMaze = (size: number) => {
    // Generate a simple continuous random path from top-left (0) to bottom-right (size*size - 1)
    const newPath = [0];
    let current = 0;
    const target = size * size - 1;
    
    while (current !== target) {
      const row = Math.floor(current / size);
      const col = current % size;
      
      const possibleMoves = [];
      if (col < size - 1) possibleMoves.push(current + 1); // right
      if (row < size - 1) possibleMoves.push(current + size); // down
      
      // Filter out moves that are already in path (no loops)
      const validMoves = possibleMoves.filter(m => !newPath.includes(m));
      
      if (validMoves.length === 0) {
        // Stuck? Try again (shouldn't happen with just right/down, but safe fallback)
        return generateMaze(size);
      }
      
      current = validMoves[Math.floor(Math.random() * validMoves.length)];
      newPath.push(current);
    }
    
    setPath(newPath);
    setPlayerPath([0]); // start at 0
    setPhase("MEMORIZE");
    
    setTimeout(() => {
      setPhase("PLAY");
    }, 2000 + (level * 500)); // show longer for larger mazes
  };

  const handleCellClick = (index: number, e: React.MouseEvent) => {
    if (phase !== "PLAY") return;
    
    // Must click adjacent to current position
    const current = playerPath[playerPath.length - 1];
    
    // Allow clicking only valid next step in path
    const expectedNext = path[playerPath.length];
    
    if (index === expectedNext) {
      const newPlayerPath = [...playerPath, index];
      setPlayerPath(newPlayerPath);
      
      audio.playRewardChime();
      const rect = (e.target as HTMLElement).getBoundingClientRect();
      setRewardEvents(prev => [...prev, { id: Math.random().toString(), x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }]);

      if (newPlayerPath.length === path.length) {
        // Won round
        setPhase("RESULT");
        if (round >= maxRounds) {
          handleWin(mistakes);
        } else {
          setTimeout(() => {
            setRound(r => r + 1);
            generateMaze(gridSize); // same size, new maze
          }, 1000);
        }
      }
    } else {
      // Mistake!
      audio.playErrorSound();
      setMistakes(m => m + 1);
    }
  };

  const handleWin = (totalMistakes: number) => {
    const accuracy = Math.max(0, 100 - (totalMistakes * 10));
    const score = Math.max(10, 1000 - (totalMistakes * 50) - ((Date.now() - startTime) / 1000) * 8);
    
    setTimeout(() => {
      onComplete({
        accuracy,
        mistakes: totalMistakes,
        reactionMs: 0,
        score: Math.round(score)
      });
    }, 1000);
  };

  return (
    <div className="flex h-full flex-col items-center justify-between p-4 py-8 relative">
      <RewardParticles events={rewardEvents} />
      <div className="flex w-full max-w-sm items-center justify-between text-sm font-semibold text-muted-foreground">
        <div>Round: {round} / {maxRounds}</div>
        <div>Mistakes: {mistakes}</div>
      </div>

      <div className="mt-8 text-center text-lg font-bold">
        {phase === "MEMORIZE" && <span className="text-blue-500">Memorize the path!</span>}
        {phase === "PLAY" && <span className="text-foreground">Recreate the path</span>}
        {phase === "RESULT" && <span className="text-emerald-500">Correct!</span>}
      </div>

      <div 
        className="mt-8 grid gap-1 sm:gap-2"
        style={{ gridTemplateColumns: `repeat(${gridSize}, minmax(0, 1fr))` }}
      >
        {Array(gridSize * gridSize).fill(null).map((_, i) => {
          const isPath = path.includes(i);
          const isPlayerPath = playerPath.includes(i);
          const isStart = i === 0;
          const isEnd = i === gridSize * gridSize - 1;
          
          let bg = "bg-muted";
          if (phase === "MEMORIZE" && isPath) bg = "bg-blue-400";
          if ((phase === "PLAY" || phase === "RESULT") && isPlayerPath) bg = "bg-blue-500";
          
          return (
            <button
              key={i}
              onClick={(e) => handleCellClick(i, e)}
              className={`h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 rounded-md sm:rounded-xl transition-colors ${bg} ${isStart ? "ring-2 ring-blue-500 ring-offset-2" : ""} ${isEnd ? "ring-2 ring-emerald-500 ring-offset-2" : ""}`}
            >
              {isStart && <span className="text-xs font-bold text-white">S</span>}
              {isEnd && <span className="text-xs font-bold text-white">E</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
