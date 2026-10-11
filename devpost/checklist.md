---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Answer two questions and see your personal, sourced limit**
  Becomes usable: Opening the app shows the Profile screen with Candy jar Honey, in the Treat Yourself look. Picking sex and prediabetic status instantly shows the recommended limit, the reason, and a source link. **Start tracking** turns on only when both are answered, and goes to a simple tracker placeholder that shows the chosen limit.
  Why now: This is the kernel. The personalized, sourced limit is the hook and the demo's "oh, that's cool" moment. It also sets up everything else: page shell, fonts and colors, Honey, the rules file, and the test runner.
  PRD ref: `prd.md > The Core Journey` (steps 1–3), `prd.md > Profile and Recommended Limit`, `prd.md > Look and Feel`
  Spec ref: `spec.md > Profile Screen`, `spec.md > Recommended Limit Rules`, `spec.md > Honey`, `spec.md > Look and Feel`, `spec.md > File Structure`, `spec.md > Where It Runs and How Someone Tries It`
  Build:
  - Scaffold: `index.html`, `styles.css`, `js/app.js`, `js/logic.js`, `js/honey.js`, `tests/logic.test.js`, `package.json`, `LICENSE` (MIT), and a starter `README.md` with run steps.
  - `recommendedLimit()`, with AHA and WHO sources from `devpost/sources.md`.
  - `honeySVG(mood, { jar })` in four moods.
  - The Profile screen, with the result card and a "general guidance, not medical advice" note.
  - A placeholder tracker view.
  Verify (mechanical):
  - `npm test` passes every row of the limit table.
  - The local server serves the page with no console errors.
  - In the browser: male + no shows 36 g; switching to yes shows 25 g with no reload; prefer not to say + no shows 25 g; not sure shows 25 g.
  - Start tracking is disabled until both are answered.
  - The source link has `target="_blank"`.
  Learner check: Run `python3 -m http.server 8000`, open http://localhost:8000, and click through the answers. Does the limit change the way you expect? Does it look and feel like Treat Yourself?
  Commit: `Add profile screen with personalized, sourced sugar limit`

