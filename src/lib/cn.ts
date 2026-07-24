import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merges Tailwind class strings, resolving conflicting utilities (e.g. `px-4`
 * vs `px-6`) by keeping the last one instead of relying on unpredictable
 * stylesheet-order wins.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
