import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Container } from "@/components/ui/Layout";
import { CartButton } from "@/components/store/cart/CartButton";
import { MobileMenu } from "@/components/store/MobileMenu";
import { TabLink } from "@/components/store/TabLink";
import { Icon, type IconName } from "@/components/ui/Icons";
import { mobileBottomNav } from "@/config/home";
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
    <header className="header-glass border-leaf-900/10 sticky top-0 z-30 border-b">
      <Container className="flex items-center gap-2 py-3 md:gap-3">
        <Link href="/" aria-label={`${siteConfig.name} - الرئيسية`} className="tap shrink-0">
          <Logo className="h-11 w-auto" priority />
        </Link>
        {mobileBottomNav ? null : (
          <MobileMenu
            categories={categories.map((c) => ({
              slug: c.slug,
              shortName: c.shortName,
              ageLabel: c.ageLabel,
              image: c.image,
            }))}
          />
        )}
        <Link
          href="/collections"
          className="tap text-ink/60 hover:bg-leaf-50 flex min-h-11 min-w-0 flex-1 items-center gap-2 rounded-xl bg-[#f3f1ec] ps-4 pe-3 text-sm transition-colors md:mx-auto md:max-w-md lg:max-w-xl"
        >
          <span className="truncate">ابحث عن بيجامة...</span>
          <Icon name="search" className="text-leaf-900 ms-auto size-5 shrink-0" />
        </Link>
        <CartButton className="text-leaf-900 hover:bg-leaf-50 flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors">
          <Icon name="bag" />
        </CartButton>
      </Container>
      <nav aria-label="الأقسام" className="border-leaf-900/10 hidden border-t md:block">
        <Container>
          <ul className="flex gap-1 py-2 text-sm font-bold">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/collections/${c.slug}`}
                  className="tap hover:text-leaf-700 block px-3.5 py-2 hover:underline hover:decoration-2 hover:underline-offset-8"
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
      className="border-leaf-900/10 fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-3">
        {tabs.map((t) => (
          <li key={t.href}>
            <TabLink href={t.href} label={t.label}>
              <Icon name={t.icon} className="size-6" />
            </TabLink>
          </li>
        ))}
        <li>
          <CartButton
            badgeClassName="end-auto! left-[calc(50%+0.2rem)]! top-1.5! shadow-sm"
            className="tap text-ink/55 flex min-h-14 w-full flex-col items-center justify-center gap-0.5 text-[11px] font-bold"
          >
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
    <footer
      className={`bg-leaf-900 relative mt-14 text-white ${mobileBottomNav ? "pb-24 md:pb-10" : "pb-10"}`}
    >
      <Container className="relative grid gap-8 py-10 md:grid-cols-3">
        <div>
          <span className="inline-block rounded-xl bg-white px-4 py-2">
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
      <p className="relative border-t border-white/15 py-4 text-center text-xs text-white/60">
        © {siteConfig.name}. جميع الحقوق محفوظة.
      </p>
    </footer>
  );
}
