/**
 * Date and duration helpers shared by the task board and the Pomodoro page.
 * Due dates are "YYYY-MM-DD" strings and are read in the user's local time zone.
 */
const DAY_MS = 24 * 60 * 60 * 1000;

/** Parses "YYYY-MM-DD" as a local date (new Date("YYYY-MM-DD") would use UTC). */
export function parseLocalDate(isoDate) {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/** Today's date as "YYYY-MM-DD" in local time. */
export function todayIso() {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Whole days from today to the given date: 0 = today, -1 = yesterday, 1 = tomorrow. */
export function daysFromToday(isoDate) {
  return Math.round((parseLocalDate(isoDate) - startOfDay(new Date())) / DAY_MS);
}

/**
 * Describes a due date for a task card.
 * Returns { label, state } where state is "overdue", "today", "soon" or "later".
 */
export function describeDueDate(isoDate) {
  const days = daysFromToday(isoDate);
  const short = parseLocalDate(isoDate).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  if (days < 0) return { label: `Overdue · ${short}`, state: "overdue" };
  if (days === 0) return { label: "Today", state: "today" };
  if (days === 1) return { label: "Tomorrow", state: "soon" };
  if (days < 7) {
    return { label: parseLocalDate(isoDate).toLocaleDateString(undefined, { weekday: "long" }), state: "soon" };
  }
  return { label: short, state: "later" };
}

/** Formats seconds as "1h 05m", "25m" or "<1m". */
export function formatDuration(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  if (minutes < 1) return "<1m";
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? `${hours}h ${String(rest).padStart(2, "0")}m` : `${rest}m`;
}
