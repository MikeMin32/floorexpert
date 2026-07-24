import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    qualities: [75, 95],
    // Include mid sizes so portrait cards from landscape sources stay sharp.
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384, 512, 640, 750],
    deviceSizes: [640, 750, 828, 1080, 1200, 1440, 1920, 2048, 3840],
  },
};

export default nextConfig;
