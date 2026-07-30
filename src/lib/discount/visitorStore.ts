import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

/** After this many manual closes, never offer the popup for that IP again. */
export const DISCOUNT_MAX_DISMISSES = 3;

export type DiscountVisitorRecord = {
  dismissCount: number;
  updatedAt: string;
};

export type DiscountVisitorStoreFile = {
  version: 1;
  byIp: Record<string, DiscountVisitorRecord>;
};

let writeChain: Promise<unknown> = Promise.resolve();

function resolveStorePath(): string {
  const configured = process.env.DISCOUNT_STORE_PATH?.trim();
  if (configured) return path.resolve(configured);
  return path.join(process.cwd(), "data", "discount-visitors.json");
}

async function readStore(filePath: string): Promise<DiscountVisitorStoreFile> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed) &&
      typeof (parsed as DiscountVisitorStoreFile).byIp === "object" &&
      (parsed as DiscountVisitorStoreFile).byIp !== null
    ) {
      return {
        version: 1,
        byIp: { ...(parsed as DiscountVisitorStoreFile).byIp },
      };
    }
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? (error as { code?: string }).code
        : undefined;
    if (code !== "ENOENT") {
      console.error("[discount] Failed to read visitor store:", error);
    }
  }

  return { version: 1, byIp: {} };
}

async function writeStoreAtomic(
  filePath: string,
  store: DiscountVisitorStoreFile,
): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const tmpPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  await writeFile(tmpPath, `${JSON.stringify(store, null, 2)}\n`, "utf8");
  await rename(tmpPath, filePath);
}

export function getDismissCount(
  store: DiscountVisitorStoreFile,
  ip: string,
): number {
  return store.byIp[ip]?.dismissCount ?? 0;
}

export async function readDiscountDismissCount(ip: string): Promise<number> {
  const store = await readStore(resolveStorePath());
  return getDismissCount(store, ip);
}

/** Increment dismiss count for an IP. Returns the new count. */
export async function recordDiscountDismiss(ip: string): Promise<number> {
  const run = async (): Promise<number> => {
    const filePath = resolveStorePath();
    const store = await readStore(filePath);
    const current = store.byIp[ip]?.dismissCount ?? 0;
    const dismissCount = Math.min(current + 1, DISCOUNT_MAX_DISMISSES);
    store.byIp[ip] = {
      dismissCount,
      updatedAt: new Date().toISOString(),
    };
    await writeStoreAtomic(filePath, store);
    return dismissCount;
  };

  const result = writeChain.then(run, run);
  writeChain = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

export function isBlockedByDismisses(dismissCount: number): boolean {
  return dismissCount >= DISCOUNT_MAX_DISMISSES;
}
