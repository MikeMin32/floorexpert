/**
 * Client-only persistence for the discount popup.
 * Server IP rules are the source of truth; these keys only speed up the UX.
 */

export const DISCOUNT_STORAGE_KEYS = {
  /** Timestamp (ms) of the moment the visitor claimed the discount (this browser). */
  activated: "floorExpertDiscountActivated",
  /** Timestamp (ms) of a successfully submitted lead (this browser). */
  leadSubmitted: "floorExpertLeadSubmitted",
  /** Set when the IP is permanently blocked (3 closes or discount lead). */
  ipBlocked: "floorExpertDiscountIpBlocked",
} as const;

/** Session-scoped key: caps the popup at one appearance per tab. */
const SHOWN_IN_SESSION_KEY = "floorExpertDiscountShownAt";

type StorageKind = "local" | "session";

function getStore(kind: StorageKind): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return kind === "local" ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function readValue(kind: StorageKind, key: string): string | null {
  try {
    return getStore(kind)?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeTimestamp(kind: StorageKind, key: string, at: number): void {
  try {
    getStore(kind)?.setItem(key, String(at));
  } catch {
    // Storage can be full or blocked — the popup still works, just without memory.
  }
}

function hasFlag(kind: StorageKind, key: string): boolean {
  return readValue(kind, key) !== null;
}

export function isDiscountActivated(): boolean {
  return hasFlag("local", DISCOUNT_STORAGE_KEYS.activated);
}

export function markDiscountActivated(at: number = Date.now()): void {
  writeTimestamp("local", DISCOUNT_STORAGE_KEYS.activated, at);
}

export function isLeadSubmitted(): boolean {
  return hasFlag("local", DISCOUNT_STORAGE_KEYS.leadSubmitted);
}

export function markLeadSubmitted(at: number = Date.now()): void {
  writeTimestamp("local", DISCOUNT_STORAGE_KEYS.leadSubmitted, at);
}

export function isDiscountIpBlocked(): boolean {
  return hasFlag("local", DISCOUNT_STORAGE_KEYS.ipBlocked);
}

export function markDiscountIpBlocked(at: number = Date.now()): void {
  writeTimestamp("local", DISCOUNT_STORAGE_KEYS.ipBlocked, at);
}

export function wasShownInSession(): boolean {
  return hasFlag("session", SHOWN_IN_SESSION_KEY);
}

export function markShownInSession(at: number = Date.now()): void {
  writeTimestamp("session", SHOWN_IN_SESSION_KEY, at);
}

/** Fast local gate used before / alongside the server eligibility check. */
export function canShowDiscountPopup(): boolean {
  if (typeof window === "undefined") return false;
  if (isDiscountIpBlocked()) return false;
  if (isDiscountActivated()) return false;
  if (isLeadSubmitted()) return false;
  return !wasShownInSession();
}
