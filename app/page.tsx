import Image from "next/image";
import { site, summary, socialLinks, sections } from "./content";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Hero */}
      <section className="relative mx-auto max-w-4xl px-6 py-16 md:py-24">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <Image
              alt="Roman Antl"
              className="rounded-full w-40 h-40 md:w-48 md:h-48 2xl:w-56 2xl:h-56 object-cover ring-4 ring-white dark:ring-gray-800 shadow-xl"
              src="/profile_picture.jpeg"
              width={224}
              height={224}
              priority
            />
          </div>
          <h1 className="font-display mt-8 text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl md:text-6xl">
            {site.name}
          </h1>
          <p className="mt-2 font-display text-lg font-medium text-accent-from dark:text-accent-to sm:text-xl">
            {site.title}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {site.tagline}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            {socialLinks.map(({ href, label, icon, color }) => (
              <a
                key={label}
                href={href}
                rel="noopener noreferrer"
                target="_blank"
                className={`socialbtn ${color}`}
                aria-label={label}
              >
                <i className={icon} />
              </a>
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-2xl space-y-4 text-left text-slate-600 dark:text-slate-300 sm:text-lg">
            {summary.paragraphs.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      {/* Vybrané projekty – placeholder */}
      <section className="border-t border-slate-200 dark:border-gray-800 bg-white/50 dark:bg-gray-900/50">
        <div className="mx-auto max-w-4xl px-6 py-16 md:py-20">
          <h2 className="font-display text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
            {sections.workTitle}
          </h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {sections.workSubtitle}
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="flex min-h-[140px] items-center justify-center rounded-xl border-2 border-dashed border-slate-200 dark:border-gray-700 bg-slate-50/50 dark:bg-gray-800/30"
              >
                <span className="text-sm text-slate-400 dark:text-slate-500">
                  Projekt {i} — brzy
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
