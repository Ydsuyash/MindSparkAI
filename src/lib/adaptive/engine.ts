import { supabase } from "@/integrations/supabase/client";

export type AdaptiveSkill = "Visual Memory" | "Logic" | "Pattern Recognition" | "Working Memory" | "Spatial Memory" | "Selective Attention" | "Focus" | "Reaction";

export interface GamePerformance {
  gameId: string;
  skill: AdaptiveSkill;
  accuracy: number; // 0 to 100
  reactionMs: number;
  mistakes: number;
  durationSecs: number;
  score: number;
  currentDifficulty: number; // 1 to 5
}

export class AdaptiveEngine {
  /**
   * Evaluates the performance and determines the next difficulty level.
   * Rules:
   * > 85% -> Increase
   * 60% - 85% -> Maintain
   * < 60% -> Decrease
   */
  static calculateNextDifficulty(current: number, accuracy: number): number {
    let next = current;
    // User requested: > 50% accuracy = increase difficulty, <= 50% = maintain or decrease
    if (accuracy > 50) {
      next += 1;
    } else if (accuracy < 50) {
      next -= 1;
    }
    
    // Clamp to minimum 1, but NO MAXIMUM to allow infinite levels
    return Math.max(1, next);
  }

  /**
   * Retrieves the user's current difficulty for a specific skill.
   * Returns 1 (beginner) by default if no data exists.
   */
  static async getCurrentDifficulty(userId: string, skill: AdaptiveSkill): Promise<number> {
    try {
      const { data, error } = await supabase
        .from('adaptive_scores')
        .select('score')
        .eq('user_id', userId)
        .eq('skill', skill)
        .maybeSingle();

      if (error) throw error;
      
      // Score represents a floating point scale from 1.0 to 5.0 in the DB for continuous tracking,
      // but difficulty level is an integer. Let's say score maps to the level directly.
      if (data && data.score) {
        return Math.max(1, Math.floor(Number(data.score)));
      }
      return 1; // Default
    } catch (err) {
      console.error("Failed to get difficulty", err);
      return 1;
    }
  }

  /**
   * Submits a completed game session, records it to the database,
   * calculates XP, and updates the adaptive score for the skill.
   */
  static async submitSession(userId: string, performance: GamePerformance): Promise<{ xpGained: number, nextDifficulty: number }> {
    const nextDiff = this.calculateNextDifficulty(performance.currentDifficulty, performance.accuracy);
    
    // Base XP is 10. Bonus XP for high accuracy or leveling up.
    let xpGained = 10;
    if (performance.accuracy > 80) xpGained += 5;
    if (performance.accuracy === 100) xpGained += 10;
    if (nextDiff > performance.currentDifficulty) xpGained += 15;

    // 1. Insert game session
    await supabase.from('game_sessions').insert({
      user_id: userId,
      game_id: performance.gameId,
      skill: performance.skill,
      accuracy: performance.accuracy,
      reaction_ms: performance.reactionMs,
      mistakes: performance.mistakes,
      duration_sec: performance.durationSecs,
      score: performance.score,
      difficulty_level: performance.currentDifficulty
    });

    // 2. Update adaptive score
    await supabase.from('adaptive_scores').upsert({
      user_id: userId,
      skill: performance.skill,
      difficulty_level: nextDiff,
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id, skill' });

    // 3. Award XP to profile
    const { data: profile } = await supabase.from('profiles').select('xp, level').eq('id', userId).single();
    if (profile) {
      const newXp = (profile.xp || 0) + xpGained;
      const newLevel = Math.floor(newXp / 100) + 1; // 100 XP per level
      
      await supabase.from('profiles').update({
        xp: newXp,
        level: newLevel,
        last_active: new Date().toISOString()
      }).eq('id', userId);
    }

    return { xpGained, nextDifficulty: nextDiff };
  }
}
