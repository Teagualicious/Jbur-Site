// Rows for the home page's "Systems I've built" table (spec 5.1 and 6).
// Pure functions over case-study data, so they run under node:test.

export type Status = "Live" | "Pilot" | "In progress" | "Retired";
export type Steps = { total: number; people: number };

export interface SystemInput {
  id: string;
  data: {
    title: string;
    summary: string;
    status: Status;
    launched: Date;
    replaced?: string;
    steps?: Steps;
  };
}

export interface SystemRow {
  id: string;
  title: string;
  summary: string;
  replaced: string;
  status: Status;
  since: number;
  steps?: Steps;
}

/** Case studies with a "replaced" line, Live first, then newest launch first. */
export function systemRows(entries: SystemInput[]): SystemRow[] {
  return entries
    .filter((e) => e.data.replaced)
    .sort(
      (a, b) =>
        Number(b.data.status === "Live") - Number(a.data.status === "Live") ||
        b.data.launched.valueOf() - a.data.launched.valueOf(),
    )
    .map(({ id, data }) => ({
      id,
      title: data.title,
      summary: data.summary,
      replaced: data.replaced as string,
      status: data.status,
      since: data.launched.getUTCFullYear(),
      steps: data.steps,
    }));
}

/** "2 by people · 7 automated" */
export function stepCaption({ total, people }: Steps): string {
  return `${people} by people · ${total - people} automated`;
}

/** Screen-reader label for the dot strip. */
export function stepLabel({ total, people }: Steps): string {
  return `${total} steps: ${people} done by people, ${total - people} automated`;
}
