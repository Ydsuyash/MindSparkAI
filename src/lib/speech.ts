/**
 * Global speech singleton. Survives across components, can be killed
 * from anywhere (e.g. onAuthStateChange SIGNED_OUT) so no companion
 * voice ever continues after logout.
 */
class SpeechManager {
  private enabled = true;
  private muted = false;

  speak(text: string, opts: { rate?: number; pitch?: number; voice?: SpeechSynthesisVoice | null } = {}) {
    if (typeof window === "undefined") return;
    if (!this.enabled || this.muted) return;
    if (!("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = opts.rate ?? 1.02;
      u.pitch = opts.pitch ?? 1.15;
      if (opts.voice) u.voice = opts.voice;
      window.speechSynthesis.speak(u);
    } catch {
      /* ignore */
    }
  }

  stopAll() {
    if (typeof window === "undefined") return;
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
  }

  setEnabled(v: boolean) {
    this.enabled = v;
    if (!v) this.stopAll();
  }

  setMuted(v: boolean) {
    this.muted = v;
    if (v) this.stopAll();
  }
}

export const speech = new SpeechManager();
