# Personal site: design spec

- **Date:** 2026-10-07
- **Owner:** Jeremy Burris
- **Status:** Draft for owner review
- **Repo:** `Teagualicious/Jbur-Site` (to be made private)
- **Visual reference:** `docs/design/site-directions.html`. Direction B is the base, and the demos use direction C's run log.

## 1. Purpose

This is a public site for recruiters and hiring managers hiring for forward-deployed, applied-AI, and automation engineering roles. It should show, quickly and with evidence, that Jeremy already does full-time-level work:

- He finds the real bottleneck.
- He maps workflows nobody wrote down.
- He builds automations that create capacity without changing how people work.

Case studies carry the full stories. Field logs carry short, dated notes on single decisions. Interactive demos let a visitor use a scrubbed version of what he built.

Most visitors arrive from LinkedIn or a résumé link, often on a phone, and give the page 30 to 90 seconds.

## 2. Success criteria

1. Within the first screen, on desktop and on a 390 px phone, a visitor sees:
   - who Jeremy is,
   - the one-line claim, and
   - every contact method: email, LinkedIn, résumé PDF, GitHub, and availability.
2. Within one scroll of the home page, a visitor sees what he has built, what each system replaced, and a working demo.
3. No client name, internal system name, coworker name, or employer branding appears anywhere outside the résumé. A build that contains one fails.
4. Every outcome figure on the site says whether it is measured, estimated, or illustrative.
5. Publishing a new field log takes one Markdown file and one push.
6. Hosting costs nothing beyond the domain renewal.

## 3. Scope

**In v1:**

- Home
- Case studies (index and entries)
- Field logs (index and entries)
- Writing (index and entries)
- Projects
- How I work
- Résumé (page and PDF)
- 404 page, sitemap, robots.txt
- Interactive demos inside case studies, with one featured on the home page
- The anonymity safeguards
- Cloudflare deployment with preview builds
- Cookieless analytics
- Domain email forwarding

**Not in v1** (each line says when to add it):

| Feature | Add when |
|---|---|
| Tag pages | There are about 20 field logs |
| RSS feed | Someone asks to subscribe |
| Light/dark toggle | Someone wants to override the OS setting |
| Contact form | The email link proves insufficient |
| Notion sync | Writing in Markdown becomes the bottleneck |
| Generated per-page social images | A shared link needs its own image |
| Site search | There are about 50 entries |
| Python running in the browser (Pyodide) | A demo genuinely needs it |

## 4. Architecture

| Concern | Choice |
|---|---|
| Framework | Astro, static output, TypeScript strict |
| Integrations | `@astrojs/mdx`, `@astrojs/sitemap`, `@astrojs/preact` (nothing else) |
| Interactive demos | Preact + TypeScript islands, `client:visible` |
| Styling | Plain CSS: one global stylesheet with tokens, plus styles scoped to each component. No CSS framework. |
| Fonts | Instrument Sans (variable) and JetBrains Mono, self-hosted via `@fontsource` packages (Latin subset) |
| Hosting | Cloudflare Workers with static assets, built by Workers Builds from the GitHub repo |
| Node | 22 LTS, pinned in `.node-version` |

The site has no server code, no database, and no third-party scripts beyond Cloudflare's cookieless analytics beacon. Pages ship no JavaScript except the demo islands, and those load only when scrolled into view.

**Commands** (npm scripts, so the same command works on Windows):

- `npm run dev`: local preview with live reload. Drafts are visible.
- `npm test`: runs `node --test` on the demo logic and the term checker.
- `npm run build`: blocked-terms check, then `npm test`, then `astro build`. Any failure stops the build.

## 5. Pages and URLs

The navigation uses sentence case, in this order: Case studies · Field logs · Writing · Projects · How I work · Résumé.

