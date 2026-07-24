import type { LeadFormPayload } from "@/types/lead";

/**
 * Server-side helper that turns a lead payload into a Telegram-ready Markdown message.
 * Keep this module imported only from server code (API routes / server actions).
 * Do not import from Client Components.
 */

function sanitizeUserText(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Escape Telegram legacy Markdown special characters. */
function escapeMarkdown(value: string): string {
  return value.replace(/([_*`\[])/g, "\\$1");
}

/** Format integer with regular spaces as thousand separators: 12500 → "12 500". */
function formatAmount(value: number): string {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  const digits = String(Math.abs(rounded));
  const withSpaces = digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${sign}${withSpaces}`;
}

function formatUah(value: number): string {
  return `${formatAmount(value)} грн`;
}

function formatQuantity(value: number): string {
  if (Number.isInteger(value)) {
    return formatAmount(value);
  }

  return String(value)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/** Display timestamp: DD.MM.YYYY • HH:MM (local server time) */
function formatDisplayTimestamp(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}.${month}.${year} • ${hours}:${minutes}`;
}

function formatServiceBlock(item: {
  serviceName: string;
  quantity: number;
  unit: string;
  price: number;
  subtotal: number;
}): string {
  const name = escapeMarkdown(sanitizeUserText(item.serviceName));
  const unit = sanitizeUserText(item.unit);
  return [
    `🔹 _${name}_`,
    `${formatQuantity(item.quantity)} ${unit} × ${formatUah(item.price)}`,
    `= ${formatUah(item.subtotal)}`,
  ].join("\n");
}

export function formatLeadMessage(payload: LeadFormPayload): string {
  const now = new Date();
  const lines: string[] = [
    "🏠 Нова заявка - Floor Expert",
    "",
    escapeMarkdown(sanitizeUserText(payload.name)),
    escapeMarkdown(sanitizeUserText(payload.phone)),
  ];

  if (payload.calculations && payload.calculations.items.length > 0) {
    const { items, totalArea, totalLinearLength, totalCost } = payload.calculations;

    lines.push("", "Послуги", "");
    lines.push(items.map(formatServiceBlock).join("\n\n"));
    lines.push(
      "",
      `Загальна площа: ${formatQuantity(totalArea)} м²`,
      `Плінтус: ${formatQuantity(totalLinearLength)} п.м.`,
      "",
      `Загальна вартість: ${formatUah(totalCost)}`,
    );
  }

  lines.push("", formatDisplayTimestamp(now));

  return lines.join("\n");
}
