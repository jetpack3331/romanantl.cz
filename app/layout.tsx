import type { Metadata } from "next";
import Script from "next/script";
import { Plus_Jakarta_Sans, Source_Sans_3 } from "next/font/google";
import "./globals.css";
import { SetLocaleLang } from "./SetLocaleLang";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://romanantl.cz";

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "Roman Antl - Full Stack Developer & Contractor",
    template: "%s | Roman Antl",
  },
  description:
    "Full Stack Developer, React, TypeScript, Vue. AI product photography and ComfyUI. 14+ years experience. E-commerce, web3.",
  openGraph: {
    type: "website",
    siteName: "Roman Antl",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={`${plusJakarta.variable} ${sourceSans.variable}`}>
      <body className="font-sans antialiased">
        <SetLocaleLang />
        <Script
          src="https://kit.fontawesome.com/b09d0cc083.js"
          strategy="afterInteractive"
          crossOrigin="anonymous"
        />
        {children}
      </body>
    </html>
  );
}
