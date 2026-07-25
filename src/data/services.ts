import type { CalculatorService, ServiceCard } from "@/types";

export const CALCULATOR_SERVICES: CalculatorService[] = [
  {
    id: "laminate",
    name: "Укладання ламінату",
    unit: "m2",
    price: 290,
    defaultQuantity: 0,
    defaultChecked: false,
  },
  {
    id: "vinyl",
    name: "Укладання кварцвінілу (SPC)",
    unit: "m2",
    price: 340,
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
    price: 90,
    defaultQuantity: 0,
    defaultChecked: false,
  },
  {
    id: "preparation",
    name: "Підготовка основи (грунтування)",
    unit: "m2",
    price: 30,
    defaultQuantity: 0,
    defaultChecked: false,
  },
  {
    id: "removal",
    name: "Демонтаж старого покриття",
    unit: "m2",
    price: 40,
    defaultQuantity: 0,
    defaultChecked: false,
  },
];

export const SERVICE_CARDS: ServiceCard[] = [
  {
    icon: "layers",
    title: "Укладання ламінату",
    priceLabel: "від 290 грн/м²",
    description:
      "Швидкий та точний монтаж ламінату будь-якого класу з підбором оптимальної схеми розкладки.",
  },
  {
    icon: "grid",
    title: "Укладання кварцвінілу",
    priceLabel: "від 340 грн/м²",
    description:
      "Вологостійке SPC-покриття, яке ідеально пасує для кухні, коридору та санвузлів.",
  },
  {
    icon: "ruler",
    title: "Встановлення плінтуса",
    priceLabel: "від 90 грн/п.м.",
    description:
      "МДФ, алюмінієвий та пластиковий плінтус з акуратними внутрішніми та зовнішніми кутами.",
  },
  {
    icon: "roller",
    title: "Підготовка основи",
    priceLabel: "від 30 грн/м²",
    description:
      "Вирівнювання, грунтування та шумоізоляція основи для рівної та довговічної підлоги.",
  },
  {
    icon: "wasteBag",
    title: "Демонтаж покриття",
    priceLabel: "від 40 грн/м²",
    description:
      "Швидке та чисте видалення старого покриття з вивезенням будівельного сміття.",
  },
];
