"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useRef,
  useSyncExternalStore,
  type MouseEvent as ReactMouseEvent,
  type TouchEvent as ReactTouchEvent,
} from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@/components/ui/Icon";
import type { WorkImage } from "@/data/works";
import { cn } from "@/lib/cn";

interface LightboxProps {
  images: WorkImage[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

const SWIPE_THRESHOLD = 56;

function subscribe() {
  return () => {};
}

function useIsClient() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

export function Lightbox({ images, index, onClose, onNavigate }: LightboxProps) {
  const isClient = useIsClient();
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

  const isOpen = index !== null && images.length > 0;
  const current = isOpen ? images[index] : null;
  const total = images.length;

  const goPrev = useCallback(() => {
    if (index === null || total === 0) return;
    onNavigate((index - 1 + total) % total);
  }, [index, onNavigate, total]);

  const goNext = useCallback(() => {
    if (index === null || total === 0) return;
    onNavigate((index + 1) % total);
  }, [index, onNavigate, total]);

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [goNext, goPrev, isOpen, onClose]);

  const onBackdropClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  const onTouchStart = (event: ReactTouchEvent) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
    touchDeltaX.current = 0;
  };

  const onTouchMove = (event: ReactTouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = (event.touches[0]?.clientX ?? 0) - touchStartX.current;
  };

  const onTouchEnd = () => {
    if (Math.abs(touchDeltaX.current) >= SWIPE_THRESHOLD) {
      if (touchDeltaX.current > 0) goPrev();
      else goNext();
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && current ? (
        <motion.div
          key="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Галерея робіт"
          className="fixed inset-0 z-[100] flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div
            aria-hidden="true"
            className="absolute inset-0 bg-ink/80 backdrop-blur-md"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <div
            className="relative z-10 flex h-[100dvh] w-full max-w-[1600px] flex-col items-center justify-center px-3 py-4 sm:px-6 sm:py-6 md:px-10"
            onClick={onBackdropClick}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Закрити"
              className="absolute right-3 top-3 z-20 flex h-11 w-11 items-center justify-center rounded-full bg-cream/10 text-cream transition-colors duration-200 hover:bg-cream/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream sm:right-5 sm:top-5"
            >
              <Icon name="close" className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={goPrev}
              aria-label="Попереднє фото"
              className={cn(
                "absolute left-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream/10 text-cream transition-colors duration-200 hover:bg-cream/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream sm:left-4 md:left-6",
                "md:h-12 md:w-12",
              )}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="M15 6 9 12l6 6" />
              </svg>
            </button>

            <button
              type="button"
              onClick={goNext}
              aria-label="Наступне фото"
              className={cn(
                "absolute right-2 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream/10 text-cream transition-colors duration-200 hover:bg-cream/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cream sm:right-4 md:right-6",
                "md:h-12 md:w-12",
              )}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path d="m9 6 6 6-6 6" />
              </svg>
            </button>

            <div
              className="relative flex w-full max-w-5xl flex-1 flex-col items-center justify-center"
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.src}
                  className="relative h-[min(72dvh,820px)] w-full overflow-hidden rounded-[18px] shadow-2xl shadow-black/40 sm:h-[min(78dvh,860px)]"
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Image
                    src={current.src}
                    alt={current.alt}
                    fill
                    quality={95}
                    sizes="(max-width: 768px) 94vw, (max-width: 1280px) 80vw, 1024px"
                    className="object-contain bg-ink/40"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              <p className="mt-4 text-sm font-medium tracking-wide text-cream/75 tabular-nums sm:mt-5">
                {(index ?? 0) + 1} / {total}
              </p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
