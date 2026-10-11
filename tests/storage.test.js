import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

// A tiny in-memory stand-in for the browser's localStorage, so the safe read/write
// code can be checked in Node. `broken` makes every call throw, like a blocked store.
const memory = new Map();
let broken = false;
globalThis.localStorage = {
  getItem: (k) => { if (broken) throw new Error("blocked"); return memory.has(k) ? memory.get(k) : null; },
  setItem: (k, v) => { if (broken) throw new Error("blocked"); memory.set(k, String(v)); },
  removeItem: (k) => { if (broken) throw new Error("blocked"); memory.delete(k); },
};

const storage = await import("../js/storage.js");

beforeEach(() => { memory.clear(); broken = false; });

test("profile, goal, and log round-trip", () => {
  storage.saveProfile({ sex: "male", prediabetic: "no" });
  storage.saveGoal({ mode: "custom", grams: 30 });
  storage.saveLog({ day: "2026-10-10", items: [{ id: "a1", treatId: "coke", name: "Coke", emoji: "🥤", grams: 39, at: "2026-10-10T12:00:00.000Z" }] });
  assert.deepEqual(storage.loadProfile(), { sex: "male", prediabetic: "no" });
  assert.deepEqual(storage.loadGoal(), { mode: "custom", grams: 30 });
  assert.deepEqual(storage.loadLog(), { day: "2026-10-10", items: [{ id: "a1", treatId: "coke", name: "Coke", emoji: "🥤", grams: 39, at: "2026-10-10T12:00:00.000Z" }] });
});

test("nothing saved reads as null", () => {
  assert.equal(storage.loadProfile(), null);
  assert.equal(storage.loadGoal(), null);
  assert.equal(storage.loadLog(), null);
});

test("garbage and wrong shapes read as null instead of throwing", () => {
  memory.set("ty.profile", "garbage{{{");
  memory.set("ty.goal", JSON.stringify({ mode: "weird", grams: 30 }));
  memory.set("ty.log", JSON.stringify(["not", "an", "object"]));
  assert.equal(storage.loadProfile(), null);
  assert.equal(storage.loadGoal(), null);
  assert.equal(storage.loadLog(), null);

  memory.set("ty.profile", JSON.stringify({ sex: "dragon", prediabetic: "no" }));
  assert.equal(storage.loadProfile(), null);
  memory.set("ty.goal", JSON.stringify({ mode: "custom", grams: "thirty" }));
  assert.equal(storage.loadGoal(), null);
});

test("a log with some broken rows keeps the good ones", () => {
  memory.set("ty.log", JSON.stringify({ day: "2026-10-10", items: [
    { id: "ok", name: "Coke", grams: 39 },
    { id: 5, name: "bad id", grams: 1 },
    "nope",
    { id: "ok2", name: "no grams" },
  ] }));
  const log = storage.loadLog();
  assert.equal(log.items.length, 1);
  assert.equal(log.items[0].id, "ok");
  assert.equal(log.items[0].emoji, "🍬"); // filled in when missing
});

test("a blocked store never throws", () => {
  broken = true;
  assert.equal(storage.storageAvailable(), false);
  assert.equal(storage.saveProfile({ sex: "male", prediabetic: "no" }), false);
  assert.equal(storage.loadProfile(), null);
  broken = false;
  assert.equal(storage.storageAvailable(), true);
});

test("custom treats round-trip and drop broken rows", () => {
  storage.saveCustom([
    { id: "custom-1", name: "Lemon bar", emoji: "🍭", serving: "1 bar", addedSugarG: 12, basis: "custom", createdAt: "2026-10-10T20:00:00.000Z" },
  ]);
  assert.deepEqual(storage.loadCustom(), [
    { id: "custom-1", name: "Lemon bar", emoji: "🍭", serving: "1 bar", addedSugarG: 12, basis: "custom", createdAt: "2026-10-10T20:00:00.000Z" },
  ]);
  memory.set("ty.custom", JSON.stringify([{ id: "ok", name: "Fine", addedSugarG: 3 }, { id: 7, name: "bad id", addedSugarG: 3 }, { id: "neg", name: "Negative", addedSugarG: -2 }, "junk", { id: "nan", name: "Decimal", addedSugarG: 2.5 }]));
  const list = storage.loadCustom();
  assert.equal(list.length, 1);
  assert.equal(list[0].emoji, "🍭");
  assert.equal(list[0].basis, "custom");
  memory.set("ty.custom", "{not json");
  assert.deepEqual(storage.loadCustom(), []);
});
