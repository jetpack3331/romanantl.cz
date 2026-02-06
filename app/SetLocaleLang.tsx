"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { isValidLocale } from "@/i18n";

export function SetLocaleLang() {
  const pathname = usePathname();
  useEffect(() => {
    const segment = pathname?.replace(/^\//, "").split("/")[0];
    const lang = segment && isValidLocale(segment) ? segment : "cs";
    document.documentElement.lang = lang;
  }, [pathname]);
  return null;
}
