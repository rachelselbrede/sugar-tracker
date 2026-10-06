---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [ ] **1. Answer two questions and see your personal, sourced limit**
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

- [ ] **2. Tap a treat and watch the scale fill while Honey reacts**
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

- [ ] **3. Every treat shows where its number came from**
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

- [ ] **4. It remembers you and starts fresh each day**
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

- [ ] **5. Change your goal or your profile any time**
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

- [ ] **6. Polished, phone-friendly, and documented**
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

- [ ] Early usable behavior explored, after slice 2 (core loop: profile → treats → scale and Honey)
- [ ] Final kick-the-tires exploration and feedback completed

## Final Review

- [ ] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [ ] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [ ] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [ ] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: 
Route and stops: 
Edit outcome: 
Reflection: 
Activity mode: 

## Revisions
