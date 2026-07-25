"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { GallerySheet } from "@/components/gallery/GallerySheet";
import { Lightbox } from "@/components/gallery/Lightbox";
import type { WorkImage } from "@/data/works";
import { cn } from "@/lib/cn";

interface GalleryProps {
  images: WorkImage[];
  className?: string;
}

/** Desktop collapsed preview. */
const DESKTOP_PREVIEW = 6;
/** Compact teaser shown inline on mobile before opening the sheet. */
const MOBILE_TEASER = 6;

export function Gallery({ images, className }: GalleryProps) {
  const [expanded, setExpanded] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const needsDesktopToggle = images.length > DESKTOP_PREVIEW;
  const desktopImages = expanded ? images : images.slice(0, DESKTOP_PREVIEW);
  const mobileTeaser = images.slice(0, MOBILE_TEASER);

  const openLightbox = (src: string) => {
    setLightboxIndex(images.findIndex((item) => item.src === src));
  };

  return (
    <div className={cn("flex flex-col items-center", className)}>
      {/* Mobile teaser — opens overlay sheet */}
      <div className="flex w-full flex-col items-center lg:hidden">
        <div className="grid w-full grid-cols-3 gap-2.5">
          {mobileTeaser.map((image, index) => (
            <button
              key={image.src}
              type="button"
              onClick={() => setSheetOpen(true)}
              className="relative aspect-square overflow-hidden rounded-2xl bg-cream-dark/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze"
              aria-label={`Відкрити галерею, фото ${index + 1}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                quality={85}
                sizes="33vw"
                className="object-cover"
              />
            </button>
          ))}
        </div>

        <Button
          type="button"
          variant="primary"
          onClick={() => setSheetOpen(true)}
          className="mt-8 w-full max-w-sm rounded-xl px-7 py-3.5 text-sm font-semibold"
        >
          Переглянути всі роботи
        </Button>
      </div>

      {/* Desktop / large tablet inline gallery */}
      <div className="hidden w-full flex-col items-center lg:flex">
        <motion.div
          layout
          className="grid w-full grid-cols-3 gap-5"
        >
          <AnimatePresence initial={false} mode="popLayout">
            {desktopImages.map((image, index) => (
              <motion.button
                key={image.src}
                type="button"
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10, scale: 0.98 }}
                transition={{
                  duration: 0.4,
                  ease: [0.22, 1, 0.36, 1],
                  delay:
                    expanded && index >= DESKTOP_PREVIEW
                      ? (index - DESKTOP_PREVIEW) * 0.045
                      : 0,
                }}
                onClick={() => openLightbox(image.src)}
                className="group relative aspect-[4/5] w-full cursor-pointer overflow-hidden rounded-[18px] bg-cream-dark/40 text-left shadow-sm shadow-ink/5 transition-shadow duration-500 hover:shadow-xl hover:shadow-ink/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bronze"
                aria-label={`Відкрити фото ${index + 1}`}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  quality={90}
                  sizes="340px"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-ink/0 transition-colors duration-500 group-hover:bg-ink/[0.04]"
                />
              </motion.button>
            ))}
          </AnimatePresence>
        </motion.div>

        {needsDesktopToggle ? (
          <Button
            type="button"
            variant="outline"
            onClick={() => setExpanded((value) => !value)}
            className="mt-12 rounded-md px-7 py-3 text-sm font-medium shadow-none"
          >
            {expanded ? "Згорнути" : "Переглянути всі роботи"}
          </Button>
        ) : null}
      </div>

      <GallerySheet
        images={images}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onSelect={(index) => setLightboxIndex(index)}
      />

      <Lightbox
        images={images}
        index={lightboxIndex}
        onClose={() => setLightboxIndex(null)}
        onNavigate={setLightboxIndex}
      />
    </div>
  );
}
