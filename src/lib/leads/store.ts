import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { LeadFormPayload } from "@/types/lead";
import { phoneFingerprint } from "@/lib/leads/phone";

export type StoredLead = {
  id: string;
  name: string;
  phone: string;
  /** Digits-only normalized phone used for uniqueness. */
  phoneKey: string;
  ip: string | null;
  discountActivated: boolean;
  calculations?: LeadFormPayload["calculations"];
  source: LeadFormPayload["source"];
  createdAt: string;
  receivedAt: string;
};

export type LeadStoreFile = {
  version: 1;
  leads: StoredLead[];
};

export type RecordLeadResult = {
  lead: StoredLead;
  /** True when this phone or IP already appeared in an earlier lead. */
  isReturning: boolean;
};

const EMPTY_STORE: LeadStoreFile = { version: 1, leads: [] };

/** Serialize appends within a single Node process. */
let writeChain: Promise<unknown> = Promise.resolve();

function resolveStorePath(): string {
  const configured = process.env.LEADS_STORE_PATH?.trim();
  if (configured) return path.resolve(configured);
  return path.join(process.cwd(), "data", "leads.json");
}

async function readStore(filePath: string): Promise<LeadStoreFile> {
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      !Array.isArray(parsed) &&
      Array.isArray((parsed as LeadStoreFile).leads)
    ) {
      return {
        version: 1,
        leads: (parsed as LeadStoreFile).leads,
      };
    }
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? (error as { code?: string }).code
        : undefined;
    if (code !== "ENOENT") {
      console.error("[leads] Failed to read store:", error);
    }
  }

  return { ...EMPTY_STORE, leads: [] };
}

async function writeStoreAtomic(filePath: string, store: LeadStoreFile): Promise<void> {
  await mkdir(path.dirname(filePath), { recursive: true });
  const tmpPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  const payload = `${JSON.stringify(store, null, 2)}\n`;
  await writeFile(tmpPath, payload, "utf8");
  await rename(tmpPath, filePath);
}

export type RecordLeadInput = {
  payload: LeadFormPayload;
  ip: string | null;
};

/**
 * Append a lead to the JSON store and report whether phone / IP were already known.
 * Writes are serialized; a failed write is logged and rethrown so the caller can decide.
 */
export async function recordLead(input: RecordLeadInput): Promise<RecordLeadResult> {
  const run = async (): Promise<RecordLeadResult> => {
    const filePath = resolveStorePath();
    const store = await readStore(filePath);
    const phoneKey = phoneFingerprint(input.payload.phone);
    const ip = input.ip?.trim() || null;

    const previousPhoneCount = store.leads.filter((lead) => lead.phoneKey === phoneKey).length;
    const previousIpCount = ip
      ? store.leads.filter((lead) => lead.ip === ip).length
      : 0;

    const lead: StoredLead = {
      id: randomUUID(),
      name: input.payload.name,
      phone: input.payload.phone,
      phoneKey,
      ip,
      discountActivated: Boolean(input.payload.discountActivated),
      ...(input.payload.calculations ? { calculations: input.payload.calculations } : {}),
      source: input.payload.source,
      createdAt: input.payload.createdAt,
      receivedAt: new Date().toISOString(),
    };

    store.leads.push(lead);
    await writeStoreAtomic(filePath, store);

    return {
      lead,
      isReturning: previousPhoneCount > 0 || previousIpCount > 0,
    };
  };

  const result = writeChain.then(run, run);
  writeChain = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

/** True when this IP already submitted at least one lead with the discount claimed. */
export async function hasDiscountLeadFromIp(ip: string): Promise<boolean> {
  const trimmed = ip.trim();
  if (!trimmed) return false;
  const store = await readStore(resolveStorePath());
  return store.leads.some(
    (lead) => lead.ip === trimmed && lead.discountActivated,
  );
}
