// Fails the build if any blocked term (client, system, team, coworker or
// employer name) appears in site source. The list comes from BLOCKED_TERMS
// and is never committed. See spec section 8.1.
import { readdirSync, readFileSync } from "node:fs";
import { extname, join, relative, sep } from "node:path";
import { pathToFileURL } from "node:url";

const EXTENSIONS = new Set([".md", ".mdx", ".ts", ".tsx", ".astro", ".json", ".css"]);
// The résumé is meant to name the employer.
const SKIP = /^pages\/resume\.[^/]+$/;

export function parseTerms(raw) {
  return (raw ?? "").split(",").map((t) => t.trim()).filter(Boolean);
}

function pattern(term) {
  const body = term
    .split(/\s+/)
    .map((word) => word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("\\s+");
  // Whole word or phrase: no letter, digit or underscore on either side.
  return new RegExp(`(?<![\\p{L}\\p{N}_])${body}(?![\\p{L}\\p{N}_])`, "giu");
}

export function scan(root, terms) {
  const patterns = terms.map((term) => [term, pattern(term)]);
  const hits = [];
  for (const entry of readdirSync(root, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile() || !EXTENSIONS.has(extname(entry.name))) continue;
    const full = join(entry.parentPath, entry.name);
    const file = relative(root, full);
    if (SKIP.test(file.split(sep).join("/"))) continue;
    // Match against the whole file so a phrase wrapped across lines is caught.
    const text = readFileSync(full, "utf8");
    for (const [term, re] of patterns) {
      const lines = new Set();
      for (const m of text.matchAll(re)) lines.add(text.slice(0, m.index).split("\n").length);
      for (const line of lines) hits.push({ file, line, term });
    }
  }
  return hits.sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
}

function main(root = "src") {
  const terms = parseTerms(process.env.BLOCKED_TERMS);
  if (terms.length === 0) {
    console.error("check-terms: BLOCKED_TERMS is missing or empty. Set it in .env (local) or as a build secret (Cloudflare).");
    return 1;
  }
  const hits = scan(root, terms);
  for (const { file, line, term } of hits) console.error(`${join(root, file)}:${line}: "${term}"`);
  if (hits.length > 0) {
    console.error(`check-terms: ${hits.length} blocked term(s) found. Nothing was built.`);
    return 1;
  }
  console.log(`check-terms: ${terms.length} term(s), no matches.`);
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv[2]);
}
