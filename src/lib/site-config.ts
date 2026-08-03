const DEFAULT_SITE_URL = "https://floorexpert.com.ua";

/** Production site origin without a trailing slash. Never falls back to localhost. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_SITE_URL
).replace(/\/+$/, "");

export const SITE_NAME = "Floor Expert";

/** Absolute URL helper that avoids double slashes. */
export function absoluteUrl(path = "/"): string {
  const normalized =
    !path || path === "/"
      ? "/"
      : path.startsWith("/")
        ? path
        : `/${path}`;

  return normalized === "/" ? `${SITE_URL}/` : `${SITE_URL}${normalized}`;
}

/** Open Graph / social share image from existing public assets. */
export const OG_IMAGE_PATH = "/images/hero/hero.png";

export const GOOGLE_ADS_ID = "AW-18361700035";

/** Lead conversion send_to — fired only after a successful contact form submit. */
export const GOOGLE_ADS_LEAD_CONVERSION_ID =
  "AW-18361700035/i-ZNCLDlmdscEMOdxbNE";
