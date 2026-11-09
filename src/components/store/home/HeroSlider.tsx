"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export type HeroSlide = { src: string; alt: string; href: string; eyebrow: string; title: string };

/**
 * Big photo stage. Only the first photo loads with the page (it is the one that matters for
 * speed); the others are added a moment later and then fade in one after another. The rotation
 * pauses while the pointer or focus is on it, in a hidden tab, and for people who prefer
 * reduced motion.
 */
export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [active, setActive] = useState(0);
  const [more, setMore] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setMore(true), 2000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!more || paused || slides.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        setActive((i) => (i + 1) % slides.length);
      }
    }, 5000);
    return () => window.clearInterval(id);
  }, [more, paused, slides.length]);

  return (
    <div
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[2rem] bg-white shadow-[0_24px_60px_-20px_rgb(36_63_23/0.45)] ring-[6px] ring-white md:aspect-[3/4]">
        {slides.map((s, i) =>
          i === 0 || more ? (
            <Link
              key={s.href}
              href={s.href}
              aria-hidden={i !== active}
              tabIndex={i === active ? 0 : -1}
              className={`absolute inset-0 block transition-opacity duration-1000 ${
                i === active ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <Image
                src={s.src}
                alt={s.alt}
                fill
                quality={70}
                sizes="(min-width: 1024px) 420px, 88vw"
                preload={i === 0}
                loading={i === 0 ? "eager" : "lazy"}
                fetchPriority={i === 0 ? "high" : "low"}
                className="object-cover object-top"
              />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4 pt-16">
                <span className="bg-sun-400 text-leaf-900 inline-block rounded-full px-3 py-1 text-xs font-bold">
                  {s.eyebrow}
                </span>
                <span className="font-display mt-2 flex items-center gap-2 text-xl leading-8 font-extrabold text-white">
                  {s.title}
                  <span aria-hidden="true">←</span>
                </span>
              </span>
            </Link>
          ) : null,
        )}
      </div>
      {slides.length > 1 ? (
        <div className="mt-2 flex justify-center" role="group" aria-label="صور المجموعات">
          {slides.map((s, i) => (
            <button
              key={s.href}
              type="button"
              disabled={!more && i > 0}
              onClick={() => setActive(i)}
              aria-label={`الصورة ${i + 1}: ${s.eyebrow}`}
              aria-current={i === active}
              className="flex size-8 items-center justify-center"
            >
              <span
                aria-hidden="true"
                className={`block h-2.5 rounded-full transition-all ${
                  i === active ? "bg-leaf-700 w-8" : "bg-leaf-700/25 w-2.5"
                }`}
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
