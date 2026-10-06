---
doc: prd
status: approved
---

# Treat Yourself — Product Requirements

A cute, guilt-free added-sugar tracker for people who are prediabetic. You set a quick profile, then tap treats through the day, and a sugar scale fills toward a personal daily limit that has a real source behind it.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey
Source: `scope.md > The Core Loop`, `scope.md > What "Working" Looks Like`.

1. **First open:** the person lands on the **Profile screen**. Honey says hello, and they answer two questions: sex (female, male, or prefer not to say) and prediabetic (yes, no, or not sure).
2. As they answer, the screen shows their **recommended daily added-sugar limit**, why it was chosen, and a link to its source, plus a short "general guidance, not medical advice" note.
3. They tap **Start tracking** and move to the **Tracker screen**.
4. On the tracker, they browse treats by category and **tap a treat** to log it. Today's total goes up, the sugar scale fills toward their limit, and Honey reacts with a kind message.
5. If they want to know where a number came from, they tap the treat's **info button** to see its source.
6. They can remove a treat logged by mistake, or open **Daily goal** to change their limit or edit their profile.
7. When they come back later, they go straight to the tracker with today's log intact. After midnight, the log starts fresh.

**Success:** a prediabetic user can see a personal, sourced limit, log what they ate, and see how close they are without being shamed.

## Screens and Layout
Two views on one page:
- **Profile screen:** shown on first open, or when "Edit profile" is chosen. It's a centered card with Honey, the two questions, the recommended-limit result, and a **Start tracking** button.
- **Tracker screen:** keeps the original Treat Yourself layout:
  - **Header:** Honey, the "Treat Yourself" logo and tagline, today's date, and a **⚙︎ Daily goal** button.
  - **Main column:** the treat picker (category tabs and a grid of treat cards), then today's log below it.
  - **Side column:** the vertical sugar scale. On narrow phone screens it stacks above the picker.
  - **Footer:** a short "not medical advice" note.

