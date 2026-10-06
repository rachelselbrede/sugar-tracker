---
doc: spec
status: approved
---

# Treat Yourself — Technical Spec

## How This Works, In Plain Language
Treat Yourself is one web page made of plain HTML, CSS and JavaScript. There's no framework, no server, and nothing to install.

- **The page** has two views: the **Profile screen** and the **Tracker screen**. JavaScript shows one and hides the other.
- **The rules** live in a small file of plain functions:
  - which daily limit fits your profile
  - how full the scale is
  - which face Honey makes
  - whether a typed goal is valid

  Because these functions only do math, a few automated tests can check them. These are the numbers your "accurate" kernel depends on.
- **The treat list** is a hand-picked data file. Each treat stores its added sugar, serving size, and the **source link** that number came from.
- **Memory** is the browser's localStorage, which works like a sticky note the browser keeps for this one site. It holds your profile, your goal, and today's log, so when you come back everything is still there. Nothing leaves your device.
- **Honey** is drawn in code as an SVG picture with four moods.

Why this shape: it's the same approach that worked for the original, it's fast to build, and it publishes to GitHub Pages with no setup.

## The Core Journey Through the System
PRD ref: `prd.md > The Core Journey`.

1. **Page opens.** `app.js` asks `storage.js` for a saved profile. If there's none, it shows the **Profile screen**.
2. **You answer the two questions.** Each tap calls `recommendedLimit()` in `logic.js`, which returns the grams, the reason, and the source. The result card updates right away, with no reload.
3. **You tap Start tracking.** `storage.js` saves the profile and the goal (set to "recommended"). `app.js` hides the profile and shows the **Tracker screen**.
4. **You tap a treat.** `app.js` looks it up in `treats.js` and adds a copy (name, emoji, grams, time) to today's log, and `storage.js` saves it. Then `logic.js`'s `scaleState()` works out the percent, grams left or over, the color, and Honey's level. The scale, readout, log, and Honey all update, and Honey waves.
5. **You tap ⓘ on a treat.** The source popup shows that treat's source name, serving size, basis, and link. Nothing is logged.
6. **You remove a row or change your goal.** The log or goal updates in storage, and everything re-renders from it.
7. **You come back later.** The saved profile means you go straight to the tracker. If the saved log is from an earlier day, it gets cleared first.

```
tap ─▶ app.js ─▶ logic.js (math) ─▶ app.js renders ─▶ screen
            └──▶ storage.js ◀──▶ localStorage (profile, goal, today's log)
treats.js (data + sources) ──▶ app.js
honey.js (SVG moods) ──▶ app.js
```

## Stack
- **HTML, CSS, and JavaScript (ES modules), with no framework and no build step.** *Learner agreed.* The tradeoff: plain JS gets messy in big apps, but at this size it's the fastest path and matches the original.
  - JavaScript modules: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules
- **localStorage** for profile, goal, and today's log. *Learner agreed.*
  - https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- **Google Fonts** for Fredoka, Nunito, and Pacifico (see `## Look and Feel`).
  - https://fonts.google.com/
- **Node's built-in test runner** (`node --test`) for the logic tests. Uses the installed Node 26, with no packages. *Learner agreed.*
  - https://nodejs.org/api/test.html
- **Hand-curated treat data.** No live API. The USDA FoodData Central API key can't safely ship in front-end code, and its added-sugar data for treats is patchy (see `devpost/sources.md`).

## Where It Runs and How Someone Tries It
- **Runtime:** any modern browser. ES modules need the page to be served over http, because browsers block modules opened straight from a `file://` path.
- **Run locally:**
  ```bash
  python3 -m http.server 8000
  ```
  Then open http://localhost:8000.
- **Run the tests:**
  ```bash
  npm test
  ```
  This runs `node --test` and installs nothing.
- **Live link (learner chose GitHub Pages):** a public GitHub repo, with Pages set to deploy from the `main` branch root. It's free and needs no build. The repo name gets picked in `6-ship`, and it can't be `treat-yourself`, because the original already uses that name.
- **Demo recording:** record the live link or localhost. Show these, in order:
  1. Profile: male + not prediabetic shows 36 g, then switching to prediabetic shows 25 g with its source.
  2. Start tracking.
  3. Tap a boba or soda; the scale jumps and Honey reacts.
  4. Tap ⓘ to show the source.
  5. Go over the limit and show the kind message.
  6. Open Daily goal.
