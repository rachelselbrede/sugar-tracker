# 🍬 Treat Yourself

A cute, guilt-free added-sugar tracker. Answer two questions, get a personal daily added-sugar limit with its source, then tap treats to see how close you are. Honey the bear keeps you company, and nothing you enter leaves your browser.

Built as a small proof of concept for Devpost's **Build With AI: Basics** hackathon, using a plan-first workflow (scope → PRD → spec → build). The planning documents are in [`devpost/`](devpost/).

**Try it:** https://rachelselbrede.github.io/sugar-tracker/ · **Code:** https://github.com/rachelselbrede/sugar-tracker

## What it does

- **A personal, sourced limit.** Pick your sex and whether you're prediabetic, and the app shows a recommended daily added-sugar limit, the reason, and a link to the guidance it came from.
- **Sourced treats.** Every treat in the picker shows its added sugar and serving. Tap **ⓘ** to see exactly where the number came from, with a link to the product's Nutrition Facts panel.
- **A kind sugar scale.** Tap a treat to log it. The scale fills toward your limit, and Honey reacts. Going over shows the number and a reminder that tomorrow is a fresh start. No red alerts, no guilt.
- **Remembers you.** Your profile, goal, and today's log are saved in your browser. After midnight the log starts fresh; your profile stays.
- **Your own goal.** The **⚙︎ Daily goal** panel lets you set a custom number, use the 25 / 36 / 50 g quick buttons, go back to your recommended limit, or edit your profile.

## Run it

No build step and nothing to install. Serve the folder, then open the page:

```bash
python3 -m http.server 8000
```

Then visit http://localhost:8000. Opening `index.html` directly won't work, because browsers block JavaScript modules on `file://`.

## Test it

```bash
npm test
```

This uses Node's built-in test runner and installs nothing. The tests cover the limit table, the scale math, goal validation, the day key, safe storage, and a check that every treat has a positive added-sugar value, a serving, a valid basis, and an https source.

## How the numbers are chosen

**Daily limits** (added sugar per day):

| Profile | Limit | Source |
|---|---|---|
| Prediabetic, or not sure | 25 g, labeled as general guidance | There is no official added-sugar number for prediabetes. This uses the careful end of public guidance: the WHO's conditional target of under 5% of energy and the AHA's limit for women. |
| Not prediabetic, female | 25 g | American Heart Association |
| Not prediabetic, male | 36 g | American Heart Association |
| Not prediabetic, prefer not to say | 25 g | American Heart Association (the more careful limit) |

- AHA, *How much sugar is too much?*: https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/sugar/how-much-sugar-is-too-much
- WHO, *Guideline: sugars intake for adults and children* (2015): https://www.who.int/news/item/04-03-2015-who-calls-on-countries-to-reduce-sugars-intake-among-adults-and-children
- The 50 g quick button is the FDA Daily Value for added sugars: https://www.fda.gov/food/nutrition-facts-label/added-sugars-nutrition-facts-label

**Treats.** A treat only goes on the list if its added sugar is known, not guessed. Each value is the "Includes Xg Added Sugars" line from the product's US Nutrition Facts panel, read from a grocery-store product page that shows the full panel, for the serving shown. Items whose labels only give total sugar and contain milk, fruit, or juice were left out. The list and its source links live in [`js/treats.js`](js/treats.js), and the research notes are in [`devpost/sources.md`](devpost/sources.md).

Treat Yourself is general guidance, not medical advice. Talk to your clinician about what's right for you.

## How it's built

Plain HTML, CSS, and JavaScript modules, with no framework and no dependencies.

- `index.html` — both screens (Profile and Tracker), the goal panel, the source popup, and the footer
- `styles.css` — the pastel candy-shop look, layout, and reduced-motion fallback
- `js/app.js` — wires the page together: loads saved state, renders, handles taps, checks for a new day
- `js/logic.js` — the rules, as pure functions: `recommendedLimit`, `scaleState`, `isValidGoal`, `todayKey`
- `js/storage.js` — safe localStorage reads and writes that never crash on blocked or corrupt data
- `js/treats.js` — the treat list with added sugar, serving, basis, and source link
- `js/honey.js` — Honey the bear, drawn as SVG in four moods
- `tests/` — the Node tests

## Honey and the original Treat Yourself

Honey the character comes from our earlier Treat Yourself project and was redrawn for this build; no earlier code was reused. The fonts (Fredoka, Nunito, Pacifico) and the pastel palette carry over as the design direction.

## License

MIT. See [LICENSE](LICENSE).
