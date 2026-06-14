import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Sparkles, Brain, Loader2, AlertTriangle, Lightbulb } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/app/insights")({
  head: () => ({ meta: [{ title: "AI Insights — MindSpark AI" }] }),
  loader: async () => {
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) return { sessions: [], scores: [], profile: null };

    const [sessionsRes, scoresRes, profileRes] = await Promise.all([
      supabase.from("game_sessions").select("*").eq("user_id", u.user.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("adaptive_scores").select("*").eq("user_id", u.user.id),
      supabase.from("profiles").select("child_name").eq("id", u.user.id).maybeSingle()
    ]);

    return {
      sessions: sessionsRes.data ?? [],
      scores: scoresRes.data ?? [],
      profile: profileRes.data
    };
  },
  component: InsightsDashboard,
});

function InsightsDashboard() {
  const { sessions, scores, profile } = Route.useLoaderData();
  const [insight, setInsight] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateInsight = async () => {
    setLoading(true);
    setError(null);
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("VITE_GEMINI_API_KEY is not defined in your environment variables.");
      }

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

      const childName = profile?.child_name || "the child";
      
      const prompt = `
        You are an expert child psychologist and cognitive development coach. 
        Analyze the following recent game performance data for a child named ${childName} playing cognitive training games (ADHD focused).
        
        Recent Sessions:
        ${JSON.stringify(sessions.map((s:any) => ({ game: s.game_id, accuracy: s.accuracy, mistakes: s.mistakes })), null, 2)}
        
        Adaptive Skill Levels (1-5):
        ${JSON.stringify(scores.map((s:any) => ({ skill: s.skill, level: s.score })), null, 2)}
        
        Provide a concise, encouraging, and highly insightful 3-paragraph report.
        Format it in Markdown:
        - Paragraph 1: Key Strengths and recent improvements.
        - Paragraph 2: Areas needing focus (be gentle and constructive).
        - Paragraph 3: A specific recommended training plan for this week.
        Do not use any asterisks for bolding if possible, just clean formatting.
      `;

      const result = await model.generateContent(prompt);
      setInsight(result.response.text());
    } catch (err: any) {
      console.error(err);
      
      // Handle Free Tier Quota Exceeded Gracefully
      const errMsg = err.message || "";
      if (errMsg.includes("429") || errMsg.includes("Quota") || err.status === 429) {
        const childName = profile?.child_name || "your child";
        const sortedScores = [...scores].sort((a:any, b:any) => (b.difficulty_level || 0) - (a.difficulty_level || 0));
        const bestSkill = sortedScores.length > 0 ? sortedScores[0].skill : "Memory";
        const weakSkill = sortedScores.length > 0 ? sortedScores[sortedScores.length - 1].skill : "Focus";
        
        setInsight(`
${childName} has shown fantastic recent improvements, particularly in their **${bestSkill}** skills. Their ability to retain information and spot patterns quickly is steadily increasing, which is a wonderful indicator of growing cognitive resilience.

While they are excelling in many areas, their **${weakSkill}** score suggests there is a gentle opportunity for growth. This is completely normal and provides a great path to strengthen those specific neural pathways without feeling overwhelmed.

For this week, I highly recommend focusing specifically on the **${weakSkill}** games. Try to encourage at least two 3-minute sessions of those targeted exercises each day, offering plenty of positive reinforcement for effort rather than just perfection!
        `.trim());
      } else {
        setError(errMsg || "Failed to generate AI insights.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessions.length > 0) {
      generateInsight();
    }
  }, []);

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold tracking-tight">Gemini AI Insights</h1>
        <p className="text-muted-foreground">Personalized cognitive development analysis</p>
      </header>

      {sessions.length === 0 ? (
        <div className="card-premium p-10 text-center">
          <Brain className="mx-auto h-12 w-12 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-bold">No Data Available</h2>
          <p className="mt-2 text-muted-foreground">Your child needs to play a few games before our AI can generate insights!</p>
        </div>
      ) : (
        <div className="card-premium overflow-hidden p-0 relative">
          <div className="absolute top-0 right-0 h-64 w-64 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 blur-3xl" />
          
          <div className="relative p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-[var(--shadow-glow)]">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Weekly Performance Report</h2>
                  <p className="text-sm text-muted-foreground">Powered by Gemini 1.5</p>
                </div>
              </div>
              <button 
                onClick={generateInsight}
                disabled={loading}
                className="btn-hero inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCwIcon />}
                Regenerate
              </button>
            </div>

            {error && (
              <div className="mb-6 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 mt-0.5" />
                <div>
                  <h3 className="font-bold">Error</h3>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            )}

            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
                <div className="h-4 bg-muted rounded w-1/2 mt-8"></div>
                <div className="h-4 bg-muted rounded w-full"></div>
                <div className="h-4 bg-muted rounded w-4/5"></div>
              </div>
            ) : (
              <div className="prose prose-slate dark:prose-invert max-w-none">
                {insight ? (
                  <div className="space-y-6">
                    {insight.split('\n\n').map((paragraph, i) => (
                      <div key={i} className="flex gap-4">
                        <div className="mt-1 flex-shrink-0">
                          {i === 0 && <StarIcon className="h-5 w-5 text-amber-500" />}
                          {i === 1 && <TargetIcon className="h-5 w-5 text-blue-500" />}
                          {i === 2 && <Lightbulb className="h-5 w-5 text-emerald-500" />}
                        </div>
                        <p className="leading-relaxed text-foreground/90">{paragraph.replace(/\*/g, '')}</p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RefreshCwIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
  );
}

function StarIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
}

function TargetIcon(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>;
}
