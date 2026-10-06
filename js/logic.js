// Pure rules for Treat Yourself: no page, no storage, just numbers in and numbers out.
// Keeping them here means `npm test` can check the math the whole app depends on.

export const SOURCES = {
  aha: {
    name: "American Heart Association: How much sugar is too much?",
    url: "https://www.heart.org/en/healthy-living/healthy-eating/eat-smart/sugar/how-much-sugar-is-too-much",
  },
  who: {
    name: "World Health Organization: guideline on sugars intake",
    url: "https://www.who.int/news/item/04-03-2015-who-calls-on-countries-to-reduce-sugars-intake-among-adults-and-children",
  },
};

const PREDIABETES_NOTE =
  "There's no official added-sugar number for prediabetes, so this uses the careful end of the guidance: " +
  "the WHO's under-5% target and the American Heart Association's limit for women.";

// Returns the recommended daily added-sugar limit for a profile, or null until both questions are answered.
// sex: "female" | "male" | "unspecified"; prediabetic: "yes" | "no" | "unsure"
export function recommendedLimit({ sex, prediabetic } = {}) {
  if (!sex || !prediabetic) return null;

  if (prediabetic === "yes") {
    return {
      grams: 25,
      reason: PREDIABETES_NOTE + " It's general guidance, so check in with your clinician too.",
      sources: [SOURCES.who, SOURCES.aha],
      general: true,
    };
  }
  if (prediabetic === "unsure") {
    return {
      grams: 25,
      reason: "Not sure? We'll err on the careful side. " + PREDIABETES_NOTE + " Your clinician can tell you more.",
      sources: [SOURCES.who, SOURCES.aha],
      general: true,
    };
  }
  if (sex === "male") {
    return {
      grams: 36,
      reason: "The American Heart Association suggests no more than 36 g (about 9 teaspoons) of added sugar a day for men.",
      sources: [SOURCES.aha],
      general: false,
    };
  }
  if (sex === "female") {
    return {
      grams: 25,
      reason: "The American Heart Association suggests no more than 25 g (about 6 teaspoons) of added sugar a day for women.",
      sources: [SOURCES.aha],
      general: false,
    };
  }
  return {
    grams: 25,
    reason: "With no sex selected, we use the more careful American Heart Association limit: 25 g (about 6 teaspoons) of added sugar a day.",
    sources: [SOURCES.aha],
    general: false,
  };
}
