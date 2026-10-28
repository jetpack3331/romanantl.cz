import { CLIENT_STATUSES } from "@/lib/crm/clients/statuses";

export type SortDirection = "asc" | "desc";

type SortColumn = {
  /** ORDER BY expression(s) for the given direction; empty values always go last. */
  orderBy: (direction: SortDirection) => string;
};

const statusOrder = `CASE status ${CLIENT_STATUSES.map(
  (status, index) => `WHEN '${status.replace(/'/g, "''")}' THEN ${index}`
).join(" ")} ELSE ${CLIENT_STATUSES.length} END`;

/** Sortable columns of the client list, keyed by the `razeni` URL value. */
const SORT_COLUMNS = {
  firma: {
    // Czech collation is applied in listClients(); this is the SQL fallback
    orderBy: (dir) => `name COLLATE NOCASE ${dir}`,
  },
  kontakt: {
    orderBy: (dir) => `emails = '', emails COLLATE NOCASE ${dir}`,
  },
  web: {
    orderBy: (dir) => `web_score IS NULL, web_score ${dir}`,
  },
  stav: {
    // Pipeline order as defined in CLIENT_STATUSES
    orderBy: (dir) => `${statusOrder} ${dir}, status ${dir}`,
  },
  krok: {
    orderBy: (dir) => `next_step_date = '', next_step_date ${dir}, next_step = '', next_step ${dir}`,
  },
} satisfies Record<string, SortColumn>;

export type ClientSortKey = keyof typeof SORT_COLUMNS;
export type ClientSort = { key: ClientSortKey; direction: SortDirection };

/** Order used when no column is selected: highest web score (= worst website, best lead) first. */
export const DEFAULT_CLIENT_SORT: ClientSort = { key: "web", direction: "desc" };

function isSortKey(value: string | null): value is ClientSortKey {
  return value !== null && Object.hasOwn(SORT_COLUMNS, value);
}

/** Reads `razeni` and `smer` from the query string; null means no column is selected. */
export function parseClientSort(params: URLSearchParams): ClientSort | null {
  const key = params.get("razeni");
  if (!isSortKey(key)) return null;
  return { key, direction: params.get("smer") === "asc" ? "asc" : "desc" };
}

/** Whitelisted ORDER BY clause; ties are broken by company name. */
export function clientOrderBy(sort: ClientSort): string {
  const primary = SORT_COLUMNS[sort.key].orderBy(sort.direction);
  return sort.key === "firma" ? primary : `${primary}, name COLLATE NOCASE ASC`;
}

/**
 * Sort state after clicking a column header, cycling
 * descending -> ascending -> no sort (back to the default order).
 */
export function nextClientSort(current: ClientSort | null, key: ClientSortKey): ClientSort | null {
  if (current?.key !== key) return { key, direction: "desc" };
  return current.direction === "desc" ? { key, direction: "asc" } : null;
}
