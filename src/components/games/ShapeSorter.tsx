import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GameContainer } from "./GameContainer";
import { audio } from "@/lib/audio";
import { RewardParticles, type RewardEvent } from "./RewardParticles";

const SHAPES = [
  { id: "apple", emoji: "🍎" },
  { id: "banana", emoji: "🍌" },
  { id: "car", emoji: "🚗" },
  { id: "star", emoji: "⭐" },
  { id: "tree", emoji: "🌲" },
  { id: "cat", emoji: "🐱" },
  { id: "sun", emoji: "☀️" },
  { id: "moon", emoji: "🌙" },
  { id: "heart", emoji: "❤️" },
  { id: "rocket", emoji: "🚀" },
  { id: "flower", emoji: "🌻" },
  { id: "diamond", emoji: "💎" },
  { id: "ball", emoji: "⚽" },
  { id: "book", emoji: "📚" },
  { id: "bear", emoji: "🧸" },
  { id: "pizza", emoji: "🍕" }
];

interface ShapeSorterProps {
  gameId: string;
}

export function ShapeSorter({ gameId }: ShapeSorterProps) {
  return (
    <GameContainer
      gameId={gameId}
      title="Smart Shape Sorter"
      skill="Logic"
      colorClass="from-teal-400 to-emerald-500"
      tutorialSteps={[
        {
          text: "Let's sort some shapes! Drag the object to its matching silhouette.",
          visual: (
            <div className="relative flex h-48 w-48 items-center justify-center rounded-2xl bg-teal-50">
              <motion.div
                className="absolute flex h-20 w-20 items-center justify-center text-6xl"
                initial={{ x: -60, y: 0 }}
                animate={{ x: 60, y: 0 }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                style={{ zIndex: 10 }}
              >
                🍎
              </motion.div>
              <div className="absolute right-4 h-20 w-20 rounded-2xl bg-black/10 text-6xl opacity-50 grayscale filter" style={{ transform: "translateX(20px)" }}>
                🍎
              </div>
            </div>
          )
        },
        {
          text: "When it perfectly overlaps, it snaps into place!",
          visual: (
            <div className="flex h-48 w-48 items-center justify-center rounded-2xl bg-teal-50">
              <motion.div
                className="flex h-20 w-20 items-center justify-center text-6xl drop-shadow-md"
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                🍎
                <motion.div
                  className="absolute inset-0 rounded-2xl ring-4 ring-emerald-400"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: [0, 1, 0], scale: [0.8, 1.3, 1.5] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              </motion.div>
            </div>
          )
        },
        {
          text: "Sort all the objects as fast as you can to earn maximum points!",
          visual: (
            <div className="grid grid-cols-2 gap-4">
              {["🍌", "🚗", "🧸"].map((emoji, i) => (
                <motion.div
                  key={i}
                  className="flex h-16 w-16 items-center justify-center text-5xl"
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.3, repeat: Infinity, repeatDelay: 2 }}
                >
                  {emoji}
                </motion.div>
              ))}
            </div>
          )
        }
      ]}
    >
      {({ level, onComplete }) => <ShapeSorterGame level={level} onComplete={onComplete} />}
    </GameContainer>
  );
}

