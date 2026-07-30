"use client";

import { useDiscountContext } from "@/context/DiscountContext";

const INTRO_CLASS = "max-w-xs min-h-[2.75rem] text-sm leading-relaxed";

/** Same slot as the default intro — swaps copy when the discount is claimed (no extra banner). */
export function ContactIntroCopy() {
  const { discountActivated } = useDiscountContext();

  if (discountActivated) {
    return (
      <p className={`${INTRO_CLASS} text-bronze-dark`} role="status" aria-live="polite">
        <span className="font-medium">Знижку 10% активовано.</span> Залиште контакти.
      </p>
    );
  }

  return (
    <p className={`${INTRO_CLASS} text-ink-soft/65`}>
      Залиште свої дані, і ми передзвонимо вам найближчим часом
    </p>
  );
}
