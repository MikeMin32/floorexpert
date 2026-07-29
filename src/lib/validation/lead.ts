import type { LeadCalculations, LeadFormPayload } from "@/types/lead";

const MAX_NAME_LENGTH = 100;
const MAX_PHONE_LENGTH = 32;
const MAX_ITEMS = 50;
const MAX_QUANTITY = 100000;
const MAX_PRICE = 1000000;

export type LeadValidationResult =
  | { ok: true; data: LeadFormPayload }
  | {
      ok: false;
      error: string;
      fieldErrors?: Partial<Record<"name" | "phone" | "calculations", string>>;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/** Digits-only length after stripping formatting; accepts common UA formats. */
export function isValidPhone(phone: string): boolean {
  const trimmed = phone.trim();
  if (!trimmed || trimmed.length > MAX_PHONE_LENGTH) return false;

  const digits = trimmed.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 13) return false;

  // +380XXXXXXXXX / 380XXXXXXXXX
  if (digits.length === 12 && digits.startsWith("380")) return true;
  // 0XXXXXXXXX
  if (digits.length === 10 && digits.startsWith("0")) return true;
  // Other reasonable international lengths already bounded above
  return digits.length >= 10 && digits.length <= 13;
}

function normalizeName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const name = value.trim().replace(/\s+/g, " ");
  if (!name || name.length > MAX_NAME_LENGTH) return null;
  return name;
}

function normalizePhone(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const phone = value.trim();
  if (!isValidPhone(phone)) return null;
  return phone;
}

function normalizeCalculations(value: unknown): LeadCalculations | undefined | null {
  if (value === undefined) return undefined;
  if (!isRecord(value)) return null;

  const { items, totalCost, totalArea, totalLinearLength } = value;
  if (!Array.isArray(items) || items.length === 0 || items.length > MAX_ITEMS) return null;
  if (!isFiniteNumber(totalCost) || totalCost < 0) return null;
  if (!isFiniteNumber(totalArea) || totalArea < 0) return null;
  if (!isFiniteNumber(totalLinearLength) || totalLinearLength < 0) return null;

  const normalizedItems = [];
  for (const item of items) {
    if (!isRecord(item)) return null;
    if (typeof item.serviceId !== "string" || !item.serviceId.trim()) return null;
    if (typeof item.serviceName !== "string" || !item.serviceName.trim()) return null;
    if (typeof item.unit !== "string" || !item.unit.trim()) return null;
    if (!isFiniteNumber(item.quantity) || item.quantity <= 0 || item.quantity > MAX_QUANTITY) {
      return null;
    }
    if (!isFiniteNumber(item.price) || item.price < 0 || item.price > MAX_PRICE) return null;
    if (!isFiniteNumber(item.subtotal) || item.subtotal < 0) return null;

    const expectedSubtotal = item.quantity * item.price;
    if (Math.abs(item.subtotal - expectedSubtotal) > 0.01) return null;

    normalizedItems.push({
      serviceId: item.serviceId.trim(),
      serviceName: item.serviceName.trim().slice(0, 120),
      unit: item.unit.trim().slice(0, 16),
      quantity: item.quantity,
      price: item.price,
      subtotal: item.subtotal,
    });
  }

  return {
    items: normalizedItems,
    totalCost,
    totalArea,
    totalLinearLength,
  };
}

export function validateLeadPayload(body: unknown): LeadValidationResult {
  if (!isRecord(body)) {
    return { ok: false, error: "Некоректний формат запиту." };
  }

  const fieldErrors: Partial<Record<"name" | "phone" | "calculations", string>> = {};

  const name = normalizeName(body.name);
  if (!name) {
    fieldErrors.name = "Вкажіть ваше ім'я.";
  }

  const phone = normalizePhone(body.phone);
  if (!phone) {
    fieldErrors.phone = "Вкажіть коректний номер телефону.";
  }

  const calculations = normalizeCalculations(body.calculations);
  if (calculations === null) {
    fieldErrors.calculations = "Некоректні дані розрахунку.";
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false,
      error: "Перевірте правильність заповнення форми.",
      fieldErrors,
    };
  }

  const discountActivated = body.discountActivated === true;
  const source = body.source === "website" ? "website" : "website";
  const createdAt =
    typeof body.createdAt === "string" && body.createdAt.trim()
      ? body.createdAt.trim()
      : new Date().toISOString();

  return {
    ok: true,
    data: {
      name: name!,
      phone: phone!,
      ...(calculations ? { calculations } : {}),
      ...(discountActivated ? { discountActivated } : {}),
      source,
      createdAt,
    },
  };
}
