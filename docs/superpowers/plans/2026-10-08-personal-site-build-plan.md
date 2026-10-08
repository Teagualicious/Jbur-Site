# Personal site: build plan

- **Date:** 2026-10-08
- **Spec:** `docs/superpowers/specs/2026-10-07-personal-site-design-spec.md` (approved 2026-10-08)
- **Status:** Ready to start

Each step below is one pull request. A step is done when its "Done when" checks pass on a clean checkout. Steps marked **Jeremy** need something only Jeremy can do or supply.

## Versions (checked 2026-10-08)

| Package | Pin | Note |
|---|---|---|
| Node | 22 (≥ 22.18) | Astro needs ≥ 22.12. Node 22.18+ runs `.ts` tests without flags (checked on 22.22). |
| `astro` | `^7.3.7` | Content layer: `glob` from `astro/loaders`, `z` from `astro/zod` (Zod 4). |
| `@astrojs/mdx` | `^8.0.3` | |
| `@astrojs/sitemap` | `^3.7.4` | |
| `@astrojs/preact` | `^6.0.6` | |
| `preact` | `^10` | **Not 11.** The integration's peer range is `^10.6.5`. |
| `@astrojs/check`, `typescript` | `^0.9.10`, `^6` | **Not TypeScript 7.** `@astrojs/check` supports TS 5 and 6 only. |
| `@fontsource-variable/instrument-sans`, `@fontsource-variable/jetbrains-mono` | `^5.3.0` | |
| `wrangler` | `^4` | Dev dependency, so the deploy command uses the pinned version. |

## One change from the spec

The spec's build chain is terms check → tests → `astro build`. Astro's build doesn't type-check, and Node strips types without checking them. So "TypeScript strict" would go unenforced. The plan adds `astro check` to the chain:

```
"build": "node --env-file-if-exists=.env scripts/check-terms.mjs && npm test && astro check && astro build"
```

## Step 0: before the build (**Jeremy**)

1. Make `Teagualicious/Jbur-Site` private (Settings → General → Danger Zone → Change visibility). Spec 8.5.
2. Create or confirm a Cloudflare account, with the main domain already on it.
3. Write the blocked-terms list. Keep it in a password manager, not in a file in the repo. Step 2 needs it.

Steps 1–9 can begin while 0.2 is pending. Only Step 10 needs Cloudflare.

## Step 1: scaffold

Files: `package.json`, `package-lock.json`, `.node-version`, `.gitignore`, `.env.example`, `tsconfig.json`, `astro.config.mjs`, `wrangler.jsonc`, `src/pages/index.astro` (placeholder), `public/favicon.svg`.

- `package.json` scripts: `dev`, `test` (`node --test "src/**/*.test.ts" "scripts/**/*.test.mjs"`), `build` (above).
- `tsconfig.json` extends `astro/tsconfigs/strict` and adds `allowImportingTsExtensions` and `erasableSyntaxOnly`. With `erasableSyntaxOnly`, `astro check` rejects enums and parameter properties, so the spec 7.1 rule is enforced, not just written down. `jsxImportSource: "preact"`.
- `astro.config.mjs`: `output: "static"`, `site` set to a placeholder until the domain is attached, integrations `mdx()`, `sitemap()`, `preact()`.
- `wrangler.jsonc` exactly as spec section 10.

**Done when:** `npm ci && npm run dev` serves the placeholder, and `npm run build` writes `dist/` with `BLOCKED_TERMS=placeholder` set.

## Step 2: blocked-terms check (test first)

Files: `scripts/check-terms.mjs`, `scripts/check-terms.test.mjs`.

Write the tests first, against a temp directory:

- Missing or empty `BLOCKED_TERMS` → exit 1.
- A whole-word match in each scanned extension → exit 1 and prints `file:line: "term"`.
- Case-insensitive match; a multi-word phrase match.
- A substring inside a longer word doesn't match (`Acme` doesn't hit `Acmeville`).
- `src/pages/resume.mdx` is skipped.
- A clean tree → exit 0.

Then implement it to spec 8.1. Export the scan function so the tests call it directly, and keep the CLI wrapper thin.

**Done when:** tests pass, and `npm run build` fails with no `.env`, and passes with one.

## Step 3: content model

Files: `src/content.config.ts`, `src/lib/content.ts`, `src/data/site.json`, `src/data/projects.json`, one `draft: true` sample in each collection.

- Schemas exactly as spec section 6, including the `steps` refine (`0 ≤ people ≤ total`) and the required `basis` on `outcome`.
- `src/lib/content.ts` exports `published(collection)`, which returns everything in dev and filters drafts when `import.meta.env.PROD`, sorted newest first. Every page uses this and never calls `getCollection` directly, so drafts can't leak through one page that forgot the filter.
- `site.json` gets placeholders for the fields Jeremy supplies later (spec 15).

**Done when:** removing `date` from a sample field log, an outcome without `basis`, or `steps.people > steps.total` each fail `npm run build` (check by hand, then revert).

## Step 4: design system and base layout

Files: `src/styles/global.css`, `src/layouts/Base.astro`, `src/components/{Header,Footer,Seo}.astro`, `src/pages/404.astro`.

- Tokens from spec 9.3 as CSS custom properties, light by default, dark under `prefers-color-scheme: dark`. Type scale 9.2, spacing and layout 9.1.
- Fonts imported once in `Base.astro`, Latin subset only.
- `Header`: name plus nav. Below 760 px the nav becomes a `<details>` menu.
- `Footer`: name plus contact links from `site.json`.
- `Seo`: title, description, canonical, Open Graph and Twitter tags, default `og.png`.
- Skip link, 2 px focus ring, `prefers-reduced-motion` reset.

