import { test } from "node:test";
import assert from "node:assert/strict";
import { recommendedLimit, scaleState, todayKey, isValidGoal, SOURCES } from "../js/logic.js";

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

test("scaleState: 10 g of a 25 g limit", () => {
  const s = scaleState(10, 25);
  assert.equal(s.pct, 40);
  assert.equal(s.left, 15);
  assert.equal(s.over, 0);
  assert.equal(s.level, "low");
  assert.equal(s.mood, "happy");
  assert.equal(s.color, "butter");
  assert.equal(s.fillPct, 32); // 10 / (25 * 1.25)
  assert.equal(s.goalPct, 80);
});

test("scaleState: empty, close, at, and over the limit", () => {
  const empty = scaleState(0, 25);
  assert.equal(empty.level, "empty");
  assert.equal(empty.mood, "peek");
  assert.equal(empty.color, "mint");
  assert.equal(empty.fillPct, 0);

  const close = scaleState(20, 25);
  assert.equal(close.level, "mid");
  assert.equal(close.mood, "content");
  assert.equal(close.color, "peach");

  const at = scaleState(25, 25);
  assert.equal(at.atLimit, true);
  assert.equal(at.level, "over");
  assert.equal(at.mood, "ohmy");
  assert.equal(at.left, 0);
  assert.equal(at.over, 0);

  const over = scaleState(30, 25);
  assert.equal(over.over, 5);
  assert.equal(over.left, 0);
  assert.equal(over.color, "rose");
  assert.equal(over.fillPct, 96);

  assert.equal(scaleState(100, 25).fillPct, 100, "fill never spills out of the tube");
});

test("scaleState: color steps at 40, 70, and 100 percent", () => {
  assert.equal(scaleState(9, 25).color, "mint"); // 36%
  assert.equal(scaleState(10, 25).color, "butter"); // 40%
  assert.equal(scaleState(17, 25).color, "butter"); // 68%
  assert.equal(scaleState(18, 25).color, "peach"); // 72%
  assert.equal(scaleState(24, 25).color, "peach"); // 96%
  assert.equal(scaleState(25, 25).color, "rose"); // 100%
});

test("todayKey formats local dates as YYYY-MM-DD", () => {
  assert.equal(todayKey(new Date(2026, 9, 10, 23, 59)), "2026-10-10");
  assert.equal(todayKey(new Date(2026, 0, 5, 0, 0)), "2026-01-05");
  assert.equal(todayKey(new Date(2026, 11, 31)), "2026-12-31");
  assert.match(todayKey(), /^\d{4}-\d{2}-\d{2}$/);
});

test("todayKey changes across midnight", () => {
  const beforeMidnight = new Date(2026, 9, 10, 23, 59, 59);
  const afterMidnight = new Date(2026, 9, 11, 0, 0, 1);
  assert.notEqual(todayKey(beforeMidnight), todayKey(afterMidnight));
});

test("isValidGoal accepts whole numbers from 1 to 300, including typed text", () => {
  for (const ok of [1, 25, 36, 300, "30", " 36 ", "300"]) assert.equal(isValidGoal(ok), true, String(ok));
});

test("isValidGoal rejects 0, negatives, blanks, over 300, decimals, and junk", () => {
  for (const bad of [0, -5, "", "   ", 301, 2.5, "2.5", "0", "-5", "301", "abc", null, undefined, NaN, Infinity, "1e400", true]) {
    assert.equal(isValidGoal(bad), false, String(bad));
  }
});
