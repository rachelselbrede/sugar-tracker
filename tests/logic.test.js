import { test } from "node:test";
import assert from "node:assert/strict";
import { recommendedLimit, SOURCES } from "../js/logic.js";

test("recommendedLimit waits until both questions are answered", () => {
  assert.equal(recommendedLimit({}), null);
  assert.equal(recommendedLimit({ sex: "male" }), null);
  assert.equal(recommendedLimit({ prediabetic: "no" }), null);
});

test("recommendedLimit matches the PRD limit table", () => {
  const rows = [
    // [sex, prediabetic, grams, general guidance?]
    ["female", "yes", 25, true],
    ["male", "yes", 25, true],
    ["unspecified", "yes", 25, true],
    ["female", "unsure", 25, true],
    ["male", "unsure", 25, true],
    ["unspecified", "unsure", 25, true],
    ["female", "no", 25, false],
    ["male", "no", 36, false],
    ["unspecified", "no", 25, false],
  ];
  for (const [sex, prediabetic, grams, general] of rows) {
    const result = recommendedLimit({ sex, prediabetic });
    assert.equal(result.grams, grams, `${sex} + ${prediabetic}`);
    assert.equal(result.general, general, `${sex} + ${prediabetic} general flag`);
    assert.ok(result.reason.length > 0);
  }
});

test("switching a man to prediabetic drops the limit from 36 g to 25 g", () => {
  assert.equal(recommendedLimit({ sex: "male", prediabetic: "no" }).grams, 36);
  assert.equal(recommendedLimit({ sex: "male", prediabetic: "yes" }).grams, 25);
});

test("every limit cites a real https source", () => {
  for (const prediabetic of ["yes", "no", "unsure"]) {
    for (const sex of ["female", "male", "unspecified"]) {
      const { sources } = recommendedLimit({ sex, prediabetic });
      assert.ok(sources.length > 0);
      for (const s of sources) assert.match(s.url, /^https:\/\//);
    }
  }
  assert.deepEqual(recommendedLimit({ sex: "male", prediabetic: "yes" }).sources, [SOURCES.who, SOURCES.aha]);
});
