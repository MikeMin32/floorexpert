import { cn } from "@/lib/cn";

interface ImagePlaceholderProps {
  label: string;
  /** Documents where the final asset should live once ready, e.g. /placeholders/hero.jpg */
  src: string;
  className?: string;
  aspectClassName?: string;
  tone?: "dark" | "light";
  /** Set to false for edge-to-edge placement where corner rounding is handled by a parent container. */
  rounded?: boolean;
}

export function ImagePlaceholder({
  label,
  src,
  className,
  aspectClassName = "aspect-[4/3]",
  tone = "light",
  rounded = true,
}: ImagePlaceholderProps) {
  const isDark = tone === "dark";
  const radiusClassName = rounded ? "rounded-2xl" : "";

  return (
    <div
      title={`Заплановане зображення: ${src}`}
      className={cn(
        "relative flex w-full items-center justify-center overflow-hidden",
        aspectClassName,
        radiusClassName,
        isDark
          ? "bg-gradient-to-br from-ink-soft via-ink to-ink-soft"
          : "bg-gradient-to-br from-cream-dark via-cream to-cream-dark",
        className,
      )}
    >
      <div
        className={cn("absolute inset-0 bg-noise", isDark ? "opacity-10" : "opacity-40")}
        aria-hidden="true"
      />
      <div
        className={cn(
          "absolute inset-0 border",
          radiusClassName,
          isDark ? "border-cream/10" : "border-ink/10",
        )}
        aria-hidden="true"
      />
      <div className="relative flex flex-col items-center gap-3 px-6 text-center">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-full border ${
            isDark ? "border-bronze-light/50 text-bronze-light" : "border-bronze/40 text-bronze-dark"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            className="h-5 w-5"
            aria-hidden="true"
          >
            <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
            <circle cx="9" cy="10" r="1.6" />
            <path d="m4.5 17 4.5-4.5 3 3 3.5-4 4.5 5.5" />
          </svg>
        </span>
        <span
          className={`text-xs font-semibold uppercase tracking-[0.2em] ${
            isDark ? "text-cream/60" : "text-ink-soft/50"
          }`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
