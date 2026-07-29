"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  isDiscountActivated,
  isLeadSubmitted,
  markDiscountActivated,
  markLeadSubmitted as persistLeadSubmitted,
} from "@/lib/discountStorage";

export interface DiscountContextValue {
  /** The visitor claimed the 10% discount — attach it to the lead. */
  discountActivated: boolean;
  activateDiscount: () => void;
  /** A lead was already sent from this browser. */
  leadSubmitted: boolean;
  markLeadSubmitted: () => void;
}

interface DiscountFlags {
  discountActivated: boolean;
  leadSubmitted: boolean;
}

const EMPTY_FLAGS: DiscountFlags = { discountActivated: false, leadSubmitted: false };

/**
 * The flags live in localStorage, so they are exposed as an external store:
 * the server and the first client render both see EMPTY_FLAGS, and React
 * re-renders with the stored values right after hydration.
 */
let snapshot: DiscountFlags = EMPTY_FLAGS;
const listeners = new Set<() => void>();

/** Fallback for browsers that block storage — flags still hold for the visit. */
const inMemoryFlags: DiscountFlags = { discountActivated: false, leadSubmitted: false };

function getSnapshot(): DiscountFlags {
  const discountActivated = inMemoryFlags.discountActivated || isDiscountActivated();
  const leadSubmitted = inMemoryFlags.leadSubmitted || isLeadSubmitted();

  if (
    discountActivated !== snapshot.discountActivated ||
    leadSubmitted !== snapshot.leadSubmitted
  ) {
    snapshot = { discountActivated, leadSubmitted };
  }

  return snapshot;
}

function getServerSnapshot(): DiscountFlags {
  return EMPTY_FLAGS;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emitChange(): void {
  for (const listener of listeners) listener();
}

const DiscountContext = createContext<DiscountContextValue | null>(null);

export function DiscountProvider({ children }: { children: ReactNode }) {
  const flags = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const activateDiscount = useCallback(() => {
    markDiscountActivated();
    inMemoryFlags.discountActivated = true;
    emitChange();
  }, []);

  const markLeadSubmitted = useCallback(() => {
    persistLeadSubmitted();
    inMemoryFlags.leadSubmitted = true;
    emitChange();
  }, []);

  const value = useMemo<DiscountContextValue>(
    () => ({
      discountActivated: flags.discountActivated,
      activateDiscount,
      leadSubmitted: flags.leadSubmitted,
      markLeadSubmitted,
    }),
    [activateDiscount, flags.discountActivated, flags.leadSubmitted, markLeadSubmitted],
  );

  return <DiscountContext.Provider value={value}>{children}</DiscountContext.Provider>;
}

export function useDiscountContext(): DiscountContextValue {
  const context = useContext(DiscountContext);
  if (!context) {
    throw new Error("useDiscountContext must be used within DiscountProvider");
  }
  return context;
}
