import type { CalculatorService, ServiceCard } from "@/types";

export const CALCULATOR_SERVICES: CalculatorService[] = [
  {
    id: "laminate",
    name: "Укладання ламінату",
    unit: "m2",
    price: 289,
    defaultQuantity: 0,
    defaultChecked: false,
  },
  {
    id: "vinyl",
    name: "Укладання кварцвінілу (SPC)",
    unit: "m2",
    price: 339,
    defaultQuantity: 0,
    defaultChecked: false,
  },
  {
    id: "vinyl-glue",
    name: "Укладання клейового кварцвінілу",
    unit: "m2",
    price: 389,
    defaultQuantity: 0,
    defaultChecked: false,
  },
  {
    id: "baseboard-mdf",
    name: "Встановлення плінтуса МДФ",
    unit: "m",
    price: 270,
    defaultQuantity: 0,
    defaultChecked: false,
  },
  {
    id: "baseboard-aluminium",
    name: "Плінтус алюмінієвий",
    unit: "m",
    price: 240,
    defaultQuantity: 0,
    defaultChecked: false,
  },
  {
    id: "baseboard-plastic",
    name: "Плінтус пластиковий",
    unit: "m",
    price: 99,
    defaultQuantity: 0,
    defaultChecked: false,
  },
  {
    id: "preparation",
    name: "Підготовка основи (грунтування)",
    unit: "m2",
    price: 39,
    defaultQuantity: 0,
    defaultChecked: false,
  },
  {
    id: "removal",
    name: "Демонтаж старого покриття",
    unit: "m2",
    price: 49,
    defaultQuantity: 0,
    defaultChecked: false,
  },
];

export const SERVICE_CARDS: ServiceCard[] = [
  {
    icon: "layers",
    title: "Укладання ламінату",
    priceLabel: "від 289 грн/м²",
    description:
      "Швидкий та точний монтаж ламінату будь-якого класу з підбором оптимальної схеми розкладки.",
  },
  {
    icon: "grid",
    title: "Укладання кварцвінілу",
    priceLabel: "від 339 грн/м²",
    description:
      "Два види кварцвінілу — замковий SPC та клейовий. Вологостійке покриття для кухні, коридору та санвузлів.",
  },
  {
    icon: "ruler",
    title: "Встановлення плінтуса",
    priceLabel: "від 99 грн/п.м.",
    description:
      "МДФ, алюмінієвий та пластиковий плінтус з акуратними внутрішніми та зовнішніми кутами.",
  },
  {
    icon: "roller",
    title: "Підготовка основи",
    priceLabel: "від 39 грн/м²",
    description:
      "Вирівнювання, грунтування та шумоізоляція основи для рівної та довговічної підлоги.",
  },
  {
    icon: "wasteBag",
    title: "Демонтаж покриття",
    priceLabel: "від 49 грн/м²",
    description:
      "Швидке та чисте видалення старого покриття з вивезенням будівельного сміття.",
  },
];
