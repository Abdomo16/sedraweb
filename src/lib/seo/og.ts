import { siteConfig } from "@/config/site";

/**
 * Pages that define their own `openGraph` replace the one from the root layout,
 * including the file-based image, so they must list the image explicitly.
 */
export const defaultOgImages = [
  { url: "/opengraph-image.png", width: 1200, height: 630, alt: siteConfig.name },
];
