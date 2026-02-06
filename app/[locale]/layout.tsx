import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isValidLocale, locales } from "@/i18n";
import { getMessages } from "@/lib/get-messages";
import { Header } from "../Header";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://romanantl.cz";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isValidLocale(locale)) return {};
  const t = getMessages(locale);
  const canonical = locale === "cs" ? baseUrl : `${baseUrl}/${locale}`;
  const ogImage = `${baseUrl}/profile_picture.jpeg`;
  const ogLocale = locale === "cs" ? "cs_CZ" : "en_US";

  return {
    metadataBase: new URL(baseUrl),
    title: t.meta.title,
    description: t.meta.description,
    openGraph: {
      type: "website",
      locale: ogLocale,
      url: canonical,
      siteName: t.site.name,
      title: t.meta.title,
      description: t.meta.description,
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
      title: t.meta.title,
      description: t.meta.description,
      images: [ogImage],
    },
    alternates: {
      canonical,
      languages: Object.fromEntries(
        locales.map((loc) => [loc, loc === "cs" ? baseUrl : `${baseUrl}/${loc}`])
      ),
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
    formatDetection: { telephone: false, email: true },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isValidLocale(locale)) notFound();

  const messages = getMessages(locale);

  return (
    <>
      <Header locale={locale} messages={messages} />
      {children}
    </>
  );
}
