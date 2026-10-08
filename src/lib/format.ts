// Shared display formatting. Dates in frontmatter are parsed as UTC midnight,
// so format in UTC or a date can slip back a day in the Americas.

const dateFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
  timeZone: "UTC",
});

/** "Oct 2, 2026" */
export function formatDate(date: Date): string {
  return dateFormat.format(date);
}

/** "2026-10-02", for <time datetime>. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** The first paragraph of a Markdown body as plain text, cut at a word boundary. */
export function excerpt(markdown: string, max = 200): string {
  const paragraph =
    markdown
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .find((p) => p && !/^(#|import |export |<|```|[-*] |\d+\. )/.test(p)) ?? "";
  const text = paragraph
    .replace(/!\[[^\]]*\]\([^)]*\)/g, "")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/[*_`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length <= max) return text;
  return `${text.slice(0, text.lastIndexOf(" ", max)).replace(/[,;:.]$/, "")}…`;
}
