# Sugar Science Sources

Research notes gathered on 2026-10-05 for the PRD and spec. These are working notes for setting the daily limits and choosing the data source. They are not part of the submission copy.

## Daily added-sugar limits

| Profile | Number | Status |
|---|---|---|
| Women | 25 g/day (6 tsp, 100 kcal) | Official AHA guidance [1]. The page was last reviewed May 14, 2026. |
| Men | 36 g/day (9 tsp, 150 kcal) | Official AHA guidance [1] |
| Prediabetic | **No official number exists** | AHA [2], ADA Standards of Care 2026 [8] and CDC [9][10] all say to minimize added sugar and sugary drinks, but none gives a gram limit. |

Candidate prediabetic default: **25 g/day for any sex.** This is a design choice, not an official number. It matches WHO's conditional target of under 5% of energy (about 25 g) [6] and AHA's limit for women [1]. It should be labeled as general guidance, with a prompt to ask a clinician. Anything stricter has no source behind it.

## Other guidance worth knowing

- **Dietary Guidelines for Americans 2025–2030** (released January 2026) [3][4]:
  - "no amount of added sugars or non-nutritive sweeteners is recommended"
  - "one meal should contain no more than 10 grams of added sugars"
  - No daily percent limit for added sugar.
  - People with chronic conditions are told to talk to their health professional.
- **Prior DGA 2020–2025** [5]: added sugar under 10% of calories, which is about 50 g at 2,000 kcal.
- **WHO** [6][7]: free sugars under 10% of energy is a strong recommendation (about 50 g). Under 5% is conditional (about 25 g).
- **FDA Daily Value** [12]: 50 g of added sugar per day on a 2,000 kcal diet.
- **Diabetes Canada** [11]: sucrose at no more than 10% of energy for people with diabetes. This is the 2013 guideline, it applies to diabetes rather than prediabetes, and it is dated.

## What counts as "added sugar" (FDA)

- These count: honey, syrups (maple, agave and others), and sugars from concentrated fruit or vegetable juice [12].
- 100% fruit juice does **not** count as added sugar under FDA rules [13], but WHO does count it as "free sugar." Recommendation: follow FDA, since the app's limits are added-sugar limits.
- Sugars in whole fruit, vegetables and plain milk are not added sugars.

## Where to get accurate per-treat values

- **USDA FoodData Central** [14][15]:
  - **Branded Foods:** has "Sugars, added" from nutrition labels, but only for newer entries.
  - **SR Legacy and FNDDS:** total sugar only.
  - **Café drinks** (boba, coffee-shop drinks) are mostly missing.
  - **API:** free, but it needs an api.data.gov key. FDC deactivates keys that are exposed publicly, so a key can't safely ship in front-end code. Don't rely on DEMO_KEY either: it is heavily rate-limited.
- **Open Food Facts** [18]: no key needed and it has an added-sugars field, but the data is crowdsourced and patchy.
- **Takeaway for the proof of concept:** ship a hand-curated treat list. Each item's added-sugar value comes from its nutrition label, the brand's published nutrition info, or an FDC Branded Foods entry, and stores its source link.

## Sources

1. AHA, How much sugar is too much: https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/sugar/how-much-sugar-is-too-much
2. AHA, blood-sugar health: https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/sugar/sugar-shrink-the-sweet-spot-for-blood-sugar-health
3. Dietary Guidelines for Americans 2025–2030 (pp. 3–9): https://cdn.realfood.gov/DGA.pdf
4. ODPHP, current Dietary Guidelines: https://odphp.health.gov/our-work/nutrition-physical-activity/dietary-guidelines/current-dietary-guidelines
5. Dietary Guidelines for Americans 2020–2025 (p. x): https://www.dietaryguidelines.gov/sites/default/files/2021-03/Dietary_Guidelines_for_Americans-2020-2025.pdf
6. WHO sugars guideline (2015): https://www.who.int/news/item/04-03-2015-who-calls-on-countries-to-reduce-sugars-intake-among-adults-and-children
7. WHO healthy diet fact sheet: https://www.who.int/news-room/fact-sheets/detail/healthy-diet
8. ADA Standards of Care in Diabetes 2026, Section 5: https://pmc.ncbi.nlm.nih.gov/articles/PMC12690188/
9. CDC, prediabetes: https://www.cdc.gov/diabetes/prevention-type-2/prediabetes-prevent-type-2.html
10. CDC, diabetes meal planning: https://www.cdc.gov/diabetes/healthy-eating/diabetes-meal-planning.html
11. Diabetes Canada, sugar and diabetes: https://www.diabetes.ca/advocacy-and-policy/our-policy-positions/sugar_and_diabetes
12. FDA, added sugars on the Nutrition Facts label: https://www.fda.gov/food/nutrition-facts-label/added-sugars-nutrition-facts-label
13. 21 CFR 101.9 (Cornell LII mirror): https://www.law.cornell.edu/cfr/text/21/101.9
14. USDA FoodData Central API guide: https://fdc.nal.usda.gov/api-guide/
15. FDC example with added sugars (JOYBA bubble tea): https://fdc.nal.usda.gov/food-details/2561846/nutrients
16. USDA Food Patterns Equivalents Database: https://www.ars.usda.gov/northeast-area/beltsville-md-bhnrc/beltsville-human-nutrition-research-center/food-surveys-research-group/docs/fped-overview/
17. api.data.gov developer manual: https://api.data.gov/docs/developer-manual/
18. Open Food Facts API: https://openfoodfacts.github.io/openfoodfacts-server/api/

Caveats from the research: the CDC pages and the regulation text were read through mirrors or a summarizing fetch tool, so those quotes may be slightly normalized. Quotes from AHA, WHO, ADA and Diabetes Canada are paraphrased because those texts are copyrighted. USDA's Foundation Foods dataset was not checked.
