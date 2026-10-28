import { describe, expect, it } from "vitest";
import { parseCsv } from "@/lib/crm/clients/csv";
import { importKeyFor, normalizeDate, parseClientsCsv } from "@/lib/crm/clients/import";

const SHEET_HEADER =
  "Stav kontaktu,Název firmy,Web,Adresa,Telefon,E-mail,Hodnocení,Počet recenzí,Google Maps,Potenciál webu,Skóre webu,Problémy webu,Platforma,Výkon mobil,Další krok,Datum dalšího kroku,Poslední kontakt,Poznámka z hovoru,Volal(a)";

describe("parseCsv", () => {
  it("handles quotes, escaped quotes, CRLF and a BOM", () => {
    const rows = parseCsv('﻿a,b\r\n"x, y","say ""hi"""\r\n\r\n');
    expect(rows).toEqual([
      ["a", "b"],
      ["x, y", 'say "hi"'],
    ]);
  });

  it("detects semicolon-delimited files", () => {
    expect(parseCsv("Název firmy;Web\nFirma;www.firma.cz")).toEqual([
      ["Název firmy", "Web"],
      ["Firma", "www.firma.cz"],
    ]);
  });

  it("keeps line breaks inside quoted fields", () => {
    expect(parseCsv('a\n"line 1\nline 2"')).toEqual([["a"], ["line 1\nline 2"]]);
  });
});

describe("parseClientsCsv", () => {
  it("maps the lead spreadsheet columns", () => {
    const csv = `${SHEET_HEADER}
kontaktováno,Autoservis Bo Garage,http://www.bogarage.cz/,"Cihelní 3320/72a, Ostrava",+420 776 696 296,"bogarage@seznam.cz, info@bogarage.cz","4,7",10,https://maps.google.com/?cid=16553916204238047476&g_mp=x,nízký,3,chybí náhled,WordPress,55,zavolat,27.10.2026,,"26.10. nemá zájem",Niki`;
    const { clients, skipped } = parseClientsCsv(csv);
    expect(skipped).toBe(0);
    expect(clients[0]).toMatchObject({
      importKey: "gmaps:16553916204238047476",
      status: "kontaktováno",
      name: "Autoservis Bo Garage",
      emails: "bogarage@seznam.cz, info@bogarage.cz",
      rating: 4.7,
      reviewCount: 10,
      webScore: 3,
      mobilePerformance: 55,
      nextStepDate: "2026-10-27",
      callNote: "26.10. nemá zájem",
      calledBy: "Niki",
    });
  });

  it("accepts the scraper's English headers and skips rows without a name", () => {
    const csv = "name;website;email;rating\nFirma;https://www.firma.cz/;info@firma.cz;5\n;x;y;1";
    const { clients, skipped } = parseClientsCsv(csv);
    expect(clients).toHaveLength(1);
    expect(clients[0]).toMatchObject({ importKey: "web:firma.cz", rating: 5 });
    expect(skipped).toBe(1);
  });

  it("rejects files without a company name column", () => {
    expect(() => parseClientsCsv("foo,bar\n1,2")).toThrow("Název firmy");
  });
});

describe("helpers", () => {
  it("normalizes Czech dates and keeps unknown formats", () => {
    expect(normalizeDate("1. 2. 2026")).toBe("2026-02-01");
    expect(normalizeDate("2026-02-01")).toBe("2026-02-01");
    expect(normalizeDate("příští týden")).toBe("příští týden");
  });

  it("falls back to the name when there is no map link or website", () => {
    expect(importKeyFor({ name: " Firma " })).toBe("name:firma");
  });
});
