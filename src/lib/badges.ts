export interface BadgeDef {
  id: string;
  label: string;
  emoji: string;
  desc: string;
  color: string;
}

export const BADGES: BadgeDef[] = [
  { id: "first_game", label: "First Game", emoji: "🎮", desc: "Play your very first game", color: "from-blue-400 to-cyan-500" },
  { id: "games_5", label: "5 Games", emoji: "🏅", desc: "Play 5 total games", color: "from-amber-400 to-orange-500" },
  { id: "games_10", label: "10 Games", emoji: "🥇", desc: "Play 10 total games", color: "from-yellow-400 to-amber-500" },
  { id: "xp_100", label: "100 XP", emoji: "⭐", desc: "Earn 100 XP", color: "from-purple-400 to-fuchsia-500" },
  { id: "xp_500", label: "500 XP", emoji: "🌟", desc: "Earn 500 XP", color: "from-fuchsia-500 to-pink-500" },
  { id: "xp_1000", label: "1000 XP", emoji: "💫", desc: "Earn 1000 XP", color: "from-rose-400 to-red-500" },
  { id: "brain_spark", label: "Brain Spark", emoji: "✨", desc: "Train 3 days in a row", color: "from-yellow-300 to-amber-400" },
  { id: "streak_7", label: "7 Day Streak", emoji: "🔥", desc: "Train 7 days in a row", color: "from-orange-400 to-red-500" },
  { id: "memory_master", label: "Memory Master", emoji: "🧠", desc: "Reach Memory level 5", color: "from-indigo-400 to-purple-500" },
  { id: "focus_hero", label: "Focus Hero", emoji: "🎯", desc: "Reach Focus level 5", color: "from-emerald-400 to-teal-500" },
  { id: "laser_focus", label: "Laser Focus", emoji: "🔍", desc: "Play 3 Focus games", color: "from-cyan-400 to-blue-500" },
  { id: "emoji_collector", label: "Emoji Collector", emoji: "🧸", desc: "Play 5 Shape Sorter games", color: "from-pink-400 to-rose-500" },
];

export function computeUnlockedBadges(
  profile: any,
  sessions: any[],
  scores: any[]
): Set<string> {
  const unlocked = new Set<string>();
  
  const xp = profile?.xp || 0;
  const streak = profile?.streak_days || 0;
  const numGames = sessions.length;
  
  if (numGames >= 1) unlocked.add("first_game");
  if (numGames >= 5) unlocked.add("games_5");
  if (numGames >= 10) unlocked.add("games_10");
  
  if (xp >= 100) unlocked.add("xp_100");
  if (xp >= 500) unlocked.add("xp_500");
  if (xp >= 1000) unlocked.add("xp_1000");
  
  if (streak >= 3) unlocked.add("brain_spark");
  if (streak >= 7) unlocked.add("streak_7");
  
  const memScore = scores.find(s => s.skill === "Visual Memory" || s.skill === "Spatial Memory");
  if (memScore && memScore.difficulty_level >= 5) unlocked.add("memory_master");
  
  const focusScore = scores.find(s => s.skill === "Focus" || s.skill === "Selective Attention");
  if (focusScore && focusScore.difficulty_level >= 5) unlocked.add("focus_hero");
  
  const focusGames = sessions.filter(s => s.game_id === "focus-finder");
  if (focusGames.length >= 3) unlocked.add("laser_focus");
  
  const sorterGames = sessions.filter(s => s.game_id === "shape-sorter");
  if (sorterGames.length >= 5) unlocked.add("emoji_collector");

  return unlocked;
}
