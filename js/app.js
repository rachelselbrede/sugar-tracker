// Treat Yourself: wires the page together. Rules live in logic.js; Honey lives in honey.js.
import { recommendedLimit, scaleState, todayKey, isValidGoal, customTreatErrors } from "./logic.js";
import { storageAvailable, loadProfile, saveProfile, loadGoal, saveGoal, loadLog, saveLog, loadCustom, saveCustom } from "./storage.js";
import { honeySVG } from "./honey.js";
import { TREATS, CATEGORIES, CHECKED } from "./treats.js";

const $ = (id) => document.getElementById(id);

const state = {
  profile: { sex: null, prediabetic: null },
  goal: null, // { mode: "recommended" | "custom", grams }
  log: [], // [{ id, treatId, name, emoji, grams, at }]
  day: todayKey(), // which day the log belongs to
  category: CATEGORIES[0],
  custom: [], // treats the person added themselves, shown under "My treats"
  editing: false, // true while the Profile screen is open from "Edit profile"
};

const MY_TREATS = "My treats";
const ALL_TABS = [...CATEGORIES, MY_TREATS];

function findTreat(id) {
  return TREATS.find((t) => t.id === id) || state.custom.find((t) => t.id === id);
}

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

const canSave = storageAvailable();

function persistLog() {
  if (canSave) saveLog({ day: state.day, items: state.log });
}

function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

// ---------- profile screen ----------

const form = $("profile-form");

function readProfileForm() {
  const data = new FormData(form);
  return { sex: data.get("sex"), prediabetic: data.get("prediabetic") };
}

function renderLimitResult(limit) {
  const box = $("limit-result");
  if (!limit) {
    box.classList.remove("is-set");
    box.innerHTML = `<p class="limit-waiting">Answer both and your limit shows up here. ✨</p>`;
    return;
  }
  const sources = limit.sources
    .map((s) => `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${escapeHTML(s.name)}</a></li>`)
    .join("");
  box.innerHTML = `
    <div>
      <p class="limit-label">Your daily added-sugar limit</p>
      <p class="limit-number" data-testid="limit-grams">${limit.grams}<small> g a day</small></p>
      ${limit.general ? `<span class="badge">General guidance · ask your clinician</span>` : ""}
      <p class="limit-reason">${escapeHTML(limit.reason)}</p>
      <ul class="limit-sources">${sources}</ul>
    </div>`;
  // restart the little pop so each change is noticeable
  box.classList.remove("is-set");
  void box.offsetWidth;
  box.classList.add("is-set");
}

function onProfileChange() {
  const limit = recommendedLimit(readProfileForm());
  renderLimitResult(limit);
  $("start-btn").disabled = !limit;
}

form.addEventListener("change", onProfileChange);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const profile = readProfileForm();
  const limit = recommendedLimit(profile);
  if (!limit) return;
  const wasEditing = state.editing;
  state.profile = profile;
  state.goal = { mode: "recommended", grams: limit.grams }; // a profile change always resets the goal
  if (canSave) {
    saveProfile(state.profile);
    saveGoal(state.goal);
  }
  showTracker();
  if (wasEditing) {
    toggleGoalPanel(true);
    showGoalNote(`Profile saved. Your goal is back to your recommended limit: ${limit.grams} g a day.`);
  }
});

$("cancel-edit").addEventListener("click", () => showTracker());

// ---------- daily goal panel ----------

const goalPanel = $("goal-panel");
const goalBtn = $("goal-btn");

function renderGoalPanel() {
  const basis = state.goal.mode === "custom" ? "custom goal" : "recommended from your profile";
  $("goal-current").textContent = `${state.goal.grams} g · ${basis}`;
  $("use-recommended").disabled = state.goal.mode === "recommended";
  for (const chip of goalPanel.querySelectorAll("[data-preset]")) {
    const pressed = state.goal.mode === "custom" && Number(chip.dataset.preset) === state.goal.grams;
    chip.setAttribute("aria-pressed", String(pressed));
  }
}

