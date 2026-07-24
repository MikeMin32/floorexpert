import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { formatCurrency, formatNumber } from "@/lib/format";
import type { CalculatorTotals } from "@/hooks/useCalculator";

interface CalculatorSummaryProps {
  totals: CalculatorTotals;
}

export function CalculatorSummary({ totals }: CalculatorSummaryProps) {
  return (
    <div className="flex flex-col gap-8 rounded-2xl bg-bronze p-8 text-ink lg:sticky lg:top-28">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.15em] text-ink/60">
          Загальна вартість
        </p>
        <p className="mt-2 font-display text-4xl leading-none">
          {formatCurrency(totals.totalCost)}
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-4 border-t border-ink/15 pt-6">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-ink/60">
            Загальна площа
          </dt>
          <dd className="mt-1 text-lg font-semibold">{formatNumber(totals.totalArea)} м²</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-ink/60">
            Загальна довжина
          </dt>
          <dd className="mt-1 text-lg font-semibold">
            {formatNumber(totals.totalLinearLength)} п.м.
          </dd>
        </div>
      </dl>

      <Button href="#contact" variant="primary" className="w-full">
        Залишити заявку
        <Icon name="arrowRight" className="h-4 w-4" />
      </Button>

      <p className="text-xs leading-relaxed text-ink/60">
        Ми зв&apos;яжемось з вами для уточнення деталей та точного розрахунку вартості.
      </p>
    </div>
  );
}
