"use client";

import { createContext, useContext, type ReactNode } from "react";
import { useCalculator, type UseCalculatorResult } from "@/hooks/useCalculator";

const CalculatorContext = createContext<UseCalculatorResult | null>(null);

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const value = useCalculator();
  return <CalculatorContext.Provider value={value}>{children}</CalculatorContext.Provider>;
}

export function useCalculatorContext(): UseCalculatorResult {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error("useCalculatorContext must be used within CalculatorProvider");
  }
  return context;
}
