import db from "./db";
import index from "./index.html";

// Helper: builds a JSON Response so we don't repeat headers everywhere.
function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

Bun.serve({
  // Railway injects PORT automatically; fall back to 3000 for local dev.
  port: Number(process.env.PORT) || 3000,

  routes: {
    // Serve the HTML page. Bun automatically bundles frontend.ts.
    "/": index,

    "/api/sessions": {
      // GET /api/sessions — return every session, newest first.
      GET: () => {
        try {
          const sessions = db
            .query("SELECT * FROM sessions ORDER BY created_at DESC")
            .all();
          return json(sessions);
        } catch (err) {
          // Log the full error on the server but only send a safe message to the client.
          console.error("GET /api/sessions failed:", err);
          return json({ error: "Could not fetch sessions" }, 500);
        }
      },

      // POST /api/sessions — save a new focus session sent from the frontend.
      POST: async (req) => {
        try {
          const body = await req.json();
          const { task, duration, mood, note } = body;

          // Validate that all required fields are present.
          if (!task || !duration || !mood) {
            return json(
              { error: "Missing required fields: task, duration, mood" },
              400
            );
          }

          // Mood must be one of the three allowed values.
          if (!["good", "okay", "bad"].includes(mood)) {
            return json(
              { error: "Mood must be 'good', 'okay', or 'bad'" },
              400
            );
          }

          // Duration must be a positive number (in seconds).
          if (typeof duration !== "number" || duration <= 0) {
            return json({ error: "Duration must be a positive number" }, 400);
          }

          // Use a prepared statement to safely insert the data.
          // Prepared statements prevent SQL injection attacks by keeping
          // the query structure separate from the user-supplied values.
          const stmt = db.prepare(
            "INSERT INTO sessions (task, duration, mood, note) VALUES (?, ?, ?, ?)"
          );
          stmt.run(task, duration, mood, note ?? "");

          return json({ success: true }, 201);
        } catch (err) {
          console.error("POST /api/sessions failed:", err);
          return json({ error: "Could not save session" }, 500);
        }
      },
    },

    // GET /api/stats — aggregated data used by the dashboard charts.
    "/api/stats": {
      GET: () => {
        try {
          // Daily totals for the last 7 days.
          // Mood is converted to a number so we can average it:
          // good = 3, okay = 2, bad = 1.
          const weekly = db
            .query(
              `SELECT
                DATE(created_at)  AS date,
                SUM(duration)     AS total_duration,
                COUNT(*)          AS session_count,
                ROUND(AVG(
                  CASE mood
                    WHEN 'good' THEN 3
                    WHEN 'okay' THEN 2
                    WHEN 'bad'  THEN 1
                  END
                ), 2) AS avg_mood
               FROM sessions
               WHERE created_at >= datetime('now', '-6 days', 'localtime')
               GROUP BY DATE(created_at)
               ORDER BY date ASC`
            )
            .all();

          // All-time totals shown in the three summary cards.
          const totals = db
            .query(
              `SELECT
                COALESCE(SUM(duration), 0)  AS total_duration,
                COUNT(*)                    AS total_sessions,
                COALESCE(MAX(duration), 0)  AS longest_session
               FROM sessions`
            )
            .get();

          return json({ weekly, totals });
        } catch (err) {
          console.error("GET /api/stats failed:", err);
          return json({ error: "Could not fetch stats" }, 500);
        }
      },
    },
  },
});

console.log(`Server running on port ${process.env.PORT || 3000}`);
