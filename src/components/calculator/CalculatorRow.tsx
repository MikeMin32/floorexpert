import { UNIT_LABELS } from "@/lib/calculator";
import { formatCurrency } from "@/lib/format";
import type { CalculatorRow as CalculatorRowData } from "@/hooks/useCalculator";

interface CalculatorRowProps {
  row: CalculatorRowData;
  onToggle: (id: string) => void;
  onQuantityChange: (id: string, value: number) => void;
}

export function CalculatorRow({ row, onToggle, onQuantityChange }: CalculatorRowProps) {
  const subtotal = row.checked ? row.quantity * row.price : 0;

  return (
    <div
      className={`grid grid-cols-1 gap-3 border-b border-cream/10 py-4 transition-opacity duration-200 last:border-b-0 lg:grid-cols-[24px_minmax(0,1fr)_88px_128px_112px_120px] lg:items-center lg:gap-4 ${
        row.checked ? "opacity-100" : "opacity-45"
      }`}
    >
      <label className="flex items-center lg:justify-center">
        <input
          type="checkbox"
          checked={row.checked}
          onChange={() => onToggle(row.id)}
          className="h-5 w-5 cursor-pointer rounded border-cream/30 bg-transparent accent-bronze"
          aria-label={`Увімкнути послугу ${row.name}`}
        />
        <span className="ml-3 text-sm font-medium text-cream lg:hidden">Активна послуга</span>
      </label>

      <div>
        <span className="text-sm font-medium text-cream lg:text-[0.95rem]">{row.name}</span>
      </div>

      <div className="flex items-center justify-between text-sm text-cream-dark/70 lg:justify-center">
        <span className="lg:hidden">Од. вим.</span>
        <span>{UNIT_LABELS[row.unit]}</span>
      </div>

      <div className="flex items-center justify-between gap-3 lg:justify-center">
        <span className="text-sm text-cream-dark/70 lg:hidden">Кількість</span>
        <input
          type="number"
          inputMode="decimal"
          min={0}
          step={row.unit === "m2" ? 0.5 : 1}
          value={row.quantity === 0 ? "" : row.quantity}
          placeholder="0"
          onChange={(event) => onQuantityChange(row.id, Number(event.target.value))}
          className="w-24 rounded-lg border border-cream/15 bg-ink-soft/60 px-3 py-2 text-right text-sm text-cream focus:border-bronze-light focus:outline-none lg:w-full"
        />
      </div>

      <div className="flex items-center justify-between gap-2 lg:justify-center">
        <span className="text-sm text-cream-dark/70 lg:hidden">Ціна</span>
        <span className="text-sm text-bronze-light">{formatCurrency(row.price)}</span>
      </div>

      <div className="flex items-center justify-between lg:justify-end">
        <span className="text-sm text-cream-dark/70 lg:hidden">Сума</span>
        <span className="text-sm font-semibold text-cream">{formatCurrency(subtotal)}</span>
      </div>
    </div>
  );
}
