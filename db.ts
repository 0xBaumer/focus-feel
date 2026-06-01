import { Database } from "bun:sqlite";

// Open (or create) a SQLite database file called focus.db.
// SQLite stores everything in a single file — no separate database server needed.
const db = new Database("focus.db");

// Create the sessions table only if it doesn't already exist.
// Each row represents one completed focus session.
db.run(`
  CREATE TABLE IF NOT EXISTS sessions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    task        TEXT    NOT NULL,
    duration    INTEGER NOT NULL,
    mood        TEXT    NOT NULL CHECK(mood IN ('good', 'okay', 'bad')),
    note        TEXT    DEFAULT '',
    created_at  TEXT    DEFAULT (datetime('now', 'localtime'))
  )
`);

export default db;