- [x] **2. Tap a treat and watch the scale fill while Honey reacts**
  Becomes usable: The real Tracker screen. Category tabs and treat cards show added sugar and serving. Tapping a card logs it, so today's log and total update, the sugar scale fills toward your limit with the right color and readout, Honey's mood changes, and she waves. Rows can be removed. Starts with a first batch of verified, sourced treats; the log lives in memory for now.
  Why now: This completes the core loop (profile → treats → scale), which is the whole demo. Getting it in front of you early lets your feedback on look and feel shape the rest.
  PRD ref: `prd.md > The Core Journey` (steps 4, 6), `prd.md > Treat Picker`, `prd.md > Today's Log`, `prd.md > Sugar Scale and Honey's Reactions`, `prd.md > States and Boundaries` (empty log, over the limit)
  Spec ref: `spec.md > Treat Picker`, `spec.md > Today's Log`, `spec.md > Sugar Scale`, `spec.md > Honey`, `spec.md > Data Model`
  Build:
  - `scaleState()` (percent, left/over, color, level) with tests.
  - `js/treats.js`, starting with the first verified treats under the accuracy rule.
  - Header (head-only Honey, logo, date, a Daily goal button that's still inactive).
  - Picker, log, scale and readout, Honey moods and messages, and the wave animation.
  - Narrow-screen stacking.
  Verify (mechanical):
  - `npm test` passes the scale tests: 10 of 25 → 40%, 15 left, happy level; 25 of 25 → at limit, ohmy; 30 of 25 → 5 over.
  - In the browser: logging a treat adds a row and updates the total and scale.
  - Removing a row lowers the total.
  - The empty log shows peeking Honey.
  - Going over shows "Z g over" with no red error styling.
  Learner check: Set a profile, then tap treats until you go over your limit and remove one. Watch the scale and Honey. What do you notice, and what would you change?
  Commit: `Add tracker with treat picker, today's log, sugar scale, and Honey moods`

- [x] **3. Every treat shows where its number came from**
  Becomes usable: Each card has an ⓘ button that opens a source popup (name, serving, basis, link) without logging the treat. The treat list is complete at about 20–30 items, each checked against its source.
  Why now: Accuracy is half of the kernel. The full list is the riskiest research in the build, so it lands right after the core loop works, while there's still room to adjust.
  PRD ref: `prd.md > Treat Picker`, `prd.md > Product Decisions` (specific real products)
  Spec ref: `spec.md > Source Popup`, `spec.md > Data Model` (treat records and accuracy rule), `spec.md > Decisions and Open Issues` (useful unknown)
  Build:
  - Finish `js/treats.js` with about 20–30 treats. Each gets `basis` (`label` or `no-natural-sugar`) and a source URL, checked against the source.
  - Record any dropped candidates under Revisions.
  - Source popup: close button, Esc, click outside.
  Verify (mechanical):
  - A test checks that every treat has `addedSugarG` > 0, a serving, a valid `basis`, and an `https` source URL.
  - In the browser: tapping ⓘ opens the popup and does **not** change the total.
  - Esc and outside clicks close it.
  - Every source link opened during research returned a real page showing the number used.
  Learner check: Tap ⓘ on a few treats you know, such as a soda and a candy bar. Do the numbers and sources look right to you?
  Commit: `Add sourced treat list and source popup`

- [x] **4. It remembers you and starts fresh each day**
  Becomes usable: Reloading or coming back skips straight to the tracker with your profile, goal, and today's log intact. After midnight the log clears, but the profile stays. If storage is blocked, the app still works, with a gentle note. If saved data is corrupt, it starts fresh instead of crashing.
  Why now: Persistence is what makes it a daily tracker rather than a one-off demo. It comes after the loop and data are settled, so the saved shapes match what the UI actually uses.
  PRD ref: `prd.md > The Core Journey` (step 7), `prd.md > States and Boundaries` (returning visit, new day, storage)
  Spec ref: `spec.md > Storage and Day Rollover`, `spec.md > Data Model`, `spec.md > Important Failure Modes`
  Build:
  - `js/storage.js`: safe read and write for `ty.profile`, `ty.goal`, `ty.log`.
  - `todayKey()` with tests.
  - Load on start and save on every change.
  - Midnight check on load, every 60 seconds, and on visibility change.
  - The blocked-storage note.
  Verify (mechanical):
  - `npm test` passes the `todayKey` tests.
  - In the browser: log two treats, reload, and they're still there on the tracker.
  - Setting `ty.log.day` to yesterday and reloading clears the log but keeps the profile.
  - Writing garbage to `ty.profile` and reloading shows the Profile screen with no error.
  Learner check: Set up, log a couple of treats, close the tab, and reopen it. Are you back where you left off?
  Commit: `Persist profile, goal, and today's log with daily reset`

- [x] **5. Change your goal or your profile any time**
  Becomes usable: The **⚙︎ Daily goal** panel shows the current goal and its basis. You can save a custom number, use the 25, 36, or 50 g quick buttons, go back to your recommended limit, or edit your profile. Editing the profile resets the goal and says so. Bad entries get a gentle message.
  Why now: This builds on persistence, and it's the last PRD behavior. It finishes "customizable if they wish."
  PRD ref: `prd.md > Daily Goal Panel`, `prd.md > States and Boundaries` (changing the profile)
  Spec ref: `spec.md > Daily Goal Panel`, `spec.md > Profile Screen` (editing)
  Build:
  - `isValidGoal()` with tests.
  - The goal panel UI, wired to storage and the scale.
  - Edit profile reopens the Profile screen in edit mode, and saving resets the goal to recommended with a note.
  Verify (mechanical):
  - `npm test` passes the goal validation tests: 1 and 300 are valid; 0, -5, blank, 301, and 2.5 are invalid.
  - In the browser: saving 30 shows "of 30 g" and "custom goal."
  - Use my recommended limit restores the profile number.
  - Editing the profile from male/no to yes resets the goal to 25.
  - Invalid input shows the message and doesn't save.
  Learner check: Open Daily goal, set your own number, then switch back to recommended, then edit your profile. Does each change show up on the scale?
  Commit: `Add daily goal panel with custom goal and profile editing`

- [x] **6. Polished, phone-friendly, and documented**
  Becomes usable: The app looks right at phone width and on desktop, respects reduced motion, has the "not medical advice" footer, and has a README covering what it is, how to run and test it, sources, and the Honey disclosure.
  Why now: Final polish only makes sense once every behavior exists. The README has to describe the finished app for reviewers and the submission.
  PRD ref: `prd.md > Screens and Layout`, `prd.md > Look and Feel`, `prd.md > Non-Goals`
  Spec ref: `spec.md > Look and Feel`, `spec.md > Where It Runs and How Someone Tries It`, `spec.md > File Structure`
  Build:
  - Responsive pass at 375px and desktop.
  - Floating hearts with a reduced-motion fallback.
  - Footer.
  - Finish the README: run/test steps, sources list, "Honey the character comes from our earlier Treat Yourself project and was redrawn for this build; no earlier code reused," and the license.
  Verify (mechanical):
  - `npm test` passes.
  - At 375px width, the page has no horizontal scroll and every control can be reached.
  - With reduced motion turned on, the floating animation stops.
  - Every command in the README runs as written.
  Learner check: Open it on your phone or in a narrow window, and run through the whole journey once.
  Commit: `Polish layout and motion, and document the app`

## Hands-on Checkpoints

- [ ] Early usable behavior explored, after slice 3 — skipped at the learner's request on 2026-10-10 to save time; covered by the final review below (see Revisions)
- [x] Final kick-the-tires exploration and feedback completed — 2026-10-10, the learner opened the app from a fresh first visit in the browser preview and replied "looks good"

## Final Review

- [x] Final review complete — feedback resolved and learner confirms ready to ship (2026-10-10). No changes requested; the three fixes from the independent review were already in before the learner's look.

## Code Tour and App Map

- [x] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [x] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [x] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: Brief recap, at the learner's request to keep things simple. The practice connected is "write the failure mode down, then test it with garbage": `spec.md > Important Failure Modes` ("saved data is corrupt or an old shape → start fresh at the Profile screen") became `tests/storage.test.js` ("garbage and wrong shapes read as null instead of throwing") and the slice 4 browser check (garbage in `ty.profile`, reload, Profile screen with no error). Delivered in the final build message on 2026-10-10.
Route and stops: Reference route only (not toured): `js/app.js` logTreat → `js/logic.js` scaleState → `js/app.js` renderScale, with storage in a collapsible note. Recorded in the map as a reference route.
Edit outcome: Not offered as an exercise; the learner asked to keep the finish simple.
Reflection: One optional question offered in the final build message ("what would you do differently next time you start with an agent?"); answering is optional.
Activity mode: brief recap
Map: `devpost/app-map.html`, generated from the code at commit 169fb39, checked in the browser (no scripts, no external references, no horizontal scroll at phone width, diagram renders).

## Revisions

- `recommendedLimit()` returns `sources` (a list) instead of a single `source` — the prediabetic limit cites two sources (WHO and AHA), so one field couldn't hold both.
- The sugar tube shows 125% of the limit, so the dashed goal line sits at 80% height and going over is visible above it. The spec said fill `min(pct, 100)%`, which would have pinned the goal line to the very top, where nothing over the limit could show.
- Treat sources are grocery-store product pages (Stop & Shop, Giant, Giant Food, Hannaford, Food Lion) that show the full Nutrition Facts panel, including "Added Sugar." The spec preferred brand pages or USDA FoodData Central, but those didn't work: the USDA demo key was rate-limited (HTTP 429), brand sites didn't resolve, three research agents stalled, and Open Food Facts listed Snickers at 0 g added sugar, so it was rejected as unreliable. Each value was read off the live page on 2026-10-06.
- The full 23-item list landed in slice 2, not slice 3, because the research had to happen before any treat could be shown. Dropped: Starbucks Doubleshot Espresso & Cream (has milk and no added-sugar line), Inotea Matcha Latte (its listing showed exactly the same numbers as the Brown Sugar flavor, so it looked copied and wasn't trusted), Pepsi's Stop & Shop page (blocked; Giant Food's page was used instead).
- The early hands-on checkpoint moved from after slice 2 to after slice 3. The treat research had already landed in slice 2, which left slice 3 as a small step (the ⓘ popup and a data test), so one pause covers the core loop and the sources together. The build resumed in a new session on 2026-10-10 with the slice-2 checkpoint still unchecked, and the learner is short on time.
- Reduced motion was verified by reading the `prefers-reduced-motion` rule in `styles.css` (it hides the floating hearts and stops every animation) and by confirming the animations run normally without it. The browser tools in this session can't toggle the OS setting, so the rule wasn't exercised live.
- The learner chose on 2026-10-10 to skip the early hands-on checkpoint and build slices 4–6 straight through, to save time before the deadline. One final hands-on check covers the whole journey instead.
- Independent review on 2026-10-10, after slice 6: five reviewer agents (logic, plan conformance, accessibility and layout, data accuracy, submission readiness), with every finding checked by a reproduce lens and a plan-scope lens. 14 findings; 3 confirmed and fixed in commit 169fb39:
  - A treat tapped in the minute after midnight on a tab left open was saved under yesterday and wiped by the next day check. `logTreat` and `removeEntry` now re-check the date first. Proven with a controlled-clock Node script before and after.
  - The PRD's first journey step says Honey says hello; the Profile screen now opens with "Hi, I'm Honey!"
  - The app map still had a placeholder commit hash; stamped and committed.
  The other 11 were accurate but judged outside the proof-of-concept plan, and are worth a later pass: white text on pink buttons and the lilac focus ring are below WCAG AA contrast; the category tabs use tab roles without the arrow-key pattern; focus is lost when the tabs or log re-render; no live-region announcement of the new total; the goal error isn't linked to its input with aria-describedby; the ⓘ button is a 26 px target; `loadGoal` accepts a saved goal outside 1–300 (the form itself rejects it); the WHO source link is the 2015 press release rather than the guideline PDF; `.agents/` and `.claude/` are untracked tooling folders (handled in `6-ship`).
- Follow-up in `6-ship` (2026-10-10), after a judge-panel review against the hackathon's four criteria: white-on-pink buttons, selected tabs and chips, and the focus ring were moved to WCAG AA contrast (new `--pink-ink-soft` token, raspberry focus ring); the ⓘ button grew to a 34 px circle with a 46 px tap area; the picker says what ⓘ does; the first profile question explains why it's asked; the README names the audience, links each planning doc, and notes that product names only identify labels.
- Scope additions in `6-ship` on 2026-10-10, both the learner's decisions: (1) the treat list is being expanded well beyond 20–30 items under the same label-verification rule, with a parallel research run that verifies each candidate against a live store page and audits every result; (2) **My treats**: an add-your-own-treat form, kept separate and labeled as entered by the person, with `customTreatErrors()` tests and `ty.custom` storage tests. Also a visual pass at the learner's request: the sugar scale fills with sprinkles, and the floating hearts and sparkles are denser and swaying.
- Treat list expanded from 23 to 70 on 2026-10-10 (learner's decision). A research run proposed about 70 candidates; 42 were verified against live store pages that print an "Added Sugar" line, and every one was then re-fetched by a script that read the Added Sugar number and serving straight off the page (42 of 42 matched). Five ice cream treats were verified the same way by hand. Each new treat records its own check date. Left out: Pocas, O's Bubble, and Twrl boba, Califia Mocha, Caribou Cold Brew, and Chameleon cold brew (no store page with an Added Sugar line); Werther's Sugar Free and Welch's 100% Grape Juice (the panel shows only "0%" with no gram figure, and a 0 g can't be inferred); Celsius and Sprite Zero (no Added Sugar line); the Magnum Double Caramel bar (the panel lists only the whole 3-bar carton). About 20 more candidates were never checked because the research run hit a usage limit; nothing unchecked was added.
- Fixes from a second review of My treats: the README no longer says every number is label-checked, and describes My treats; the custom-treat date uses local time instead of UTC; a drag that ends on the backdrop no longer closes a dialog and loses what was typed; form errors are linked to their fields; after saving, the My treats tab scrolls into view and the new treat gets focus; "· yours" is real text for screen readers; the add card's hover color meets AA contrast.
