"use client";

/**
 * Loads the logo once, punches out near-black background pixels via Canvas,
 * crops empty padding, and caches the result for every logo instance.
 */

const LOGO_SRC = "/images/logo/logo.PNG";
/** RGB components at or below this value are treated as background black. */
const BLACK_THRESHOLD = 10;
/** Extra pixels kept around detected content when cropping. */
const CROP_PADDING = 12;

export type TransparentLogoAsset = {
  src: string;
  width: number;
  height: number;
};

let cachedPromise: Promise<TransparentLogoAsset> | null = null;

function hasExistingAlpha(data: Uint8ClampedArray): boolean {
  for (let i = 3; i < data.length; i += 4) {
    if (data[i]! < 255) return true;
  }
  return false;
}

function punchOutNearBlack(data: Uint8ClampedArray): void {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i]!;
    const g = data[i + 1]!;
    const b = data[i + 2]!;
    if (r <= BLACK_THRESHOLD && g <= BLACK_THRESHOLD && b <= BLACK_THRESHOLD) {
      data[i + 3] = 0;
    }
  }
}

function findOpaqueBounds(
  data: Uint8ClampedArray,
  width: number,
  height: number,
): { minX: number; minY: number; maxX: number; maxY: number } | null {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const alpha = data[(y * width + x) * 4 + 3]!;
      if (alpha === 0) continue;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }

  if (maxX < 0 || maxY < 0) return null;
  return { minX, minY, maxX, maxY };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.decoding = "async";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load logo: ${src}`));
    img.src = src;
  });
}

function canvasToUrl(canvas: HTMLCanvasElement): Promise<string> {
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(URL.createObjectURL(blob));
          return;
        }
        resolve(canvas.toDataURL("image/png"));
      },
      "image/png",
    );
  });
}

async function processLogo(): Promise<TransparentLogoAsset> {
  const img = await loadImage(LOGO_SRC);
  const width = img.naturalWidth;
  const height = img.naturalHeight;

  if (width === 0 || height === 0) {
    return { src: LOGO_SRC, width: 1536, height: 1024 };
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    return { src: LOGO_SRC, width, height };
  }

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, width, height);

  // Respect logos that already ship with transparency.
  if (hasExistingAlpha(imageData.data)) {
    return { src: LOGO_SRC, width, height };
  }

  punchOutNearBlack(imageData.data);
  ctx.putImageData(imageData, 0, 0);

  const bounds = findOpaqueBounds(imageData.data, width, height);
  if (!bounds) {
    return { src: await canvasToUrl(canvas), width, height };
  }

  const sx = Math.max(0, bounds.minX - CROP_PADDING);
  const sy = Math.max(0, bounds.minY - CROP_PADDING);
  const ex = Math.min(width, bounds.maxX + 1 + CROP_PADDING);
  const ey = Math.min(height, bounds.maxY + 1 + CROP_PADDING);
  const cropW = ex - sx;
  const cropH = ey - sy;

  // Pixel-perfect crop (no resampling) to preserve native sharpness.
  const cropped = ctx.getImageData(sx, sy, cropW, cropH);
  const out = document.createElement("canvas");
  out.width = cropW;
  out.height = cropH;
  const outCtx = out.getContext("2d");
  if (!outCtx) {
    return { src: await canvasToUrl(canvas), width, height };
  }
  outCtx.putImageData(cropped, 0, 0);

  return {
    src: await canvasToUrl(out),
    width: cropW,
    height: cropH,
  };
}

/** Shared, memoized transparent logo asset. */
export function getTransparentLogoSrc(): Promise<TransparentLogoAsset> {
  if (!cachedPromise) {
    cachedPromise = processLogo().catch((error) => {
      cachedPromise = null;
      console.error(error);
      return { src: LOGO_SRC, width: 1536, height: 1024 };
    });
  }
  return cachedPromise;
}

export { LOGO_SRC };
