import type { NextConfig } from "next";
import { legacyRedirects } from "./src/config/redirects";

// Send www.<domain> to the bare domain so there is a single canonical host.
const siteHost = process.env.NEXT_PUBLIC_SITE_URL
  ? new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname
  : "";
const canonicalHost =
  siteHost && siteHost !== "localhost" && !siteHost.startsWith("www.") ? siteHost : null;

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  images: {
    // AVIF first: smaller files, so the big home photos load fast on phones.
    formats: ["image/avif", "image/webp"],
    qualities: [70, 75],
  },
  async redirects() {
    return [
      ...(canonicalHost
        ? [
            {
              source: "/:path*",
              has: [{ type: "host" as const, value: `www.${canonicalHost}` }],
              destination: `https://${canonicalHost}/:path*`,
              permanent: true,
            },
          ]
        : []),
      ...legacyRedirects,
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
