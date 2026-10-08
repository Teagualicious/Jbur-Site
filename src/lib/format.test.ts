import { test } from "node:test";
import assert from "node:assert/strict";
import { excerpt, formatDate, isoDate } from "./format.ts";

test("formatDate uses the spec's style and doesn't shift UTC dates", () => {
  assert.equal(formatDate(new Date("2026-10-02")), "Oct 2, 2026");
  assert.equal(formatDate(new Date("2026-01-01")), "Jan 1, 2026");
});

test("isoDate", () => {
  assert.equal(isoDate(new Date("2026-10-02")), "2026-10-02");
});

test("excerpt takes the first prose paragraph as plain text", () => {
  const body = "## Heading\n\nThe *team* asked for a [dashboard](/x).\nIt wasn't needed.\n\nSecond paragraph.";
  assert.equal(excerpt(body), "The team asked for a dashboard. It wasn't needed.");
});

test("excerpt cuts long text at a word boundary", () => {
  const out = excerpt("one two three four five six", 12);
  assert.equal(out, "one two…");
});

test("excerpt of an empty body is empty", () => {
  assert.equal(excerpt(""), "");
});
