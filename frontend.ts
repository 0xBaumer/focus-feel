import { Chart, registerables } from "chart.js";

// Register all Chart.js components (scales, elements, plugins, controllers).
// Without this, Chart.js won't know how to draw anything.
Chart.register(...registerables);

// ─── State ────────────────────────────────────────────────────────────────────

let isRunning = false;        // Is the timer currently counting?
let startTime = 0;            // Timestamp (ms) when the timer was last started.
let elapsedSeconds = 0;       // Total seconds recorded for the current session.
let timerId: ReturnType<typeof setInterval> | null = null;  // setInterval handle.
let selectedMood: string | null = null;  // Mood chosen after stopping ("good" | "okay" | "bad").

// ─── DOM references ───────────────────────────────────────────────────────────

const taskInput    = document.getElementById("task")        as HTMLInputElement;
const timerDisplay = document.getElementById("timer")       as HTMLElement;
const startStopBtn = document.getElementById("startStop")   as HTMLButtonElement;
const moodSection  = document.getElementById("moodSection") as HTMLElement;
const noteInput    = document.getElementById("note")        as HTMLTextAreaElement;
const saveBtn      = document.getElementById("saveBtn")     as HTMLButtonElement;
const errorMsg     = document.getElementById("errorMsg")    as HTMLElement;
const successMsg   = document.getElementById("successMsg")  as HTMLElement;
const moodBtns     = document.querySelectorAll<HTMLButtonElement>(".mood-btn");

// ─── Timer ────────────────────────────────────────────────────────────────────

// Converts a raw number of seconds into the HH:MM:SS string shown on screen.
function formatTime(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  // padStart(2, "0") ensures single digits are shown as "01", "02", etc.
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

// Called every second by setInterval to update the on-screen timer.
function tick() {
  elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
  timerDisplay.textContent = formatTime(elapsedSeconds);
}

function startTimer() {
  if (!taskInput.value.trim()) {
    showError("Please enter a task name before starting.");
    return;
  }

  isRunning = true;
  // Subtract already-elapsed seconds so the timer resumes correctly if restarted.
  startTime = Date.now() - elapsedSeconds * 1000;
  timerId = setInterval(tick, 1000);

  startStopBtn.textContent = "Stop";
  startStopBtn.classList.add("stop");
  taskInput.disabled = true;  // Lock the task name while the timer runs.
  clearMessages();
}

function stopTimer() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  isRunning = false;
  startStopBtn.textContent = "Start";
  startStopBtn.classList.remove("stop");

  // Only show the mood form if the user actually recorded some time.
  if (elapsedSeconds > 0) {
    moodSection.style.display = "block";
    moodSection.scrollIntoView({ behavior: "smooth" });
  }
}

startStopBtn.addEventListener("click", () => {
  if (isRunning) stopTimer();
  else startTimer();
});

// ─── Mood selection ───────────────────────────────────────────────────────────

moodBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Deselect all buttons, then highlight the one that was clicked.
    moodBtns.forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    selectedMood = btn.dataset.mood ?? null;
  });
});

// ─── Save session ─────────────────────────────────────────────────────────────

