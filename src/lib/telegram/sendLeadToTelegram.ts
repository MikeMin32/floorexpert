/**
 * Server-side Telegram Bot API helper.
 * Import only from API routes / server code — never from Client Components.
 * Never log TELEGRAM_BOT_TOKEN.
 */

const TELEGRAM_REQUEST_TIMEOUT_MS = 10_000;

export type SendLeadToTelegramSuccess = {
  ok: true;
  messageId: number;
};

export class TelegramConfigError extends Error {
  readonly code = "TELEGRAM_CONFIG" as const;

  constructor(message = "Telegram environment variables are not configured.") {
    super(message);
    this.name = "TelegramConfigError";
  }
}

export class TelegramDeliveryError extends Error {
  readonly code = "TELEGRAM_DELIVERY" as const;

  constructor(message = "Telegram delivery failed.") {
    super(message);
    this.name = "TelegramDeliveryError";
  }
}

type TelegramSendMessageResponse = {
  ok: boolean;
  description?: string;
  result?: {
    message_id?: number;
  };
};

function readTelegramConfig(): { token: string; chatId: string } {
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!token || !chatId) {
    throw new TelegramConfigError(
      "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID.",
    );
  }

  return { token, chatId };
}

export async function sendLeadToTelegram(
  text: string,
): Promise<SendLeadToTelegramSuccess> {
  const { token, chatId } = readTelegramConfig();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TELEGRAM_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "Markdown",
          disable_web_page_preview: true,
        }),
        signal: controller.signal,
      },
    );

    let data: TelegramSendMessageResponse;
    try {
      data = (await response.json()) as TelegramSendMessageResponse;
    } catch {
      throw new TelegramDeliveryError(
        `Telegram returned a non-JSON response (HTTP ${response.status}).`,
      );
    }

    if (!response.ok || !data.ok) {
      const description =
        typeof data.description === "string" && data.description.trim()
          ? data.description.trim()
          : `HTTP ${response.status}`;
      throw new TelegramDeliveryError(`Telegram API error: ${description}`);
    }

    const messageId = data.result?.message_id;
    if (typeof messageId !== "number") {
      throw new TelegramDeliveryError(
        "Telegram API response missing message_id.",
      );
    }

    return { ok: true, messageId };
  } catch (error) {
    if (
      error instanceof TelegramConfigError ||
      error instanceof TelegramDeliveryError
    ) {
      throw error;
    }

    if (error instanceof Error && error.name === "AbortError") {
      throw new TelegramDeliveryError("Telegram request timed out.");
    }

    throw new TelegramDeliveryError("Failed to reach Telegram API.");
  } finally {
    clearTimeout(timeoutId);
  }
}
