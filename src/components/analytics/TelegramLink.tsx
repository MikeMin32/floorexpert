"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { trackTelegramClick } from "@/lib/analytics";

type TelegramLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "onClick"
> & {
  href: string;
  children: ReactNode;
};

/** External Telegram link with analytics — preserves href/target/rel/styles. */
export function TelegramLink({ children, ...props }: TelegramLinkProps) {
  return (
    <a onClick={trackTelegramClick} {...props}>
      {children}
    </a>
  );
}
