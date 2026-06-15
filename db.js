// This file sets up the database.
// We use Bun's built in SQLite, which keeps all the data in one file.
import { Database } from "bun:sqlite";

// Open the database file. On Railway we point DB_PATH at a folder that is kept
// (a Volume), so the data stays after a new deploy. Locally it is just focus.db.
var db = new Database(process.env.DB_PATH || "focus.db");

// Make the table the first time the program runs, if it is not there yet.
db.run(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    task TEXT,
    seconds INTEGER,
    mood TEXT,
    note TEXT,
    day TEXT
  )
`);

// If the database was made before we added the day column, add it now.
try {
  db.run("ALTER TABLE sessions ADD COLUMN day TEXT");
} catch (e) {
  // the column is already there, so there is nothing to do
}

export default db;