function showGoalNote(text) {
  const note = $("goal-note");
  note.textContent = text || "";
  note.hidden = !text;
}

function setGoal(goal, note) {
  state.goal = goal;
  if (canSave) saveGoal(goal);
  $("goal-input").value = "";
  $("goal-error").hidden = true;
  showGoalNote(note);
  renderGoalPanel();
  renderScale();
}

function toggleGoalPanel(open = goalPanel.hidden) {
  goalPanel.hidden = !open;
  goalBtn.setAttribute("aria-expanded", String(open));
  if (open) {
    renderGoalPanel();
  } else {
    showGoalNote("");
    $("goal-error").hidden = true;
  }
}

goalBtn.addEventListener("click", () => toggleGoalPanel());

$("goal-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const raw = $("goal-input").value;
  if (!isValidGoal(raw)) {
    $("goal-error").hidden = false;
    $("goal-input").focus();
    return;
  }
  setGoal({ mode: "custom", grams: Number(raw) }, `Goal set to ${Number(raw)} g a day.`);
});

$("goal-input").addEventListener("input", () => {
  $("goal-error").hidden = true;
});

goalPanel.addEventListener("click", (event) => {
  const chip = event.target.closest("[data-preset]");
  if (!chip) return;
  const grams = Number(chip.dataset.preset);
  setGoal({ mode: "custom", grams }, `Goal set to ${grams} g a day.`);
});

$("use-recommended").addEventListener("click", () => {
  const limit = recommendedLimit(state.profile);
  if (!limit) return;
  setGoal({ mode: "recommended", grams: limit.grams }, `Back to your recommended limit: ${limit.grams} g a day.`);
});

$("edit-profile").addEventListener("click", () => showProfile({ editing: true }));

// ---------- treat picker ----------

function renderTabs() {
  $("category-tabs").innerHTML = ALL_TABS.map(
    (cat) =>
      `<button type="button" class="tab" role="tab" data-category-tab="${escapeHTML(cat)}" aria-selected="${cat === state.category}">${escapeHTML(cat)}</button>`,
  ).join("");
}

function treatCard(t) {
  const custom = t.basis === "custom";
  return `
      <div class="treat-card${custom ? " is-custom" : ""}" data-category="${escapeHTML(t.category)}">
        <button type="button" class="treat-add" data-treat="${t.id}" aria-label="Add ${escapeHTML(t.name)}, ${t.addedSugarG} grams of added sugar">
          <span class="treat-emoji" aria-hidden="true">${t.emoji}</span>
          <span class="treat-name">${escapeHTML(t.name)}</span>
          <span class="treat-serving">${escapeHTML(t.serving)}</span>
          <span class="treat-sugar">${t.addedSugarG} g added sugar</span>
        </button>
        <button type="button" class="treat-info" data-info="${t.id}" aria-label="Where the number for ${escapeHTML(t.name)} comes from" title="Where this number comes from">ⓘ</button>
      </div>`;
}

function renderTreats() {
  if (state.category === MY_TREATS) {
    const addCard = `
      <button type="button" class="add-card" data-add-treat>
        <span class="add-plus" aria-hidden="true">＋</span>
        <span>Add a treat<small>${state.custom.length ? "from your own label" : "Nothing here yet. Add one from a label."}</small></span>
      </button>`;
    $("treat-grid").innerHTML = addCard + [...state.custom].reverse().map(treatCard).join("");
    return;
  }
  const treats = TREATS.filter((t) => t.category === state.category);
  $("treat-grid").innerHTML = treats.map(treatCard).join("");
}

$("category-tabs").addEventListener("click", (event) => {
  const tab = event.target.closest("[data-category-tab]");
  if (!tab) return;
  state.category = tab.dataset.categoryTab;
  renderTabs();
  renderTreats();
});

