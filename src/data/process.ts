import type { ProcessStep } from "@/types";

export const PROCESS_STEPS: ProcessStep[] = [
  {
    index: "01",
    title: "Заявка",
    description: "Залишаєте заявку на сайті або телефонуєте",
    icon: "pen",
  },
  {
    index: "02",
    title: "Консультація",
    description: "Обговорюємо деталі та прораховуємо вартість",
    icon: "users",
  },
  {
    index: "03",
    title: "Виконання робіт",
    description: "Професійно виконуємо роботи в строк",
    icon: "clipboard",
  },
  {
    index: "04",
    title: "Результат",
    description: "Ви отримуєте якісно виконану підлогу",
    icon: "key",
  },
];
