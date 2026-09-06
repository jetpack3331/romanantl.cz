export const socialLinks = [
  {
    href: "https://www.linkedin.com/in/romanantl/",
    label: "LinkedIn",
    icon: "fa-brands fa-linkedin-in",
    color: "#0A66C2",
  },
  {
    href: "https://github.com/jetpack3331",
    label: "GitHub",
    icon: "fa-brands fa-github",
    color: "#181717",
  },
  {
    href: "mailto:romcaantl@gmail.com",
    label: "E-mail",
    icon: "fa-solid fa-envelope",
    color: "#555",
  },
  {
    href: "https://www.facebook.com/romca.antl",
    label: "Facebook",
    icon: "fa-brands fa-facebook-f",
    color: "#1877F2",
  },
  {
    href: "https://twitter.com/rom_an_33",
    label: "Twitter",
    icon: "fa-brands fa-twitter",
    color: "#1DA1F2",
  },
] as const;

/**
 * Locale-agnostic portfolio project data (links, screenshot ids). Localized
 * title/description text lives in messages/*.json under `portfolio.items`,
 * matched by `id`.
 *
 * To swap a placeholder image for a real screenshot, add a file named
 * `<id>.<ext>` to `src/assets/portfolio/` (e.g. `src/assets/portfolio/svetdovolene.png`).
 * It's picked up automatically at build time (via import.meta.glob in
 * HomePage.astro) and optimized through astro:assets - no code change needed.
 */
export const portfolioProjects = [
  { id: "zivotvespanelsku", href: "https://zivot-ve-spanelsku.cz" },
  { id: "svetdovolene", href: "https://svetdovolene.cz" },
  { id: "apartman", href: "https://apartmanvespanelsku.cz" },
  { id: "asoka", href: "https://asoka-events.es" },
  { id: "coolsocks", href: "https://coolsocks.cz" },
  { id: "spaindecoder", href: "https://spaindecoder.es" },
  { id: "rudolfantl", href: "https://rudolfantl.eu" },
  { id: "einpresswire", href: "https://www.einpresswire.com" },
] as const;
