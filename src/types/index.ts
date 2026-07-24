export type ServiceUnit = "m2" | "m";

export type IconName =
  | "hammer"
  | "shield"
  | "clock"
  | "medal"
  | "planks"
  | "prybar"
  | "wasteBag"
  | "layers"
  | "grid"
  | "ruler"
  | "roller"
  | "broom"
  | "phone"
  | "pin"
  | "calendar"
  | "menu"
  | "close"
  | "plus"
  | "minus"
  | "trash"
  | "arrowRight"
  | "send"
  | "check"
  | "sparkles"
  | "leaf"
  | "pen"
  | "users"
  | "clipboard"
  | "key"
  | "telegram";

export interface CalculatorService {
  /** Stable identifier, used as React key and for state updates. */
  id: string;
  name: string;
  unit: ServiceUnit;
  price: number;
  defaultQuantity: number;
  defaultChecked: boolean;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface FeatureItem {
  icon: IconName;
  title: string;
  description: string;
}

export interface ServiceCard {
  icon: IconName;
  title: string;
  priceLabel: string;
  description: string;
}

export interface ProcessStep {
  index: string;
  title: string;
  description: string;
  icon: IconName;
}

export interface ContactInfo {
  phone: string;
  phoneHref: string;
  address: string;
}
