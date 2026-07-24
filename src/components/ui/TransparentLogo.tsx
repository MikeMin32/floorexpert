"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  getTransparentLogoSrc,
  type TransparentLogoAsset,
} from "@/lib/transparentLogo";
import { cn } from "@/lib/cn";

interface TransparentLogoProps {
  alt: string;
  className?: string;
  /** Prefer loading early in the header for LCP. */
  priority?: boolean;
  /**
   * Hint for the browser about displayed CSS width.
   * Prefer ~2× the on-screen width so Retina picks a sharp source.
   */
  sizes?: string;
}

/**
 * Renders the site logo with a client-side Canvas punch-out of the solid
 * black background. Processing runs once and is shared across instances.
 */
export function TransparentLogo({
  alt,
  className,
  priority = false,
  sizes = "160px",
}: TransparentLogoProps) {
  const [asset, setAsset] = useState<TransparentLogoAsset | null>(null);

  useEffect(() => {
    let cancelled = false;

    getTransparentLogoSrc().then((result) => {
      if (!cancelled) setAsset(result);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!asset) {
    return <span className="absolute inset-0" aria-hidden="true" />;
  }

  return (
    <Image
      src={asset.src}
      alt={alt}
      width={asset.width}
      height={asset.height}
      unoptimized
      priority={priority}
      sizes={sizes}
      className={cn("absolute inset-0 h-full w-full object-contain", className)}
      draggable={false}
    />
  );
}
