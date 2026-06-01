# Session Context — Focus & Feel

## Project

**Name:** focus-feel  
**Location:** `/Users/balintnussbaumer/dev/HSG/focus-feel`  
**Stack:** Bun + TypeScript + SQLite + Chart.js, no frameworks  
**Dev server:** `bun --hot index.ts` → http://localhost:3000

### Files

| File | Role |
|------|------|
| `index.ts` | Bun server — routes: `GET/POST /api/sessions`, `GET /api/stats` |
| `db.ts` | Opens `focus.db` (SQLite), creates `sessions` table |
| `frontend.ts` | Timer logic, mood selection, save session, Chart.js dashboard |
| `index.html` | Single-page UI — bundled automatically by Bun |

### DB Schema

```sql
CREATE TABLE sessions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  task       TEXT    NOT NULL,
  duration   INTEGER NOT NULL,           -- seconds
  mood       TEXT    NOT NULL CHECK(mood IN ('good', 'okay', 'bad')),
  note       TEXT    DEFAULT '',
  created_at TEXT    DEFAULT (datetime('now', 'localtime'))
);
```

### What the app does

Focus timer web app. User enters a task name, starts a timer, stops it, picks a mood (good/okay/bad), adds an optional note, saves. Dashboard shows 3 summary stats + 2 Chart.js charts (focus hours bar chart + mood line chart, both last 7 days).

---

## Course Context

**Course:** Advanced Programming Languages — HSG / MacFin  
**Platform:** learning.unisg.ch/courses/26040  
**Course materials:** `/Users/balintnussbaumer/Desktop/Studies/MacFin/programming_advanced_languages`

The course uses CodingXCamp.com and covers group/individual projects across Python, Java, JavaScript, R. Focus is on practical, simple, working projects with documentation. This focus-feel app is (likely) the student's project submission.

### Course material highlights

- **Python projects:** BMI analysis, US regional stats, NYT bestsellers, IMDB DB, Wikipedia revisions, weather data, ML/MNIST, WHO data
- **Java:** Android apps (calculator, coffee ordering)
- **JavaScript:** Build-your-own cryptocurrency / blockchain
- **Guidelines:** Groups of 3–6 (or solo with approval), submit by last day of semester via CodingXCamp, must have working functionality + documentation

---

## MCP Setup (for reference)

Playwright MCP is connected (`npx @playwright/mcp@latest`) but **tools only appear in new sessions** — if tools aren't loading, start a fresh Claude Code session.

Active MCP servers:
- `playwright` ✓ Connected
- `blender` ✓ Connected
- `canva-dev` ✓ Connected
- `google-calendar` ✓ Connected
- `gmail` ✓ Connected
- `github` ✗ Failed
- `figma` needs auth
- `google-drive` needs auth
