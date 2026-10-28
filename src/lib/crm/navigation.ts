/** CRM modules shown in the top navigation. Add an entry when adding a module. */
export const CRM_NAVIGATION = [
  { href: "/crm/klienti", label: "Klienti" },
  { href: "/crm/email", label: "Napsat e-mail" },
  { href: "/crm/emaily", label: "Odeslané e-maily" },
  { href: "/crm/klienti/import", label: "Import" },
] as const;

/** The most specific navigation entry matching the current path. */
export function activeNavigationHref(pathname: string): string | null {
  const matches = CRM_NAVIGATION.filter(
    ({ href }) => pathname === href || pathname.startsWith(`${href}/`)
  );
  return matches.sort((a, b) => b.href.length - a.href.length)[0]?.href ?? null;
}
