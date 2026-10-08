# Jbur-Site

Jeremy Burris's personal site. Astro, fully static, deployed to Cloudflare Workers.

- Design spec: `docs/superpowers/specs/2026-10-07-personal-site-design-spec.md`
- Build plan: `docs/superpowers/plans/2026-10-08-personal-site-build-plan.md`

## Commands

Requires Node 22.18 or newer (see `.node-version`).

| Command | What it does |
|---|---|
| `npm ci` | Install dependencies |
| `npm run dev` | Local preview with live reload at http://localhost:4321 |
| `npm test` | Run the unit tests |
| `npm run build` | Blocked-terms check, tests, type check, then build to `dist/` |

## Blocked terms

`npm run build` fails unless `BLOCKED_TERMS` is set. Copy `.env.example` to `.env` and list, comma-separated, every client, system, team, coworker and employer name that must never appear on the site. `.env` is git-ignored; never commit the list. On Cloudflare it is a build secret.