**Done when:** the 404 page renders correctly in light and dark at 390 px and 1280 px, with no horizontal scroll, and the menu works with JavaScript disabled.

## Step 5: home page

Files: `src/pages/index.astro`, `src/components/{ContactCard,SystemsTable,LogList,FeaturedDemo}.astro`, `src/lib/systems.ts`, `src/lib/systems.test.ts`.

- `src/lib/systems.ts` holds the logic as pure functions, tested: which case studies are rows (`replaced` set), their order (Live first, then `launched`, newest first), the "Since" year, and the step caption ("2 by people · 7 automated").
- Layout order and phone order exactly as spec 5.1. `FeaturedDemo` renders a placeholder until Step 8.
- JSON-LD `Person` (spec 10) goes in the home page head.
- The Writing section is hidden when it has no published entries.

**Done when:** the first screen at 390 px shows the claim, meta line, and full contact card. That is spec success criterion 1, checked in a 390 × 844 viewport.

## Step 6: remaining pages

Files: `src/layouts/Entry.astro`, `src/pages/case-studies/{index,[slug]}.astro`, `src/pages/field-logs/{index,[slug]}.astro`, `src/pages/writing/{index,[slug]}.astro`, `src/pages/projects.astro`, `src/pages/how-i-work.mdx`, `src/pages/resume.mdx`, `public/robots.txt`.

- Case study page per spec 5.2, including the related field logs found by `related`.
- Dates shown as "Oct 2, 2026" with tabular figures, using one shared formatter.
- `how-i-work.mdx` and `resume.mdx` get placeholder text, which Step 11 replaces.

**Done when:** every URL in spec section 5 builds, `dist/sitemap-index.xml` lists them, drafts are absent from `dist/`, and `dist/` contains no `<script>` outside demo islands. Check that last one with `grep`.

## Step 7: demo kit

Files: `src/demos/kit/{random.ts,random.test.ts,DemoFrame.tsx,RunLog.tsx,DataTable.tsx,Kpis.tsx,kit.css}`.

- Only the pieces spec 7.2 lists for the first demo. `EmailPreview`, `Chart`, and the controls wait for a demo that needs them.
- `random.ts`: a seeded PRNG (mulberry32), tested to give the same sequence for the same seed.
- `DemoFrame`: the label "Demo · made-up data · v{version} · {Mon YYYY}", plus Run all, Step, and Reset.
- `RunLog`: 150–200 ms reveal, instant under reduced motion. Lines go in an `aria-live="polite"` region.
- Container queries in `kit.css`; 44 px targets.

**Done when:** a throwaway test demo hydrates with `client:visible`, its JavaScript only loads when scrolled into view (check the network panel), and without JavaScript it shows the starting state.

## Step 8: first demo, sponsorship tracker sync

Files: `src/demos/sponsorship-tracker/{data.ts,logic.ts,logic.test.ts,Demo.tsx}`, and `FeaturedDemo.astro` imports it.

- `data.ts`: two seeded exports, 48 rows in total, against invented advertisers and open tracker lines. All names are made up and checked against the blocked-terms list.
- `logic.ts`: pure steps (collect → merge → match → flag → wait for approval → update tracker). Each returns its output plus a run-log line.
- Tests cover a clean run, a misspelled advertiser landing in review instead of being guessed, an approval applying only the approved rows, and Reset restoring the seed.
- Jeremy confirms the rules match the launched version (spec 7: "frozen at the version that launched").

**Done when:** the full flow works by mouse, keyboard, and touch at 390 px, `npm test` covers the rules, and the demo appears on the home page under the systems table.

## Step 9: case study template

File: `docs/templates/case-study.mdx`, with the frontmatter skeleton, the eight headings from spec 5.3, and the pre-publish checklist from 8.4 in an HTML comment.

**Done when:** copying it into `src/content/case-studies/`, then filling in the frontmatter, builds.

## Step 10: Cloudflare deploy (**Jeremy** for account steps)

1. Workers & Pages → Create → Import a repository → `Teagualicious/Jbur-Site`.
2. Build command `npm run build`. Deploy command `npx wrangler deploy`. Non-production branch deploy command `npx wrangler versions upload`. Production branch `main`.
3. Build variable `BLOCKED_TERMS`, as a secret.
4. Turn on preview URLs.

**Done when:**
- A push to `main` goes live on `*.workers.dev`.
- A branch push gets a preview URL.
- A push with a blocked term in a field log fails the build, and the live site doesn't change. This is the spec's core safeguard, so test it on purpose.

## Step 11: launch content (Claude drafts, Jeremy edits)

From the Notion records (spec 14): the bio and Now line, How I work, the sponsorship case study, three field logs, and `projects.json`. Each piece goes up as `draft: true` in its own pull request and gets reviewed on its preview URL before the draft flag comes off.

**Jeremy:** LinkedIn URL, availability wording, `resume.pdf`, `og.png` approval, and the employer-policy check (spec 8.5).

## Step 12: verification and launch

1. Spec section 12 pre-launch checks: a real phone, a keyboard-only pass, Lighthouse mobile (Accessibility 100, Performance ≥ 90) on the home page and the first case study, and a design critique.
2. Launch-gate checklist (spec 11), ticked item by item in the launch pull request description.
3. **Jeremy:** attach the main domain to the Worker, set up the `www` and extra-domain redirects, set up Email Routing for `hello@`, and turn on Web Analytics.
4. Update `site` in `astro.config.mjs` to the real domain so canonical URLs and the sitemap are correct.
5. Send a test email to `hello@` and get a reply back.
