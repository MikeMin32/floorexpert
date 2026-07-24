import { NextResponse } from "next/server";
import { formatLeadMessage } from "@/lib/telegram/formatLeadMessage";
import {
  sendLeadToTelegram,
  TelegramConfigError,
  TelegramDeliveryError,
} from "@/lib/telegram/sendLeadToTelegram";
import { validateLeadPayload } from "@/lib/validation/lead";
import type { ContactApiResponse } from "@/types/lead";

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    const response: ContactApiResponse = {
      ok: false,
      error: "Некоректний JSON у запиті.",
    };
    return NextResponse.json(response, { status: 400 });
  }

  const validation = validateLeadPayload(body);
  if (!validation.ok) {
    const response: ContactApiResponse = {
      ok: false,
      error: validation.error,
      fieldErrors: validation.fieldErrors,
    };
    return NextResponse.json(response, { status: 400 });
  }

  const payload = validation.data;
  const message = formatLeadMessage(payload);

  try {
    await sendLeadToTelegram(message);
  } catch (error) {
    if (error instanceof TelegramConfigError) {
      console.error("[contact] Telegram is not configured.");
      const response: ContactApiResponse = {
        ok: false,
        error: "Сервіс повідомлень не налаштовано.",
      };
      return NextResponse.json(response, { status: 503 });
    }

    if (error instanceof TelegramDeliveryError) {
      console.error("[contact] Telegram delivery failed:", error.message);
      const response: ContactApiResponse = {
        ok: false,
        error: "Не вдалося надіслати заявку. Спробуйте пізніше.",
      };
      return NextResponse.json(response, { status: 502 });
    }

    console.error("[contact] Unexpected Telegram error.");
    const response: ContactApiResponse = {
      ok: false,
      error: "Не вдалося надіслати заявку. Спробуйте пізніше.",
    };
    return NextResponse.json(response, { status: 502 });
  }

  const response: ContactApiResponse = {
    ok: true,
    message: "Заявку прийнято.",
  };

  return NextResponse.json(response, { status: 200 });
}
