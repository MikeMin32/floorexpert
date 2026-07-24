interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "dark",
}: SectionHeadingProps) {
  const isCenter = align === "center";
  const isLight = tone === "light";

  return (
    <div
      className={`flex flex-col gap-4 ${isCenter ? "items-center text-center" : "items-start text-left"}`}
    >
      {eyebrow ? (
        <span
          className={`text-xs font-semibold uppercase tracking-[0.2em] ${
            isLight ? "text-bronze-light" : "text-bronze-dark"
          }`}
        >
          {eyebrow}
        </span>
      ) : null}
      <h2
        className={`max-w-2xl font-display text-3xl leading-tight text-balance sm:text-4xl lg:text-[2.75rem] ${
          isLight ? "text-cream" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={`max-w-xl text-base leading-relaxed sm:text-lg ${
            isLight ? "text-cream-dark/80" : "text-ink-soft/70"
          }`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
