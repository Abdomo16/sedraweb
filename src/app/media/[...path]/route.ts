import { readFile } from "node:fs/promises";
import path from "node:path";
import { env } from "@/lib/env";

const types: Record<string, string> = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".avif": "image/avif",
};

/**
 * Serves uploaded media (product photos) from MEDIA_DIR, which lives outside
 * `public/` so files added while the server runs are served immediately.
 * Put Cloudflare in front in production to cache them at the edge.
 */
export async function GET(_request: Request, ctx: RouteContext<"/media/[...path]">) {
  const { path: segments } = await ctx.params;
  const base = path.resolve(env.MEDIA_DIR);
  const file = path.resolve(base, ...segments);
  const type = types[path.extname(file).toLowerCase()];

  if (!type || !file.startsWith(base + path.sep)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    const data = await readFile(file);
    return new Response(new Uint8Array(data), {
      headers: {
        "Content-Type": type,
        // Uploaded files get a unique name and never change, so they can be cached for good.
        "Cache-Control":
          segments[0] === "uploads"
            ? "public, max-age=31536000, immutable"
            : "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
