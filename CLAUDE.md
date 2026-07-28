# CLAUDE.md

Project memory for the Setlz marketing site. Read this before editing anything.

Setlz is B2B stablecoin settlement infrastructure sold whitelabelled to marketplaces,
freight platforms and fintechs. The buyer is a CFO, a head of payments, or a platform
CTO. This repo is the marketing site, currently a demo build (`noindex, nofollow`).

`README.md` holds the content guardrails and the change-order history (v2.1 through the
third deck revision). It is the record of what may and may not be claimed on the page.
This file is the structural map. Read both.

---

## 1. Stack, build, dev, deploy

| | |
|---|---|
| Stack | Hand-written static HTML + CSS + vanilla JS. No framework, no bundler, no TypeScript. |
| Build command | **None.** There is no build step. |
| Dev command | `python3 -m http.server 8231`, then `http://localhost:8231`. Any static server works (`npx serve . -l 8231`). |
| Deploy target | **None configured.** No `netlify.toml`, `vercel.json`, `Dockerfile`, `Makefile`, or `.github/`. |
| Package manager | **None.** No `package.json` and no `node_modules`. |
| Tests / CI | None. |

Five files at the root, no subdirectories:

| File | Lines | Role |
|---|---|---|
| `index.html` | 825 | The entire site. One page. |
| `styles.css` | 1718 | All styling. |
| `app.js` | 1231 | All behaviour: brand injection, four demos, form, scroll reveal. |
| `map-dots.js` | 4 | Generated dot-matrix world-map grid (`MAP_DOTS`, `MAP_GRID`). Minified data, baked offline from public-domain polygons. Do not hand-edit. |
| `README.md` | 85 | Content guardrails and change-order log. |
| `verticals/index.html` | — | The seven use cases and pattern grid moved off the homepage in 1.2. |
| `why/index.html` | — | The competitive teardown, trump card and moat, moved off the homepage in 5.5. |
| `settlements.js` | — | Simulated settlement anatomy data, and the Hacken audit fact. |
| `fonts/` | — | Three self-hosted variable woff2 files, 94KB total. |

