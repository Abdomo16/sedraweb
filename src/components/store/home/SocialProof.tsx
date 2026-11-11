import { Container } from "@/components/ui/Layout";
import { social } from "@/config/home";

/** Real number from the brand's Facebook page, with links to the social pages. */
export function SocialProof() {
  return (
    <section aria-label="تابعنا" className="py-8">
      <Container>
        <div className="bg-leaf-900 relative overflow-hidden rounded-2xl px-6 py-8 text-white md:flex md:items-center md:justify-between md:gap-8 md:px-10 md:py-10">
          <div className="relative">
            <p className="font-display text-3xl leading-10 font-extrabold md:text-4xl">
              <span>{social.facebookFollowers}</span> متابع بيثقوا في سيدرا
            </p>
            <p className="mt-2 text-sm leading-7 text-white/85 md:text-base">
              تابعنا على فيسبوك وإنستجرام وشوف أحدث التصاميم والعروض.
            </p>
          </div>
          <div className="relative mt-5 flex flex-wrap gap-3 md:mt-0">
            <a
              href={social.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-leaf-900 hover:bg-leaf-100 inline-flex min-h-11 items-center rounded-xl bg-white px-6 text-sm font-bold transition-colors"
            >
              تابعنا على فيسبوك
            </a>
            <a
              href={social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center rounded-xl border border-white/40 px-6 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              إنستجرام
            </a>
          </div>
        </div>
      </Container>
    </section>
  );
}
