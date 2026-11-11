/**
 * Home page content that is not stored in the database yet. Slides and tiles read the
 * cover photo and name from the categories, so changing a category cover in the admin
 * changes the home page too. (Later this can move into an admin screen.)
 */
export const heroSlides = [
  { category: "older-girls", eyebrow: "بنات من 9 لـ 14 سنة" },
  { category: "he-and-she-boys", eyebrow: "HE and SHE · من 11 لـ 16 سنة" },
  { category: "girls", eyebrow: "بنات من 3 لـ 8 سنين" },
  { category: "baby-boys", eyebrow: "بيبي من 6 شهور لسنتين" },
] as const;

export const ageTiles = [
  {
    label: "بيبي",
    sub: "من 6 شهور لسنتين",
    cover: "baby-girls",
    girls: { slug: "baby-girls", label: "بنات" },
    boys: { slug: "baby-boys", label: "ولاد" },
    tone: "bg-sun-100",
  },
  {
    label: "أطفال",
    sub: "من 3 لـ 8 سنين",
    cover: "girls",
    girls: { slug: "girls", label: "بنات" },
    boys: { slug: "boys", label: "ولاد" },
    tone: "bg-leaf-100",
  },
  {
    label: "كبار",
    sub: "من 9 لـ 14 سنة",
    cover: "older-girls",
    girls: { slug: "older-girls", label: "بنات" },
    boys: { slug: "older-boys", label: "ولاد" },
    tone: "bg-sky-100",
  },
  {
    label: "HE and SHE",
    sub: "من 11 لـ 16 سنة",
    cover: "he-and-she-girls",
    // Short labels so both buttons fit side by side on a phone; the tile title says HE and SHE.
    girls: { slug: "he-and-she-girls", label: "بنات" },
    boys: { slug: "he-and-she-boys", label: "ولاد" },
    tone: "bg-rose-100",
  },
] as const;

export const social = {
  facebook: "https://www.facebook.com/Sedrakids1",
  instagram: "https://www.instagram.com/sedrakids8/",
  /** As shown on the Facebook page; update when it changes. */
  facebookFollowers: "٩١ ألف",
} as const;

/**
 * How the categories show on phones, right under the header:
 *   "chips"   text pills (كل الأقسام، بيبي بناتي ...)
 *   "circles" round photos
 * Change this one word to switch back and forth.
 */
export const mobileCategoryStyle: "chips" | "circles" = "chips";

/** Products per page in a collection (an even number keeps the 2-column grid full). */
export const productsPerPage = 12;

/**
 * Phones: true shows the bottom bar (الرئيسية، الأقسام، السلة); false hides it and puts a
 * "الأقسام" button next to the logo instead (the logo is home, the cart is already in the header).
 */
export const mobileBottomNav: boolean = false;