| URL | Content |
|---|---|
| `/` | Home (section 5.1) |
| `/case-studies/`, `/case-studies/<slug>/` | Case study index (newest first) and entries |
| `/field-logs/`, `/field-logs/<slug>/` | Field log index (newest first) and entries |
| `/writing/`, `/writing/<slug>/` | Essays |
| `/projects/` | Side projects from `src/data/projects.json` |
| `/how-i-work/` | Operating philosophy and how impact is measured |
| `/resume/`, `/resume.pdf` | Short page version and Jeremy's PDF |
| `/404` | Not-found page, served for any missing path |

On phones, the menu is a native `<details>` disclosure, which needs no JavaScript.

### 5.1 Home, top to bottom

1. **Header:** name on the left, nav on the right.
2. **Intro.** On desktop it is two columns: the claim on the left, the contact card on the right. On phones it is one column in this order: claim, meta line, contact card, bio, Now line.
   - **Claim (H1):** "I find the bottleneck in a team's workflow and automate it without changing how they work."
   - **Meta line:** "Performance analytics at a Fortune 500 media company · Economics at UNC Charlotte"
   - **Contact card, titled "Get in touch":**
     - Email, shown as plain text that can be copied
     - LinkedIn
     - Résumé PDF
     - GitHub
     - Status: availability and location
     - A full-width "Email me" button, the page's only primary action
   - **Bio:** about 60 words.
   - **Now line:** what he is working on now.
3. **Systems I've built.** A table built from case-study frontmatter. Columns:
   - System (linked name and a one-line description)
   - What it replaced
   - Steps today (dot strip plus a caption such as "2 by people · 7 automated")
   - Status
   - Since

   Below 760 px, each row stacks into a block. A caption explains the dots.
4. **Try a demo.** The featured demo, placed directly under the table. `src/components/FeaturedDemo.astro` imports that one demo explicitly. Changing the featured demo means editing that one import.
5. **Field logs:** the latest three.
6. **Writing:** the latest two essays. The section is hidden when there are none.
7. **Footer:** name and the contact links again.

### 5.2 Case study page

The page shows:

- Title and summary.
- A meta block: status, tools, period, launch date, role, and context.
- An outcome line with its basis label, when the case study has an outcome.
- The MDX body.
- The demo, placed by the author, usually after "What I built".
- At the end, the field logs whose `related` field points to this case study.

### 5.3 Case study template

New case studies start from `docs/templates/case-study.mdx`. Its headings come from the Sept 18 Career Branding notes:

1. The ask
2. What was actually wrong
3. How I found out
4. Options and the call
5. What I built
6. What stayed familiar, what went away, what people had to learn
7. Result
8. What I'd change

The template ends with an HTML comment holding the pre-publish checklist (section 8.4).

## 6. Content model

Collections are defined in `src/content.config.ts` with zod schemas. A schema violation fails the build. Entries with `draft: true` render in `npm run dev` and are excluded from production builds.

**`case-studies`** (`src/content/case-studies/*.mdx`):

```ts
{
  title: string,
  summary: string,              // ≤ 280 chars; used on cards and as the meta description
  date: Date,                   // published
  launched: Date,               // when the real product shipped
  period: string,               // e.g. "Jul–Sep 2026"
  context: string,              // "Fortune 500 media company" or "Personal project"
  role: string,                 // what Jeremy owned, one line
  status: "Live" | "Pilot" | "In progress" | "Retired",
  tools: string[],
  replaced?: string,            // "What it replaced" column
  steps?: { total: number, people: number },   // refine: 0 ≤ people ≤ total
  outcome?: { text: string, basis: "measured" | "estimated" | "illustrative" },
  draft: boolean = false,
}
```

The home page's Systems table lists every published case study that has `replaced` set. Live rows come first, then rows by `launched`, newest first. "Since" is the year of `launched`. The step caption is computed from `steps`. Personal projects without `replaced` don't appear in the table; they show up under Case studies and Projects.

