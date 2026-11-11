"use client";

import { useState } from "react";

/**
 * Text clamped to two lines with a "المزيد" toggle. The full text is always in the page
 * (the clamp is only CSS), so search engines and screen readers read all of it.
 */
export function ExpandableText({ children }: { children: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="mt-3 px-1">
      <p
        id="collection-intro"
        className={`text-ink/80 text-sm leading-7 ${open ? "" : "line-clamp-2"}`}
      >
        {children}
      </p>
      {children.length > 90 ? (
        <button
          type="button"
          aria-expanded={open}
          aria-controls="collection-intro"
          onClick={() => setOpen((v) => !v)}
          className="tap text-leaf-700 mt-0.5 min-h-8 text-sm font-bold"
        >
          {open ? "أقل" : "المزيد"}
        </button>
      ) : null}
    </div>
  );
}
