export type SkillId = "memory" | "attention" | "focus" | "logic" | "reaction" | "pattern";

export interface GameMeta {
  id: string;
  title: string;
  tagline: string;
  skill: SkillId;
  category: "Memory" | "Attention" | "Focus" | "Logic" | "Reaction";
  emoji: string;
  color: string;
  difficultyLabels: string[]; // 5 levels
  xpPerSession: number;
}

export const GAMES: GameMeta[] = [
  {
    id: "memory-match",
    title: "Memory Match",
    tagline: "Flip cards & pair them up",
    skill: "memory",
    category: "Memory",
    emoji: "🧩",
    color: "from-violet-500 to-indigo-600",
    difficultyLabels: ["6 cards", "8 cards", "12 cards", "16 cards", "20 cards"],
    xpPerSession: 80,
  },
  {
    id: "shape-sorter",
    title: "Smart Shape Sorter",
    tagline: "Drag shapes into matching holes",
    skill: "logic",
    category: "Logic",
    emoji: "🔷",
    color: "from-teal-400 to-emerald-500",
    difficultyLabels: ["3 shapes", "4 shapes", "5 shapes", "6 + distractors", "Timed mode"],
    xpPerSession: 75,
  },
  {
    id: "pattern-grid",
    title: "Pattern Grid",
    tagline: "Find the missing tile",
    skill: "pattern",
    category: "Logic",
    emoji: "🟪",
    color: "from-fuchsia-500 to-pink-500",
    difficultyLabels: ["2×2", "3×3", "4×4", "5×5", "5×5 timed"],
    xpPerSession: 90,
  },
  {
    id: "color-sequence",
    title: "Color Sequence",
    tagline: "Repeat the flashing colors",
    skill: "memory",
    category: "Memory",
    emoji: "🎨",
    color: "from-amber-400 to-orange-500",
    difficultyLabels: ["3 colors", "4 colors", "5 colors", "6 colors", "7+ colors"],
    xpPerSession: 85,
  },
  {
    id: "memory-maze",
    title: "Memory Maze",
    tagline: "Remember the path",
    skill: "focus",
    category: "Focus",
    emoji: "🗺️",
    color: "from-blue-500 to-cyan-500",
    difficultyLabels: ["4×4 short", "5×5", "6×6", "7×7", "8×8 + traps"],
    xpPerSession: 100,
  },
  {
    id: "focus-finder",
    title: "Focus Finder",
    tagline: "Spot the target fast",
    skill: "attention",
    category: "Attention",
    emoji: "🔍",
    color: "from-rose-500 to-red-500",
    difficultyLabels: ["8 items", "16 items", "24 items", "32 items", "48 + timed"],
    xpPerSession: 80,
  },
];

export const GAME_BY_ID = Object.fromEntries(GAMES.map((g) => [g.id, g]));

export const SKILLS: { id: SkillId; label: string; color: string }[] = [
  { id: "memory", label: "Memory", color: "var(--chart-1)" },
  { id: "attention", label: "Attention", color: "var(--chart-2)" },
  { id: "focus", label: "Focus", color: "var(--chart-3)" },
  { id: "logic", label: "Logic", color: "var(--chart-4)" },
  { id: "reaction", label: "Reaction", color: "var(--chart-5)" },
  { id: "pattern", label: "Pattern", color: "var(--chart-1)" },
];
