"use client";

import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { CalculatorRow } from "@/components/calculator/CalculatorRow";
import { CalculatorSummary } from "@/components/calculator/CalculatorSummary";
import { useCalculatorContext } from "@/context/CalculatorContext";

const TABLE_HEADERS = ["", "Послуга", "Од. вим.", "Кількість", "Ціна", "Сума"];

export function CostCalculator() {
  const { rows, toggleChecked, updateQuantity } = useCalculatorContext();

  return (
    <section id="calculator" className="bg-white pb-20 sm:pb-28">
      <Container className="flex flex-col gap-12 lg:max-w-[1520px] lg:gap-[52px] lg:px-[72px]">
        <SectionHeading
          eyebrow="Онлайн-розрахунок"
          title="Калькулятор вартості"
          description="Оберіть послуги та вкажіть дані для попереднього розрахунку — сума оновлюється миттєво."
        />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="rounded-2xl bg-ink p-6 sm:p-8">
            <div className="hidden grid-cols-[24px_minmax(0,1fr)_88px_128px_112px_120px] gap-4 border-b border-cream/10 pb-4 text-xs font-semibold uppercase tracking-wide text-cream-dark/50 lg:grid">
              {TABLE_HEADERS.map((header, index) => (
                <span
                  key={`${header}-${index}`}
                  className={
                    index === 2 || index === 3 || index === 4
                      ? "text-center"
                      : index === 5
                        ? "text-right"
                        : ""
                  }
                >
                  {header}
                </span>
              ))}
            </div>

            <div>
              {rows.map((row) => (
                <CalculatorRow
                  key={row.id}
                  row={row}
                  onToggle={toggleChecked}
                  onQuantityChange={updateQuantity}
                />
              ))}
            </div>
          </div>

          <CalculatorSummary />
        </div>
      </Container>
    </section>
  );
}
