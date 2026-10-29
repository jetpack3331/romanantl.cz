import { beforeEach, describe, expect, it } from "vitest";
import { createClient, listClients } from "@/lib/crm/clients/repository";
import {
  DEFAULT_CLIENT_SORT,
  clientOrderBy,
  nextClientSort,
  parseClientSort,
} from "@/lib/crm/clients/sorting";
import { openDb, type Db } from "@/lib/crm/db";

describe("parseClientSort", () => {
  it("reads key and direction, descending when no direction is given", () => {
    expect(parseClientSort(new URLSearchParams("razeni=firma&smer=asc"))).toEqual({ key: "firma", direction: "asc" });
    expect(parseClientSort(new URLSearchParams("razeni=web"))).toEqual({ key: "web", direction: "desc" });
    expect(parseClientSort(new URLSearchParams("razeni=krok&smer=sideways"))).toEqual({ key: "krok", direction: "desc" });
  });

  it("returns null without a column or for unknown and injected keys", () => {
    expect(parseClientSort(new URLSearchParams(""))).toBeNull();
    expect(parseClientSort(new URLSearchParams("razeni=name;DROP TABLE clients"))).toBeNull();
    expect(parseClientSort(new URLSearchParams("razeni=toString"))).toBeNull();
    expect(clientOrderBy(DEFAULT_CLIENT_SORT)).toContain("web_score");
  });
});

describe("nextClientSort", () => {
  it("cycles descending, ascending, then no sort", () => {
    const first = nextClientSort(null, "firma");
    expect(first).toEqual({ key: "firma", direction: "desc" });
    const second = nextClientSort(first, "firma");
    expect(second).toEqual({ key: "firma", direction: "asc" });
    expect(nextClientSort(second, "firma")).toBeNull();
  });

  it("starts descending when switching to another column", () => {
    expect(nextClientSort({ key: "firma", direction: "asc" }, "web")).toEqual({ key: "web", direction: "desc" });
  });
});

describe("listClients sorting", () => {
  let db: Db;

  beforeEach(() => {
    db = openDb(":memory:");
    createClient(db, { name: "beta", emails: "", status: "nevolat", nextStepDate: "2026-11-02", webScore: 10 });
    createClient(db, { name: "Alfa", emails: "z@alfa.cz", status: "má zájem", nextStepDate: "", webScore: null });
    createClient(db, { name: "Gama", emails: "a@gama.cz", status: "nekontaktováno", nextStepDate: "2026-10-30", webScore: 80 });
  });

  const names = (key: "firma" | "kontakt" | "web" | "stav" | "krok", direction: "asc" | "desc") =>
    listClients(db, {}, { key, direction }).map((client) => client.name);

  it("sorts names with Czech collation", () => {
    createClient(db, { name: "Šimek" });
    createClient(db, { name: "Chata" });
    createClient(db, { name: "Zeman" });
    createClient(db, { name: "Hora" });
    expect(names("firma", "asc")).toEqual(["Alfa", "beta", "Gama", "Hora", "Chata", "Šimek", "Zeman"]);
  });

  it("uses the default order (web score) without a selected column", () => {
    expect(listClients(db, {}, null).map((client) => client.name)).toEqual(["Gama", "beta", "Alfa"]);
  });

  it("puts low-priority clients last in the default order only", () => {
    createClient(db, { name: "Delta", status: "nabídnout správu", webScore: 99 });
    expect(listClients(db, {}, null).map((client) => client.name)).toEqual(["Gama", "beta", "Alfa", "Delta"]);
    expect(listClients(db, {}, { key: "web", direction: "desc" })[0].name).toBe("Delta");
  });

  it("sorts names case-insensitively", () => {
    expect(names("firma", "asc")).toEqual(["Alfa", "beta", "Gama"]);
    expect(names("firma", "desc")).toEqual(["Gama", "beta", "Alfa"]);
  });

  it("keeps empty values last in both directions", () => {
    expect(names("web", "desc")).toEqual(["Gama", "beta", "Alfa"]);
    expect(names("web", "asc")).toEqual(["beta", "Gama", "Alfa"]);
    expect(names("kontakt", "asc")).toEqual(["Gama", "Alfa", "beta"]);
    expect(names("krok", "asc")).toEqual(["Gama", "beta", "Alfa"]);
    expect(names("krok", "desc")).toEqual(["beta", "Gama", "Alfa"]);
  });

  it("sorts statuses in pipeline order", () => {
    expect(names("stav", "asc")).toEqual(["Gama", "Alfa", "beta"]);
  });
});
