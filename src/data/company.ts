import type { ContactInfo } from "@/types";

export const CONTACT_INFO: ContactInfo = {
  phone: "+380 95 860 21 93",
  phoneHref: "tel:+380958602193",
  address: "м. Київ та область",
};

export const COMPANY_NAME = "Floor Expert";

export const COMPANY_TAGLINE = "Якісна укладка вашого інтер'єру";

export const SOCIAL_LINKS = [
  {
    label: "Telegram",
    href: "https://t.me/ffloorexpert",
    icon: "telegram" as const,
  },
];
