import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/Layout";
import { CartButton } from "@/components/store/cart/CartButton";
import { Icon, type IconName } from "@/components/ui/Icons";
import { getCategories } from "@/features/catalog/queries";

/** Brand logo (transparent PNG). Replace /public/logo.png with an SVG/hi-res file when available. */
export function Logo({
  className = "",
  priority = false,
}: {
  className?: string;
  priority?: boolean;
}) {
  return (
    <Image
      src="/logo.png"
      alt={siteConfig.name}
      width={700}
      height={425}
      sizes="120px"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      className={className}
    />
  );
}

const announcements = [
  "شحن لكل محافظات مصر · الدفع عند الاستلام متاح",
  "هوم وير وبيجامات ناعمة للأطفال من 6 شهور لـ 16 سنة",
];

/** Two short messages that take turns (CSS only; without motion the first one stays). */
export function AnnouncementBar() {
  return (
    <div className="bg-leaf-900 relative h-9 overflow-hidden text-center text-xs font-bold text-white">
      {announcements.map((text, i) => (
        <p
          key={text}
          className={`announce absolute inset-0 flex items-center justify-center px-4 ${
            i === 0 ? "announce-first" : "announce-second"
          }`}
        >
          {text}
        </p>
      ))}
    </div>
  );
}

export async function Header() {
  const categories = await getCategories();
  return (
    <header className="border-leaf-700/10 bg-cream/95 sticky top-0 z-30 border-b backdrop-blur">
      <Container className="flex items-center gap-3 py-3">
        <Link href="/" aria-label={`${siteConfig.name} - الرئيسية`} className="shrink-0">
          <Logo className="h-11 w-auto" priority />
        </Link>
        <Link
          href="/collections"
          className="text-ink/70 shadow-soft flex min-h-11 flex-1 items-center gap-2 rounded-full bg-white px-4 text-sm md:mx-auto md:max-w-md"
        >
          <Icon name="search" className="size-5" />
          ابحث عن بيجامة...
        </Link>
        <CartButton className="bg-leaf-100 text-leaf-900 hover:bg-leaf-500 flex size-11 shrink-0 items-center justify-center rounded-full transition-colors hover:text-white">
          <Icon name="bag" />
        </CartButton>
      </Container>
      <nav aria-label="الأقسام" className="border-leaf-700/10 hidden border-t md:block">
        <Container>
          <ul className="flex gap-1 py-2 text-sm font-bold">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/collections/${c.slug}`}
                  className="hover:bg-leaf-100 block rounded-full px-3.5 py-2 transition-colors"
                >
                  {c.shortName}
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </nav>
    </header>
  );
}

const tabs: { href: string; label: string; icon: IconName }[] = [
  { href: "/", label: "الرئيسية", icon: "home" },
  { href: "/collections", label: "الأقسام", icon: "grid" },
];

export function BottomTabBar() {
  return (
    <nav
      id="bottom-tab-bar"
      aria-label="التنقل السريع"
      className="border-leaf-700/10 fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-3">
        {tabs.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              className="text-leaf-900 flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-bold"
            >
              <Icon name={t.icon} className="size-6" />
              {t.label}
            </Link>
          </li>
        ))}
        <li>
          <CartButton className="text-leaf-900 flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-xs font-bold">
            <Icon name="bag" className="size-6" />
            السلة
          </CartButton>
        </li>
      </ul>
    </nav>
  );
}

export async function Footer() {
  const categories = await getCategories();
  return (
    <footer className="bg-leaf-900 mt-14 rounded-t-[2rem] pb-24 text-white md:pb-10">
      <Container className="grid gap-8 py-10 md:grid-cols-3">
        <div>
          <span className="inline-block rounded-2xl bg-white px-4 py-2">
            <Logo className="h-14 w-auto" />
          </span>
          <p className="mt-2 text-sm leading-7 text-white/80">{siteConfig.tagline}</p>
          <p className="mt-4 text-sm text-white/80">الدفع: عند الاستلام · فيزا · إنستاباي</p>
        </div>
        <nav aria-label="الأقسام">
          <p className="mb-3 font-bold">الأقسام</p>
          <ul className="grid gap-2 text-sm text-white/80">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/collections/${c.slug}`} className="hover:text-white">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="معلومات">
          <p className="mb-3 font-bold">معلومات</p>
          <ul className="grid gap-2 text-sm text-white/80">
            <li>
              <Link href="/about" className="hover:text-white">
                من نحن
              </Link>
            </li>
            <li>سياسة الشحن</li>
            <li>الاستبدال والاسترجاع</li>
            <li>دليل المقاسات</li>
            <li>تواصل معنا</li>
          </ul>
        </nav>
      </Container>
      <p className="border-t border-white/15 py-4 text-center text-xs text-white/60">
        © {siteConfig.name}. جميع الحقوق محفوظة.
      </p>
    </footer>
  );
}
