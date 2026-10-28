type Migration = { version: number; sql: string };

/** Append-only list of schema changes, applied by `migrate()` in db.ts. */
export const MIGRATIONS: Migration[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        -- Stable import key (Google Maps cid, else normalized website), NULL for manual clients
        import_key TEXT UNIQUE,
        name TEXT NOT NULL,
        website TEXT NOT NULL DEFAULT '',
        address TEXT NOT NULL DEFAULT '',
        phone TEXT NOT NULL DEFAULT '',
        -- One or more addresses separated by ", " (as in the lead spreadsheet)
        emails TEXT NOT NULL DEFAULT '',
        rating REAL,
        review_count INTEGER,
        google_maps_url TEXT NOT NULL DEFAULT '',
        web_potential TEXT NOT NULL DEFAULT '',
        web_score INTEGER,
        web_problems TEXT NOT NULL DEFAULT '',
        platform TEXT NOT NULL DEFAULT '',
        mobile_performance INTEGER,
        status TEXT NOT NULL DEFAULT 'nekontaktováno',
        next_step TEXT NOT NULL DEFAULT '',
        next_step_date TEXT NOT NULL DEFAULT '',
        last_contact_at TEXT NOT NULL DEFAULT '',
        call_note TEXT NOT NULL DEFAULT '',
        called_by TEXT NOT NULL DEFAULT '',
        source TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX clients_status ON clients (status);

      CREATE TABLE sent_emails (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER REFERENCES clients (id) ON DELETE SET NULL,
        to_email TEXT NOT NULL,
        company_name TEXT NOT NULL,
        client_url TEXT NOT NULL,
        sender_name TEXT NOT NULL,
        subject TEXT NOT NULL,
        sent_at TEXT NOT NULL
      );
      CREATE INDEX sent_emails_to ON sent_emails (to_email);
      CREATE INDEX sent_emails_client ON sent_emails (client_id);

      CREATE TABLE unsubscribes (
        email TEXT PRIMARY KEY,
        unsubscribed_at TEXT NOT NULL
      );
    `,
  },
  {
    version: 2,
    sql: `
      -- Saved sender details for the outreach e-mail form (e.g. Niki, Roman)
      CREATE TABLE sender_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        label TEXT NOT NULL UNIQUE,
        intro TEXT NOT NULL DEFAULT 'team',
        gender TEXT NOT NULL DEFAULT 'female',
        sender_name TEXT NOT NULL,
        business_name TEXT NOT NULL,
        business_id TEXT NOT NULL,
        sender_phone TEXT NOT NULL,
        sender_email TEXT NOT NULL,
        our_website TEXT NOT NULL DEFAULT '',
        updated_at TEXT NOT NULL
      );
    `,
  },
];