## Look and Feel
Source: `scope.md > Inspiration & Identity`. Keep the original Treat Yourself look (https://rachelselbrede.github.io/treat-yourself/):
- **Fonts:** Fredoka for headings, Nunito for body text, Pacifico for the logo.
- **Palette:** pastel candy-shop pinks, with scale colors shifting mint → butter → peach → rose.
- **Style:** soft rounded cards and buttons, gentle shadows, floating hearts and sparkles in the background.
- **Honey the bear** is the mascot and reacts to the user.
- **Tone:** warm and encouraging, never shaming. No red warnings or alarm language.
- Rebuilt fresh. The original code is design reference only.

## Features and Behavior

### Profile and Recommended Limit
Source: `scope.md > The POC Boundary` (Profile).

The two answers set the recommended limit:

| Answers | Recommended limit | Explanation shown |
|---|---|---|
| Prediabetic: **yes** (any sex) | **25 g** | General guidance. There's no official prediabetes number, so this uses the stricter WHO target (under 5% of energy) and the AHA women's limit. Ask your clinician. |
| Prediabetic: **not sure** (any sex) | **25 g** | Same as above, erring on the careful side. |
| Female, prediabetic **no** | **25 g** | American Heart Association (AHA) limit for women |
| Male, prediabetic **no** | **36 g** | AHA limit for men |
| **Prefer not to say**, prediabetic **no** | **25 g** | Uses the more careful AHA limit |

Citations come from `devpost/sources.md`.

- As someone who's prediabetic, I want a limit that fits me so that my tracker isn't using a generic number.
  - [ ] Choosing male + prediabetic **no** shows 36 g. Switching prediabetic to **yes** changes it to 25 g immediately, without a page reload.
  - [ ] Each combination in the table shows the listed limit and explanation.
  - [ ] The source link opens the cited page in a new tab.
  - [ ] **Start tracking** stays disabled until both questions are answered.
  - [ ] The "general guidance, not medical advice" note is visible on this screen.

### Treat Picker
Source: `scope.md > The POC Boundary` (Treat picker).

- About 20–30 common treats grouped into category tabs (for example bakery, boba & coffee, ice cream, candy, soda & drinks).
- Each card shows an emoji, the name, the serving size, and the **added sugar in grams**, labeled as "added sugar."
- Tapping the card logs the treat. A small **ⓘ info button** on the card opens the source details instead.
- **Source details:** a small popup with the source name (for example the brand's nutrition info or a USDA FoodData Central entry), the serving size the number is for, and a link to the source.
- Only added sugar counts. Fruit and plain milk aren't on the list.

- As someone watching my sugar, I want numbers I can trust so that I'm not guessing.
  - [ ] Every treat card shows grams of added sugar and a serving size.
  - [ ] Tapping a card adds it to today's log, and the total updates right away.
  - [ ] Tapping ⓘ shows the source, and does **not** log the treat.
  - [ ] Every treat in the list has a working source link.

### Today's Log
- A list of today's treats showing the emoji, name, grams and time added, with a running total.
- Each row has a remove button. Removing a row updates the total and the scale.

- [ ] Logging the same treat twice shows two rows, and the total counts both.
- [ ] Removing a row lowers the total by that treat's grams.

### Sugar Scale and Honey's Reactions
Source: `scope.md > What "Working" Looks Like` (the "oh, that's cool" beat).

- A vertical gauge fills in proportion to today's total ÷ limit, with a dashed line at the limit.
- The readout says "**X g of Y g**," then "Z g left" (or "Z g over").
- The color shifts mint → butter → peach → rose as the total gets closer to the limit.
- Honey's face and message change with the level:

| Level | Honey and message |
|---|---|
| Empty | Peeking, with a friendly start prompt |
| Under about 50% | Happy |
| About 50–99% | Content, "getting close" |
| At or over 100% | "Oh my!" Says plainly that you're over by Z g and that tomorrow is a fresh start. Never shames. |

- Honey gives a little wave whenever a treat is logged.

- [ ] With a 25 g limit, logging 10 g fills the scale to 40% and reads "10 g of 25 g · 15 g left".
- [ ] Going over shows "Z g over" plus a kind message. No red error styling.
- [ ] Honey's face changes when the total crosses each level.

### Daily Goal Panel
Source: learner's choice, "goal setting like before".

- **⚙︎ Daily goal** opens a panel showing the current limit and where it came from (your profile, or a custom number).
- **Custom goal:** a number input and **Save**, plus quick buttons for 25 g, 36 g and 50 g (50 g is the FDA Daily Value).
- **Use my recommended limit** sets the goal back to the number from the profile.
- **Edit profile** reopens the Profile screen.

- [ ] Saving 30 shows 30 g on the scale and the source as "custom goal."
- [ ] **Use my recommended limit** goes back to the profile-based number.
- [ ] Entering 0, a negative number, a blank, or anything over 300 shows a gentle message and doesn't save.

## States and Boundaries
- **First use:** Profile screen, with nothing logged.
- **Returning visit:** goes straight to the tracker with the saved profile, goal and today's log.
- **Empty log:** Honey peeks out with a prompt like "Tap a treat to add it." The scale is empty.
- **Over the limit:** the scale is full, the readout says "Z g over," and Honey gives a kind message with no red warnings.
- **New day:** after midnight, today's log and total clear. The profile and goal stay.
- **Changing the profile:** the goal resets to the new recommended limit, replacing any custom goal, and the panel says so.
- **Storage:** everything stays in this browser on this device. Clearing site data resets the app. There are no accounts and nothing is sent anywhere.

## Product Decisions
- **Track added sugar only.** The official limits measure added sugar. *(Scope.)*
- **Profile first, then tracker.** The personal limit is the hook, so it comes first.
- **Prediabetic limit is 25 g for any sex.** It's labeled as general guidance, since no official prediabetes number exists.
- **"Prefer not to say" is an option for sex, and it defaults to 25 g.** No one has to pick a gender.
- **Sources show on tap** (the ⓘ button), which keeps the cards clean.
- **Daily goal panel works like the original,** so the person can always override the recommendation.
- **Keep the original look:** fonts, palette, Honey and layout.
- **"Not sure" if prediabetic → 25 g.** Errs on the careful side. *(Confirmed at review.)*
- **Edit profile lives in the Daily goal panel.** *(Confirmed at review.)*
- **Changing the profile replaces a custom goal** with the new recommended limit. *(Confirmed at review.)*
- **Treats are specific real products or chain items** (for example "Coca-Cola, 12 oz can," not "soda"), so each number matches a real source. *(Confirmed at review.)*

## What We're Building
- Profile screen with the recommended limit, its explanation and source.
- Tracker with about 20–30 sourced treats in categories, an ⓘ source popup, today's log with remove, the sugar scale, and Honey's reactions.
- Daily goal panel with a custom goal, presets, reset to recommended, and edit profile.
- Midnight reset, browser-only storage, and a "not medical advice" note.
- The original Treat Yourself look.

## Deferred From the POC
- **Custom treats:** needs its own form and validation, and the source would be unverified.
- **Search:** not needed with only about 25 items.
- **History and streaks:** need multi-day storage and a chart, and aren't needed to prove the kernel.
- **Share card:** image generation, not core.
- **Live food lookup (USDA or Open Food Facts):** needs an API key and a proxy, and the data is patchy for treats.
- **10 g per-meal nudge** (from the 2025–2030 Dietary Guidelines): needs the concept of meals.
- **Dark mode.**

## Possible Later Enhancements
- Show what a treat equals in sugar cubes or teaspoons.
- A "this treat alone is over 10 g" hint, based on the new per-meal guidance.
- A glossary of hidden sugar names (dextrose, cane juice and others).

## Non-Goals
- **Not a medical device or diet plan:** it gives no diagnosis or dosing.
- **No total-sugar, calorie, or carb tracking:** it focuses on added sugar.
- **No accounts, server, or sync:** the privacy of health info is kept simple.
- **No shaming:** no red alerts, guilt copy, or punishments.

## Open Questions
- **Which treats go on the list:** can be picked during the build. The values and sources get compiled then. Doesn't block `4-spec`.
