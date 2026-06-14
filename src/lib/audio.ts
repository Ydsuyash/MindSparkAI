import { speech } from "./speech";

class AudioManager {
  private isEnabled: boolean = true;
  
  private successPhrases = [
    "Awesome work!",
    "Keep going!",
    "Great job!",
    "You got this!",
    "Nice one!",
    "Perfect!",
    "Amazing!",
    "Super!"
  ];

  private errorPhrases = [
    "Oops, try again!",
    "That's okay, keep trying!",
    "Almost!",
    "You can do it!",
    "Close one!"
  ];

  public setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
  }

  public playRewardChime() {
    if (!this.isEnabled) return;
    
    // Check if user enabled sound in local storage directly
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mindspark_voice_feedback");
      if (stored === "false") return;
    }

    const phrase = this.successPhrases[Math.floor(Math.random() * this.successPhrases.length)];
    speech.speak(phrase);
  }

  public playErrorSound() {
    if (!this.isEnabled) return;
    
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("mindspark_voice_feedback");
      if (stored === "false") return;
    }

    const phrase = this.errorPhrases[Math.floor(Math.random() * this.errorPhrases.length)];
    speech.speak(phrase);
  }
}

export const audio = new AudioManager();