$("treat-grid").addEventListener("click", (event) => {
  if (event.target.closest("[data-add-treat]")) {
    openCustomForm();
    return;
  }
  const info = event.target.closest("[data-info]");
  if (info) {
    const treat = findTreat(info.dataset.info);
    if (treat) openSource(treat);
    return; // ⓘ never logs the treat
  }
  const button = event.target.closest("[data-treat]");
  if (!button) return;
  const treat = findTreat(button.dataset.treat);
  if (!treat) return;
  logTreat(treat);
  button.classList.remove("just-added");
  void button.offsetWidth;
  button.classList.add("just-added");
});

// ---------- source popup ----------

const sourceDialog = $("source-dialog");

function basisText(treat) {
  if (treat.basis === "custom") {
    return "You added this one yourself, from the label on your own package. Treat Yourself hasn't checked it, so it's only as right as the label you read.";
  }
  if (treat.basis === "no-natural-sugar") {
    return "All the sugar in this one is added. Only total sugar is published, but there's no milk, fruit, or juice in it, so total sugar and added sugar are the same.";
  }
  return "Read straight from the \"Includes Added Sugars\" line on the Nutrition Facts panel.";
}

function openSource(treat) {
  const custom = treat.basis === "custom";
  $("source-title").textContent = treat.name;
  $("source-serving").textContent = treat.serving ? `Serving: ${treat.serving}` : "Serving: as you had it";
  $("source-grams").textContent = `${treat.addedSugarG} g added sugar`;
  $("source-basis").textContent = basisText(treat);
  const link = $("source-url");
  link.parentElement.hidden = custom;
  if (!custom) {
    link.href = treat.source.url;
    link.textContent = treat.source.name;
  }
  $("source-checked").textContent = custom
    ? `Added by you${treat.createdAt ? ` on ${treat.createdAt.slice(0, 10)}` : ""}.`
    : `Checked against the source on ${CHECKED}.`;
  const remove = $("source-remove");
  remove.hidden = !custom;
  remove.dataset.removeCustom = custom ? treat.id : "";
  sourceDialog.showModal();
}

$("source-close").addEventListener("click", () => sourceDialog.close());

$("source-remove").addEventListener("click", () => {
  const id = $("source-remove").dataset.removeCustom;
  state.custom = state.custom.filter((t) => t.id !== id);
  if (canSave) saveCustom(state.custom);
  sourceDialog.close();
  renderTreats();
});

// ---------- add your own treat ----------

const customDialog = $("custom-dialog");
const customForm = $("custom-form");

function openCustomForm() {
  customForm.reset();
  $("custom-error").hidden = true;
  customDialog.showModal();
  $("custom-name").focus();
}

$("add-treat-btn").addEventListener("click", openCustomForm);
$("custom-close").addEventListener("click", () => customDialog.close());
$("custom-cancel").addEventListener("click", () => customDialog.close());
customDialog.addEventListener("click", (event) => {
  if (event.target === customDialog) customDialog.close();
});

customForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const data = new FormData(customForm);
  const draft = { name: data.get("name"), serving: data.get("serving"), addedSugarG: data.get("addedSugarG") };
  const errors = customTreatErrors(draft);
  if (errors.length) {
    const box = $("custom-error");
    box.textContent = errors.join(" ");
    box.hidden = false;
    return;
  }
  const treat = {
    id: `custom-${newId()}`,
    name: String(draft.name).trim(),
    emoji: "🍭",
    serving: String(draft.serving || "").trim(),
    addedSugarG: Number(draft.addedSugarG),
    basis: "custom",
    category: MY_TREATS,
    createdAt: new Date().toISOString(),
  };
  state.custom.push(treat);
  if (canSave) saveCustom(state.custom);
  customDialog.close();
  state.category = MY_TREATS;
  renderTabs();
  renderTreats();
});

// Esc is handled by <dialog> itself. A click on the backdrop lands on the dialog element, not its card.
sourceDialog.addEventListener("click", (event) => {
  if (event.target === sourceDialog) sourceDialog.close();
});

