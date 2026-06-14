import foxImg from "@/assets/companion-fox.png";
import owlImg from "@/assets/companion-owl.png";
import pandaImg from "@/assets/companion-panda.png";
import unicornImg from "@/assets/companion-unicorn.png";

export type CompanionId = "fox" | "owl" | "panda" | "unicorn";

export interface Companion {
  id: CompanionId;
  name: string;
  image: string;
  color: string;
  personality: string;
  greetings: string[];
  encouragements: string[];
  celebrations: string[];
}

export const companions: Record<CompanionId, Companion> = {
  fox: {
    id: "fox",
    name: "Finn the Fox",
    image: foxImg,
    color: "from-orange-400 to-pink-500",
    personality: "Playful, brave, and energetic",
    greetings: ["Hey there, friend! Ready to train?", "Let's spark some brainpower!", "I missed you! Let's go!"],
    encouragements: ["You've got this!", "Try once more — I believe in you!", "Almost! Keep going!"],
    celebrations: ["AMAZING!", "You're on fire!", "New best — woohoo!"],
  },
  owl: {
    id: "owl",
    name: "Ollie the Owl",
    image: owlImg,
    color: "from-violet-500 to-indigo-600",
    personality: "Wise, calm, and thoughtful",
    greetings: ["Welcome back, scholar.", "Your mind is sharper than yesterday.", "Shall we learn something new?"],
    encouragements: ["Take a breath. Think it through.", "Smart minds make smart moves.", "Pattern coming together..."],
    celebrations: ["Brilliant work!", "Wisdom unlocked!", "Truly impressive!"],
  },
  panda: {
    id: "panda",
    name: "Pippa the Panda",
    image: pandaImg,
    color: "from-emerald-400 to-teal-500",
    personality: "Gentle, kind, and encouraging",
    greetings: ["Hi sweet friend! So happy to see you.", "Let's have fun today!", "We'll go at your pace."],
    encouragements: ["You're doing wonderful.", "Every try makes you stronger.", "Mistakes help us grow!"],
    celebrations: ["So proud of you!", "Beautiful job!", "You shine!"],
  },
  unicorn: {
    id: "unicorn",
    name: "Luna the Unicorn",
    image: unicornImg,
    color: "from-pink-400 to-fuchsia-500",
    personality: "Magical, imaginative, and fun",
    greetings: ["Magic time!", "Sparkles ready, let's play!", "Adventure awaits!"],
    encouragements: ["Believe in your magic!", "One more spell — go!", "Almost a rainbow!"],
    celebrations: ["PURE MAGIC!", "Rainbow streak!", "You enchant me!"],
  },
};

export const companionList = Object.values(companions);
