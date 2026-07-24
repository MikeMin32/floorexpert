import type { IconName } from "@/types";

export interface MaterialCard {
  label: string;
  imageSrc: string;
  alt: string;
  /** Tuned per image so floor / focal content stays visible in portrait cards. */
  objectPosition: string;
}

export interface MaterialAdvantage {
  icon: IconName;
  label: string;
}

export const MATERIAL_CARDS: MaterialCard[] = [
  {
    label: "Ламінат",
    imageSrc: "/images/cards/laminat.png",
    alt: "Інтер'єр з ламінованою підлогою",
    objectPosition: "48% 58%",
  },
  {
    label: "Кварцвініл",
    imageSrc: "/images/cards/kvarc.png",
    alt: "Кухня з кварцвініловою підлогою",
    objectPosition: "42% 55%",
  },
  {
    label: "Плінтус",
    imageSrc: "/images/cards/plintus.png",
    alt: "Деталь білого плінтуса біля підлоги",
    objectPosition: "52% 42%",
  },
];

export const MATERIAL_ADVANTAGES: MaterialAdvantage[] = [
  { icon: "shield", label: "Стійкість до зносу" },
  { icon: "sparkles", label: "Легкість у догляді" },
  { icon: "layers", label: "Широкий вибір дизайнів" },
  { icon: "leaf", label: "Екологічність та безпека" },
];
