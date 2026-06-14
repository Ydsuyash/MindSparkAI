import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { speech } from "@/lib/speech";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card-premium max-w-md p-10 text-center">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-primary to-primary-glow text-4xl text-primary-foreground shadow-[var(--shadow-glow)]">
          ✨
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          That page wandered off. Let's get you back to brain-training.
        </p>
        <Link
          to="/"
          className="btn-hero mt-6 inline-flex items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="card-premium max-w-md p-10 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Something tripped up</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Don't worry — your progress is safe. Give it another go.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="btn-hero inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-2xl border border-input bg-background px-5 py-3 text-sm font-semibold transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => {
    const unsubRouter = router.subscribe("onBeforeLoad", () => {
      if (speech) speech.stopAll();
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        if (speech) speech.stopAll();
        queryClient.clear();
        router.invalidate();
        return;
      }
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        queryClient.invalidateQueries();
        router.invalidate();
      }
    });
    
    return () => {
      unsubRouter();
      sub.subscription.unsubscribe();
      if (speech) speech.stopAll();
    };
  }, [queryClient, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster position="top-center" richColors />
    </QueryClientProvider>
  );
}
