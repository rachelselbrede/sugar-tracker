---
doc: scope
status: approved
---

# Treat Yourself

A cute, guilt-free added-sugar tracker for people who are prediabetic. You set a quick profile, add your treats, and see how close you are to a daily limit that is personal to you and based on real sources.

## The Unique Kernel
**Kind, not clinical, and still accurate.** Diabetes and diet apps feel medical and shaming. Treat Yourself feels like a cozy journal ("awareness, not guilt"), but its numbers are real:
- The daily limit is **personalized** from your sex and prediabetes status, and you can change it.
- It counts **added sugar only**, which is what the official limits measure.
- Every treat's sugar value comes from a **real source**.

## Who It's For
**Someone who's prediabetic** and wants to be more aware of how much added sugar they eat. Anyone can use it, but the default limits and wording are tuned for them.
Today they guess, or use diet apps that feel like calorie-shaming rather than "a cozy journal instead of a diet app" (from the original README).

## The Core Loop
1. **Once:** set a profile (sex, prediabetic yes/no). The app shows your personal daily added-sugar limit and where the number comes from. You can override it.
2. **Through the day:** tap the treats you've had. The total adds up, the sugar scale fills toward your limit, and Honey reacts with kind words, never red warnings.
3. **Tomorrow:** the day resets at midnight, so you come back and start fresh.

## Inspiration & Identity
- Keep the look of the original Treat Yourself (https://rachelselbrede.github.io/treat-yourself/): **Fredoka** for headings, **Nunito** for body text, **Pacifico** for the logo; pastel candy-shop palette; floating hearts and sparkles; Honey the bear.
- Tone: warm, encouraging, never shaming. Going over the limit says so plainly, then says tomorrow resets.
- Design reference only. The original code is not copied in. Any original asset that gets reused (such as Honey's drawing) is disclosed in the submission.

## Why This Matters to the Learner
The original was built for "awareness, not guilt," but its science was loose. This version makes the numbers trustworthy: a limit tuned to the person, and sugar counts "closer to what they should be."

## What "Working" Looks Like
In the learner's words: *"they set their profile then add treats."*
- **The "oh, that's cool" beat:** pick "prediabetic" and the daily limit changes right in front of you, with its source. Then add a boba and watch the scale jump while Honey responds kindly.
- All of this has to show clearly in a demo video under 3 minutes.

## The POC Boundary
- **Profile:** sex and prediabetic yes/no set a default daily added-sugar limit, with a cited source. The user can override it.
- **Treat picker:** a short, curated list of common treats (about 20–30). Each shows added sugar per serving and where the number came from.
- **Today's log:** running total; remove items added by mistake.
- **Sugar scale:** fills toward the personal limit, with kind messages and Honey reacting.
- **Daily reset at midnight;** everything stored in the browser only (no server, no account).
- A short "not medical advice" note.

## Later
- Add your own custom treats
- Search across the treat list
- 7-day history chart and sweet streaks
- Share-my-day card
- Sugar glossary and insights tab
- Live lookup of any food from a nutrition database
- Dark mode

## Explicitly Cut
- **Total sugar and natural-sugar tracking:** the limits apply to added sugar only, so counting fruit or plain milk would make the numbers less accurate. *(Learner's decision.)*
- **Extra health-profile fields (age, weight, diabetes history):** not needed to set the limit, and they add sensitive data for no benefit.
- **The large ~55-item treat list:** a smaller list with real sources beats a big list of rough guesses.

## Open for the PRD
- **The prediabetes limit:** which number to use, and which source to cite. As far as we know, no major body publishes a prediabetes-specific gram limit; to be confirmed with sources.
- **The defaults for women and men** (likely American Heart Association guidance); to be confirmed.
