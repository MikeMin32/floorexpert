"use client";

import Image from "next/image";
import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { WorkImage } from "@/data/works";

interface GallerySheetProps {
  images: WorkImage[];
  open: boolean;
  onClose: () => void;
  onSelect: (index: number) => void;
}

function subscribe() {
  return () => {};
}

function useIsClient() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

export function GallerySheet({ images, open, onClose, onSelect }: GallerySheetProps) {
  const isClient = useIsClient();

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, open]);

  if (!isClient) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="gallery-sheet"
          className="fixed inset-0 z-[90] flex items-end justify-center px-0 pt-6 sm:items-center sm:p-5 lg:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.button
            type="button"
            aria-label="Закрити галерею"
            className="absolute inset-0 bg-ink/55 backdrop-blur-[6px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Галерея робіт"
            className="relative z-10 flex max-h-[min(90dvh,920px)] w-full max-w-lg flex-col overflow-hidden rounded-t-[28px] rounded-b-none bg-[#f7f4ef] shadow-2xl shadow-ink/25 sm:rounded-[28px]"
            initial={{ opacity: 0, y: 36, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 28, scale: 0.98 }}
            transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="relative flex shrink-0 items-center justify-center px-12 pb-3 pt-5">
              <h3 className="text-center text-[13px] font-semibold uppercase tracking-[0.18em] text-ink">
                Галерея робіт
              </h3>
              <button
                type="button"
                onClick={onClose}
                aria-label="Закрити"
                className="absolute right-4 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full text-ink/55 transition-colors hover:bg-ink/[0.06] hover:text-ink"
              >
                <Icon name="close" className="h-5 w-5" />
              </button>
            </header>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 pt-1">
              <p className="mb-4 text-center text-[15px] font-medium text-ink/80">
                Виконані роботи
              </p>

              <div className="grid grid-cols-3 gap-2.5">
                {images.map((image, index) => (
                  <button
                    key={image.src}
                    type="button"
                    onClick={() => onSelect(index)}
                    className="relative aspect-square overflow-hidden rounded-2xl bg-cream-dark/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze"
                    aria-label={`Відкрити фото ${index + 1}`}
                  >
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      quality={85}
                      sizes="30vw"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="shrink-0 border-t border-ink/[0.06] bg-[#f7f4ef] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
              <Button
                type="button"
                variant="primary"
                onClick={onClose}
                className="w-full rounded-xl py-3.5 text-sm font-semibold"
              >
                Згорнути
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
