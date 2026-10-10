import { test } from "node:test";
import assert from "node:assert/strict";
import { TREATS, CATEGORIES, CHECKED } from "../js/treats.js";

test("the treat list is proof-of-concept sized (about 20–30 items)", () => {
  assert.ok(TREATS.length >= 20 && TREATS.length <= 30, `found ${TREATS.length}`);
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