**`field-logs`** (`src/content/field-logs/*.md`). Aim for 150 to 500 words. The length isn't enforced.

```ts
{ title: string, date: Date, tags: string[], related?: reference("case-studies"), draft: boolean = false }
```

**`writing`** (`src/content/writing/*.mdx`):

```ts
{ title: string, summary: string, date: Date, updated?: Date, draft: boolean = false }
```

**Data files:**

- `src/data/site.json`: name, email, linkedin, github, resumePdf, availability, location, now. Every contact detail lives here, once.
- `src/data/projects.json`: an array of `{ name, blurb, status, stack[], repo, link? }`.

Dates are shown as "Oct 2, 2026" with tabular figures. Monospace type appears only inside demos and code.

## 7. Interactive demos

Each work case study gets a demo version of the product. Each demo:

- is frozen at the version that launched, and labeled with that version and launch date;
- carries no employer branding or design language;
- runs entirely on made-up data.

For Power Automate projects, TypeScript stands in for the flow and runs its steps visibly.

### 7.1 Files

```
src/demos/<id>/data.ts         seeded synthetic data (same output every run)
src/demos/<id>/logic.ts        the product's rules as pure functions: input → steps and outputs
src/demos/<id>/logic.test.ts   node:test assertions on the rules
src/demos/<id>/Demo.tsx        the Preact interface, built from the kit
src/demos/kit/                 shared pieces (below)
```

`logic.ts` uses only TypeScript syntax that Node can strip: no enums and no parameter properties. That way `node --test` runs it directly, with no build step.

### 7.2 Kit

The kit grows only when a demo needs a new piece.

The first demo needs:

- `random.ts`: a seeded PRNG of about six lines.
- `DemoFrame`: the title, the label "Demo · made-up data · v{version} · {Mon YYYY}", and the Run all, Step, and Reset buttons.
- `RunLog`: one timestamped line per step with a status column. The step waiting on a person gets the highlighter mark.
- `DataTable`: optionally editable cells. On phones, low-priority columns hide (marked per column).
- `Kpis`: at most three tiles.

Later demos add `EmailPreview`, `Chart` (SVG line or bar), and the native range and select controls.

### 7.3 Behavior

- **Islands** hydrate with `client:visible`.
- **Without JavaScript**, the server-rendered starting state shows as a static picture.
- **Run all** reveals the run-log lines one at a time, 150 to 200 ms apart. This is the site's one animated moment. With `prefers-reduced-motion`, they appear at once.
- **Editing.** Visitors can edit the inputs, for example rename an advertiser, and run again. Reset restores the seeded data.
- **Layout.** The kit uses container queries, so a demo fits both the home page's full width and a case study's text column. Everything works at 390 px with 44 px touch targets.

### 7.4 First demo: sponsorship tracker sync

This is the anonymized version of the live sponsorship automation. A visitor sees:

- this week's two made-up export files (48 rows);
- Run all, which collects, merges, matches against open tracker lines, flags rows that need a person, and then waits;
- after an approval click, the tracker update.

Renaming an advertiser and running again makes that row land in review instead of being guessed.

## 8. Anonymity safeguards

### 8.1 Blocked-terms check

`scripts/check-terms.mjs`, about 30 lines, with one test file. It:

- Reads `BLOCKED_TERMS`, a comma-separated list. **If the variable is missing or empty, the check fails**, so it can't silently switch off.
- Scans every text file under `src/` (`.md .mdx .ts .tsx .astro .json .css`) except `src/pages/resume.*`, since the résumé is meant to name the employer.
- Matches each term case-insensitively, as a whole word or phrase.
- On a hit, prints `file:line: "term"` and exits 1.

The list itself is never committed:

- **On Cloudflare:** a Workers Builds build secret.
- **Locally:** a git-ignored `.env`, loaded by `node --env-file-if-exists=.env`.
- **In the repo:** `.env.example`, which documents the variable name with an empty value.

