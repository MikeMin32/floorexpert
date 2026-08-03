type GtagParams = Record<string, string | number | boolean | undefined>;

type GtagFunction = (
  command: "config" | "event" | "js" | "set",
  targetOrEventName: string | Date,
  params?: GtagParams,
) => void;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: GtagFunction;
  }
}

function getGtag(): GtagFunction | undefined {
  if (typeof window === "undefined") return undefined;
  if (typeof window.gtag !== "function") return undefined;
  return window.gtag;
}

function currentPageLocation(): string | undefined {
  if (typeof window === "undefined") return undefined;
  return window.location.href;
}

/** Fire a regular GA/Ads event. No-ops safely if gtag is unavailable. */
export function trackEvent(eventName: string, params?: GtagParams): void {
  const gtag = getGtag();
  if (!gtag) return;

  try {
    gtag("event", eventName, params);
  } catch {
    // Ignore analytics failures — never break UX.
  }
}

/**
 * Fire a Google Ads conversion. Requires a full send_to value:
 * AW-XXXXXXXXXXX/XXXXXXXXXXXX
 */
export function trackAdsConversion(
  sendTo: string,
  params?: GtagParams,
): void {
  const trimmed = sendTo.trim();
  if (!trimmed) return;

  const gtag = getGtag();
  if (!gtag) return;

  try {
    gtag("event", "conversion", {
      send_to: trimmed,
      ...params,
    });
  } catch {
    // Ignore analytics failures — never break UX.
  }
}

export function trackPhoneClick(): void {
  trackEvent("phone_click", {
    event_category: "contact",
    event_label: "+380958602193",
    page_location: currentPageLocation(),
  });
}

export function trackTelegramClick(): void {
  trackEvent("telegram_click", {
    event_category: "contact",
    event_label: "ffloorexpert",
    page_location: currentPageLocation(),
  });
}

export function trackContactFormSubmitSuccess(): void {
  trackEvent("contact_form_submit_success", {
    event_category: "contact",
    event_label: "contact_form",
    page_location: currentPageLocation(),
  });
}
