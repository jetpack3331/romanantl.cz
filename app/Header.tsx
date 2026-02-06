import Link from "next/link";
import type { Locale } from "@/i18n";
import type { Messages } from "@/lib/get-messages";

type HeaderProps = {
  locale: Locale;
  messages: Messages;
};

export function Header({ locale, messages }: HeaderProps) {
  const nav = messages.nav;

  return (
    <header className="sticky top-0 z-10 border-b border-pastel-sand/80 bg-pastel-cream/95 backdrop-blur dark:border-pastel-dark-secondary dark:bg-pastel-dark/95">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <nav className="flex flex-wrap items-center gap-5">
          <Link
            href={`/${locale}`}
            className="font-display text-sm font-medium text-pastel-dark hover:text-pastel-accent dark:text-pastel-cream dark:hover:text-pastel-dark-accent"
          >
            {nav.home}
          </Link>
          <a
            href="#work"
            className="font-display text-sm font-medium text-pastel-dark hover:text-pastel-accent dark:text-pastel-cream dark:hover:text-pastel-dark-accent"
          >
            {nav.tvorba}
          </a>
          <a
            href="#about"
            className="font-display text-sm font-medium text-pastel-dark hover:text-pastel-accent dark:text-pastel-cream dark:hover:text-pastel-dark-accent"
          >
            {nav.about}
          </a>
          <a
            href="#employers"
            className="font-display text-sm font-medium text-pastel-dark hover:text-pastel-accent dark:text-pastel-cream dark:hover:text-pastel-dark-accent"
          >
            {nav.employers}
          </a>
          <a
            href="#contact"
            className="font-display text-sm font-medium text-pastel-dark hover:text-pastel-accent dark:text-pastel-cream dark:hover:text-pastel-dark-accent"
          >
            {nav.contact}
          </a>
        </nav>
        <div className="flex items-center gap-1" role="group" aria-label="Jazyk / Language">
          <Link
            href="/cs"
            hrefLang="cs"
            aria-label="Čeština"
            aria-current={locale === "cs" ? "true" : undefined}
            className={`flex h-9 w-9 items-center justify-center rounded-btn text-lg transition hover:bg-pastel-sand dark:hover:bg-pastel-dark-secondary ${locale === "cs" ? "bg-pastel-sand/80 dark:bg-pastel-dark-secondary/80 ring-1 ring-pastel-accent/50" : ""}`}
            title="Čeština"
          >
            CZ
          </Link>
          <Link
            href="/en"
            hrefLang="en"
            aria-label="English"
            aria-current={locale === "en" ? "true" : undefined}
            className={`flex h-9 w-9 items-center justify-center rounded-btn text-lg transition hover:bg-pastel-sand dark:hover:bg-pastel-dark-secondary ${locale === "en" ? "bg-pastel-sand/80 dark:bg-pastel-dark-secondary/80 ring-1 ring-pastel-accent/50" : ""}`}
            title="English"
          >
            EN
          </Link>
        </div>
      </div>
    </header>
  );
}