The list starts with client names, internal system and tool names, team names, coworker names, and the employer's name and brand terms.

### 8.2 Data and images

- Demo data is invented and seeded. It is never derived from real exports.
- No screenshots of real systems.
- The check can't read images, so any image added to content gets checked by eye (8.4).

### 8.3 Figures

- An outcome line can't be published without its basis label. The schema enforces this.
- The reported "4,000+ hours across 83 employees" stays off the site until the How I Work page documents:
  - its time period,
  - its calculation method,
  - which projects it covers, and
  - what the 83 means.

### 8.4 Pre-publish checklist (in the case-study template)

- No client, system, team, or coworker names. The build check also catches these.
- Every figure is labeled measured, estimated, or illustrative.
- The demo runs only on made-up data and carries no employer styling.
- Images are checked by eye.
- Inherited processes are described diplomatically.

### 8.5 Repository and policy

- The repo is private, so drafts and history stay private.
- Before the first work case study goes live, Jeremy confirms the employer's policy on publishing work, or gets his director's OK.

## 9. Visual design

### 9.1 Layout

- Maximum width 1200 px. Side padding is 16 px on phones and 40 px on desktop.
- One breakpoint at 760 px, done with media queries for page layout and container queries inside demos.
- Spacing steps: 4, 8, 12, 16, 24, 32, 48, 64, 80.
- Section gap: 64 px on phones, 80 px on desktop.
- Prose is capped at 32em, about 68 characters per line.
- One corner radius (4 px), 1 px borders, no shadows.

### 9.2 Type

Instrument Sans for everything. JetBrains Mono only inside demos and code.

| Role | Size / line height / weight |
|---|---|
| H1 claim | 30 px phone, 38 px desktop / 1.15 / 600, letter-spacing −0.015em |
| H2 | 24 / 1.25 / 600 |
| H3 | 20 / 1.35 / 600 |
| Body | 17 / 1.6 / 400 |
| Small | 15 / 1.5 |
| Label | 14 phone, 13 desktop / 1.4 |
| KPI value | 28 / 1.1 / 600, tabular figures |

### 9.3 Color

The theme follows the OS setting. All pairs below were checked against WCAG AA:

- text ≥ 12.9:1
- muted ≥ 5.6:1
- accent ≥ 6.4:1
- controls ≥ 3:1

| Token | Light | Dark |
|---|---|---|
| bg | `#F3F5F4` | `#161B1A` |
| surface | `#FFFFFF` | `#1D2422` |
| soft (table headers) | `#E9EEEB` | `#232B29` |
| line | `#D3DAD6` | `#2E3835` |
| control (outlined borders) | `#86908B` | `#69766F` |
| text | `#14201B` | `#E4EAE7` |
| muted | `#526059` | `#A2AEA8` |
| accent (links, primary, automated, Live) | `#0D6B5B` | `#7CC1B0` |
| accent-ink (text on accent) | `#FFFFFF` | `#0F1715` |
| people (hollow dots) | `#6A6256` | `#C8C0B2` |
| warn (needs a person, demos only) | `#875A00` | `#E0B55E` |
| mark (run-log highlight) | `#F2DA74` | `#6E5507` |

**Semantic rules:**

- Amber means "needs a person" and appears only in demos.
- Status words other than Live use text color.
- Color never carries meaning alone. Statuses are words, and the dot strips use hollow versus filled shapes plus a caption.

### 9.4 Accessibility

This is the minimum standard:

- Skip link.
- Visible 2 px focus ring.
- 44 px targets on phones.
- One H1 per page, headings in order.
- Alt text on images.
- `prefers-reduced-motion` respected.
- Every demo control is reachable by keyboard and has an accessible name.

## 10. Build, deploy, and hosting

