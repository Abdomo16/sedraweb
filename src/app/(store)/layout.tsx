import { BackToTop } from "@/components/store/BackToTop";
import { CartDrawerHost } from "@/components/store/cart/CartDrawerHost";
import { AnnouncementBar, BottomTabBar, Footer, Header } from "@/components/store/Shell";
import { JsonLd } from "@/components/seo/JsonLd";
import { mobileBottomNav, social } from "@/config/home";
import { siteConfig } from "@/config/site";

/** Public storefront shell. */
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": `${siteConfig.url}/#organization`,
            name: siteConfig.name,
            alternateName: siteConfig.nameVariants,
            logo: `${siteConfig.url}/logo.png`,
            url: siteConfig.url,
            sameAs: [social.facebook, social.instagram],
          },
          {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteConfig.name,
            url: siteConfig.url,
            inLanguage: siteConfig.lang,
          },
        ]}
      />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-50 focus:rounded-full focus:bg-white focus:px-4 focus:py-2"
      >
        تخطي إلى المحتوى
      </a>
      <AnnouncementBar />
      <Header />
      <main id="main" className={mobileBottomNav ? "pb-20 md:pb-0" : undefined}>
        {children}
      </main>
      <Footer />
      {mobileBottomNav ? <BottomTabBar /> : null}
      <BackToTop />
      <CartDrawerHost />
    </>
  );
}
