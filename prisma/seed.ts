import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

/**
 * Search-friendly category names. `legacyName` keeps the old internal names
 * (بيبي / وسط / محير) for admin reference. Age ranges get added to names
 * once confirmed.
 */
const categories = [
  {
    slug: "baby-girls",
    name: "بيجامات بيبي رضع بناتي",
    legacyName: "بيبي بناتي",
    ageBand: "BABY",
    gender: "GIRLS",
  },
  {
    slug: "baby-boys",
    name: "بيجامات بيبي رضع ولادي",
    legacyName: "بيبي ولادي",
    ageBand: "BABY",
    gender: "BOYS",
  },
  {
    slug: "girls",
    name: "بيجامات أطفال بناتي",
    legacyName: "وسط بناتي",
    ageBand: "KIDS",
    gender: "GIRLS",
  },
  {
    slug: "boys",
    name: "بيجامات أطفال ولادي",
    legacyName: "وسط ولادي",
    ageBand: "KIDS",
    gender: "BOYS",
  },
  {
    slug: "older-girls",
    name: "بيجامات كبار الأطفال بناتي",
    legacyName: "محير بناتي",
    ageBand: "OLDER",
    gender: "GIRLS",
  },
  {
    slug: "older-boys",
    name: "بيجامات كبار الأطفال ولادي",
    legacyName: "محير ولادي",
    ageBand: "OLDER",
    gender: "BOYS",
  },
  {
    slug: "unisex",
    name: "بيجامات أطفال للجنسين",
    legacyName: "محير He&She",
    ageBand: "OLDER",
    gender: "UNISEX",
  },
] as const;

async function main() {
  for (const [index, c] of categories.entries()) {
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, legacyName: c.legacyName, sortOrder: index },
      create: { ...c, sortOrder: index },
    });
  }
  console.log(`Seeded ${categories.length} categories`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
