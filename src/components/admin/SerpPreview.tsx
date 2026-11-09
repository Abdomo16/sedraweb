import { siteConfig } from "@/config/site";

/**
 * Google-style preview with character counters, so the owner can see what the
 * page will look like in search results and keep titles/descriptions in range.
 */
export function SerpPreview({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  const fullTitle = `${title} | ${siteConfig.name}`;
  const titleLen = fullTitle.length;
  const descLen = description.length;
  return (
    <div className="rounded-2xl bg-gray-50 p-4" dir="rtl">
      <p className="text-xs text-gray-600" dir="ltr">
        {siteConfig.url.replace(/^https?:\/\//, "")}
        {path}
      </p>
      <p className="mt-1 text-lg leading-snug font-bold text-blue-800">{fullTitle}</p>
      <p className="mt-1 text-sm leading-6 text-gray-700">{description || "..."}</p>
      <p className="mt-2 flex flex-wrap gap-x-4 text-xs">
        <span className={titleLen > 60 ? "font-bold text-red-600" : "text-gray-600"}>
          العنوان {titleLen}/60
        </span>
        <span
          className={
            descLen > 160 || (descLen > 0 && descLen < 70)
              ? "font-bold text-red-600"
              : "text-gray-600"
          }
        >
          الوصف {descLen}/160 (الأفضل 70 إلى 160)
        </span>
      </p>
    </div>
  );
}
