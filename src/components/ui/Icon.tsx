import type { IconName } from "@/types";

export interface IconProps {
  name: IconName;
  className?: string;
}

const paths: Record<IconName, React.ReactNode> = {
  // Lucide-style hammer — skilled craftsman / installer tool
  hammer: (
    <>
      <path d="m15 12-8.373 8.373a1 1 0 1 1-3-3L12 9" />
      <path d="m18 15 4-4" />
      <path d="m21.5 11.5-1.914-1.914A2 2 0 0 1 19 8.172V7l-2.26-2.26a6 6 0 0 0-4.202-1.756L9 2.96l.92.82A6.18 6.18 0 0 1 12 8.4v1.702a2 2 0 0 1-.586 1.414L10.4 12.6" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3.5 5 6v5.2c0 4.1 2.9 6.9 7 8.3 4.1-1.4 7-4.2 7-8.3V6Z" />
      <path d="m9.3 12 2 2 3.6-4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>
  ),
  medal: (
    <>
      <circle cx="12" cy="14.5" r="5.5" />
      <path d="M9.5 3h5l1.8 6-3.3 2-3.3-2Z" />
      <path d="M10.6 13.2 12 14.6l3-3" />
    </>
  ),
  // Flooring planks as a compact stepped staircase
  planks: (
    <>
      <rect x="3" y="15.8" width="11.5" height="3" rx="0.55" />
      <rect x="6.25" y="11.15" width="11.5" height="3" rx="0.55" />
      <rect x="9.5" y="6.5" width="11.5" height="3" rx="0.55" />
    </>
  ),
  layers: (
    <>
      <path d="M12 3.5 4 8l8 4.5L20 8Z" />
      <path d="M4 12.5 12 17l8-4.5" />
      <path d="M4 16.5 12 21l8-4.5" />
    </>
  ),
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
    </>
  ),
  ruler: (
    <>
      <rect x="3" y="9" width="18" height="6" rx="1" transform="rotate(-8 12 12)" />
      <path d="M7.3 9.7 8 12" />
      <path d="M11 9 11.9 12" />
      <path d="M14.7 8.3 15.6 11.3" />
    </>
  ),
  roller: (
    <>
      <rect x="4" y="4.5" width="14" height="5" rx="1.5" />
      <path d="M8 9.5v3.5" />
      <rect x="6" y="13" width="4" height="7" rx="1" />
    </>
  ),
  broom: (
    <>
      <path d="M14 4 6 18" />
      <path d="M13 3.5 20 8l-4.5 3-4-2.7Z" />
      <path d="M6 18 4 21M8 18l-1.5 3M10 17l-1 3" />
    </>
  ),
  // Crowbar prying up a floor plank
  prybar: (
    <>
      <path d="M2.5 20h10.5" />
      <path d="M2.5 16.5h10l2.4-4H4.9Z" />
      <path d="M19.8 3.2 9.6 15" />
      <path d="M9.6 15 6.2 13.6 4.8 18.2c-.12.4.2.8.65.75l2.55-.3" />
    </>
  ),
  // Waste bin with broken flooring planks sticking out
  wasteBag: (
    <>
      <path d="M5 11.5h14" />
      <path d="M6.5 11.5h11l-1.1 9H7.6Z" />
      <path d="M8.2 11.5V5.2h2.6V11.5" />
      <path d="M8.2 5.2l1.3-1.6 1.3 1.6" />
      <path d="M11.2 11.5V3.8h2.6V11.5" />
      <path d="M11.2 3.8l1.3-1.5 1.3 1.5" />
      <path d="M14.2 11.5V6h2.6V11.5" />
      <path d="M14.2 6l1.3-1.3 1.3 1.3" />
    </>
  ),
  phone: (
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  ),
  // Lucide map-pin, scaled up to match phone visual weight
  pin: (
    <g transform="translate(12 12) scale(1.14) translate(-12 -12)">
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </g>
  ),
  calendar: (
    <>
      <rect x="4" y="5.5" width="16" height="14.5" rx="1.5" />
      <path d="M4 9.5h16M8 3.5v3.5M16 3.5v3.5" />
    </>
  ),
  menu: <path d="M4 6.5h16M4 12h16M4 17.5h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  trash: (
    <>
      <path d="M5 7h14M9.5 7V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v2" />
      <path d="M6.5 7 7.3 19a1.5 1.5 0 0 0 1.5 1.4h6.4a1.5 1.5 0 0 0 1.5-1.4L17.5 7" />
    </>
  ),
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  send: <path d="m4 4 16.5 8L4 20l3-8Zm0 0 5 8" />,
  check: <path d="M5 13l4 4L19 7" />,
  sparkles: (
    <>
      <path d="M12 3.5 13.4 8 18 9.5 13.4 11 12 15.5 10.6 11 6 9.5 10.6 8Z" />
      <path d="M18.5 15.5 19.3 18 21.5 18.8 19.3 19.6 18.5 22 17.7 19.6 15.5 18.8 17.7 18Z" />
    </>
  ),
  leaf: (
    <>
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </>
  ),
  pen: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="3.5" />
      <path d="M22 21v-2a3.5 3.5 0 0 0-2.5-3.3" />
      <path d="M16.5 3.7a3.5 3.5 0 0 1 0 6.6" />
    </>
  ),
  clipboard: (
    <>
      <rect x="6" y="4.5" width="12" height="16" rx="2" />
      <path d="M9 4.5V3.8a1.2 1.2 0 0 1 1.2-1.2h3.6A1.2 1.2 0 0 1 15 3.8v.7" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15" r="4.5" />
      <path d="M11.5 12.5 20 4l2 2-2.5 2.5L22 11l-2 1-2.5-2.5" />
    </>
  ),
  telegram: (
    // Solid paper-plane; shifted left (+ slight vertical) for optical centering.
    <path
      transform="translate(-1.75 0.85)"
      d="M20.66 2.98 3.18 9.72c-1.2.47-1.18 1.26-.2 1.57l4.5 1.4 1.7 5.2c.3.95 1.18 1.17 1.77.4l2.45-3.15 4.6 3.38c.84.62 1.72.28 1.93-.92L22.95 4.52c.28-1.16-.6-1.7-1.4-1.3l-.89.36Z"
    />
  ),
};

/** Icons drawn as solid shapes rather than strokes (e.g. brand marks). */
const FILLED_ICONS = new Set<IconName>(["telegram"]);

/** Per-icon stroke overrides to equalize visual weight. */
const ICON_STROKE_WIDTH: Partial<Record<IconName, number>> = {
  pin: 1.9,
};

export function Icon({ name, className = "h-5 w-5" }: IconProps) {
  const filled = FILLED_ICONS.has(name);
  const strokeWidth = filled ? undefined : (ICON_STROKE_WIDTH[name] ?? 1.6);

  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