function ShapeSorterGame({ level, onComplete }: { level: number; onComplete: (s: any) => void }) {
  const [shapes, setShapes] = useState<typeof SHAPES>([]);
  const [objects, setObjects] = useState<{ id: string; shapeId: string; emoji: string; sorted: boolean }[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [wrongShake, setWrongShake] = useState<string | null>(null);
  const [rewardEvents, setRewardEvents] = useState<RewardEvent[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Unlimited scaling: start with 2, add 1 per level, up to the max available shapes (16)
    const count = Math.min(2 + (level - 1), SHAPES.length);
    const activeShapes = [...SHAPES].sort(() => Math.random() - 0.5).slice(0, count);
    setShapes(activeShapes);

    const numObjects = count;
    let newObjects: any[] = [];
    
    for (let i = 0; i < numObjects; i++) {
      const shape = activeShapes[i];
      newObjects.push({
        id: `obj-${shape.id}-${i}`,
        shapeId: shape.id,
        emoji: shape.emoji,
        sorted: false
      });
    }

    setObjects(newObjects.sort(() => Math.random() - 0.5));
    setMistakes(0);
    setRewardEvents([]);
    setStartTime(Date.now());
  }, [level]);

  const handleDragEnd = (event: any, info: any, object: any) => {
    const el = event.target as HTMLElement;
    
    // Temporarily disable pointer events on the dragged element so we can see what's underneath it
    const originalEvents = el.style.pointerEvents;
    const originalDisplay = el.style.display;
    el.style.display = "none";
    
    // Find the element underneath the pointer
    const dropTarget = document.elementFromPoint(info.point.x, info.point.y);
    
    // Restore the dragged element
    el.style.display = originalDisplay;

    let success = false;

    if (dropTarget) {
      // Traverse up to find data-shape-id just in case they dropped it on an inner element
      const targetContainer = dropTarget.closest("[data-shape-id]");
      if (targetContainer) {
        const targetId = targetContainer.getAttribute("data-shape-id");
        
        if (targetId === object.shapeId) {
          // Correct!
          success = true;
          
          audio.playRewardChime();
          // Find center of target element for particle burst
          const rect = targetContainer.getBoundingClientRect();
          setRewardEvents(prev => [...prev, { id: Math.random().toString(), x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }]);

          setObjects(prev => prev.map(o => o.id === object.id ? { ...o, sorted: true } : o));
          
          // Check win
          setObjects(latest => {
            if (latest.every(o => o.sorted)) {
              handleWin(latest.length, mistakes);
            }
            return latest;
          });
        } else {
          // Mistake - dropped on wrong hole
          setMistakes(m => m + 1);
          setWrongShake(object.id);
          setTimeout(() => setWrongShake(null), 500);
        }
      }
    }
  };

  const handleWin = (totalObjects: number, totalMistakes: number) => {
    const accuracy = Math.max(0, 100 - (totalMistakes * 15));
    const score = Math.max(10, 1000 - (totalMistakes * 50) - ((Date.now() - startTime) / 1000) * 10);
    
    setTimeout(() => {
      onComplete({
        accuracy,
        mistakes: totalMistakes,
        reactionMs: 0,
        score: Math.round(score)
      });
    }, 800);
  };

  return (
    <div ref={containerRef} className="flex h-full flex-col items-center p-4 relative">
      <RewardParticles events={rewardEvents} />
      <div className="mb-8 flex w-full max-w-lg items-center justify-between text-sm font-semibold text-muted-foreground">
        <div>Sorted: {objects.filter(o => o.sorted).length} / {objects.length}</div>
        <div>Mistakes: {mistakes}</div>
      </div>

      {/* Holes / Silhouettes */}
      <div className="mb-16 flex flex-wrap justify-center gap-6">
        {shapes.map(shape => {
          const isFilled = objects.find(o => o.shapeId === shape.id && o.sorted);
          return (
            <div
              key={`hole-${shape.id}`}
              data-shape-id={shape.id}
              className={`relative grid h-28 w-28 place-items-center rounded-3xl border-4 ${
                isFilled ? "border-emerald-400 bg-emerald-50" : "border-dashed border-teal-200 bg-teal-50/50"
              } transition-colors`}
            >
              <AnimatePresence>
                {isFilled ? (
                  <motion.div
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="text-6xl"
                  >
                    {shape.emoji}
                  </motion.div>
                ) : (
                  <div className="text-6xl brightness-0 opacity-[0.15]">
                    {shape.emoji}
                  </div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Objects to Drag */}
      <div className="relative flex min-h-[12rem] w-full max-w-lg flex-wrap justify-center gap-4 rounded-3xl bg-muted p-6">
        {objects.map(obj => {
          if (obj.sorted) return null; // Hide if sorted
          return (
            <motion.div
              key={obj.id}
              drag
              dragConstraints={containerRef}
              dragElastic={0.5}
              dragSnapToOrigin={true}
              onDragEnd={(e, info) => handleDragEnd(e, info, obj)}
              whileDrag={{ scale: 1.2, zIndex: 50, cursor: "grabbing" }}
              animate={wrongShake === obj.id ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.3 }}
              className="grid h-20 w-20 cursor-grab place-items-center rounded-2xl bg-white text-5xl shadow-md touch-none"
            >
              {obj.emoji}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
