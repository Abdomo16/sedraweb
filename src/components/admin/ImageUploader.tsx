"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export type ImageItem = { url: string; alt: string };

const btn =
  "bg-leaf-100 text-leaf-900 hover:bg-leaf-500 flex size-9 items-center justify-center rounded-full text-sm font-bold transition-colors hover:text-white disabled:opacity-40";

/**
 * Multi-image uploader with reorder, delete and alt text. The first image is the
 * main photo (shown on cards and used for sharing). Files are uploaded one by one.
 */
export function ImageUploader({
  value,
  onChange,
  hint,
  defaultAlt,
  max = 10,
}: {
  value: ImageItem[];
  onChange: (items: ImageItem[]) => void;
  /** Used for the stored file name (SEO): the product or category slug. */
  hint: string;
  defaultAlt: string;
  max?: number;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError(null);
    let items = [...value];
    for (const file of Array.from(files)) {
      if (items.length >= max) break;
      const body = new FormData();
      body.set("file", file);
      body.set("hint", hint);
      try {
        const res = await fetch("/admin/api/upload", { method: "POST", body });
        const data = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !data.url) throw new Error(data.error ?? "فشل الرفع");
        items = [...items, { url: data.url, alt: `${defaultAlt} - صورة ${items.length + 1}` }];
        onChange(items);
      } catch (e) {
        setError(`${file.name}: ${e instanceof Error ? e.message : "فشل الرفع"}`);
      }
    }
    setBusy(false);
    if (input.current) input.current.value = "";
  }

  const move = (from: number, to: number) => {
    if (to < 0 || to >= value.length) return;
    const next = [...value];
    [next[from], next[to]] = [next[to], next[from]];
    onChange(next);
  };

  return (
    <div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {value.map((img, i) => (
          <li key={img.url} className="rounded-2xl bg-white p-2 shadow-sm ring-1 ring-black/5">
            <div className="bg-leaf-50 relative aspect-[3/4] overflow-hidden rounded-xl">
              <Image
                src={img.url}
                alt={img.alt}
                fill
                sizes="200px"
                unoptimized
                className="object-cover"
              />
              {i === 0 ? (
                <span className="bg-sun-400 text-leaf-900 absolute start-1.5 top-1.5 rounded-full px-2 py-0.5 text-[11px] font-bold">
                  الرئيسية
                </span>
              ) : null}
            </div>
            <input
              value={img.alt}
              onChange={(e) =>
                onChange(value.map((x, k) => (k === i ? { ...x, alt: e.target.value } : x)))
              }
              aria-label={`وصف الصورة ${i + 1}`}
              placeholder="وصف الصورة (مهم للـ SEO)"
              className="border-leaf-700/20 mt-2 min-h-9 w-full rounded-lg border px-2 text-xs"
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="flex gap-1">
                <button
                  type="button"
                  className={btn}
                  onClick={() => move(i, i - 1)}
                  disabled={i === 0}
                  aria-label="تقديم"
                >
                  →
                </button>
                <button
                  type="button"
                  className={btn}
                  onClick={() => move(i, i + 1)}
                  disabled={i === value.length - 1}
                  aria-label="تأخير"
                >
                  ←
                </button>
              </div>
              <button
                type="button"
                className="flex min-h-9 items-center rounded-full bg-red-50 px-3 text-xs font-bold text-red-700 hover:bg-red-100"
                onClick={() => onChange(value.filter((_, k) => k !== i))}
              >
                حذف
              </button>
            </div>
          </li>
        ))}
        {value.length < max ? (
          <li>
            <button
              type="button"
              onClick={() => input.current?.click()}
              disabled={busy}
              className="border-leaf-700/30 text-leaf-700 hover:bg-leaf-50 flex aspect-[3/4] w-full flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed text-sm font-bold disabled:opacity-60"
            >
              <span className="text-3xl leading-none">+</span>
              {busy ? "جاري الرفع..." : "إضافة صور"}
            </button>
          </li>
        ) : null}
      </ul>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        hidden
        onChange={(e) => upload(e.target.files)}
      />
      {error ? (
        <p
          role="alert"
          className="mt-2 rounded-xl bg-red-50 px-3 py-2 text-sm font-bold text-red-700"
        >
          {error}
        </p>
      ) : null}
      <p className="text-ink/70 mt-2 text-xs">
        أول صورة هي الرئيسية. الصور بتتصغّر وتتحوّل تلقائياً لحجم خفيف.
      </p>
    </div>
  );
}
