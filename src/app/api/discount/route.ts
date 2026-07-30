import { NextResponse } from "next/server";
import { getClientIp } from "@/lib/leads/clientIp";
import {
  dismissDiscountForRequest,
  getDiscountEligibility,
} from "@/lib/discount/eligibility";
import type { DiscountEligibility } from "@/types/discount";

function isDismissBody(body: unknown): boolean {
  return (
    typeof body === "object" &&
    body !== null &&
    (body as { action?: unknown }).action === "dismiss"
  );
}

export async function GET(request: Request) {
  const eligibility = await getDiscountEligibility(getClientIp(request));
  return NextResponse.json(eligibility satisfies DiscountEligibility);
}

export async function POST(request: Request) {
  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  if (!isDismissBody(body)) {
    return NextResponse.json(
      { error: 'Очікується action: "dismiss".' },
      { status: 400 },
    );
  }

  const eligibility = await dismissDiscountForRequest(request);
  return NextResponse.json(eligibility satisfies DiscountEligibility);
}
