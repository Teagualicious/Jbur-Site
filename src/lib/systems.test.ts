import { test } from "node:test";
import assert from "node:assert/strict";
import { stepCaption, stepLabel, systemRows, type SystemInput } from "./systems.ts";

const entry = (id: string, status: SystemInput["data"]["status"], launched: string, replaced?: string): SystemInput => ({
  id,
  data: { title: id, summary: "", status, launched: new Date(launched), replaced },
});

test("only case studies with a 'replaced' line become rows", () => {
  const rows = systemRows([entry("a", "Live", "2026-01-01", "x"), entry("b", "Live", "2026-02-01")]);
  assert.deepEqual(rows.map((r) => r.id), ["a"]);
});

test("Live rows come first, then newest launch first", () => {
  const rows = systemRows([
    entry("old-pilot", "Pilot", "2025-03-01", "x"),
    entry("new-pilot", "Pilot", "2026-09-01", "x"),
    entry("old-live", "Live", "2024-05-01", "x"),
    entry("new-live", "Live", "2026-08-01", "x"),
  ]);
  assert.deepEqual(rows.map((r) => r.id), ["new-live", "old-live", "new-pilot", "old-pilot"]);
});

test("'Since' is the launch year in UTC", () => {
  assert.equal(systemRows([entry("a", "Live", "2026-01-01", "x")])[0].since, 2026);
});

test("step caption and label", () => {
  assert.equal(stepCaption({ total: 9, people: 2 }), "2 by people · 7 automated");
  assert.equal(stepLabel({ total: 6, people: 1 }), "6 steps: 1 done by people, 5 automated");
});
