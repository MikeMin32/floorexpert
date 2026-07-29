"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { useCalculatorContext } from "@/context/CalculatorContext";
import { useDiscountContext } from "@/context/DiscountContext";
import { useDiscountPopup } from "@/hooks/useDiscountPopup";
import { scrollToSection } from "@/lib/scroll";

/**
 * Modern interior with a wooden floor, reused from the hero section.
 * To ship a dedicated shot, add `public/images/discount-popup-bg.webp`
 * (landscape, ~1200x800, works under a dark overlay) and swap this constant.
 */
const BACKGROUND_IMAGE_SRC = "/images/hero/hero.png";

const CONTACT_SECTION_ID = "contact";

/** Lets the dialog unmount and unlock scrolling before we scroll the page. */
const SCROLL_HANDOFF_MS = 60;

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

function subscribe() {
  return () => {};
}

function useIsClient() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

export function DiscountPopup() {
  const { lastInteractionAt } = useCalculatorContext();
  const { discountActivated, activateDiscount, leadSubmitted } = useDiscountContext();

  const isClient = useIsClient();
  const shouldReduceMotion = useReducedMotion();
  const titleId = useId();
  const descriptionId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef(0);

  const { isOpen, close } = useDiscountPopup({
    calculatorTouchedAt: lastInteractionAt,
    disabled: discountActivated || leadSubmitted,
    formSectionId: CONTACT_SECTION_ID,
  });

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusFrame = window.requestAnimationFrame(() => {
      dialogRef.current?.focus({ preventScroll: true });
    });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        close();
        return;
      }
      if (event.key !== "Tab") return;

      const container = dialogRef.current;
      if (!container) return;

      const focusable = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;
      const isInside = active instanceof Node && container.contains(active);

      if (event.shiftKey) {
        if (!isInside || active === first) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (!isInside || active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus({ preventScroll: true });
    };
  }, [close, isOpen]);

  useEffect(() => () => window.clearTimeout(scrollTimerRef.current), []);

  const handleAccept = useCallback(() => {
    close();
    activateDiscount();
    window.clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = window.setTimeout(
      () => scrollToSection(CONTACT_SECTION_ID),
      SCROLL_HANDOFF_MS,
    );
  }, [activateDiscount, close]);

  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          key="discount-popup"
          className="fixed inset-0 z-[120] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-ink/80 backdrop-blur-[4px]"
            onClick={close}
          />

          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            tabIndex={-1}
            className="relative z-10 flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-2xl shadow-[0_28px_70px_-30px_rgba(10,8,6,0.75)] outline-none sm:max-w-[600px]"
            initial={
              shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 22, scale: 0.975 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.985 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image
              src={BACKGROUND_IMAGE_SRC}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 600px"
              className="object-cover object-center"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/85 to-ink/90"
            />

            <button
              type="button"
              onClick={close}
              aria-label="Закрити вікно зі знижкою"
              className="absolute right-2.5 top-2.5 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-ink/45 text-cream/80 transition-colors duration-200 hover:bg-ink/70 hover:text-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-light sm:right-3.5 sm:top-3.5"
            >
              <Icon name="close" className="h-5 w-5" />
            </button>

            <div className="relative z-10 flex flex-col items-center gap-4 overflow-y-auto overscroll-contain px-6 py-11 text-center sm:gap-5 sm:px-14 sm:py-14">
              <h2
                id={titleId}
                className="font-display text-[2.1rem] leading-[1.05] tracking-tight text-bronze-light sm:text-[3.15rem]"
              >
                10% ЗНИЖКА
              </h2>

              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-cream sm:text-sm sm:tracking-[0.26em]">
                НА ВАШЕ ПЕРШЕ ЗАМОВЛЕННЯ!
              </p>

              <p
                id={descriptionId}
                className="max-w-[40ch] text-sm leading-relaxed text-cream/70"
              >
                Ця пропозиція діє для всіх нових клієнтів. Залиште заявку та отримайте
                знижку на роботи.
              </p>

              <Button
                type="button"
                variant="outlineLight"
                onClick={handleAccept}
                className="mt-2 w-full rounded-xl border-bronze-light/45 bg-ink/50 py-4 text-[0.8rem] uppercase tracking-[0.14em] text-white hover:border-bronze-light/70 hover:bg-ink/25 focus-visible:outline-bronze-light sm:w-[78%]"
              >
                ОТРИМАТИ ЗНИЖКУ
              </Button>

              <button
                type="button"
                onClick={close}
                className="rounded-sm px-2 py-1 text-xs font-medium text-cream/55 underline-offset-4 transition-colors duration-200 hover:text-cream hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze-light"
              >
                Закрити
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
