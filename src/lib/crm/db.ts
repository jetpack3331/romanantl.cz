import { mkdirSync } from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { getCrmDataDir } from "@/lib/crm/config";
import { MIGRATIONS } from "@/lib/crm/migrations";

export type Db = DatabaseSync;

/**
 * Applies pending migrations in order. Each migration runs in its own
 * transaction and is recorded in `schema_migrations`, so adding a CRM module
 * means appending a migration to MIGRATIONS - never edit an applied one.
 */
function migrate(db: Db): void {
  db.exec(
    "CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY, applied_at TEXT NOT NULL)"
  );
  const applied = new Set(
    db
      .prepare("SELECT version FROM schema_migrations")
      .all()
      .map((row) => Number(row.version))
  );
  for (const migration of MIGRATIONS) {
    if (applied.has(migration.version)) continue;
    transaction(db, () => {
      db.exec(migration.sql);
      db.prepare(
        "INSERT INTO schema_migrations (version, applied_at) VALUES (?, ?)"
      ).run(migration.version, new Date().toISOString());
    });
  }
}

export function openDb(file: string): Db {
  if (file !== ":memory:") mkdirSync(path.dirname(file), { recursive: true });
  const db = new DatabaseSync(file);
  // Rollback journal instead of WAL: WAL shared memory is not coherent across a
  // Docker bind mount on macOS, and a single small app gains nothing from it.
  db.exec("PRAGMA journal_mode = DELETE; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000;");
  migrate(db);
  return db;
}

export function transaction<T>(db: Db, work: () => T): T {
  db.exec("BEGIN");
  try {
    const result = work();
    db.exec("COMMIT");
    return result;
  } catch (error) {
    db.exec("ROLLBACK");
    throw error;
  }
}

let shared: Db | null = null;

/** Process-wide connection to `<CRM_DATA_DIR>/crm.db`. */
export function getDb(): Db {
  shared ??= openDb(path.join(getCrmDataDir(), "crm.db"));
  return shared;
}
