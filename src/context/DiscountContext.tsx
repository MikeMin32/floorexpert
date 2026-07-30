"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { DiscountEligibility } from "@/types/discount";
import {
  isDiscountActivated,
  isDiscountIpBlocked,
  isLeadSubmitted,
  markDiscountActivated,
  markDiscountIpBlocked,
  markLeadSubmitted as persistLeadSubmitted,
} from "@/lib/discountStorage";

export interface DiscountContextValue {
  /** The visitor claimed the 10% discount — attach it to the lead. */
  discountActivated: boolean;
  activateDiscount: () => void;
  /** A lead was already sent from this browser. */
  leadSubmitted: boolean;
  markLeadSubmitted: () => void;
  /**
   * False when this IP closed the popup 3 times or already sent a discounted lead.
   * Starts optimistic (true) until the server answers, unless localStorage already blocked.
   */
  popupEligible: boolean;
  /** Server eligibility resolved (or failed open). */
  eligibilityReady: boolean;
  /** Record a manual close against the visitor IP. */
  recordPopupDismiss: () => Promise<void>;
}

interface LocalFlags {
  discountActivated: boolean;
  leadSubmitted: boolean;
  ipBlocked: boolean;
}

const EMPTY_FLAGS: LocalFlags = {
  discountActivated: false,
  leadSubmitted: false,
  ipBlocked: false,
};

let snapshot: LocalFlags = EMPTY_FLAGS;
const listeners = new Set<() => void>();
const inMemoryFlags: LocalFlags = {
  discountActivated: false,
  leadSubmitted: false,
  ipBlocked: false,
};

function getSnapshot(): LocalFlags {
  const discountActivated = inMemoryFlags.discountActivated || isDiscountActivated();
  const leadSubmitted = inMemoryFlags.leadSubmitted || isLeadSubmitted();
  const ipBlocked = inMemoryFlags.ipBlocked || isDiscountIpBlocked();

  if (
    discountActivated !== snapshot.discountActivated ||
    leadSubmitted !== snapshot.leadSubmitted ||
    ipBlocked !== snapshot.ipBlocked
  ) {
    snapshot = { discountActivated, leadSubmitted, ipBlocked };
  }

  return snapshot;
}

function getServerSnapshot(): LocalFlags {
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

function applyEligibility(data: DiscountEligibility): void {
  if (!data.eligible) {
    markDiscountIpBlocked();
    inMemoryFlags.ipBlocked = true;
    emitChange();
  }
}

const DiscountContext = createContext<DiscountContextValue | null>(null);

export function DiscountProvider({ children }: { children: ReactNode }) {
  const flags = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [serverEligible, setServerEligible] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadEligibility() {
      try {
        const response = await fetch("/api/discount", { method: "GET" });
        if (!response.ok) {
          if (!cancelled) setServerEligible(true);
          return;
        }
        const data = (await response.json()) as DiscountEligibility;
        if (cancelled) return;
        applyEligibility(data);
        setServerEligible(data.eligible);
      } catch {
        if (!cancelled) setServerEligible(true);
      }
    }

    void loadEligibility();
    return () => {
      cancelled = true;
    };
  }, []);

  const activateDiscount = useCallback(() => {
    markDiscountActivated();
    inMemoryFlags.discountActivated = true;
    emitChange();
  }, []);

  const markLeadSubmitted = useCallback(() => {
    persistLeadSubmitted();
    inMemoryFlags.leadSubmitted = true;
    // A discounted lead permanently blocks this IP on the server; mirror locally.
    if (inMemoryFlags.discountActivated || isDiscountActivated()) {
      markDiscountIpBlocked();
      inMemoryFlags.ipBlocked = true;
      setServerEligible(false);
    }
    emitChange();
  }, []);

  const recordPopupDismiss = useCallback(async () => {
    try {
      const response = await fetch("/api/discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dismiss" }),
      });
      if (!response.ok) return;
      const data = (await response.json()) as DiscountEligibility;
      applyEligibility(data);
      setServerEligible(data.eligible);
    } catch {
      // Network failure — session still won't re-show; server count retries next close.
    }
  }, []);

  const popupEligible =
    !flags.ipBlocked &&
    !flags.discountActivated &&
    !flags.leadSubmitted &&
    serverEligible !== false;

  const value = useMemo<DiscountContextValue>(
    () => ({
      discountActivated: flags.discountActivated,
      activateDiscount,
      leadSubmitted: flags.leadSubmitted,
      markLeadSubmitted,
      popupEligible,
      eligibilityReady: serverEligible !== null || flags.ipBlocked,
      recordPopupDismiss,
    }),
    [
      activateDiscount,
      flags.discountActivated,
      flags.ipBlocked,
      flags.leadSubmitted,
      markLeadSubmitted,
      popupEligible,
      recordPopupDismiss,
      serverEligible,
    ],
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
