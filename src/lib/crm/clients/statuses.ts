/** Client pipeline statuses. The first four mirror the lead spreadsheet. */
export const CLIENT_STATUSES = [
  "nekontaktováno",
  "kontaktováno",
  "e-mail odeslán",
  "s volaným číslem se nelze spojit",
  "má zájem",
  "nemá zájem",
  "nevolat",
  // New or freshly redesigned website: no redesign offer now, maybe maintenance later
  "nabídnout správu",
] as const;

type ClientStatus = (typeof CLIENT_STATUSES)[number];

export const DEFAULT_STATUS: ClientStatus = "nekontaktováno";
/** Set after the outreach e-mail goes out to a not yet contacted client. */
export const EMAIL_SENT_STATUS: ClientStatus = "e-mail odeslán";
/** Set when the client unsubscribes - never contact again. */
export const DO_NOT_CONTACT_STATUS: ClientStatus = "nevolat";

/** Clients that are not a priority now; the default list order puts them last. */
export const LOW_PRIORITY_STATUSES: readonly ClientStatus[] = ["nabídnout správu"];

export const WEB_POTENTIALS = ["vysoký", "střední", "nízký", "neověřeno"] as const;

/** Tailwind classes for the status badge. */
export function statusBadgeClass(status: string): string {
  switch (status) {
    case "má zájem":
      return "bg-green-100 text-green-800";
    case "e-mail odeslán":
    case "kontaktováno":
      return "bg-blue-100 text-blue-800";
    case "nabídnout správu":
      return "bg-amber-100 text-amber-800";
    case "nemá zájem":
    case "nevolat":
    case "s volaným číslem se nelze spojit":
      return "bg-red-100 text-red-700";
    default:
      return "bg-pastel-sand text-pastel-dark";
  }
}
