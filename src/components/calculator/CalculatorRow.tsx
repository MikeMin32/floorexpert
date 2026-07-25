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
  const muted = row.checked ? "text-cream-dark/70" : "text-cream-dark/45";

  return (
    <div className="grid grid-cols-1 gap-3 border-b border-cream/10 py-4 last:border-b-0 lg:grid-cols-[24px_minmax(0,1fr)_88px_128px_112px_120px] lg:items-center lg:gap-4">
      <label className="flex items-center lg:justify-center">
        <input
          type="checkbox"
          checked={row.checked}
          onChange={() => onToggle(row.id)}
          className="h-5 w-5 shrink-0 cursor-pointer rounded border-cream/30 bg-transparent accent-bronze"
          aria-label={`Увімкнути послугу ${row.name}`}
        />
        <span className="ml-3 text-sm font-medium text-cream lg:hidden">{row.name}</span>
      </label>

      <div className="hidden lg:block">
        <span className="text-[0.95rem] font-medium text-cream">{row.name}</span>
      </div>

      <div className={`flex items-center justify-between text-sm lg:justify-center ${muted}`}>
        <span className="lg:hidden">Од. вим.</span>
        <span>{UNIT_LABELS[row.unit]}</span>
      </div>

      <div className="flex items-center justify-between gap-3 lg:justify-center">
        <span className={`text-sm lg:hidden ${muted}`}>Кількість</span>
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
        <span className={`text-sm lg:hidden ${muted}`}>Ціна</span>
        <span className={`text-sm ${row.checked ? "text-bronze-light" : "text-bronze-light/55"}`}>
          {formatCurrency(row.price)}
        </span>
      </div>

      <div className="flex items-center justify-between lg:justify-end">
        <span className={`text-sm lg:hidden ${muted}`}>Сума</span>
        <span
          className={`text-sm font-semibold ${row.checked ? "text-cream" : "text-cream/45"}`}
        >
          {formatCurrency(subtotal)}
        </span>
      </div>
    </div>
  );
}