// ---------- today's log ----------

function logTreat(treat) {
  checkDay(); // re-check the date at write time, so a tap just after midnight starts today's log
  state.log.push({
    id: newId(),
    treatId: treat.id,
    name: treat.name,
    emoji: treat.emoji,
    grams: treat.addedSugarG,
    at: new Date().toISOString(),
  });
  persistLog();
  renderLog();
  renderScale({ wave: true });
}

function removeEntry(id) {
  checkDay();
  state.log = state.log.filter((entry) => entry.id !== id);
  persistLog();
  renderLog();
  renderScale();
}

function todayTotal() {
  return state.log.reduce((sum, entry) => sum + entry.grams, 0);
}

function formatTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toLowerCase();
}

function renderLog() {
  const list = $("log-list");
  const entries = [...state.log].reverse(); // newest first
  list.innerHTML = entries
    .map(
      (e) => `
      <li class="log-item">
        <span class="log-emoji" aria-hidden="true">${e.emoji}</span>
        <span class="log-name">${escapeHTML(e.name)}<span class="log-time">${formatTime(e.at)}</span></span>
        <span class="log-grams">${e.grams} g</span>
        <button type="button" class="remove-btn" data-remove="${e.id}" aria-label="Remove ${escapeHTML(e.name)}">✕</button>
      </li>`,
    )
    .join("");
  $("log-empty").hidden = entries.length > 0;
  $("log-total").textContent = `${todayTotal()} g`;
}

$("log-list").addEventListener("click", (event) => {
  const button = event.target.closest("[data-remove]");
  if (button) removeEntry(button.dataset.remove);
});

// ---------- sugar scale + Honey ----------

function honeyMessage(scale) {
  if (scale.level === "empty") return "Hi! Tap a treat and I'll keep count.";
  if (scale.level === "low") return "Sweet! Plenty of room left today.";
  if (scale.level === "mid") return "Getting close. Just something to notice.";
  if (scale.atLimit) return "Right at your limit. Nicely noticed!";
  return `Oh my! ${scale.over} g over today. That's okay, tomorrow's a fresh start. 🌸`;
}

let lastMood = null;

function renderScale({ wave = false } = {}) {
  const scale = scaleState(todayTotal(), state.goal.grams);

  const tube = $("scale-tube");
  tube.dataset.color = scale.color;
  tube.setAttribute("aria-valuemax", String(scale.limit));
  tube.setAttribute("aria-valuenow", String(scale.total));
  tube.setAttribute("aria-valuetext", `${scale.total} grams of ${scale.limit} gram daily limit`);
  $("scale-fill").style.height = `${scale.fillPct}%`;
  $("goal-line").style.bottom = `${scale.goalPct}%`;
  $("goal-line-label").textContent = `${scale.limit} g goal`;

  $("scale-total").textContent = `${scale.total} g`;
  $("scale-limit").textContent = `${scale.limit} g`;
  let sub = `${scale.left} g left`;
  if (scale.atLimit) sub = "Right at your limit";
  else if (scale.over > 0) sub = `${scale.over} g over`;
  $("scale-left").textContent = sub;

  const honeyBox = $("scale-honey");
  if (scale.mood !== lastMood) {
    honeyBox.innerHTML = honeySVG(scale.mood, { label: true });
    $("log-empty-honey").innerHTML = honeySVG("peek");
    lastMood = scale.mood;
  }
  $("honey-says").textContent = honeyMessage(scale);

  if (wave) {
    honeyBox.classList.remove("is-waving");
    void honeyBox.offsetWidth;
    honeyBox.classList.add("is-waving");
  }
}

// ---------- views ----------

