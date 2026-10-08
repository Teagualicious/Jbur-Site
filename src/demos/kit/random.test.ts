import { test } from "node:test";
import assert from "node:assert/strict";
import { int, pick, seeded } from "./random.ts";

test("same seed gives the same sequence", () => {
  const a = seeded(42);
  const b = seeded(42);
  const seqA = Array.from({ length: 5 }, a);
  assert.deepEqual(seqA, Array.from({ length: 5 }, b));
});

test("different seeds give different sequences", () => {
  assert.notDeepEqual(Array.from({ length: 5 }, seeded(1)), Array.from({ length: 5 }, seeded(2)));
});

test("values stay in [0, 1)", () => {
  const rng = seeded(7);
  for (let i = 0; i < 10_000; i++) {
    const v = rng();
    assert.ok(v >= 0 && v < 1);
  }
});

test("int is inclusive and covers the range", () => {
  const rng = seeded(3);
  const seen = new Set<number>();
  for (let i = 0; i < 1_000; i++) seen.add(int(rng, 1, 4));
  assert.deepEqual([...seen].sort(), [1, 2, 3, 4]);
});

test("pick returns an item from the list", () => {
  const items = ["a", "b", "c"] as const;
  const rng = seeded(9);
  for (let i = 0; i < 100; i++) assert.ok(items.includes(pick(rng, items)));
});
