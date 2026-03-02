import Image from "next/image";
import Link from "next/link";
import { locales } from "@/i18n";
import { getMessages } from "@/lib/get-messages";
import { socialLinks } from "../content";
import { ContactForm } from "../ContactForm";

function placeholdUrl(w: number, h: number, text: string) {
  return `https://placehold.co/${w}x${h}/D4C8BC/B89868?text=${encodeURIComponent(text)}`;
}

function BioWithBold({ text }: { text: string }) {
  const className = "text-sm text-pastel-dark/90 dark:text-pastel-cream/90 leading-relaxed";
  const strongClassName = "font-semibold text-pastel-dark dark:text-pastel-cream";
  return (
    <>
      {text.split(/\n\n+/).map((paragraph, i) => {
        const parts = paragraph.split(/\*\*([^*]+)\*\*/g);
        return (
          <p key={i} className={i > 0 ? `mt-3 ${className}` : className}>
            {parts.map((part, j) =>
              j % 2 === 1 ? (
                <strong key={j} className={strongClassName}>
                  {part}
                </strong>
              ) : (
                part
              )
            )}
          </p>
        );
      })}
    </>
  );
}

type Props = {
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocalePage({ params }: Props) {
  const { locale } = await params;
  const t = getMessages(locale as "cs" | "en");

  return (
    <div className="min-h-screen bg-pastel-cream dark:bg-pastel-dark">
      <main className="mx-auto max-w-5xl px-6 py-10 md:py-14">
        {/* Hero — dvě sloupce */}
        <section className="grid gap-10 md:grid-cols-2 md:items-start md:gap-12">
          <div className="space-y-6">
            {(t.hero.left.sections as Array<{ title: string; description: string }>).map((section, i) => (
              <div key={i}>
                <h2 className="font-display text-lg font-bold text-pastel-dark dark:text-pastel-cream md:text-xl">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm text-pastel-dark/90 dark:text-pastel-cream/90 leading-relaxed">
                  {section.description}
                  {section.title.startsWith("AI ") && (
                    <>
                      {" "}
                      <Link
                        href={locale === "cs" ? "/ai-tvorba" : `/${locale}/ai-tvorba`}
                        className="font-semibold text-pastel-accent dark:text-pastel-accent underline-offset-4 hover:underline"
                      >
                        {locale === "cs" ? "AI tvorba" : "AI work"}
                      </Link>
                      .
                    </>
                  )}
                </p>
              </div>
            ))}
          </div>
          <div className="rounded-card overflow-hidden bg-pastel-sand/60 dark:bg-pastel-dark-secondary/60 p-6 shadow-soft flex flex-col items-center text-center">
            <Image
              alt={t.site.name}
              className="rounded-2xl w-48 h-48 md:w-56 md:h-56 object-cover object-top shadow-soft"
              src="/profile_picture.jpeg"
              width={224}
              height={224}
              priority
            />
            <h2 className="font-display mt-5 text-xl font-bold text-pastel-dark dark:text-pastel-cream md:text-2xl">
              {(t.hero.right as { name: string }).name}
            </h2>
            <p className="mt-1 text-xs font-medium text-pastel-accent dark:text-pastel-dark uppercase tracking-wide">
              {(t.hero.right as { subtitle: string }).subtitle}
            </p>
            <div className="mt-4 text-left w-full">
              <BioWithBold text={(t.hero.right as { bio: string }).bio} />
            </div>
            <a
              href="#contact"
              className="btn-primary mt-6 inline-block "
            >
              {(t.hero.right as { cta: string }).cta}
            </a>
            <div className="mt-6 flex flex-wrap justify-center gap-2" aria-label="Technologie">
              {((t.hero.right as { techStack: string[] }).techStack).map((tech) => (
                <span
                  key={tech}
                  className="rounded-full bg-pastel-sage/60 dark:bg-pastel-dark-secondary/80 px-3 py-1 text-xs font-medium text-pastel-dark/90 dark:text-pastel-cream/90"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* O mně — bez doporučení */}
        <section id="about" className="mt-16 scroll-mt-8">
          <h2 className="font-display text-2xl font-bold text-pastel-dark dark:text-pastel-cream">
            {t.about.title}
          </h2>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div className="card p-5">
              <h3 className="font-display font-bold text-pastel-dark dark:text-pastel-dark">
                {t.about.experience}
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-pastel-dark/80 dark:text-pastel-dark/80">
                {(t.about.experienceList as Array<{ role: string; company: string; period: string }>).map((item, i) => (
                  <li key={i}>
                    <span className="font-medium text-pastel-dark dark:text-pastel-dark">
                      {item.role}
                    </span>
                    {" · "}
                    <span>{item.company}</span>
                    {" · "}
                    <span className="text-pastel-accent dark:text-pastel-dark">
                      {item.period}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-5">
              <h3 className="font-display font-bold text-pastel-dark dark:text-pastel-dark">
                {t.about.skills}
              </h3>
              <p className="mt-2 text-sm text-pastel-dark/80 dark:text-pastel-dark/80">
                {(t.about.skillsList as string[]).join(", ")}
              </p>
            </div>
            <div className="card p-5">
              <h3 className="font-display font-bold text-pastel-dark dark:text-pastel-dark">
                {t.about.aiTitle}
              </h3>
              <p className="mt-2 text-sm text-pastel-dark/80 dark:text-pastel-dark/80">
                {(t.about.aiSkillsList as string[]).join(", ")}
              </p>
            </div>
          </div>
        </section>

        {/* Pro koho jsem pracoval */}
        <section id="employers" className="mt-16 scroll-mt-8">
          <h2 className="font-display text-2xl font-bold text-pastel-dark dark:text-pastel-cream">
            {t.employers.title}
          </h2>
          <ul className="mt-6 space-y-4">
            {(t.employers.list as Array<{ company: string; role: string; period: string; what: string }>).map((item, i) => (
              <li key={i} className="card p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-display font-bold text-pastel-dark dark:text-pastel-dark">
                    {item.company}
                  </span>
                  <span className="text-sm text-pastel-accent dark:text-pastel-dark">
                    {item.period}
                  </span>
                </div>
                <p className="mt-1 text-sm font-medium text-pastel-dark/90 dark:text-pastel-dark/90">
                  {item.role}
                </p>
                <p className="mt-2 text-sm text-pastel-dark/75 dark:text-pastel-dark/75">
                  {item.what}
                </p>
              </li>
            ))}
          </ul>
        </section>

        {/* Kontakt */}
        <section id="contact" className="mt-16 scroll-mt-8">
          <h2 className="font-display text-2xl font-bold text-pastel-dark dark:text-pastel-cream">
            {t.contact.title}
          </h2>
          <div className="mt-8 grid gap-10 md:grid-cols-2">
            <div className="card p-6">
              <h3 className="font-display font-bold text-pastel-dark dark:text-pastel-dark">
                {t.contact.formTitle}
              </h3>
              <div className="mt-4">
                <ContactForm messages={t.contact} />
              </div>
            </div>
            <div className="card p-6">
              <h3 className="font-display font-bold text-pastel-dark dark:text-pastel-dark">
                {t.contact.otherContacts}
              </h3>
              <div className="mt-4 flex flex-wrap gap-3">
                {socialLinks.map(({ href, label, icon, color }) => (
                  <a
                    key={label}
                    href={href}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="socialbtn text-white"
                    style={{ backgroundColor: color }}
                    aria-label={label}
                  >
                    <i className={icon} />
                  </a>
                ))}
              </div>
              <p className="mt-4 text-sm text-pastel-dark/80 dark:text-pastel-dark/80">
                {t.contact.otherContactsDesc}
              </p>
            </div>
          </div>
        </section>

        <footer className="mt-16 border-t border-pastel-sage/50 dark:border-pastel-dark-secondary/50 py-6 text-center text-sm text-pastel-dark/70 dark:text-pastel-cream/70">
          {t.footer.credit}
        </footer>
      </main>
    </div>
  );
}
