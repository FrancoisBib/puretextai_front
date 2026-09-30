# PureText AI — Studio

Front-end for **PureText AI**, a French-language writing-assistant web app, ported from a
Claude design-canvas prototype (`PureText AI.dc.html`) to a real Next.js app. Three
routes ship today:

- `/studio` — the app: five tools (Correction, Humanisation, Vérification, Lisibilité,
  Compteur) plus Historique and Profil.
- `/tarifs` — the public pricing page.
- `/connexion` — sign-in / sign-up.

There is no backend yet. Every "AI" feature (grammar fixes, humanization, AI-likelihood
and plagiarism detection, readability scoring, word counting) runs as deterministic mock
logic over small local data tables, and accounts and plans are mocked the same way — see
[`CLAUDE.md`](./CLAUDE.md) for where that logic lives and how to swap it for a real API
later.

## Stack

- [Next.js](https://nextjs.org) (App Router) + TypeScript
- React 19
- [Tailwind CSS v4](https://tailwindcss.com) (design tokens in `app/globals.css`)
- [Zustand](https://zustand.docs.pmnd.rs) for app state
- [pnpm](https://pnpm.io) as the package manager

## Getting started

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) — it redirects to `/studio`.

The layout has two breakpoints, at 1023px and 760px, both ported from the design; check
changes at desktop, tablet and phone widths.

Other scripts:

```bash
pnpm build   # production build
pnpm start   # run the production build
pnpm lint    # ESLint
```

## Project structure

```
app/                    Next.js routes (App Router)
  layout.tsx             root layout: fonts, default SEO metadata, lang="fr"
  sitemap.ts / robots.ts  project-wide SEO plumbing
  studio/page.tsx         the Studio app screen (noindex — it's behind login)
  tarifs/page.tsx         the public pricing page (indexable)
  connexion/page.tsx      sign-in / sign-up (noindex, no app header)
components/
  ui/                     shared design-system primitives (Button, Card, Popover, ...)
  studio/                 the Studio app itself, one folder per tab/feature
    mobile/                the responsive layout pieces shared by every tab
  auth/ pricing/          the two public screens
  system/                 app-wide client behaviour (overlay scrollbars)
lib/
  store/                  Zustand store (studio-store.ts) + per-tab derived-view selectors
  engines/                pure, framework-free "AI" mock engines (grammar, humanize,
                           verify, readability, count, plan, language detection)
  hooks/ text/ utils/     shared helpers
```

## SEO

`/studio` and `/connexion` are marked `noindex`; `/tarifs` is public and listed in the
sitemap. Root-level SEO plumbing (metadata defaults, `sitemap.ts`, `robots.ts`,
`lang="fr"`) is in place so further public/marketing pages inherit good foundations —
see `app/layout.tsx`, `app/sitemap.ts`, `app/robots.ts`.

## Design fidelity

The visual design (colors, spacing, radii, shadows, copy) is ported to the letter from
the `PureText AI.dc.html` design project on claude.ai. When extending this app, match the
source values exactly rather than approximating them — see `CLAUDE.md` for the link to
the design and the rest of the rules.
