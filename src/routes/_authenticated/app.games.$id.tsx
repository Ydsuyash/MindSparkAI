import { createFileRoute, Link } from "@tanstack/react-router";
import { Hammer, ChevronLeft } from "lucide-react";
import { GAME_BY_ID } from "@/lib/games";

import { MemoryMatch } from "@/components/games/MemoryMatch";
import { ShapeSorter } from "@/components/games/ShapeSorter";
import { PatternGrid } from "@/components/games/PatternGrid";
import { ColorSequence } from "@/components/games/ColorSequence";
import { MemoryMaze } from "@/components/games/MemoryMaze";
import { FocusFinder } from "@/components/games/FocusFinder";

export const Route = createFileRoute("/_authenticated/app/games/$id")({
  head: ({ params }) => ({
    meta: [{ title: `${GAME_BY_ID[params.id]?.title ?? "Game"} — MindSpark AI` }],
  }),
  component: GamePlayer,
});

function GamePlayer() {
  const { id } = Route.useParams();
  const game = GAME_BY_ID[id];

  switch (id) {
    case "memory-match": return <MemoryMatch gameId={id} />;
    case "shape-sorter": return <ShapeSorter gameId={id} />;
    case "pattern-grid": return <PatternGrid gameId={id} />;
    case "color-sequence": return <ColorSequence gameId={id} />;
    case "memory-maze": return <MemoryMaze gameId={id} />;
    case "focus-finder": return <FocusFinder gameId={id} />;
  }

  return (
    <div className="space-y-6">
      <Link to="/app/games" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ChevronLeft className="h-4 w-4" /> Back to Games
      </Link>

      <div className="card-premium overflow-hidden p-0">
        <div className={`flex h-48 items-center justify-center bg-gradient-to-br ${game?.color ?? "from-primary to-primary-glow"} text-8xl text-white`}>
          {game?.emoji ?? "🎮"}
        </div>
        <div className="p-6">
          <h1 className="text-3xl font-extrabold tracking-tight">{game?.title ?? "Game"}</h1>
          <p className="mt-1 text-muted-foreground">{game?.tagline}</p>

          <div className="mt-6 rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-6 text-center">
            <Hammer className="mx-auto h-8 w-8 text-primary" />
            <h2 className="mt-3 text-xl font-bold">Game launching soon</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              The game runtime, tutorial, and adaptive difficulty engine ship in the next build stage.
              All your XP, sessions, and progress will start saving the moment it goes live.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
