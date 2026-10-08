// The only way pages read collections. Drafts show in `npm run dev` and never
// reach a production build, so no page can forget the filter.
import { getCollection, getEntry, type CollectionEntry, type CollectionKey } from "astro:content";

const visible = (data: { draft: boolean }) => import.meta.env.DEV || !data.draft;

export async function published<C extends CollectionKey>(collection: C): Promise<CollectionEntry<C>[]> {
  const entries = ((await getCollection(collection)) as CollectionEntry<C>[]).filter((e) => visible(e.data));
  await checkRelated(entries);
  return entries.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

// Astro only logs a dangling reference, so a field log could quietly point at a
// renamed case study, or at a draft that 404s in production. Fail instead.
async function checkRelated(entries: CollectionEntry<CollectionKey>[]): Promise<void> {
  for (const entry of entries) {
    if (!("related" in entry.data) || !entry.data.related) continue;
    const target = await getEntry(entry.data.related);
    if (!target || !visible(target.data)) {
      throw new Error(
        `${entry.collection}/${entry.id}: "related" points at case-studies/${entry.data.related.id}, which is missing or a draft.`,
      );
    }
  }
}
