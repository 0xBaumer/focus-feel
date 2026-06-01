# Focus & Feel

A minimal focus timer web app that tracks your work sessions and mood over time.

## What it does

1. Enter what you're working on
2. Start the timer — stop it when you're done
3. Pick your mood (Good / Okay / Bad) and add an optional note
4. Save — the dashboard updates instantly with your stats and charts

## Features

- Live stopwatch timer with HH:MM:SS display
- Mood tracking per session (good / okay / bad)
- Optional notes per session
- Dashboard with 3 summary stats (total focus hours, session count, longest session)
- Bar chart — focus hours over the last 7 days
- Line chart — average mood score over the last 7 days
- All data stored locally in SQLite — no cloud, no accounts

## Tech stack

| Layer | Technology |
|---|---|
| Runtime | [Bun](https://bun.sh) |
| Language | TypeScript |
| Server | `Bun.serve()` — built-in HTTP server |
| Database | SQLite via `bun:sqlite` |
| Charts | [Chart.js](https://www.chartjs.org/) |
| Frontend bundler | Bun's built-in HTML import bundler |

No Express, no Vite, no React — just Bun and vanilla TypeScript.

## Prerequisites

- [Bun](https://bun.sh) v1.0 or later

## Installation & running

```bash
# Clone the repo
git clone https://github.com/0xBaumer/focus-feel.git
cd focus-feel

# Install dependencies
bun install

# Start the dev server with hot reload
bun --hot index.ts
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project structure

```
focus-feel/
├── index.ts       # Bun HTTP server — API routes
├── db.ts          # SQLite database setup and schema
├── frontend.ts    # Timer logic, mood selection, Chart.js charts
├── index.html     # Single-page UI with all CSS inline
├── package.json   # Dependencies
└── bun.lock       # Bun lockfile
```

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/sessions` | Return all sessions (newest first) |
| POST | `/api/sessions` | Save a new session |
| GET | `/api/stats` | Return weekly aggregates + all-time totals |

## Database schema

```sql
CREATE TABLE sessions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  task       TEXT    NOT NULL,
  duration   INTEGER NOT NULL,      -- seconds
  mood       TEXT    NOT NULL CHECK(mood IN ('good', 'okay', 'bad')),
  note       TEXT    DEFAULT '',
  created_at TEXT    DEFAULT (datetime('now', 'localtime'))
);
```
