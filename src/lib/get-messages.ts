import type { Locale } from "@/lib/i18n";
import cs from "@/messages/cs.json";
import en from "@/messages/en.json";
import es from "@/messages/es.json";

export type Messages = typeof cs;

const messagesByLocale: Record<Locale, Messages> = {
  cs: cs as Messages,
  en: en as Messages,
  es: es as Messages,
};

export function getMessages(locale: Locale): Messages {
  return messagesByLocale[locale] ?? messagesByLocale.cs;
}