- **`wrangler.jsonc`:** `name: "jbur-site"`, `compatibility_date` set to the setup day, `assets.directory: "./dist"`, `assets.not_found_handling: "404-page"`.
- **Workers Builds:**
  - Connected to the private repo, with production branch `main`.
  - Build command `npm run build`, deploy command `npx wrangler deploy`.
  - Branches other than `main` get preview builds with preview URLs.
  - A failed build deploys nothing, and the live site keeps its last good version.
- **Build secret:** `BLOCKED_TERMS`.
- **Domains:**
  - The main domain is attached to the Worker at launch.
  - `www` and any other domains Jeremy owns 301-redirect to it through Cloudflare redirect rules.
  - Until launch, the site lives only at its `workers.dev` and preview URLs.
- **Email:** Cloudflare Email Routing forwards `hello@<main domain>` to Jeremy's Gmail.
- **Analytics:** Cloudflare Web Analytics is turned on for the custom domain at launch. It is cookieless and needs no consent banner.
- **Search and sharing:**
  - A title and description on every page, from frontmatter `summary` where one exists.
  - Canonical URLs.
  - Open Graph and Twitter tags with one default `public/og.png` (1200×630).
  - A sitemap.
  - `robots.txt` that allows all crawlers and links the sitemap.
  - JSON-LD `Person` on the home page: name, url, and sameAs (LinkedIn, GitHub), with no employer field.

## 11. Launch gate

The main domain is attached only when all of these are true:

1. The bio, How I work, the résumé page, and `resume.pdf` are in.
2. At least one case study is published with its demo. The first is the sponsorship tracker sync.
3. At least three field logs are published.
4. The employer-policy check is done (8.5).
5. `BLOCKED_TERMS` is set in Cloudflare and locally, and the check passes.
6. The domain email has been tested by sending and receiving.
7. The pre-launch checks in section 12 pass.

## 12. Verification

**Every build** runs three checks:

1. The blocked-terms check.
2. `node --test` (demo logic and the term checker).
3. Astro's schema validation.

**Before launch:**

- Check the home page and one case study on a real phone.
- Do a keyboard-only pass through the nav, the contact card, and the demo controls.
- Run Lighthouse in mobile mode on the home page and the first case study: Accessibility 100, Performance ≥ 90.
- Render the finished pages and run the design-standards critique.

## 13. Repository layout

```
astro.config.mjs        site URL, integrations
wrangler.jsonc
package.json            scripts: dev, test, build
.node-version           22
.env.example            BLOCKED_TERMS=
.gitignore              node_modules, dist, .env, .wrangler, .astro
public/                 robots.txt, og.png, favicon.svg, resume.pdf
scripts/                check-terms.mjs, check-terms.test.mjs
docs/templates/         case-study.mdx
docs/superpowers/specs/ this file
src/content.config.ts
src/content/            case-studies/, field-logs/, writing/
src/data/               site.json, projects.json
src/demos/              kit/, sponsorship-tracker/
src/components/         Header, Footer, ContactCard, SystemsTable, LogList, FeaturedDemo, Seo
src/layouts/            Base.astro, Entry.astro
src/pages/              index, case-studies/, field-logs/, writing/, projects, how-i-work.mdx, resume.mdx, 404
src/styles/global.css   tokens and base styles
```

## 14. Content for launch

Claude drafts each piece from the Notion records, and Jeremy edits and approves it:

- **Bio and How I work:** from the Career Branding page (Sept 18).
- **First case study and demo:** the sponsorship automation, Live, from its Notion context and handoff page.
- **Three field logs:** from the field-note themes in the Career Branding page, limited to things that actually happened.
- **Projects:** the FRED MCP server and any other public GitHub work.

## 15. Inputs needed from Jeremy before launch

These are decided at launch, not design decisions:

- The main domain and any other domains.
- His LinkedIn URL.
- The availability wording.
- The résumé PDF.
- The blocked-terms list.
- Push access to the repo for the build session, either through GitHub access for the session or by pushing from his machine.
