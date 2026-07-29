"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { canShowDiscountPopup, markShownInSession } from "@/lib/discountStorage";

/** Primary trigger: minimum dwell time before the popup may appear. */
const MIN_TIME_ON_PAGE_MS = 12_000;
/** Primary trigger: minimum share of the page the visitor has scrolled. */
const MIN_SCROLL_RATIO = 0.35;
/** Calculator trigger: idle time after the last calculator change. */
const CALCULATOR_IDLE_MS = 10_000;
/** Exit intent stays disarmed for the first seconds of the visit. */
const EXIT_INTENT_ARM_DELAY_MS = 8_000;
/** Exit intent fires only in this top strip of the viewport. */
const EXIT_INTENT_TOP_ZONE_PX = 12;
/** Upward pointer travel between two moves that counts as "leaving". */
const EXIT_INTENT_MIN_UPWARD_DELTA_PX = 8;
/** Below this share of the viewport the contact section counts as "in use". */
const FORM_VISIBLE_RATIO = 0.85;

export interface UseDiscountPopupOptions {
  /** Timestamp of the last calculator change, or null while untouched. */
  calculatorTouchedAt: number | null;
  /** Permanently silences the popup (discount already claimed, lead sent). */
  disabled?: boolean;
  /** Section the visitor is scrolled to when the popup must stay closed. */
  formSectionId?: string;
}

export interface UseDiscountPopupResult {
  isOpen: boolean;
  /** Closes the popup; it stays closed for the rest of the session. */
  close: () => void;
}

export function useDiscountPopup({
  calculatorTouchedAt,
  disabled = false,
  formSectionId = "contact",
}: UseDiscountPopupOptions): UseDiscountPopupResult {
  const [isOpen, setIsOpen] = useState(false);

  /** True once the popup has been shown (or ruled out) for this mount. */
  const settledRef = useRef(false);
  const disabledRef = useRef(disabled);
  const timeReachedRef = useRef(false);
  const scrollReachedRef = useRef(false);

  useEffect(() => {
    disabledRef.current = disabled;
    if (disabled) settledRef.current = true;
  }, [disabled]);

  /** Contexts where an interruption would be rude or would stack dialogs. */
  const isBlockedByPage = useCallback(() => {
    if (document.querySelector('[role="dialog"][aria-modal="true"]')) return true;

    const section = document.getElementById(formSectionId);
    if (!section) return false;

    const active = document.activeElement;
    if (active instanceof HTMLElement && section.contains(active)) return true;

    const rect = section.getBoundingClientRect();
    return rect.top < window.innerHeight * FORM_VISIBLE_RATIO && rect.bottom > 0;
  }, [formSectionId]);

  const tryOpen = useCallback(() => {
    if (settledRef.current || disabledRef.current) return;
    if (!canShowDiscountPopup()) {
      settledRef.current = true;
      return;
    }
    // Leave the trigger armed: a later attempt may find the page ready.
    if (isBlockedByPage()) return;

    settledRef.current = true;
    markShownInSession();
    setIsOpen(true);
  }, [isBlockedByPage]);

  // Primary trigger: dwell time + scroll depth.
  useEffect(() => {
    if (disabledRef.current || !canShowDiscountPopup()) {
      settledRef.current = true;
      return;
    }

    const onScroll = () => {
      const scrollable =
        document.documentElement.scrollHeight - window.innerHeight;
      const ratio = scrollable > 0 ? window.scrollY / scrollable : 1;
      if (ratio >= MIN_SCROLL_RATIO) scrollReachedRef.current = true;
      if (timeReachedRef.current && scrollReachedRef.current) tryOpen();
    };

    const dwellTimer = window.setTimeout(() => {
      timeReachedRef.current = true;
      if (scrollReachedRef.current) tryOpen();
    }, MIN_TIME_ON_PAGE_MS);

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      window.clearTimeout(dwellTimer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [tryOpen]);

  // Calculator trigger: each change restarts the idle countdown.
  useEffect(() => {
    if (calculatorTouchedAt === null) return;
    if (settledRef.current || disabledRef.current) return;

    const idleTimer = window.setTimeout(tryOpen, CALCULATOR_IDLE_MS);
    return () => window.clearTimeout(idleTimer);
  }, [calculatorTouchedAt, tryOpen]);

  // Desktop exit intent: pointer rushing towards the top of the window.
  useEffect(() => {
    if (settledRef.current || disabledRef.current) return;

    const supportsExitIntent = window.matchMedia(
      "(pointer: fine) and (min-width: 1024px)",
    ).matches;
    if (!supportsExitIntent) return;

    let armed = false;
    let lastY: number | null = null;

    const armTimer = window.setTimeout(() => {
      armed = true;
    }, EXIT_INTENT_ARM_DELAY_MS);

    const onMouseMove = (event: MouseEvent) => {
      const previousY = lastY;
      lastY = event.clientY;
      if (!armed || previousY === null) return;

      const movingUp = previousY - event.clientY >= EXIT_INTENT_MIN_UPWARD_DELTA_PX;
      if (movingUp && event.clientY <= EXIT_INTENT_TOP_ZONE_PX) tryOpen();
    };

    document.addEventListener("mousemove", onMouseMove, { passive: true });

    return () => {
      window.clearTimeout(armTimer);
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [tryOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  return { isOpen, close };
}
