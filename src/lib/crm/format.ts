/** Czech date/time for CRM tables; ISO dates without time are shown as dates only. */
export function formatCrmDate(value: string): string {
  if (!value) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-");
    return `${Number(day)}. ${Number(month)}. ${year}`;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("cs-CZ", { timeZone: "Europe/Prague" });
}

/** Today in Prague as YYYY-MM-DD. */
export function todayInPrague(now: Date = new Date()): string {
  return now.toLocaleDateString("sv-SE", { timeZone: "Europe/Prague" });
}

/** Imported URLs are rendered as links, so only http(s) is allowed. */
export function safeHref(url: string): string {
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^[a-z][a-z0-9+.-]*:/i, "")}`;
}
