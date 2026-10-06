// Treat Yourself: wires the page together. Rules live in logic.js; Honey lives in honey.js.
import { recommendedLimit } from "./logic.js";
import { honeySVG } from "./honey.js";

const $ = (id) => document.getElementById(id);

const state = {
  profile: { sex: null, prediabetic: null },
  goal: null, // { mode: "recommended" | "custom", grams }
};

// ---------- profile screen ----------

const form = $("profile-form");

function readProfileForm() {
  const data = new FormData(form);
  return { sex: data.get("sex"), prediabetic: data.get("prediabetic") };
}

function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
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
  $("placeholder-grams").textContent = state.goal.grams;
  window.scrollTo(0, 0);
}

showProfile();
