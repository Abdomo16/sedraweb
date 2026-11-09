import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "لوحة التحكم",
  robots: { index: false, follow: false, nocache: true },
};

// Everything under /admin reads the session cookie, so it is rendered per request.
export const instant = false;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="bg-cream text-ink min-h-dvh">{children}</div>;
}
