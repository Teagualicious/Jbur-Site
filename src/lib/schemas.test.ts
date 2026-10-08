import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { projectsSchema, siteSchema } from "./schemas.ts";

const read = (name: string): unknown =>
  JSON.parse(readFileSync(new URL(`../data/${name}`, import.meta.url), "utf8"));

test("site.json matches its schema", () => {
  siteSchema.parse(read("site.json"));
});

test("projects.json matches its schema", () => {
  projectsSchema.parse(read("projects.json"));
});

test("site schema rejects a missing contact field", () => {
  const { email: _email, ...rest } = siteSchema.parse(read("site.json"));
  assert.equal(siteSchema.safeParse(rest).success, false);
});
