"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getSectionScrollTarget, readHeaderOffset } from "@/lib/scroll";

function isNavigationKey(event: KeyboardEvent): boolean {
  const keys = new Set([
    "ArrowUp",
    "ArrowDown",
    "PageUp",
    "PageDown",
    "Home",
    "End",
    " ",
    "Spacebar",
  ]);
  return keys.has(event.key);
}

export type NavigateToSectionOptions = {
  /** Delay before starting the scroll (e.g. wait for mobile menu to collapse). */
  scrollDelayMs?: number;
};

/**
 * Tracks which page section is currently in view, accounting for the sticky header.
 * Supports a programmatic-scroll lock so nav clicks do not flicker the active item.
 */
export function useActiveSection(sectionIds: readonly string[]) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");

  const isProgrammaticScrolling = useRef(false);
  const targetSectionId = useRef<string | null>(null);
  const cleanupProgrammatic = useRef<(() => void) | null>(null);
  const visibilityRef = useRef(new Map<string, number>());
  const resolveActiveRef = useRef<() => void>(() => {});

  const endProgrammaticScroll = useCallback(() => {
    cleanupProgrammatic.current?.();
    cleanupProgrammatic.current = null;
    isProgrammaticScrolling.current = false;
    targetSectionId.current = null;
  }, []);

  const resolveActive = useCallback(() => {
    if (isProgrammaticScrolling.current) return;
    if (sectionIds.length === 0) return;

    const visibility = visibilityRef.current;
    const scrollBottom = window.scrollY + window.innerHeight;
    const docHeight = document.documentElement.scrollHeight;

    // Short final sections (e.g. contact) may never dominate the observer band.
    if (docHeight - scrollBottom < 96) {
      setActiveId(sectionIds[sectionIds.length - 1]);
      return;
    }

    let bestId = sectionIds[0];
    let bestRatio = -1;

    for (const id of sectionIds) {
      const ratio = visibility.get(id) ?? 0;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestId = id;
      }
    }

    if (bestRatio > 0) {
      setActiveId(bestId);
    }
  }, [sectionIds]);

  useEffect(() => {
    resolveActiveRef.current = resolveActive;
  }, [resolveActive]);

  const watchScrollComplete = useCallback((targetY: number, onComplete: () => void) => {
    let done = false;
    let rafId = 0;
    let settledFrames = 0;
    let lastScrollY = window.scrollY;
    let scrollIdleTimer = 0;
    let safetyTimer = 0;

    const tearDown = () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(scrollIdleTimer);
      window.clearTimeout(safetyTimer);
      window.removeEventListener("scrollend", onScrollEnd);
      window.removeEventListener("scroll", onScroll);
    };

    const complete = () => {
      if (done) return;
      done = true;
      tearDown();
      onComplete();
    };

    const cancel = () => {
      if (done) return;
      done = true;
      tearDown();
    };

    const onScrollEnd = () => complete();

    const onScroll = () => {
      window.clearTimeout(scrollIdleTimer);
      scrollIdleTimer = window.setTimeout(() => {
        if (Math.abs(window.scrollY - targetY) <= 4) {
          complete();
        }
      }, 120);
    };

    const tick = () => {
      if (done) return;

      const y = window.scrollY;
      const nearTarget = Math.abs(y - targetY) <= 2;
      const stopped = Math.abs(y - lastScrollY) < 0.5;
      lastScrollY = y;

      if (nearTarget && stopped) {
        settledFrames += 1;
        if (settledFrames >= 3) {
          complete();
          return;
        }
      } else {
        settledFrames = 0;
      }

      rafId = window.requestAnimationFrame(tick);
    };

    window.addEventListener("scrollend", onScrollEnd);
    window.addEventListener("scroll", onScroll, { passive: true });
    rafId = window.requestAnimationFrame(tick);
    safetyTimer = window.setTimeout(complete, 4000);

    return cancel;
  }, []);

  const navigateToSection = useCallback(
    (sectionId: string, options?: NavigateToSectionOptions) => {
      if (!sectionIds.includes(sectionId)) return;

      // Cancel any in-flight programmatic scroll (supports rapid nav clicks).
      endProgrammaticScroll();

      isProgrammaticScrolling.current = true;
      targetSectionId.current = sectionId;
      setActiveId(sectionId);

      const interruptEvents = ["wheel", "touchstart", "pointerdown"] as const;
      const onUserInterrupt = (event: Event) => {
        if (!isProgrammaticScrolling.current) return;
        if (event.type === "keydown" && !isNavigationKey(event as KeyboardEvent)) {
          return;
        }

        // Nav link clicks start a new programmatic scroll via navigateToSection;
        // do not treat them as a manual interrupt (avoids a one-frame flicker).
        if (
          (event.type === "pointerdown" || event.type === "touchstart") &&
          event.target instanceof Element &&
          event.target.closest("header a[href^='#']")
        ) {
          return;
        }

        endProgrammaticScroll();
        resolveActiveRef.current();
      };

      const onKeyInterrupt = (event: KeyboardEvent) => onUserInterrupt(event);

      for (const type of interruptEvents) {
        window.addEventListener(type, onUserInterrupt, { passive: true });
      }
      window.addEventListener("keydown", onKeyInterrupt);

      let scrollDelayTimer = 0;
      let cancelWatch: (() => void) | null = null;

      const cleanup = () => {
        window.clearTimeout(scrollDelayTimer);
        cancelWatch?.();
        cancelWatch = null;
        for (const type of interruptEvents) {
          window.removeEventListener(type, onUserInterrupt);
        }
        window.removeEventListener("keydown", onKeyInterrupt);
      };

      cleanupProgrammatic.current = cleanup;

      const startScroll = () => {
        if (!isProgrammaticScrolling.current || targetSectionId.current !== sectionId) {
          return;
        }

        const targetY = getSectionScrollTarget(sectionId);

        if (Math.abs(window.scrollY - targetY) <= 2) {
          endProgrammaticScroll();
          return;
        }

        window.scrollTo({ top: targetY, behavior: "smooth" });

        try {
          history.pushState(null, "", `#${sectionId}`);
        } catch {
          // Ignore pushState failures (e.g. restricted contexts).
        }

        cancelWatch = watchScrollComplete(targetY, () => {
          if (targetSectionId.current === sectionId) {
            setActiveId(sectionId);
          }
          endProgrammaticScroll();
        });
      };

      const delay = options?.scrollDelayMs ?? 0;
      if (delay > 0) {
        scrollDelayTimer = window.setTimeout(startScroll, delay);
      } else {
        startScroll();
      }
    },
    [endProgrammaticScroll, sectionIds, watchScrollComplete],
  );

  useEffect(() => {
    if (sectionIds.length === 0) return;

    const headerOffset = readHeaderOffset();
    const visibility = visibilityRef.current;
    visibility.clear();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          visibility.set(
            entry.target.id,
            entry.isIntersecting ? entry.intersectionRatio : 0,
          );
        }
        resolveActiveRef.current();
      },
      {
        rootMargin: `-${headerOffset + 4}px 0px -42% 0px`,
        threshold: [0, 0.05, 0.1, 0.2, 0.35, 0.5, 0.75, 1],
      },
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    const onScroll = () => resolveActiveRef.current();
    window.addEventListener("scroll", onScroll, { passive: true });
    resolveActiveRef.current();

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      endProgrammaticScroll();
    };
  }, [endProgrammaticScroll, sectionIds]);

  return { activeId, navigateToSection };
}
