import fox from "@/assets/companion-fox.png";
import owl from "@/assets/companion-owl.png";
import panda from "@/assets/companion-panda.png";
import unicorn from "@/assets/companion-unicorn.png";

export const AVATARS = [
  { id: "fox", image: fox, label: "Fox" },
  { id: "owl", image: owl, label: "Owl" },
  { id: "panda", image: panda, label: "Panda" },
  { id: "unicorn", image: unicorn, label: "Unicorn" },
];

export function getAvatarImage(id?: string | null) {
  return AVATARS.find((a) => a.id === id)?.image ?? fox;
}
