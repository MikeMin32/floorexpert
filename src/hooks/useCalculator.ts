"use client";

import { useCallback, useMemo, useState } from "react";
import type { CalculatorService } from "@/types";
import type { LeadCalculations } from "@/types/lead";
import { CALCULATOR_SERVICES } from "@/data/services";
import {
  buildLeadCalculations,
  toCalculatorTotals,
  type CalculatorTotals,
} from "@/lib/calculator";

export interface CalculatorRow extends CalculatorService {
  quantity: number;
  checked: boolean;
}

export type { CalculatorTotals };

const MAX_QUANTITY = 100000;

function createInitialRows(): CalculatorRow[] {
  return CALCULATOR_SERVICES.map((service) => ({
    ...service,
    quantity: service.defaultQuantity,
    checked: service.defaultChecked,
  }));
}

function clamp(value: number, max: number): number {
  if (Number.isNaN(value) || value < 0) return 0;
  return Math.min(value, max);
}

export function useCalculator() {
  const [rows, setRows] = useState<CalculatorRow[]>(createInitialRows);

  const toggleChecked = useCallback((id: string) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, checked: !row.checked } : row)),
    );
  }, []);

  const updateQuantity = useCallback((id: string, value: number) => {
    const quantity = clamp(value, MAX_QUANTITY);
    setRows((current) =>
      current.map((row) => {
        if (row.id !== id) return row;
        return {
          ...row,
          quantity,
          // Typing a quantity activates the service immediately.
          checked: quantity > 0 ? true : row.checked,
        };
      }),
    );
  }, []);

  const calculations = useMemo<LeadCalculations>(
    () => buildLeadCalculations(rows),
    [rows],
  );

  const totals = useMemo<CalculatorTotals>(
    () => toCalculatorTotals(calculations),
    [calculations],
  );

  return {
    rows,
    calculations,
    totals,
    toggleChecked,
    updateQuantity,
  };
}

export type UseCalculatorResult = ReturnType<typeof useCalculator>;
