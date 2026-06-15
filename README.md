# Focus &amp; Feel

A small study timer web app. You start a timer for a task, stop it when you are
done, pick how the session felt (Good, Okay or Bad), and add an optional note.
Each session is sent to a server and saved in a database, and a dashboard shows
your totals, a simple bar chart and a list of all sessions.

Made for the Advanced Programming Languages course at HSG (MacFin).
Language: JavaScript. The app is deployed online on Railway.

## How it works

1. Open the app. The page asks the server for the saved sessions and shows them.
2. Type what you are working on and click Start. The timer counts up.
3. Click Stop, pick a mood, optionally add a note, and click Save session.
4. The page sends the session to the server, which saves it in the database, and
   the dashboard updates.

## What it is built with

* HTML and CSS for the page
* JavaScript for the timer, the buttons and the dashboard (inside index.html)
* A small server written with Bun (server.js)
* A SQLite database (db.js) that stores the sessions
* Hosted on Railway, with the database kept on a storage volume

## How to run it

Online: open the public Railway link for the project.

On your own computer:
1. Install Bun (the JavaScript tool, from bun.sh).
2. In the project folder, run: bun server.js
3. Open the address it shows (localhost:3000) in a web browser.

## Files

* index.html : the web page and the browser JavaScript
* server.js : the server (sends the page, saves and reads sessions)
* db.js : opens the SQLite database and makes the table
* package.json : how to start the server
* Dockerfile : tells Railway to run the project with Bun
* Focus_Feel_Documentation.docx : full project documentation
