import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export interface RewardEvent {
  id: string;
  x: number;
  y: number;
}

export function RewardParticles({ events }: { events: RewardEvent[] }) {
  // Use local state to manage particles with a timeout so they disappear
  const [particles, setParticles] = useState<RewardEvent[]>([]);

  useEffect(() => {
    if (events.length > 0) {
      const latest = events[events.length - 1];
      setParticles((prev) => [...prev, latest]);

      const timer = setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== latest.id));
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [events]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden">
      <AnimatePresence>
        {particles.map((p) => (
          <ParticleBurst key={p.id} x={p.x} y={p.y} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ParticleBurst({ x, y }: { x: number; y: number }) {
  const emojis = ["⭐", "✨", "🎉", "🔥", "🚀"];
  
  // Generate 8 particles per burst
  const burst = Array.from({ length: 8 }).map((_, i) => {
    const angle = (i * 360) / 8 + (Math.random() * 20 - 10);
    const velocity = 50 + Math.random() * 50;
    const emoji = emojis[Math.floor(Math.random() * emojis.length)];
    return { id: i, angle, velocity, emoji };
  });

  return (
    <>
      {burst.map((p) => {
        const rad = (p.angle * Math.PI) / 180;
        const tx = Math.cos(rad) * p.velocity;
        const ty = Math.sin(rad) * p.velocity - 50; // extra upward bias

        return (
          <motion.div
            key={p.id}
            className="absolute text-2xl drop-shadow-md"
            style={{ left: x, top: y, x: "-50%", y: "-50%" }}
            initial={{ opacity: 1, scale: 0.5, x: 0, y: 0 }}
            animate={{
              opacity: [1, 1, 0],
              scale: [0.5, 1.2, 0.8],
              x: tx,
              y: ty,
            }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {p.emoji}
          </motion.div>
        );
      })}
    </>
  );
}
