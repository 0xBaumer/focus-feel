// This is the server. It sends the web page to the browser and saves the
// sessions in the database. It is written with Bun's built in web server.
import db from "./db.js";

// Read the web page once when the server starts.
var page = Bun.file("index.html");

Bun.serve({
  // Railway gives the port to use. Locally we use 3000.
  port: process.env.PORT || 3000,

  async fetch(req) {
    var url = new URL(req.url);

    // The home page: send the HTML file.
    if (url.pathname == "/") {
      return new Response(page);
    }

    // Give back all the saved sessions as JSON (newest first).
    if (url.pathname == "/api/sessions" && req.method == "GET") {
      var rows = db.query("SELECT * FROM sessions ORDER BY id DESC").all();
      return Response.json(rows);
    }

    // Save a new session that the page sends to us.
    if (url.pathname == "/api/sessions" && req.method == "POST") {
      var data = await req.json();
      // make today's date as text, without dashes, for example 15/6/2026
      var now = new Date();
      var day = now.getDate() + "/" + (now.getMonth() + 1) + "/" + now.getFullYear();
      db.query("INSERT INTO sessions (task, seconds, mood, note, day) VALUES (?, ?, ?, ?, ?)")
        .run(data.task, data.seconds, data.mood, data.note, day);
      return Response.json({ ok: true });
    }

    // Anything else.
    return new Response("Not found", { status: 404 });
  }
});

console.log("Server is running");
