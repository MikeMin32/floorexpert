import type { ServiceUnit } from "@/types";
import type { LeadCalculationItem, LeadCalculations } from "@/types/lead";

export const UNIT_LABELS: Record<ServiceUnit, string> = {
  m2: "м²",
  m: "п.м.",
};

export interface CalculatorRowInput {
  id: string;
  name: string;
  unit: ServiceUnit;
  quantity: number;
  price: number;
  checked: boolean;
}

export interface CalculatorTotals {
  totalCost: number;
  totalArea: number;
  totalLinearLength: number;
}

/** Selected (checked) services with a positive quantity — single source for form attach + totals. */
export function buildLeadCalculations(rows: CalculatorRowInput[]): LeadCalculations {
  const items: LeadCalculationItem[] = [];
  let totalCost = 0;
  let totalArea = 0;
  let totalLinearLength = 0;

  for (const row of rows) {
    if (!row.checked || row.quantity <= 0) continue;

    const subtotal = row.quantity * row.price;
    items.push({
      serviceId: row.id,
      serviceName: row.name.trim() || "Послуга",
      unit: UNIT_LABELS[row.unit],
      quantity: row.quantity,
      price: row.price,
      subtotal,
    });

    totalCost += subtotal;
    if (row.unit === "m2") totalArea += row.quantity;
    if (row.unit === "m") totalLinearLength += row.quantity;
  }

  return { items, totalCost, totalArea, totalLinearLength };
}

export function toCalculatorTotals(calculations: LeadCalculations): CalculatorTotals {
  return {
    totalCost: calculations.totalCost,
    totalArea: calculations.totalArea,
    totalLinearLength: calculations.totalLinearLength,
  };
}

export function hasAttachableCalculations(calculations: LeadCalculations): boolean {
  return calculations.items.length > 0;
}