**Implication for the rebuild plan:** several prompts assume a build step
("fail the build rather than shipping an empty claim", "read from a Base RPC at build
time", "environment-driven noindex", "server-side submission handler"). None of that is
possible today. Phases 4.2, 6.1 and 6.2 require introducing tooling first — either a
package.json with a small build script, or a host that provides functions. That decision
has not been made and should be raised before those phases, not assumed.

---

## 2. Homepage composition, in render order

Everything is inline in `index.html`. **There are no components and no partials** — no
includes, no templates. "Delete the component and its file" instructions in the rebuild
plan translate to deleting a markup block in `index.html`, its CSS block in `styles.css`,
and its logic block in `app.js`.

| # | Section | `index.html` | CSS block | JS block | Notes |
|---|---|---|---|---|---|
| — | `header.nav` | 18–34 | 145 | — | Sticky. 6 nav links + 1 CTA button. |
| 1 | `.hero` | 41–73 | 215 | — | Headline, subhead, 2 CTAs, green corner glow (`.hero-glow`). |
| 1b | Settlement stream | 54–72 | 245 | 39–113 | **Demo 1 of 4.** Auto-running, `setInterval` 1500ms, forever. Fake short hashes. |
| 2 | `#race` The race | 78–148 | 371 | 115–225 | **Demo 2 of 4.** Click-to-run, two racing bars, hold toggle, fake tx confirm. |
| 3 | `#what` What it is | 153–176 | 556 | — | Statement, 5-node flow diagram, 4 stat cards. |
| 4 | `#how` How it works | 178–250 | 618 | — | 5 steps, tech strip, 2 `.coin-strip` blocks (multi-coin, compliance). |
| 5 | `#hold` The hold | 252–360 | 660 | 227–588 | **Demo 3 of 4.** Interactive escrow simulator. The survivor per Phase 1.1. |
| 6 | `#compare` The comparison | 362–446 | 1038, 1221 | 590–1082 | **Demo 4 of 4** (world-map corridor race) + the static comparison table + business-model strip. |
| 7 | `#why` Why Setlz wins | 448–561 | 1262 | — | 3 "camps" (~900 words), full-bleed `.trump`, commented-out trust block, moat strip, why-now strip. |
| 8 | `#cases` Use cases | 563–678 | 1368 | — | 1 banner + 9 cards + 12-item tag cloud + where-we-are strip. |
| 9 | `#team` Team | 680–724 | 1460 | — | 6 text-only cards. |
| 10 | `#request-demo` | 726–784 | 1503 | 1084–1208 | Form. Renders, validates, **submits nowhere**. |
| — | `footer.footer` | 786–819 | 1618 | — | 9 links, all `href="#"`. |

Nav anchor map: `#race`, `#how`, `#hold`, `#why`, `#cases`, `#request-demo`. The CTA
button also targets `#race`. **Phase 1.1 deletes `#race`, so three separate references
break** — the nav link, the hero's second CTA, and the nav CTA button.

### Four demos, not three

The rebuild plan (Prompt 1.1) names three demo widgets. There are **four**. The hero
settlement stream is a fifth argument that settlement is fast, and it is the only one
that runs unprompted and loops forever. It is not in the plan's consolidation list.
Phase 3.2 replaces the hero anyway, which resolves it — but if 3.2 slips, the stream
should be counted in the consolidation.

---

## 3. Design tokens: partial, and off-deck

Tokens live in one place, `styles.css` `:root` (lines 11–28). 319 `var()` references,
so the colour layer is genuinely tokenised. Everything else is not.

**Defined:** 15 colour tokens, 3 font-family tokens, 1 radius token (`--radius: 14px`).

**Not defined, hardcoded throughout:**

| Category | State |
|---|---|
| Type sizes | 31 distinct `font-size` values inline in component rules, 11 of them `clamp()`. No scale. |
| Spacing | 36 distinct px values across `padding`/`margin`. No steps. |
| Letter-spacing | 25 separate declarations, per component, not tokenised. |
| Radius | `--radius` exists but there are **55** `border-radius` declarations; most use raw px or `999px`. |
| Raw hex | 61 literals, 15 distinct. `#fff` alone appears 41 times. |
| Raw rgba | 20 literals. |
| Breakpoints | `760px` and `980px`, repeated as literals. |

**The palette does not match the deck.** This is the central finding of Phase 0 and the
reason Phase 2 exists.

| Role | Site now | Deck (authoritative) |
|---|---|---|
| Base ground | `#FFFFFF` pure white | `#FBFAF7` warm paper |
| Tint ground | `#F5F7F6` cool grey | `#E8F5EE` signal wash |
| Ink | `#17191C` | `#15171A` |
| Secondary ink | `#42474D` | `#4A4E54` |
| Hairline | `#E4E7E9` cool | `#DAD7CE` warm |
| Accent | `#27A55E` | `#1CA964` |
| Deep accent | `#1D7F47` | `#0A6E48` |
| Body face | **Inter Tight** | **Inter** |

Every value is off, and the neutrals are cool where the deck is warm. The body face is
the wrong cut of Inter. Fixing this is Phase 2.2.

**Accent is not reserved for CTAs.** `--accent` currently paints the eyebrow square,
flow-node borders, table win-cells, the `comp-punch` left rule, `coin-tag-live` badges,
hover borders on six card types, and the logo's final letter. Phase 2.2 requires it be
CTA-only, which touches most component blocks.

---

## 4a. Primitive re-inventory after Phase 1 (1.4)

Phase 1 was subtraction. It did **not** meaningfully reduce the primitive count,
because the deletions removed *instances of content*, not the primitives themselves.
This is what Phase 2.3 has to replace:

| | Before Phase 1 | After Phase 1 |
|---|---|---|
| Bordered-card containers | 34 | **27** |
| Tag pills and badge labels | 33 | **24** |
| Aphorism kickers | 19 | **4** |
| `.mono` micro-text instances | 161 | **132** |
| `.reveal` wrappers | 52 | 44 |
| Numbered eyebrows | 8 | **0** |
| Asterisked footnotes | 4 visible | **0** |
| Visible "simulated" labels | 3 section-level | **2** (one per demo) |

Container breakdown after Phase 1: `coin-strip` 6, `team-card` 6, `step` 5,
`stat-card` 4, `camp` 3, `case-card` 2, `case-banner` 1.

The headline: **`.coin-strip` is now the single most-used container on the page at 6
instances**, ahead of every card type. It is a tinted panel with a heading, a lede, a
chip row and support paragraphs, and it carries the multi-coin strip, compliance,
business model, moat, why-now and where-we-are blocks. Phase 2.3's ledger-banding
replacement has to absorb all six.

Kickers went from 19 to 4, and those 4 now use **4 different classes** (`pullquote`,
`camp-punch`, `trump-punch`, `case-payoff`) — one primitive each. Phase 2.3 should
collapse them to one. `.comp-punch` and `.pattern-grid` reached zero uses and their
CSS was deleted.

## 4. Reusable primitives

No JS components, so a "primitive" here is a CSS class contract. Counts are instances in
`index.html`.

| Primitive | Class | Count | CSS | Verdict per plan |
|---|---|---|---|---|
| Bordered card | `.case-card` | 9 | 1420 | **Delete** (2.3). 6 of 9 also deleted by 1.2. |
| Bordered card | `.stat-card` | 4 | 597 | **Delete** (2.3) → label/value rows. |
| Bordered card | `.team-card` | 6 | 1466 | **Delete** (2.3) → ruled rows. |
| Bordered card | `.step` | 5 | 620 | **Delete** (2.3). |
| Bordered card | `.camp` | 3 | 1268 | Moved to `/why` by 5.5. |
| Bordered card | `.case-banner` | 1 | 1367 | **Delete** (2.3). |
| Tinted panel | `.coin-strip` | 6 | 958 | **Delete** (2.3). The most overused block on the page. |
| Tag pill | `.coin-chip` | 17 | 972 | **Delete** (2.3) → inline text. |
| Badge label | `.coin-tag` / `-live` | 6 | 984 | **Delete** (2.3). |
| Badge label | `.case-tag` / `-live` | 10 | 1429 | **Delete** (2.3). 7 read `EXPLORATORY`. |
| Section eyebrow | `.eyebrow` | 10 | 84 | **Restyle** (1.4). 8 are numbered `02`–`10`; hero and one dark variant are not. Currently a 10px green **square**, not the deck's 22×1.5px rule. |
| Blockquote kicker | `.case-payoff` | 10 | 1449 | Keep 4 total across all kicker types (1.3). |
| Blockquote kicker | `.camp-punch` | 3 | 1355 | ditto |
| Blockquote kicker | `.comp-punch` | 5 | 997 | ditto |
| Blockquote kicker | `.pullquote` | 1 | 1345 | ditto |
| Blockquote kicker | `.trump-punch` | 1 | 1330 | ditto |
| Stat row | `.wm-row` | 9 | 1180 | Deleted with the map (1.1). |
| Comparison widget | `.compare-table` | 1 | 1221 | **Keep.** Relocate under the escrow demo (1.1). |
| Mono micro-text | `.mono` | **161** | 49 | Reduce ~70% (5.2). This is the page's dominant texture. |
| Scroll reveal | `.reveal` | 52 | 1656 | Keep. |
| Data strip | `.tech-strip` | 2 | 645 | Reassess in 2.3. |
| Tag cloud | `.pattern-grid` | 1 (12 items) | 1408 | **Delete** (1.2). |

**Aphorism kickers total 19**, not the ~25 the plan estimates. Phase 1.3 keeps 4, so
15 get deleted. Full list with line numbers is in the Phase 1.3 working notes.

**Containment depth.** The escrow demo is the worst offender, as the plan says:
`.esc` → `.esc-board` → `.esc-col` → `.esc-node`/`.esc-vault` → inner head/amt/rule
rows. That is 4–5 levels against the plan's limit of 1.

---

## 5. Animation and scroll libraries

**Zero dependencies.** No GSAP, Framer Motion, Lenis, AOS, ScrollMagic — nothing. All
motion is hand-written:

| Technique | Uses | Where |
|---|---|---|
| `IntersectionObserver` | 6 | Scroll reveal, escrow autoplay, map autoplay |
| `requestAnimationFrame` | 6 | Race clock, map arc, wire pulse |
| `element.animate()` (WAAPI) | 1 | Escrow particle dots |
| `setTimeout` / `setInterval` | 4 | Stream spawn loop, staged demo transitions |
| CSS transitions / keyframes | many | Bars, reveals, hovers |
| `scroll` event listener | **0** | Good — nothing to migrate for 3.1. |

`prefers-reduced-motion` is honoured throughout via one `prefersReducedMotion` const
(`app.js:24`) plus a CSS block at 1667. Keep this pattern.

**Fonts are render-blocking third-party.** `index.html:8–10` loads Space Grotesk,
Inter Tight and JetBrains Mono from `fonts.googleapis.com`. Phase 2.2 must self-host.

---

## 6. Things worth knowing before you edit

1. **The `setl` misspelling is REVERSED and must not come back.** Phase 5.1 changed
   every rendered instance to correct English. `Setlz` is the brand and never changes;
   brand-derived identifiers (`.wm-pulse-setlz`, `.th-setlz`, `.wm-lane-setlz`) keep
   their spelling. Never use the brand as a verb. See README's Spelling section.

2. **`README.md` claims the site makes no external requests at runtime.** It does — three
   Google Fonts requests. The claim was true before the fonts were added and was never
   updated. Phase 2.2 makes it true again.

3. **Brand name is injected at runtime**, not written in markup. `BRAND_NAME` at
   `app.js:6` feeds `[data-brand]`, `[data-brand-upper]`, `.logo-word` (which splits the
   final letter into `.logo-z` for the green terminal) and `document.title`. **Consequence:
   the `<title>` is set by JS**, so it is empty for crawlers and for any no-JS client.
   Phase 6.2 needs a real static `<title>`.

4. **A prepared block sits commented out** at `index.html:519–535`, "PREPARED TRUST
   CENTERPIECE". Its CSS is already live at `styles.css:1009`. It is gated on three
   conditions (wallet-architecture memo, third-party audit, sign-off). Phase 4.2 builds a
   security section in adjacent territory — do not enable this block as a shortcut.

5. **`map-dots.js` is generated.** If the world-map demo is deleted in Phase 1.1, delete
   this file and its `<script>` tag too. It is 40KB of the repo.

6. **The `.dead` class on footer links** exists purely to style the 9 `href="#"` links.
   Phase 6.2 removes the need for it.

7. **Two uncommitted-history notes.** `.claude/settings.json` sets `attribution.commit`
   to empty — commits carry no co-author trailer, deliberately. And `HEAD` is currently
   2 commits ahead of `origin/main` because this machine has no working git credential
   (no keychain entry, no `gh`, no SSH key); pushes must be run by the user.

---

## Conventions

_To be filled in by Phase 7.3, once the rebuild has settled. Do not add rules here
speculatively — this section is the contract that stops a future session undoing the
work, so it should describe what was actually built._
