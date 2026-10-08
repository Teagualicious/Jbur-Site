import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseTerms, scan } from "./check-terms.mjs";

const SCRIPT = fileURLToPath(new URL("./check-terms.mjs", import.meta.url));

// Builds a throwaway src/ tree from { "relative/path": "contents" }.
function tree(files) {
  const root = mkdtempSync(join(tmpdir(), "check-terms-"));
  for (const [path, body] of Object.entries(files)) {
    const full = join(root, path);
    mkdirSync(dirname(full), { recursive: true });
    writeFileSync(full, body);
  }
  return root;
}

function run(env, root) {
  return spawnSync(process.execPath, [SCRIPT, root], {
    env: { PATH: process.env.PATH, ...env },
    encoding: "utf8",
  });
}

test("parseTerms trims and drops empty entries", () => {
  assert.deepEqual(parseTerms(" Acme , ,Widget Co,"), ["Acme", "Widget Co"]);
  assert.deepEqual(parseTerms(""), []);
  assert.deepEqual(parseTerms(undefined), []);
});

test("fails when BLOCKED_TERMS is missing", () => {
  const result = run({}, tree({ "a.md": "clean" }));
  assert.equal(result.status, 1);
  assert.match(result.stderr, /BLOCKED_TERMS/);
});

test("fails when BLOCKED_TERMS is empty or only commas", () => {
  const root = tree({ "a.md": "clean" });
  assert.equal(run({ BLOCKED_TERMS: "" }, root).status, 1);
  assert.equal(run({ BLOCKED_TERMS: " , " }, root).status, 1);
});

test("passes on a clean tree", () => {
  const result = run({ BLOCKED_TERMS: "Acme" }, tree({ "a.md": "nothing here" }));
  assert.equal(result.status, 0, result.stderr);
});

test("finds a term in every scanned extension", () => {
  const exts = [".md", ".mdx", ".ts", ".tsx", ".astro", ".json", ".css"];
  const files = Object.fromEntries(exts.map((ext) => [`f${ext}`, "x\nmade by Acme\n"]));
  const hits = scan(tree(files), ["Acme"]);
  assert.equal(hits.length, exts.length);
  for (const hit of hits) assert.equal(hit.line, 2);
});

test("ignores other file types", () => {
  assert.deepEqual(scan(tree({ "f.txt": "Acme", "f.svg": "Acme" }), ["Acme"]), []);
});

test("matches case-insensitively", () => {
  assert.equal(scan(tree({ "a.md": "ACME\nacme" }), ["Acme"]).length, 2);
});

test("matches a multi-word phrase, including across extra spaces", () => {
  const root = tree({ "a.md": "Widget Co\nWidget   co\nWidget alone" });
  assert.deepEqual(
    scan(root, ["Widget Co"]).map((h) => h.line),
    [1, 2],
  );
});

test("matches a phrase wrapped across a line break", () => {
  const root = tree({ "a.md": "made for Widget\nCo last year" });
  assert.deepEqual(scan(root, ["Widget Co"]), [{ file: "a.md", line: 1, term: "Widget Co" }]);
});

test("reports a line once per term", () => {
  assert.equal(scan(tree({ "a.md": "Acme and Acme" }), ["Acme"]).length, 1);
});

test("does not match inside a longer word", () => {
  const root = tree({ "a.md": "Acmeville, preAcme, Acme_x, Acme2" });
  assert.deepEqual(scan(root, ["Acme"]), []);
});

test("matches next to punctuation", () => {
  const root = tree({ "a.md": "(Acme),\nAcme's\n\"Acme\"." });
  assert.equal(scan(root, ["Acme"]).length, 3);
});

test("treats regex characters in terms literally", () => {
  const root = tree({ "a.md": "AT&T\nC++\na.b" });
  assert.equal(scan(root, ["AT&T", "C++", "a.b"]).length, 3);
  assert.deepEqual(scan(tree({ "a.md": "axb" }), ["a.b"]), []);
});

test("scans nested folders", () => {
  const root = tree({ "content/case-studies/x.mdx": "Acme" });
  assert.equal(scan(root, ["Acme"])[0].file, join("content", "case-studies", "x.mdx"));
});

test("skips the résumé page only", () => {
  const root = tree({
    "pages/resume.mdx": "Acme",
    "pages/resume.astro": "Acme",
    "pages/resume-notes.md": "Acme",
    "content/resume.md": "Acme",
  });
  assert.deepEqual(
    scan(root, ["Acme"]).map((h) => h.file).sort(),
    [join("content", "resume.md"), join("pages", "resume-notes.md")],
  );
});

test("CLI prints file:line and the term, then exits 1", () => {
  const result = run({ BLOCKED_TERMS: "Acme" }, tree({ "notes/a.md": "one\nAcme two" }));
  assert.equal(result.status, 1);
  assert.match(result.stderr, /notes[\\/]a\.md:2: "Acme"/);
});
