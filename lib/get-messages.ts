import type { Locale } from "@/i18n";
import cs from "@/messages/cs.json";
import en from "@/messages/en.json";

export type Messages = typeof cs;

export function getMessages(locale: Locale): Messages {
  return locale === "en" ? (en as Messages) : (cs as Messages);
}
