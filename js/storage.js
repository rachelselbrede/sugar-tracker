// Safe localStorage for Treat Yourself. Every read and write is wrapped, so a blocked
// store (some private windows) or corrupt data never crashes the app: reads fall back
// to "nothing saved" and the app carries on in memory for that visit.
// Keys and shapes: see devpost/spec.md > Data Model.

export const KEYS = { profile: "ty.profile", goal: "ty.goal", log: "ty.log" };

const SEXES = ["female", "male", "unspecified"];
const PREDIABETIC = ["yes", "no", "unsure"];
const GOAL_MODES = ["recommended", "custom"];

// True when localStorage can actually be written to right now.
export function storageAvailable() {
  try {
    const probe = "ty.__probe__";
    localStorage.setItem(probe, "1");
    localStorage.removeItem(probe);
    return true;
  } catch {
    return false;
  }
}

function read(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? null : JSON.parse(raw);
  } catch {
    return null; // blocked, or not valid JSON
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

// ---------- profile ----------

export function loadProfile() {
  const p = read(KEYS.profile);
  if (!isObject(p) || !SEXES.includes(p.sex) || !PREDIABETIC.includes(p.prediabetic)) return null;
  return { sex: p.sex, prediabetic: p.prediabetic };
}

export function saveProfile(profile) {
  return write(KEYS.profile, { sex: profile.sex, prediabetic: profile.prediabetic });
}

// ---------- goal ----------

export function loadGoal() {
  const g = read(KEYS.goal);
  if (!isObject(g) || !GOAL_MODES.includes(g.mode) || !Number.isFinite(g.grams) || g.grams < 1) return null;
  return { mode: g.mode, grams: g.grams };
}

export function saveGoal(goal) {
  return write(KEYS.goal, { mode: goal.mode, grams: goal.grams });
}

// ---------- today's log ----------

export function loadLog() {
  const l = read(KEYS.log);
  if (!isObject(l) || typeof l.day !== "string" || !Array.isArray(l.items)) return null;
  const items = l.items
    .filter((e) => isObject(e) && typeof e.id === "string" && typeof e.name === "string" && Number.isFinite(e.grams))
    .map((e) => ({
      id: e.id,
      treatId: typeof e.treatId === "string" ? e.treatId : "",
      name: e.name,
      emoji: typeof e.emoji === "string" ? e.emoji : "🍬",
      grams: e.grams,
      at: typeof e.at === "string" ? e.at : "",
    }));
  return { day: l.day, items };
}

export function saveLog(log) {
  return write(KEYS.log, { day: log.day, items: log.items });
}