saveBtn.addEventListener("click", async () => {
  if (!selectedMood) {
    showError("Please select a mood before saving.");
    return;
  }

  const payload = {
    task:     taskInput.value.trim(),
    duration: elapsedSeconds,
    mood:     selectedMood,
    note:     noteInput.value.trim(),
  };

  try {
    saveBtn.disabled = true;
    saveBtn.textContent = "Saving…";

    // Send the session to the server as JSON.
    const res = await fetch("/api/sessions", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    if (!res.ok) {
      // The server returned an error — read it and rethrow so the catch block handles it.
      const err = await res.json();
      throw new Error(err.error ?? "Unknown server error");
    }

    showSuccess("Session saved!");
    resetForm();
    loadStats();  // Refresh the dashboard with the new data.
  } catch (err) {
    showError(`Failed to save: ${(err as Error).message}`);
  } finally {
    // Always re-enable the button, whether save succeeded or failed.
    saveBtn.disabled = false;
    saveBtn.textContent = "Save Session";
  }
});

// Resets the UI back to its initial state after a session is saved.
function resetForm() {
  taskInput.value    = "";
  taskInput.disabled = false;
  elapsedSeconds     = 0;
  timerDisplay.textContent = "00:00:00";
  moodSection.style.display = "none";
  noteInput.value    = "";
  selectedMood       = null;
  moodBtns.forEach((b) => b.classList.remove("selected"));
}

// ─── Feedback messages ────────────────────────────────────────────────────────

function showError(msg: string) {
  errorMsg.textContent   = msg;
  errorMsg.style.display = "block";
  successMsg.style.display = "none";
}

function showSuccess(msg: string) {
  successMsg.textContent   = msg;
  successMsg.style.display = "block";
  errorMsg.style.display   = "none";
  setTimeout(() => (successMsg.style.display = "none"), 3000);
}

function clearMessages() {
  errorMsg.style.display   = "none";
  successMsg.style.display = "none";
}

// ─── Dashboard & Charts ───────────────────────────────────────────────────────

// Keep references to charts so we can destroy them before re-drawing.
// Without this, Chart.js would stack multiple canvases on top of each other.
let focusChart: Chart | null = null;
let moodChart:  Chart | null = null;

async function loadStats() {
  try {
    const res = await fetch("/api/stats");
    if (!res.ok) throw new Error("Server returned an error");

    const { weekly, totals } = await res.json();

    // Update the three summary cards.
    const totalHours = (totals.total_duration / 3600).toFixed(1);
    const longestMin = Math.floor(totals.longest_session / 60);
    document.getElementById("totalHours")!.textContent    = `${totalHours}h`;
    document.getElementById("totalSessions")!.textContent = String(totals.total_sessions);
    document.getElementById("longestSession")!.textContent = `${longestMin}m`;

    // Prepare the labels and datasets for the two charts.
    const labels    = weekly.map((d: any) => d.date);
    const durations = weekly.map((d: any) =>
      parseFloat((d.total_duration / 3600).toFixed(2))
    );
    const moods = weekly.map((d: any) => d.avg_mood);

    const noData = weekly.length === 0;

    (document.getElementById("focusChart") as HTMLCanvasElement).style.display = noData ? "none" : "block";
    document.getElementById("focusEmpty")!.style.display = noData ? "block" : "none";
    (document.getElementById("moodChart") as HTMLCanvasElement).style.display = noData ? "none" : "block";
    document.getElementById("moodEmpty")!.style.display = noData ? "block" : "none";

    if (!noData) {
      drawFocusChart(labels, durations);
      drawMoodChart(labels, moods);
    }
  } catch (err) {
    // Stats failing shouldn't block the user — just log it.
    console.error("Could not load stats:", err);
  }
}

// Bar chart: how many hours of focus work per day over the last 7 days.
function drawFocusChart(labels: string[], data: number[]) {
  const canvas = document.getElementById("focusChart") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;

  if (focusChart) focusChart.destroy();

  focusChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [{
        label: "Focus hours",
        data,
        backgroundColor: "rgba(99, 102, 241, 0.75)",
        borderRadius: 6,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: "Hours" } },
      },
    },
  });
}

// Line chart: average mood score per day (1 = bad, 2 = okay, 3 = good).
function drawMoodChart(labels: string[], data: number[]) {
  const canvas = document.getElementById("moodChart") as HTMLCanvasElement;
  const ctx = canvas.getContext("2d")!;

  if (moodChart) moodChart.destroy();

  moodChart = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [{
        label: "Avg mood",
        data,
        borderColor:     "rgba(16, 185, 129, 0.9)",
        backgroundColor: "rgba(16, 185, 129, 0.1)",
        tension: 0.4,
        fill: true,
        pointRadius: 5,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        y: {
          min: 0,
          max: 3,
          ticks: {
            // Replace numeric tick values with emoji mood labels.
            callback: (val) =>
              val === 3 ? "😊 Good" : val === 2 ? "😐 Okay" : val === 1 ? "😔 Bad" : "",
          },
        },
      },
    },
  });
}

// Load stats as soon as the page is ready.
loadStats();
