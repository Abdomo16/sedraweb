import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

/**
 * Imports the processed product photos (storage/import-manifest.json) as DRAFT
 * products with PLACEHOLDER prices, sizes and stock. Every product is flagged
 * `needsReview`: the owner sets the real values in the admin before publishing.
 *
 * Existing products are left untouched unless you pass --force, so re-running
 * never overwrites anything the owner has edited.
 */
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
const force = process.argv.includes("--force");

type Manifest = {
  code: string;
  band: "baby" | "kids" | "older" | "he" | "she";
  category: string;
  images: { n: number }[];
}[];

const bands = {
  baby: {
    sizes: ["6-12 شهر", "12-18 شهر", "18-24 شهر"],
    age: "من 6 شهور لسنتين",
    price: [250, 400],
  },
  kids: { sizes: ["3", "4", "5", "6", "7", "8"], age: "من 3 لـ 8 سنين", price: [300, 500] },
  older: { sizes: ["9", "10", "11", "12", "13", "14"], age: "من 9 لـ 14 سنة", price: [400, 600] },
  he: { sizes: ["11", "12", "13", "14", "15", "16"], age: "من 11 لـ 16 سنة", price: [450, 700] },
  she: { sizes: ["11", "12", "13", "14", "15", "16"], age: "من 11 لـ 16 سنة", price: [450, 700] },
} as const;

const categories: Record<string, { slugPrefix: string; audience: string }> = {
  "baby-girls": { slugPrefix: "baby-girl", audience: "بيبي بناتي" },
  "baby-boys": { slugPrefix: "baby-boy", audience: "بيبي ولادي" },
  girls: { slugPrefix: "girl", audience: "أطفال بناتي" },
  boys: { slugPrefix: "boy", audience: "أطفال ولادي" },
  "older-girls": { slugPrefix: "older-girl", audience: "بناتي كبار" },
  "older-boys": { slugPrefix: "older-boy", audience: "ولادي كبار" },
  "he-and-she-girls": { slugPrefix: "she", audience: "SHE بناتي" },
  "he-and-she-boys": { slugPrefix: "he", audience: "HE ولادي" },
};

/** Deterministic pseudo-random so a re-import gives the same placeholder prices. */
function rng(seed: number) {
  let s = seed % 2147483647;
  return () => (s = (s * 48271) % 2147483647) / 2147483647;
}

const round5 = (n: number) => Math.round(n / 5) * 5;

async function main() {
  const manifestPath = path.resolve(process.env.MEDIA_DIR ?? "./storage", "import-manifest.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8")) as Manifest;
  const cats = await prisma.category.findMany();
  const catId = new Map(cats.map((c) => [c.slug, c.id]));

  let created = 0;
  let skipped = 0;
  for (const [index, m] of manifest.entries()) {
    const cat = categories[m.category];
    const categoryId = catId.get(m.category);
    if (!cat || !categoryId) throw new Error(`Unknown category ${m.category} for code ${m.code}`);

    const slug = `${cat.slugPrefix}-${m.code}`;
    const exists = await prisma.product.findUnique({ where: { slug } });
    if (exists && !force) {
      skipped++;
      continue;
    }

    const band = bands[m.band];
    const rand = rng(Number(m.code) * 7919);
    const price = round5(band.price[0] + rand() * (band.price[1] - band.price[0])) * 100;
    const compareAtPrice = rand() < 0.25 ? round5((price / 100) * 1.2) * 100 : null;
    const name = `طقم هوم وير ${cat.audience} موديل ${m.code}`;

    const data = {
      name,
      code: m.code,
      description: `طقم هوم وير مريح ${band.age}، موديل ${m.code} من سيدرا كيدز. اختار المقاس حسب سن الطفل.`,
      status: "DRAFT" as const,
      isNew: index % 3 === 0,
      needsReview: true,
      categoryId,
    };

    if (exists) {
      await prisma.productImage.deleteMany({ where: { productId: exists.id } });
      await prisma.variant.deleteMany({ where: { productId: exists.id } });
    }
    const product = exists
      ? await prisma.product.update({ where: { id: exists.id }, data })
      : await prisma.product.create({ data: { slug, ...data } });

    await prisma.productImage.createMany({
      data: m.images.map((img) => ({
        productId: product.id,
        url: `/media/products/${m.code}/${img.n}.webp`,
        alt: `${name} - صورة ${img.n}`,
        sortOrder: img.n,
      })),
    });
    await prisma.variant.createMany({
      data: band.sizes.map((size, i) => ({
        productId: product.id,
        sku: `${m.code}-${i + 1}`,
        size,
        price,
        compareAtPrice,
        stock: 10,
      })),
    });
    created++;
  }
  console.log(`Imported ${created} products, skipped ${skipped} existing`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
