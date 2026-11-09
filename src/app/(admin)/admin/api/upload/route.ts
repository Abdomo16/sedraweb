import { randomBytes } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { getAdmin } from "@/features/admin/auth/guard";
import { env } from "@/lib/env";

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = new Set(["jpeg", "png", "webp", "avif"]);

function fileStem(hint: string): string {
  const stem = hint
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return stem || "image";
}

/**
 * Admin-only image upload. The file is decoded for real (not trusted by name or
 * type), resized to at most 1600px, converted to WebP and stripped of metadata.
 * The file name starts with a keyword (usually the product slug) for image SEO.
 */
export async function POST(request: Request) {
  const admin = await getAdmin();
  if (!admin) return Response.json({ error: "غير مصرح" }, { status: 401 });

  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") {
    return Response.json({ error: "طلب غير مسموح" }, { status: 403 });
  }

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return Response.json({ error: "مفيش ملف" }, { status: 400 });
  if (file.size > MAX_BYTES) {
    return Response.json({ error: "الصورة أكبر من 10 ميجا" }, { status: 413 });
  }

  try {
    const input = Buffer.from(await file.arrayBuffer());
    const image = sharp(input, { limitInputPixels: 80_000_000, failOn: "error" });
    const meta = await image.metadata();
    if (!meta.format || !ALLOWED.has(meta.format)) {
      return Response.json({ error: "نوع الصورة غير مدعوم (JPG أو PNG أو WebP)" }, { status: 415 });
    }

    const { data, info } = await image
      .rotate()
      .resize({ width: 1600, height: 1600, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer({ resolveWithObject: true });

    const name = `${fileStem(String(form.get("hint") ?? ""))}-${randomBytes(4).toString("hex")}.webp`;
    const dir = path.resolve(env.MEDIA_DIR, "uploads");
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), data);

    return Response.json({ url: `/media/uploads/${name}`, width: info.width, height: info.height });
  } catch {
    return Response.json({ error: "تعذّر قراءة الصورة" }, { status: 422 });
  }
}