- **Required for submission:** the short demo video and the public GitHub repo. The Pages link is extra.

## Look and Feel
Carries forward `prd.md > Look and Feel`.
- **Fonts** (Google Fonts):
  - Fredoka 500/600/700 for headings and numbers.
  - Nunito 400/600/700/800 for body text.
  - Pacifico for the "Treat Yourself" logo only.
  - Fallbacks: `ui-rounded, system-ui, sans-serif`.
- **Palette** (CSS custom properties in `:root`):
  - cream background `#fff7f2`, cards `#ffffff`
  - ink `#4a3340`, soft ink `#745a69`
  - pink `#ff9ec4`, deep pink `#f06ea9`, lilac `#c9b3f2`
  - scale colors: mint `#8fd8c4` → butter `#ffd98e` → peach `#ffb08a` → rose `#f0768c`
  - page background: a soft pink-to-lilac wash
  - These are the same color values as the original, re-declared in fresh CSS.
- **Shape and space:** big rounded corners (cards about 28px, buttons pill-shaped), soft pink-tinted shadows, generous padding. The feel is airy and playful.
- **Background:** a few floating hearts and sparkles (♡ ✦ ✧) drifting slowly in CSS. This stops when the user has turned on reduced motion (`prefers-reduced-motion`).
- **Copy tone:** warm and plain. Going over says the number and that tomorrow resets. Never red error styling or alarm words.
- **Honey:** redrawn fresh as a new SVG in `honey.js`. **Candy jar Honey** was chosen from three options: Honey's head and paws peek over the rim of a pastel candy jar full of colored candies (pink, mint, butter, lilac, peach). Her ears are tan, with pink inner ears and rosy cheeks. The jar version is used in the scale panel and on the Profile screen. A head-only version is used as the small brand mark in the header, because the full jar is too wide there.

## Components

### Profile Screen
- **What it shows:** two button groups (sex: female / male / prefer not to say; prediabetic: yes / no / not sure), a result card (grams, reason, source link that opens in a new tab, "general guidance, not medical advice"), and **Start tracking**, which is disabled until both questions are answered.
- **Editing:** reached again from **Edit profile** in the Daily goal panel. Saving there resets the goal to the new recommended limit and says so.
- **Uses:** `recommendedLimit()` in `logic.js` and the save functions in `storage.js`.
- PRD ref: `prd.md > Profile and Recommended Limit`, `prd.md > States and Boundaries`.

### Recommended Limit Rules
In `logic.js`, `recommendedLimit({ sex, prediabetic })` returns `{ grams, reason, source: { name, url } }`:

| Answers | Grams | Reason and source |
|---|---|---|
| prediabetic `yes` or `unsure` | 25 | General guidance, no official prediabetes number: WHO's under-5% target and the AHA women's limit. Links to WHO and AHA. |
| female, `no` | 25 | AHA limit for women. Links to AHA. |
| male, `no` | 36 | AHA limit for men. Links to AHA. |
| `unspecified`, `no` | 25 | The more careful AHA limit. Links to AHA. |

The URLs come from `devpost/sources.md`: AHA [1], WHO [6].
- PRD ref: `prd.md > Profile and Recommended Limit`.

### Treat Picker
- **Tabs and cards:** category tabs, then a grid of cards from `treats.js`. Each card shows the emoji, name, serving, and "**N g added sugar**."
- **Tapping:** the whole card is a button that logs the treat. A separate small **ⓘ** button inside the card opens the source popup and stops the tap from also logging.
- PRD ref: `prd.md > Treat Picker`.

### Source Popup
- **What it shows:** a small dialog with the treat name, serving, source name, **basis** (see `## Data Model`), and a link that opens in a new tab.
- **Closing:** a close button, Esc, or tapping outside.
- PRD ref: `prd.md > Treat Picker`.

### Today's Log
- **What it shows:** a list of entries (emoji, name, grams, time like "2:14 pm") with a remove button on each, plus the running total.
- **Empty log:** Honey peeking, with "Tap a treat to add it."
- PRD ref: `prd.md > Today's Log`, `prd.md > States and Boundaries`.

