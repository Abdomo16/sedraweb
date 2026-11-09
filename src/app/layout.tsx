import type { Metadata, Viewport } from "next";
import { Baloo_Bhaijaan_2, Cairo } from "next/font/google";
import { siteConfig } from "@/config/site";
import "./globals.css";

const body = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  display: "swap",
});

const display = Baloo_Bhaijaan_2({
  variable: "--font-baloo",
  subsets: ["arabic", "latin"],
  weight: ["600", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} | ${siteConfig.tagline}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: siteConfig.name,
  },
  twitter: { card: "summary_large_image" },
  // No site-wide canonical here: each page sets its own, otherwise pages
  // without one would all point at the home page.
};

export const viewport: Viewport = {
  themeColor: siteConfig.themeColor,
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang={siteConfig.lang} dir="rtl" className={`${body.variable} ${display.variable}`}>
      <body className="bg-cream font-body text-ink min-h-dvh antialiased">{children}</body>
    </html>
  );
}
