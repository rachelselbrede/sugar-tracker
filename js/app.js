// Treat Yourself: wires the page together. Rules live in logic.js; Honey lives in honey.js.
import { recommendedLimit, scaleState } from "./logic.js";
import { honeySVG } from "./honey.js";
import { TREATS, CATEGORIES, CHECKED } from "./treats.js";

const $ = (id) => document.getElementById(id);

const state = {
  profile: { sex: null, prediabetic: null },
  goal: null, // { mode: "recommended" | "custom", grams }
  log: [], // [{ id, treatId, name, emoji, grams, at }]
  category: CATEGORIES[0],
};

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
  state.profile = profile;
  state.goal = { mode: "recommended", grams: limit.grams };
  showTracker();
});

// ---------- treat picker ----------

function renderTabs() {
  $("category-tabs").innerHTML = CATEGORIES.map(
    (cat) =>
      `<button type="button" class="tab" role="tab" data-category-tab="${escapeHTML(cat)}" aria-selected="${cat === state.category}">${escapeHTML(cat)}</button>`,
  ).join("");
}

function renderTreats() {
  const treats = TREATS.filter((t) => t.category === state.category);
  $("treat-grid").innerHTML = treats
    .map(
      (t) => `
      <div class="treat-card" data-category="${escapeHTML(t.category)}">
        <button type="button" class="treat-add" data-treat="${t.id}" aria-label="Add ${escapeHTML(t.name)}, ${t.addedSugarG} grams of added sugar">
          <span class="treat-emoji" aria-hidden="true">${t.emoji}</span>
          <span class="treat-name">${escapeHTML(t.name)}</span>
          <span class="treat-serving">${escapeHTML(t.serving)}</span>
          <span class="treat-sugar">${t.addedSugarG} g added sugar</span>
        </button>
        <button type="button" class="treat-info" data-info="${t.id}" aria-label="Where the number for ${escapeHTML(t.name)} comes from" title="Where this number comes from">ⓘ</button>
      </div>`,
    )
    .join("");
}

$("category-tabs").addEventListener("click", (event) => {
  const tab = event.target.closest("[data-category-tab]");
  if (!tab) return;
  state.category = tab.dataset.categoryTab;
  renderTabs();
  renderTreats();
});

$("treat-grid").addEventListener("click", (event) => {
  const info = event.target.closest("[data-info]");
  if (info) {
    const treat = TREATS.find((t) => t.id === info.dataset.info);
    if (treat) openSource(treat);
    return; // ⓘ never logs the treat
  }
  const button = event.target.closest("[data-treat]");
  if (!button) return;
  const treat = TREATS.find((t) => t.id === button.dataset.treat);
  if (!treat) return;
  logTreat(treat);
  button.classList.remove("just-added");
  void button.offsetWidth;
  button.classList.add("just-added");
});

// ---------- source popup ----------

const sourceDialog = $("source-dialog");

function basisText(treat) {
  if (treat.basis === "no-natural-sugar") {
    return "All the sugar in this one is added. Only total sugar is published, but there's no milk, fruit, or juice in it, so total sugar and added sugar are the same.";
  }
  return "Read straight from the \"Includes Added Sugars\" line on the Nutrition Facts panel.";
}

function openSource(treat) {
  $("source-title").textContent = treat.name;
  $("source-serving").textContent = `Serving: ${treat.serving}`;
  $("source-grams").textContent = `${treat.addedSugarG} g added sugar`;
  $("source-basis").textContent = basisText(treat);
  const link = $("source-url");
  link.href = treat.source.url;
  link.textContent = treat.source.name;
  $("source-checked").textContent = `Checked against the source on ${CHECKED}.`;
  sourceDialog.showModal();
}

$("source-close").addEventListener("click", () => sourceDialog.close());

// Esc is handled by <dialog> itself. A click on the backdrop lands on the dialog element, not its card.
sourceDialog.addEventListener("click", (event) => {
  if (event.target === sourceDialog) sourceDialog.close();
});

// ---------- today's log ----------

function logTreat(treat) {
  state.log.push({
    id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    treatId: treat.id,
    name: treat.name,
    emoji: treat.emoji,
    grams: treat.addedSugarG,
    at: new Date().toISOString(),
  });
  renderLog();
  renderScale({ wave: true });
}

function removeEntry(id) {
  state.log = state.log.filter((entry) => entry.id !== id);
  renderLog();
  renderScale();
}

function todayTotal() {
  return state.log.reduce((sum, entry) => sum + entry.grams, 0);
}

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).toLowerCase();
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

function showProfile() {
  $("tracker-view").hidden = true;
  $("profile-view").hidden = false;
  $("profile-honey").innerHTML = honeySVG("happy", { label: "Honey the bear waving hello from her candy jar" });
  onProfileChange();
}

function showTracker() {
  $("profile-view").hidden = true;
  $("tracker-view").hidden = false;
  $("brand-honey").innerHTML = honeySVG("happy", { jar: false });
  $("today-label").textContent = new Date().toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
  renderTabs();
  renderTreats();
  renderLog();
  renderScale();
  window.scrollTo(0, 0);
}

showProfile();
