import type { Metadata } from "next";
import Script from "next/script";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin", "latin-ext"],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Roman Antl — Senior Frontend & Full Stack Developer",
  description:
    "14+ let zkušeností. SatoshiLabs, freelance. React, TypeScript, Vue, blockchain. AI-aided design a tvorba. Valencian Community, Španělsko.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="cs" className={`${syne.variable} ${dmSans.variable}`}>
      <body className="font-sans antialiased">
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