function showProfile({ editing = false } = {}) {
  state.editing = editing;
  $("tracker-view").hidden = true;
  $("profile-view").hidden = false;
  $("profile-honey").innerHTML = honeySVG("happy", { label: "Honey the bear waving hello from her candy jar" });
  $("profile-title").textContent = editing ? "Update your profile" : "Let's find your daily sugar limit";
  $("profile-lede").textContent = editing
    ? "Change an answer and your goal resets to the new recommended limit."
    : "Hi, I'm Honey! Two quick questions, and your answers stay on this device.";
  $("start-btn").textContent = editing ? "Save profile" : "Start tracking";
  $("cancel-edit").hidden = !editing;
  form.reset();
  if (editing) {
    for (const [name, value] of Object.entries(state.profile)) {
      const input = form.querySelector(`input[name="${name}"][value="${value}"]`);
      if (input) input.checked = true;
    }
  }
  onProfileChange();
  window.scrollTo(0, 0);
}

function showTracker() {
  state.editing = false;
  $("profile-view").hidden = true;
  $("tracker-view").hidden = false;
  $("brand-honey").innerHTML = honeySVG("happy", { jar: false });
  $("today-label").textContent = todayLabel();
  renderTabs();
  renderTreats();
  renderLog();
  renderScale();
  window.scrollTo(0, 0);
}

// ---------- floating hearts and sparkles ----------

// The page ships with a few hearts in the HTML; this adds many more, each with its own path,
// size, color, and speed. They sit behind the content and are hidden when reduced motion is on.
function seedSky(count = 64) {
  const sky = document.querySelector(".sky");
  if (!sky) return;
  const glyphs = ["♡", "♡", "♡", "✦", "✧", "⋆", "❀", "♡", "✦", "🍬"];
  const colors = ["var(--pink)", "var(--pink)", "var(--lilac)", "var(--mint)", "var(--butter)", "var(--pink-deep)"];
  const rand = (min, max) => min + Math.random() * (max - min);
  const fragment = document.createDocumentFragment();
  for (let i = 0; i < count; i += 1) {
    const span = document.createElement("span");
    span.textContent = glyphs[i % glyphs.length];
    span.style.setProperty("--x", `${rand(1, 99).toFixed(1)}%`);
    span.style.setProperty("--s", `${rand(0.8, 1.9).toFixed(2)}rem`);
    span.style.setProperty("--d", `${rand(18, 42).toFixed(1)}s`);
    span.style.setProperty("--delay", `-${rand(0, 42).toFixed(1)}s`);
    span.style.setProperty("--sx", `${rand(-28, 28).toFixed(0)}px`);
    span.style.setProperty("--c", colors[i % colors.length]);
    span.style.setProperty("--o", rand(0.5, 0.9).toFixed(2));
    fragment.appendChild(span);
  }
  sky.appendChild(fragment);
}

// ---------- start up, and start fresh each day ----------

// If the saved log is from another day, today starts empty. The profile and goal stay.
function checkDay() {
  const today = todayKey();
  if (today === state.day) return;
  state.day = today;
  state.log = [];
  persistLog();
  if (!$("tracker-view").hidden) {
    $("today-label").textContent = todayLabel();
    renderLog();
    renderScale();
  }
}

function todayLabel() {
  return new Date().toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

function init() {
  seedSky();
  $("storage-note").hidden = canSave;

  const savedLog = canSave ? loadLog() : null;
  if (savedLog && savedLog.day === state.day) {
    state.log = savedLog.items;
  } else if (savedLog) {
    persistLog(); // yesterday's log: clear it
  }

  state.custom = canSave ? loadCustom().map((t) => ({ ...t, category: MY_TREATS })) : [];

  const profile = canSave ? loadProfile() : null;
  const limit = profile ? recommendedLimit(profile) : null;
  if (profile && limit) {
    state.profile = profile;
    state.goal = loadGoal() ?? { mode: "recommended", grams: limit.grams };
    showTracker();
  } else {
    showProfile();
  }

  setInterval(checkDay, 60_000);
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") checkDay();
  });
}

init();
