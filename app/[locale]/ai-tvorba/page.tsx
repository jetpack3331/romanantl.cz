import Image from "next/image";
import type { Metadata } from "next";
import { locales } from "@/i18n";
import { getMessages } from "@/lib/get-messages";

type Props = {
  params: Promise<{ locale: string }>;
};

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://romanantl.cz";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = getMessages(locale as "cs" | "en");
  const canonical = locale === "cs" ? `${baseUrl}/ai-tvorba` : `${baseUrl}/${locale}/ai-tvorba`;

  return {
    metadataBase: new URL(baseUrl),
    title: t.aiMeta.title,
    description: t.aiMeta.description,
    openGraph: {
      type: "website",
      url: canonical,
      siteName: t.site.name,
      title: t.aiMeta.title,
      description: t.aiMeta.description,
      images: [
        {
          url: "/profile_picture.jpeg",
          width: 400,
          height: 400,
          alt: t.site.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t.aiMeta.title,
      description: t.aiMeta.description,
      images: ["/profile_picture.jpeg"],
    },
    alternates: {
      canonical,
      languages: Object.fromEntries(
        locales.map((loc) => [
          loc,
          loc === "cs" ? `${baseUrl}/ai-tvorba` : `${baseUrl}/${loc}/ai-tvorba`,
        ]),
      ),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

export default async function AiTvorbaPage({ params }: Props) {
  const { locale } = await params;
  const t = getMessages(locale as "cs" | "en");

  const items = t.tvorba.items as Array<{
    id: string;
    title: string;
    description: string;
    imageText: string;
    hasVariants?: boolean;
    variantsText?: string;
  }>;

  return (
    <div className="min-h-screen bg-pastel-cream dark:bg-pastel-dark">
      <main className="mx-auto max-w-5xl px-6 py-10 md:py-14">
        <section className="grid gap-10 md:grid-cols-2 md:items-start md:gap-12">
          <div>
            <h1 className="font-display text-2xl font-bold text-pastel-dark dark:text-pastel-cream md:text-3xl">
              {t.hero.aiHero.title}
            </h1>
            <p className="mt-3 text-sm text-pastel-dark/90 dark:text-pastel-cream/90 leading-relaxed">
              {t.hero.aiHero.description}
            </p>
            <p className="mt-3 text-sm text-pastel-dark/85 dark:text-pastel-cream/85 leading-relaxed">
              {t.hero.aiHero.subtitle}
            </p>
          </div>
          <div className="card p-5">
            <h2 className="font-display text-lg font-bold text-pastel-dark dark:text-pastel-dark">
              {t.hero.aiAvatars.title}
            </h2>
            <p className="mt-2 text-sm text-pastel-dark/85 dark:text-pastel-dark/85">
              {t.hero.aiAvatars.description}
            </p>
          </div>
        </section>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold text-pastel-dark dark:text-pastel-cream">
            {t.tvorba.title}
          </h2>
          <p className="mt-2 text-pastel-dark/80 dark:text-pastel-cream/80 max-w-2xl">
            {t.tvorba.subtitle}
          </p>
          <ul className="mt-8 space-y-10">
            {items.map((item) => (
              <li key={item.id}>
                <article className="card overflow-hidden p-0">
                  {item.id === "dress" ? (
                    <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3 md:gap-6">
                      <div className="space-y-4 md:col-span-1">
                        <p className="text-sm font-semibold text-pastel-accent dark:text-pastel-dark">
                          {t.tvorba.originalLabel}
                        </p>
                        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
                          <Image
                            src="/portfolio/dress/original.jpg"
                            alt={`${item.imageText} — source 1`}
                            width={300}
                            height={400}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
                          <Image
                            src="/portfolio/dress/original_2.jpg"
                            alt={`${item.imageText} — source 2`}
                            width={300}
                            height={400}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <p className="text-sm font-semibold text-pastel-accent dark:text-pastel-dark mb-2">
                          {t.tvorba.productPhotosLabel}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {(["1.png", "2.png", "3.jpeg", "4.png"] as const).map((file) => (
                            <div key={file} className="relative aspect-[3/4] overflow-hidden rounded-lg">
                              <Image
                                src={`/portfolio/dress/${file}`}
                                alt={`${item.imageText} ${file}`}
                                width={300}
                                height={400}
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`grid gap-4 p-5 ${
                        item.hasVariants ? "md:grid-cols-5 md:gap-6" : "md:grid-cols-2"
                      }`}
                    >
                      <div className="w-full md:col-span-2">
                        {(item.id === "1" || item.id === "parfem") && (
                          <p className="text-sm font-semibold text-pastel-accent dark:text-pastel-dark mb-2">
                            {t.tvorba.originalLabel}
                          </p>
                        )}
                        <div className="relative aspect-square w-full">
                          {item.id === "1" ? (
                            <Image
                              src="/portfolio/desk-timer/original.jpg"
                              alt={item.imageText}
                              width={400}
                              height={400}
                              className="h-full w-full rounded-lg object-cover"
                            />
                          ) : item.id === "parfem" ? (
                            <Image
                              src="/portfolio/parfem/optimized/original.jpg"
                              alt={item.imageText}
                              width={400}
                              height={400}
                              className="h-full w-full rounded-lg object-cover"
                            />
                          ) : (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={placeholdUrl(400, 400, item.imageText)}
                              alt=""
                              width={400}
                              height={400}
                              className="h-full w-full rounded-lg object-cover"
                            />
                          )}
                        </div>
                      </div>
                      {item.hasVariants ? (
                        <div className="md:col-span-3">
                          {(item.id === "1" || item.id === "parfem") && (
                            <p className="text-sm font-semibold text-pastel-accent dark:text-pastel-dark mb-2">
                              {t.tvorba.productPhotosLabel}
                            </p>
                          )}
                          <div className="grid grid-cols-4 gap-2 md:grid-cols-2">
                            {[1, 2, 3, 4].map((i) => (
                              <div key={i} className="relative aspect-square">
                                {item.id === "1" ? (
                                  <Image
                                    src={`/portfolio/desk-timer/${i}.png`}
                                    alt={`${item.imageText} ${i}`}
                                    width={200}
                                    height={200}
                                    className="h-full w-full rounded-lg object-cover"
                                  />
                                ) : item.id === "parfem" ? (
                                  <Image
                                    src={`/portfolio/parfem/optimized/${i}.jpg`}
                                    alt={`${item.imageText} ${i}`}
                                    width={200}
                                    height={200}
                                    className="h-full w-full rounded-lg object-cover"
                                  />
                                ) : (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={placeholdUrl(200, 200, `${item.imageText} ${i}`)}
                                    alt=""
                                    width={200}
                                    height={200}
                                    className="h-full w-full rounded-lg object-cover"
                                  />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col justify-center">
                          <h3 className="font-display font-bold text-pastel-dark dark:text-pastel-dark">
                            {item.title}
                          </h3>
                          <p className="mt-2 text-sm text-pastel-dark/80 dark:text-pastel-dark/80">
                            {item.description}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                  {item.hasVariants && (
                    <div className="border-t border-pastel-sage/60 dark:border-pastel-dark-secondary/60 px-5 py-4">
                      <h3 className="font-display font-bold text-pastel-dark dark:text-pastel-dark">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-pastel-dark/80 dark:text-pastel-dark/80">
                        {item.description}
                      </p>
                      {item.variantsText && (
                        <p className="mt-2 text-xs text-pastel-accent dark:text-pastel-dark">
                          {item.variantsText}
                        </p>
                      )}
                    </div>
                  )}
                </article>
              </li>
            ))}
          </ul>
        </section>

        <section id="pricing" className="mt-16 scroll-mt-8">
          <h2 className="font-display text-2xl font-bold text-pastel-dark dark:text-pastel-cream">
            {t.pricing.title}
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {t.pricing.packages.map((pkg, idx) => {
              const styles = [
                { bg: "bg-pricing-starter", text: "text-pastel-dark", accent: "text-pastel-dark/80" },
                { bg: "bg-pricing-standard", text: "text-pastel-dark", accent: "text-pastel-dark/80" },
                { bg: "bg-pricing-premium", text: "text-pastel-dark", accent: "text-pastel-dark/80" },
              ][idx] ?? { bg: "bg-pricing-starter", text: "text-pastel-dark", accent: "text-pastel-dark/80" };
              return (
                <div key={pkg.name} className={`card p-5 flex flex-col ${styles.bg} border-0 shadow-soft`}>
                  <h3 className={`font-display text-lg font-bold ${styles.text}`}>
                    {pkg.name}
                  </h3>
                  <p className={`mt-2 text-xl font-bold ${styles.accent}`}>
                    {pkg.price}
                  </p>
                  <ul className={`mt-4 flex-1 space-y-2 text-sm ${styles.text} opacity-90`}>
                    {pkg.features.map((f, i) => (
                      <li key={i} className="flex gap-2">
                        <span className={`shrink-0 ${styles.accent}`}>·</span>
                        <span className={i === 0 ? "font-semibold" : ""}>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <div className="mt-10 card p-6 bg-pricing-retainer border-0 shadow-soft text-pastel-cream">
            <h3 className="font-display text-lg font-bold">
              {t.pricing.retainer.name}
            </h3>
            <p className="mt-2 text-xl font-bold text-pastel-cream/95">
              {t.pricing.retainer.price}
            </p>
            <ul className="mt-4 space-y-2 text-sm text-pastel-cream/90">
              {t.pricing.retainer.features.map((f, i) => (
                <li key={i} className="flex gap-2">
                  <span className="text-pastel-cream/80 shrink-0">·</span>
                  <span className={i === 0 ? "font-semibold" : ""}>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}