### Sugar Scale
- **The gauge:** a vertical tube with a dashed goal line. The fill height is `min(pct, 100)%`, and it animates.
- **Readout:** "**X g of Y g**," then "Z g left," "right at your limit," or "Z g over."
- **Colors:** mint under 40%, butter 40–69%, peach 70–99%, rose at 100% or more. The color comes from `scaleState()`.
- **Layout:** sits in the side column, and stacks above the picker on narrow screens.
- PRD ref: `prd.md > Sugar Scale and Honey's Reactions`.

### Honey
- **Drawing:** `honey.js` exports `honeySVG(mood, { jar = true })` for the moods `peek`, `happy`, `content`, and `ohmy`. With `jar: false` it draws the head only, for the header.
- **Level to mood (from `scaleState()`):**
  - empty → peek
  - under 50% → happy
  - 50–99% → content
  - 100% or more → ohmy
- **Messages:** one kind line per mood. The over message includes the grams over and "tomorrow's a fresh start."
- **Wave:** a CSS animation class added whenever a treat is logged. Turned off by `prefers-reduced-motion`.
- PRD ref: `prd.md > Sugar Scale and Honey's Reactions`.

### Daily Goal Panel
- **Opening:** the **⚙︎ Daily goal** button opens a panel showing the current goal and its basis ("recommended from your profile" or "custom goal").
- **Contents:**
  - a number input + **Save**
  - quick buttons for 25, 36, and 50 g (50 = FDA Daily Value)
  - **Use my recommended limit**
  - **Edit profile**
- **Validation:** `isValidGoal(n)` in `logic.js` accepts whole numbers from 1 to 300. Anything else shows "Pick a whole number from 1 to 300" and doesn't save.
- PRD ref: `prd.md > Daily Goal Panel`.

### Storage and Day Rollover
- **What it does:** `storage.js` reads and writes three keys as JSON (see `## Data Model`).
- **Fallback:** every read is wrapped in try/catch. If data is missing, corrupt, or blocked, it falls back to defaults.
- **Midnight:** `app.js` checks `todayKey()` against the saved log's day on load, every 60 seconds, and when the tab becomes visible again. If they differ, the log is cleared and the page re-rendered.
- PRD ref: `prd.md > States and Boundaries`.

## Data Model
All data is in localStorage, on this device only. Clearing site data resets the app.

| Key | Shape | Updated when | When you come back |
|---|---|---|---|
| `ty.profile` | `{ sex: "female"\|"male"\|"unspecified", prediabetic: "yes"\|"no"\|"unsure" }` | Start tracking, or saving Edit profile | It exists, so you skip to the tracker |
| `ty.goal` | `{ mode: "recommended"\|"custom", grams: number }` | Saving a goal, a preset, "use recommended," or a profile change (resets to recommended) | Used as the scale's limit |
| `ty.log` | `{ day: "YYYY-MM-DD", items: [{ id, treatId, name, emoji, grams, at }] }` | Logging or removing a treat | Kept if `day` is today, cleared if not |

Each log entry copies the name and grams, so it stays correct even if the treat list changes later.

**Treat records** (`treats.js`, read-only):
```js
{ id: "coca-cola-12oz", name: "Coca-Cola (12 oz can)", emoji: "🥤",
  category: "Soda & drinks", serving: "1 can (355 mL)", addedSugarG: 39,
  basis: "label",            // "label" | "no-natural-sugar"
  source: { name: "Coca-Cola product nutrition facts", url: "https://..." } }
```
The values and the URL above are placeholders. The real data gets compiled and checked during the build.

**Which treats qualify (accuracy rule):** a treat only goes on the list if its added sugar is known, not guessed.
- `basis: "label"`: the official nutrition label or the brand's nutrition info lists **Added Sugars**, or a USDA FoodData Central Branded Foods entry does.
- `basis: "no-natural-sugar"`: only total sugar is published, **and** the item has no milk, fruit, or juice. All of its sugar must be added, so total = added. The popup says "All the sugar in this one is added."
- Anything else is left off: for example milky café drinks that only publish total sugar, or shop boba without nutrition info. For boba, pick a version with published added sugar, such as a packaged bubble tea whose label lists it.
- *Learner agreed at review.*

