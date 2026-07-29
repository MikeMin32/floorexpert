const DEFAULT_HEADER_HEIGHT = 78;

/** Sticky header height, read from the CSS custom property. Client only. */
export function readHeaderOffset(): number {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue("--header-height")
    .trim();
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_HEADER_HEIGHT;
}

/** Extra distance (px) into the section so the title lands under the header. */
const SECTION_SCROLL_INSET: Record<string, number> = {
  works: 88,
};

export function getSectionScrollTarget(sectionId: string): number {
  const el = document.getElementById(sectionId);
  if (!el) return window.scrollY;

  const headerOffset = readHeaderOffset();
  const inset = SECTION_SCROLL_INSET[sectionId] ?? 0;
  const documentTop = el.getBoundingClientRect().top + window.scrollY + inset;
  const maxScroll = Math.max(
    0,
    document.documentElement.scrollHeight - window.innerHeight,
  );

  return Math.min(Math.max(0, documentTop - headerOffset), maxScroll);
}

/** One-off programmatic scroll for callers outside the header navigation. */
export function scrollToSection(sectionId: string): void {
  if (!document.getElementById(sectionId)) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  window.scrollTo({
    top: getSectionScrollTarget(sectionId),
    behavior: prefersReducedMotion ? "auto" : "smooth",
  });
}
