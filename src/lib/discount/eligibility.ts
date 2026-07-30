import { getClientIp } from "@/lib/leads/clientIp";
import { hasDiscountLeadFromIp } from "@/lib/leads/store";
import {
  DISCOUNT_MAX_DISMISSES,
  isBlockedByDismisses,
  readDiscountDismissCount,
  recordDiscountDismiss,
} from "@/lib/discount/visitorStore";
import type { DiscountEligibility } from "@/types/discount";

export type { DiscountEligibility };

export async function getDiscountEligibility(
  ip: string | null,
): Promise<DiscountEligibility> {
  if (!ip) {
    return {
      eligible: true,
      dismissCount: 0,
      maxDismisses: DISCOUNT_MAX_DISMISSES,
      discountLeadSubmitted: false,
    };
  }

  const [dismissCount, discountLeadSubmitted] = await Promise.all([
    readDiscountDismissCount(ip),
    hasDiscountLeadFromIp(ip),
  ]);

  const eligible =
    !discountLeadSubmitted && !isBlockedByDismisses(dismissCount);

  return {
    eligible,
    dismissCount,
    maxDismisses: DISCOUNT_MAX_DISMISSES,
    discountLeadSubmitted,
  };
}

export async function dismissDiscountForRequest(
  request: Request,
): Promise<DiscountEligibility> {
  const ip = getClientIp(request);
  if (!ip) {
    return getDiscountEligibility(null);
  }

  const dismissCount = await recordDiscountDismiss(ip);
  const discountLeadSubmitted = await hasDiscountLeadFromIp(ip);
  const eligible =
    !discountLeadSubmitted && !isBlockedByDismisses(dismissCount);

  return {
    eligible,
    dismissCount,
    maxDismisses: DISCOUNT_MAX_DISMISSES,
    discountLeadSubmitted,
  };
}