## File Structure
```
treat-yourself-v2/
├── index.html          # Both views (Profile, Tracker), header, footer, popup + goal panel markup
├── styles.css          # Fonts, color tokens, layout, cards, scale, Honey animations, reduced-motion
├── js/
│   ├── app.js          # Entry point: load state, choose view, render, handle taps, midnight check
│   ├── logic.js        # Pure functions: recommendedLimit, scaleState, isValidGoal, todayKey
│   ├── storage.js      # Safe localStorage read/write for ty.profile, ty.goal, ty.log
│   ├── treats.js       # Curated treats with added sugar, serving, basis, and source link
│   └── honey.js        # Honey the bear SVG in four moods
├── tests/
│   └── logic.test.js   # node --test: limit table, scale math/levels, goal validation, day key
├── package.json        # { "type": "module", "scripts": { "test": "node --test" } }, no dependencies
├── README.md           # What it is, run/test steps, live link, sources, Honey disclosure
├── LICENSE             # MIT
├── .gitignore          # Keeps devpost/learner-profile.md, .env, .DS_Store out of git
└── devpost/            # scope.md, prd.md, spec.md, sources.md, checklist.md (public); learner-profile.md (ignored)
```

## External Services and Dependencies
- **Google Fonts CSS:**
  - Exact URL: `https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@400;600;700;800&family=Pacifico&display=swap`
  - No key, no cost.
- **GitHub Pages:**
  - Static hosting from the public repo's `main` branch root.
  - Free, no key.
  - Docs: https://docs.github.com/en/pages/getting-started-with-github-pages
- **Source links** in `treats.js` and `logic.js` are just links. The app never fetches them.
- **No APIs** are called at runtime.

## Important Failure Modes
- **localStorage is blocked** (some private windows) → the app still works for that visit, holding everything in memory, and shows a small note: "Can't save on this device, so your log resets when you close the page."
- **Saved data is corrupt or an old shape** → ignore it and start fresh at the Profile screen instead of crashing.
- **Google Fonts doesn't load** → the fallback rounded system fonts keep the page readable.
- **The page stays open past midnight** → the 60-second check and the visibility check clear yesterday's log.
- **Opened by double-clicking `index.html`** → modules won't load. The README says to use the `python3 -m http.server` command or the live link.

## What Was Simplified and Why
- **A hand-curated list of about 20–30 sourced treats** instead of live food search. Accuracy comes from checking each item. A live API would need a key, a proxy, and handling of patchy data.
- **localStorage** instead of accounts or a database. It's single-user, private, and needs no server. The fuller version would need sign-in and a backend.
- **A 60-second check plus a visibility check for midnight** instead of a scheduled job. It does the same thing with no background work.
- **Leave out treats without known added sugar** instead of estimating. This keeps every number honest. Estimates could come later with a clear "estimated" label.

## Decisions and Open Issues
**Learner decisions:**
- Plain HTML/CSS/JS, localStorage, hand-curated data, and Node logic tests, all accepted as recommended.
- **Redraw Honey fresh** rather than reuse the original drawing. The learner picked **Candy jar Honey** from three drawn options.
- **GitHub Pages** for an optional live link.
- **Treat qualification rule** (`label` / `no-natural-sugar`, otherwise left off): agreed at review.

**Implementation details derived from those decisions:**
- the module split (`logic.js` / `storage.js` / `app.js` / `treats.js` / `honey.js`)
- the storage keys
- the scale color thresholds (40 / 70 / 100%)
- the 60-second midnight check
- the 1–300 goal range (carried from the PRD)

**Useful unknown (from the learner's accuracy concern):** "how accurate the sugar tracker actually is."
- **The issue:** many brands publish only *total* sugar, which includes natural sugar from milk or fruit, so it isn't the same as added sugar.
- **What clarifies it:** the qualification rule in `## Data Model` (`label` vs `no-natural-sugar`).
- **The check during the build:** open every treat's source link and confirm the number and basis before it goes in `treats.js`, and record any item that gets dropped.

**Open:**
- **Which treats go on the list** (carried from `prd.md > Open Questions`): compiled during the build. Doesn't block approval.
- **Disclosure for the submission:** Honey the character comes from the learner's earlier Treat Yourself project and is redrawn here. No earlier code is reused. The README notes this.
