import { siteConfig } from "@/config/site";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="font-display text-cedar-700 text-4xl font-extrabold">{siteConfig.name}</h1>
      <p className="text-lg">{siteConfig.tagline}</p>
      <p className="bg-cedar-100 text-cedar-900 rounded-full px-4 py-2 text-sm">
        المرحلة 1: الأساس جاهز، التصميم قريباً
      </p>
    </main>
  );
}
