import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { GameContainer } from "./GameContainer";
import { audio } from "@/lib/audio";
import { RewardParticles, type RewardEvent } from "./RewardParticles";

const EMOJIS = ["🦊", "🐼", "🦉", "🦄", "🐶", "🐱", "🐸", "🐰", "🦁", "🐧"];

interface MemoryMatchProps {
  gameId: string;
}

export function MemoryMatch({ gameId }: MemoryMatchProps) {
  return (
    <GameContainer
      gameId={gameId}
      title="Memory Match"
      skill="Visual Memory"
      colorClass="from-violet-500 to-indigo-600"
      tutorialSteps={[
        {
          text: "Let's train your memory! Tap on the cards to flip them over.",
          visual: (
            <div className="grid grid-cols-2 gap-4">
              {[0, 1].map((i) => (
                <motion.div
                  key={i}
                  className="flex h-24 w-24 cursor-pointer items-center justify-center rounded-2xl bg-violet-500 text-4xl shadow-md"
                  animate={{ rotateY: [0, 180, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, delay: i * 0.5 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  <div className="absolute inset-0 rounded-2xl bg-violet-500" style={{ backfaceVisibility: "hidden" }} />
                  <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                    ❓
                  </div>
                </motion.div>
              ))}
            </div>
          )
        },
        {
          text: "If the two cards match, they stay open. Great job!",
          visual: (
            <div className="grid grid-cols-2 gap-4">
              {[0, 1].map((i) => (
                <motion.div
                  key={i}
                  className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white text-5xl shadow-md ring-4 ring-emerald-400"
                  initial={{ rotateY: 180, scale: 0.8 }}
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                >
                  🐧
                </motion.div>
              ))}
            </div>
          )
        },
        {
          text: "If they don't match, remember where they are! Find all pairs to win.",
          visual: (
            <div className="grid grid-cols-2 gap-4">
              <motion.div
                className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white text-5xl shadow-md"
                animate={{ rotateY: [180, 0, 180] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="absolute inset-0 rounded-2xl bg-violet-500" style={{ backfaceVisibility: "hidden" }} />
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                  🦊
                </div>
              </motion.div>
              <motion.div
                className="flex h-24 w-24 items-center justify-center rounded-2xl bg-white text-5xl shadow-md"
                animate={{ rotateY: [180, 0, 180] }}
                transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="absolute inset-0 rounded-2xl bg-violet-500" style={{ backfaceVisibility: "hidden" }} />
                <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
                  🐼
                </div>
              </motion.div>
            </div>
          )
        }
      ]}
    >
      {({ level, onComplete }) => <MemoryMatchGame level={level} onComplete={onComplete} />}
    </GameContainer>
  );
}

function MemoryMatchGame({ level, onComplete }: { level: number; onComplete: (s: any) => void }) {
  const [cards, setCards] = useState<{ id: number; emoji: string; isFlipped: boolean; isMatched: boolean }[]>([]);
  const [flippedIds, setFlippedIds] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState(Date.now());
  const [rewardEvents, setRewardEvents] = useState<RewardEvent[]>([]);

  // Setup level
  useEffect(() => {
    // Unlimited scaling: start with 3 pairs, add 1 pair every level, max 18 pairs to fit on screen
    const numPairs = Math.min(3 + (level - 1), 18);
    
    // We only have 10 unique emojis, so we recycle them if numPairs > 10
    const selectedEmojis = [];
    for (let i = 0; i < numPairs; i++) {
      selectedEmojis.push(EMOJIS[i % EMOJIS.length]);
    }

    const gameCards = [...selectedEmojis, ...selectedEmojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({ id: index, emoji, isFlipped: false, isMatched: false }));
      
    setCards(gameCards);
    setFlippedIds([]);
    setMoves(0);
    setMistakes(0);
    setRewardEvents([]);
    setStartTime(Date.now());
  }, [level]);

  // Handle card click
  const handleCardClick = (id: number) => {
    if (flippedIds.length === 2) return; // Prevent clicking while animating
    if (cards.find(c => c.id === id)?.isFlipped) return; // Already flipped

    const newFlipped = [...flippedIds, id];
    setFlippedIds(newFlipped);
    
    setCards(prev => prev.map(c => c.id === id ? { ...c, isFlipped: true } : c));

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [firstId, secondId] = newFlipped;
      const firstCard = cards.find(c => c.id === firstId);
      const secondCard = cards.find(c => c.id === id); // the one we just clicked

      if (firstCard?.emoji === secondCard?.emoji) {
        // Match! Play reward
        audio.playRewardChime();
        
        // Trigger particles at approximate center of screen (since we don't have exact card coords easily without refs)
        setRewardEvents(prev => [...prev, { id: Math.random().toString(), x: window.innerWidth / 2, y: window.innerHeight / 2 }]);

        setTimeout(() => {
          setCards(prev => prev.map(c => c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c));
          setFlippedIds([]);
          
          // Check win condition
          setCards(latestCards => {
            const allMatched = latestCards.every(c => c.isMatched || c.id === firstId || c.id === secondId);
            if (allMatched) {
              handleWin(latestCards.length / 2, moves + 1, mistakes);
            }
            return latestCards;
          });
        }, 500);
      } else {
        // No match
        setMistakes(m => m + 1);
        setTimeout(() => {
          setCards(prev => prev.map(c => c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c));
          setFlippedIds([]);
        }, 1000);
      }
    }
  };

  const handleWin = (totalPairs: number, totalMoves: number, totalMistakes: number) => {
    const minPossibleMoves = totalPairs;
    // Calculate accuracy: perfect is totalPairs == totalMoves.
    // 0 mistakes = 100%. 1 mistake = drops accuracy.
    const accuracy = Math.max(0, 100 - (totalMistakes * 10)); // simple penalty
    const score = Math.max(10, 1000 - (totalMistakes * 50) - ((Date.now() - startTime) / 1000) * 5);
    
    setTimeout(() => {
      onComplete({
        accuracy,
        mistakes: totalMistakes,
        reactionMs: 0,
        score: Math.round(score)
      });
    }, 1000);
  };

  // Determine columns based on number of pairs
  const totalCards = cards.length;
  let cols = "grid-cols-3";
  if (totalCards >= 16) cols = "grid-cols-4 sm:grid-cols-6";
  else if (totalCards >= 12) cols = "grid-cols-4";
  else if (totalCards >= 8) cols = "grid-cols-3 sm:grid-cols-4";

  return (
    <div className="flex h-full flex-col items-center justify-center relative">
      <RewardParticles events={rewardEvents} />
      <div className="mb-6 flex w-full max-w-md items-center justify-between text-sm font-semibold text-muted-foreground">
        <div>Moves: {moves}</div>
        <div>Pairs: {cards.filter(c => c.isMatched).length / 2} / {cards.length / 2}</div>
      </div>
      
      <div className={`grid ${cols} gap-3 sm:gap-4`}>
        {cards.map(card => (
          <motion.div
            key={card.id}
            onClick={() => handleCardClick(card.id)}
            className={`relative flex h-20 w-20 cursor-pointer items-center justify-center rounded-2xl text-4xl shadow-[var(--shadow-sm)] sm:h-24 sm:w-24 ${
              card.isFlipped || card.isMatched ? "bg-white" : "bg-violet-500 hover:bg-violet-600"
            }`}
            animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            style={{ transformStyle: "preserve-3d" }}
          >
            <div
              className="absolute flex h-full w-full items-center justify-center rounded-2xl"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              {(card.isFlipped || card.isMatched) ? card.emoji : ""}
            </div>
            {card.isMatched && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 rounded-2xl ring-4 ring-emerald-400"
              />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
