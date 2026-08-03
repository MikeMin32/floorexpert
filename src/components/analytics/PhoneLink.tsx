"use client";

import type { AnchorHTMLAttributes, ReactNode } from "react";
import { CONTACT_INFO } from "@/data/company";
import { trackPhoneClick } from "@/lib/analytics";

type PhoneLinkProps = Omit<
  AnchorHTMLAttributes<HTMLAnchorElement>,
  "href" | "onClick"
> & {
  children: ReactNode;
};

/** tel: link with analytics — same href/behaviour, no visual changes. */
export function PhoneLink({ children, ...props }: PhoneLinkProps) {
  return (
    <a href={CONTACT_INFO.phoneHref} onClick={trackPhoneClick} {...props}>
      {children}
    </a>
  );
}
