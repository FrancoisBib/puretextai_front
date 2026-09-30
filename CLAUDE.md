# CLAUDE.md

Guidance for Claude Code (or any future engineer) working in this repo.

## What this project is

A Next.js port of a Claude design-canvas prototype (`PureText AI.dc.html`) for
**PureText AI**, a French-language writing-assistant SaaS.

The app has three routes:

- `/studio` — the app itself: five tools (Correction, Humanisation, Vérification,
  Lisibilité, Compteur), two avatar-menu screens (Historique, Profil) and the global
  overlays (undo toast, extension panel, mobile module sheet, sign-up gate).
- `/tarifs` — the public Formules page. The only indexable page today.
- `/connexion` — sign-in / sign-up, rendered without the app header.

The original design used a custom Claude-authoring template syntax (`<x-dc>`, `{{ }}`
bindings, `sc-if`/`sc-for`, `onClick="{{ handler }}"`, `style-hover`/`style-focus`) with
all app logic embedded in one big script block. None of that syntax ships here — it has
been translated into idiomatic Next.js/React/TypeScript/Tailwind/Zustand.

## Where the design lives

The source of truth is the design project on claude.ai, **not** a file in this repo:

    https://claude.ai/design/p/701ade49-36e3-40de-b4ea-8dead73734f6?file=PureText+AI.dc.html

Read it with the `DesignSync` tool (`get_file`, `path: "PureText AI.dc.html"`). The file
splits cleanly in two:

- lines 1‑1367 — the markup: colours, spacing, layout, and the two `@media` blocks.
  The literal visual spec.
- lines 1368‑2688 — the `<script type="text/x-dc">` block: state, handlers, scoring
  formulas. The literal behavioural spec.

It also ships `ptscroll.js` (ported to `components/system/OverlayScrollbars.tsx`) and
`logo-puretext.png` (in `public/`). `support.js` is the design-canvas runtime and has no
counterpart here.

If you're extending or fixing a tab and something about its exact behaviour, copy, or a
threshold value is unclear from reading this codebase, go back to that file — it is the
ground truth for "what the design actually said". An earlier note in this file pointed at
`/tmp/pta_extract/`; that extraction is long gone.

## Design-fidelity rule

Inline style values in the design (hex colours, px values, radii, shadows) are the
literal design spec. When porting or extending UI, match those numbers exactly — don't
round `13.5px` to `14px`, don't swap a near-identical hex for a "close enough" Tailwind
default. Use Tailwind arbitrary-value syntax (`bg-[#049FDE]`, `text-[13.5px]`) where a
value doesn't already sit on Tailwind's default scale. Design tokens for values reused
across the app live in `app/globals.css`'s `@theme` block — prefer those tokens
(`bg-pt-accent`, etc.) over repeating raw hex codes once a token exists for a colour.

Note that `app/globals.css` keeps its element defaults inside `@layer base`. Unlayered
rules outrank Tailwind utilities, so an unlayered `a { color }` would beat a `text-white`
class on a link-styled button. Keep new element-level rules in that layer.

## Responsive: two breakpoints, Tailwind variants

The design has exactly two `@media` blocks, at **1023px** and **760px**. They are
expressed here as named Tailwind breakpoints in `@theme` (`--breakpoint-tab: 1024px`,
`--breakpoint-mob: 761px`), used as `max-tab:` and `max-mob:` — the design's CSS itself is
not copied in.

What each does:

- `max-tab:` — the two-column module layout collapses to one column and the sidebar
  stops being sticky.
- `max-mob:` — the header sheds its wordmark, tab nav and extensions button in favour of
  a module-picker button; the language list moves into the account menu; a Texte /
  Résultats segmented control chooses which half of the column to show; action bars pin
  to the bottom edge; popovers become bottom sheets.

Three pieces carry most of this and should be reused rather than re-implemented:
`components/studio/mobile/TabColumns.tsx` (the grid), `MobileTabs.tsx` and
`ActionBar.tsx`, plus `components/ui/mobile-sheet.ts` for the popover→sheet transform.

Two things to know before touching them:

- `mobileSheetClasses()` marks its geometry utilities `!important` **on purpose**. These
  surfaces are positioned at runtime with inline `left`/`top`/`width`, and an inline
  style otherwise beats a media query. The design does the same thing for the same
  reason. For the same reason `TabColumns` passes its grid template and sticky offset as
  CSS variables instead of inline `grid-template-columns` / `top`.
- `lib/hooks/use-autogrow-textareas.ts` sizes every `textarea[data-grow]` and the
  Correction mirror (`[data-growmirror]`). On phones it computes a minimum height from
  the viewport minus the rest of the card (`[data-editor-card]`) and minus any pinned
  bottom bar (`[data-fixed-bar]`). A new editor card needs all three attributes or its
  footer will end up underneath the action bar.

