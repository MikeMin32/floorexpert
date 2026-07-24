import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "outlineLight";

interface CommonProps {
  variant?: ButtonVariant;
  className?: string;
  children: ReactNode;
}

type AnchorProps = CommonProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

type NativeButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

type ButtonProps = AnchorProps | NativeButtonProps;

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: "bg-ink text-cream hover:bg-bronze-dark focus-visible:outline-bronze",
  secondary:
    "bg-bronze text-ink hover:bg-bronze-dark hover:text-cream focus-visible:outline-ink",
  outline:
    "border border-ink/15 text-ink hover:border-ink/30 hover:bg-ink/[0.04] focus-visible:outline-ink",
  outlineLight:
    "border border-cream/20 text-cream hover:border-cream/40 hover:bg-cream/5 focus-visible:outline-cream",
};

const BASE_CLASSES =
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold tracking-wide transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.98]";

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  const classes = cn(BASE_CLASSES, VARIANT_CLASSES[variant], className);

  if (isAnchorProps(props)) {
    return (
      <a className={classes} {...props}>
        {children}
      </a>
    );
  }

  const { type, ...buttonProps } = props;

  return (
    <button className={classes} type={type ?? "button"} {...buttonProps}>
      {children}
    </button>
  );
}

function isAnchorProps(
  props: Omit<AnchorProps, keyof CommonProps> | Omit<NativeButtonProps, keyof CommonProps>,
): props is Omit<AnchorProps, keyof CommonProps> {
  return typeof props.href === "string";
}
