import { test } from "node:test";
import assert from "node:assert/strict";
import { TREATS, CATEGORIES, CHECKED } from "../js/treats.js";

test("the treat list is a real choice in every category, and still hand-curated", () => {
  assert.ok(TREATS.length >= 60 && TREATS.length <= 120, `found ${TREATS.length}`);
  for (const category of CATEGORIES) {
    assert.ok(TREATS.filter((t) => t.category === category).length >= 8, `${category} has too few treats`);
  }
});

test("every treat has a check date in YYYY-MM-DD form", () => {
  for (const t of TREATS) {
    if (t.checked !== undefined) assert.match(t.checked, /^\d{4}-\d{2}-\d{2}$/, `${t.id}: checked`);
  }
});

test("every treat has a positive added-sugar number, a serving, a valid basis, and an https source", () => {
  for (const t of TREATS) {
    assert.ok(typeof t.addedSugarG === "number" && t.addedSugarG > 0, `${t.id}: addedSugarG`);
    assert.ok(typeof t.serving === "string" && t.serving.trim().length > 0, `${t.id}: serving`);
    assert.ok(["label", "no-natural-sugar"].includes(t.basis), `${t.id}: basis "${t.basis}"`);
    assert.ok(t.source && typeof t.source.name === "string" && t.source.name.length > 0, `${t.id}: source name`);
    assert.match(t.source.url, /^https:\/\//, `${t.id}: source url`);
    assert.ok(CATEGORIES.includes(t.category), `${t.id}: category "${t.category}"`);
    assert.ok(t.name && t.emoji, `${t.id}: name and emoji`);
  }
});

test("treat ids are unique", () => {
  const ids = TREATS.map((t) => t.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("the checked date is a real YYYY-MM-DD", () => {
  assert.match(CHECKED, /^\d{4}-\d{2}-\d{2}$/);
});