## No backend — mock engines by design

Every "AI" feature is deterministic, local mock logic over small hardcoded data tables —
this is intentional, not a shortcut to fix. It lives entirely under `lib/engines/`, split
by feature (`grammar/`, `humanize/`, `verify/`, `readability/`, `count/`, `plan/`,
`language/`). Each engine is a **pure function** (`(text: string, ...) => Result`) with
no React or Zustand import, so swapping in a real API later means replacing one
function's body without touching the store's action signatures or any UI component.

Two things must stay deterministic when you touch them:

- `lib/engines/verify/similarity.engine.ts`'s "similarity" source matching is a seeded
  hash of the input text, not `Math.random()` — the same text must always produce the
  same fake sources.
- Humanisation's `aiBefore` ("98 %") is a hardcoded string ported literally from the
  source, not computed — a deliberate product simplification in the original design, not
  a bug to silently fix. Making it dynamic is a product decision to confirm, not a
  cleanup.

The simulated latencies are the design's too: 1 300 ms for the Correction analysis,
1 500 ms for Humanisation, 1 200 ms for Lisibilité, 820 ms for the translation, and the
Vérification similarity scan's 90 ms × 7 % ticks.

## Accounts and plans are mocked too

`plan` (`free` | `studio`) and `signedIn` live in the store and start from
`DEFAULT_STUDIO_CONFIG`; `/tarifs` flips the plan, `/connexion` and the gate flip
`signedIn`. Nothing is persisted and there is no auth.

No tool is behind the paywall. What the free plan caps is **volume per run** (300 words
Correction, 300 Humanisation, 500 Vérification — see `lib/engines/plan/plan.engine.ts`),
plus the non-"Généraux" tone groups and the "Maximale" intensity, which show a STUDIO
badge and route to `/tarifs`. Without an account, the second run of Correction or
Vérification opens the sign-up gate instead (`cUsed` / `vUsed`).

## State: one Zustand store, split selectors

`lib/store/studio-store.ts` holds one flat state bag (`StudioState`, defined in
`lib/store/types.ts`) mirroring the original prototype's single `state` object, plus
actions that are direct ports of its methods. Don't split this into many small stores —
tabs share state on purpose (e.g. `text` is used by both Correction and Humanisation).

Derived view-models (what the original called `renderVals()`) are split per tab under
`lib/store/selectors/` instead of one function that recomputes everything on every
keystroke. When adding a new derived value for a tab, add it to that tab's selector file,
not to the store itself — the store holds raw state, selectors compute view-ready data
(labels, colours, resolved click handlers) from it.

Two selectors are not tab-specific:

- `selectors/shell.ts` — everything around the active module: nav, module sheet, mobile
  column switch, language and account menus, toast, extension panel, plus the
  Historique/Profil demo content. It needs the finding counts of *every* module, which is
  why it is not part of `correction.ts` any more.
- `selectors/plan.ts` — plan, per-tool word budgets, the pricing rows and the gate.

Every selector is wrapped in `memoizeLast`. That is required, not an optimisation: an
unmemoised selector returning a fresh object loops `useSyncExternalStore`.

## Scope notes

- The site is bilingual (FR default at `/`, EN at `/en`) via `next-intl` — see
  `app/[locale]/`, `i18n/routing.ts`/`i18n/request.ts`, and `messages/{fr,en}/*.json`. Every
  namespace file has an FR/EN pair, loaded and exposed in `i18n/request.ts`. New UI copy
  must go through `useTranslations`, not a hardcoded string — grep the target `messages/`
  file for the existing pattern (flat keys, ICU plurals `{n, plural, one {…} other {…}}`,
  `t.rich` for embedded markup) before adding a new one. Selectors and engines under `lib/`
  have no access to the locale or to `next-intl`, so they expose stable keys +
  interpolation params (never formatted text) for anything translatable — the component
  layer resolves them. Some mock detection heuristics (Lisibilité's jargon list and
  passive-voice regex, Vérification's connector/generic-phrase lists) are inherently
  French-tuned; their labels/explanations are translated, but the detection logic itself
  isn't localized to English — a known, deliberate limitation, not a bug to fix reflexively.
- `/studio` and `/connexion` are `noindex`; `/tarifs` is public. Root-level SEO plumbing
  (`app/layout.tsx` metadata defaults, `app/sitemap.ts`, `app/robots.ts`) is wired up —
  extend those files rather than re-inventing SEO setup per page.
- The Citations tab (bibliography builder, APA/MLA/Harvard/ISO formatting) was removed
  when the design dropped it in favour of Compteur. It is recoverable from git history if
  the product ever wants it back.
