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
   conditions. Phase 4.2 builds a
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

**These are load-bearing. Each one was arrived at by measurement, and several
replaced something that looked fine but failed a check. Do not quietly revert
them; if you disagree, say so and get a decision.**

### Layout

1. **No bordered cards.** The page had 34 of them and they were its dominant
   unit. Grouping is done with a 2px top rule (`.group`) and hairline-separated
   rows (`.grow`), never a box. If you are reaching for a card, you want a
   `.group`.
2. **No tag pills, no badge labels.** 33 were removed. Status is a weight
   change, not a coloured capsule. Use `.ilist` for what used to be chip rows.
3. **Containment budget: one level.** A band is *ground*, not containment, so
   it has no border, radius or shadow. Inside a band, `.group` is the only
   permitted level. Nothing inside a group paints its own box. Verify in the
   browser, not by eye.
4. **`--radius: 0`.** One exception exists, the note popover at 4px, because it
   floats above the page. Do not add a second without a reason that good.
5. **Banding is semantic, not rhythmic.** `--ground` is default; `--ground-alt`
   marks supporting material only (the comparison, the notes). Do not alternate
   grounds for visual rhythm. Exactly one dark section, the closing CTA.
6. **Three spacing tiers**, `.tier-primary` / `-standard` / `-compressed`. They
   are restated inside the mobile media block on purpose: it sits after them
   and `.section` would otherwise flatten all three back to one value.

### Colour

7. **Green is reserved, and contrast decided it, not taste.**
   `--signal-deep` (#0A6E48, 6.03:1 on paper) is the CTA colour and appears on
   calls to action and nowhere else. `--signal` (#1CA964) measures 2.91:1 on
   paper and therefore **never carries text**; it survives only as the settled
   state and as money-in-motion graphics.
   The rule in one line: **green means money landed, or click here.**
8. Data values, eyebrows, links, hovers, active states, borders and focus rings
   are ink or a muted tone. Error states are not green.
9. **Settled state is ink on `--signal-wash`** (16:1), never paper on
   `--signal`, which is 2.91:1 and fails.
10. **Two text greys only**, `--ink` and `--ink-soft`, matching the deck. There
    is deliberately no third; fine print is `--ink-soft` at a smaller size.
    Adding one means inventing a tint.
11. **On the dark band, use the `--on-dark-*` tokens.** Phase 2.3 flattened the
    demo card and left ink text on ink at 2.15:1, with one heading at 1:1.
    Anything placed on that band must be rechecked for contrast, not just for
    containment.

### Type

12. **Mono appears in exactly two registers: data, and the hero figure.** It is
    deliberately NOT used for eyebrows. Promoting it to display scale is the
    site's main differentiator and spending it on every label dilutes that.
13. **Eyebrows are Inter, 13px, sentence case**, preceded by the deck's
    22x1.5px rule. This is a deliberate deviation from the deck's mono-uppercase
    eyebrow, approved in Phase 2.1. **The hero is the one exception**: its brief
    specifies mono uppercase with a green rule, so `.cc-eyebrow` is scoped to
    the hero and the other five sections keep the approved treatment. Do not
    let it spread.
14. **Uppercase survives only on data-column labels (`.glabel`) and the rail's
    node labels.** It was 144 text nodes and is now 43. Do not reintroduce
    wide-tracked uppercase for supporting lines, footnotes, status labels or
    list items.
15. **Tracking on uppercase comes from `var(--mono-label-track)`.** There are
    zero literal `em` letter-spacing values in the stylesheet. Keep it that way.
16. **Tabular figures wherever a numeral sits in a data position**, via both
    `font-variant-numeric` and `font-feature-settings`.
17. **No raw values in component rules.** Zero hex, zero rgba, zero spacing px
    above 3px, zero untokenised font sizes. Hairlines and rule widths at 1 to
    3px stay literal on purpose: snapping them to a spacing step blurs them.

### Entity scope — standing prohibitions

**Setlz is a standalone company.** No customer is named on the site. Any
reference on this site to any other entity must be a customer, a named vendor
or integration, or removed.

34. **Never introduce, and reject in future passes:** token or tokenomics
    content, a whitepaper, foundation or group corporate structure,
    sister-company or affiliate framing, ecosystem or community sections, or
    any positioning of Setlz as a short-term rental business. Short-term rental
    is a vertical we serve, not something we are.
35. **"Reference customer" is banned**, and so is naming any customer at all.
    It is a term of art implying an arm's-length endorsement and it
    overclaimed.
36. **AtlasOra is never mentioned on the site. Not once, anywhere.** This was
    asked for three times and reintroduced twice, so treat it as absolute: no
    name in copy, comments, alt text, config, metadata or commit-facing files.
    It is a customer, and customers are not named here. What survives is the
    unnamed version of the advantage, which is the part that persuades anyway:
    the rail was built underneath a working marketplace rather than from a
    specification, which is why the trigger and dispute logic covers the cases
    it does. Do not add a disclosure line either; with no customer named there
    is nothing to disclose, and one was already removed for reading as a
    concealed affiliate.
37. **No footnotes, no notes-and-methodology block, no caveat tooltip system.**
    A page needing eight footnotes is making eight claims it is not confident
    in. Fold the caveat into the sentence, or drop the figure. Exactly one
    visible "simulated" label, on the escrow demo.
38. **One spelling of Málaga**, accented, in markup and in JS config alike.
    Write the character, not the `&aacute;` entity, so a grep finds every
    instance.

### Copy

18. **Correct English for the settle word-family.** `Setlz` is the brand and
    never changes, including brand-derived identifiers (`.wm-pulse-setlz`,
    `.th-setlz`, `.wm-lane-setlz`). Everything else is settle, settles, settled,
    settling, settlement. The old deliberate misspelling is dead: it read as a
    typo to a payments buyer and the word "settlement" appeared zero times on a
    settlement infrastructure site.
19. **Never use the brand as a verb.** Rewrite so `Setlz` is a noun.
20. **Every external statistic carries its source inline** via the note
    affordance. Three were cut in 5.3 rather than sourced. Do not reinstate the
    $33tn stablecoin volume figure without an ADJUSTED number and a named
    provider: the raw figure includes bots, MEV and rehypothecation, which is
    why it cannot be compared to Visa and Mastercard settlement.
21. **The v2.9 claim gate still stands.** `non-custodial`, `immutable`, `no
    admin keys`, `trustless`, `we cannot alter`, `if we disappeared tomorrow`
    are never used on the site. The Hacken audit is recorded, but the stronger
    custody language stays off the page regardless.
22. **Four aphorism kickers, page-wide maximum.** There were 19.

### Behaviour

23. **No scroll listeners.** There are zero in the codebase. Use
    IntersectionObserver, and never read geometry inside its callback.
24. **Scroll-driven state maps to named sections, never pixel offsets.** See
    `RAIL_STAGES`. A new section needs adding there or its stage never fires.
25. **Animation timing accumulates per-frame deltas clamped to 50ms**, never
    wall clock. Wall clock makes a backgrounded tab jump straight to the end
    state; this bit both the map race and the hero row.
26. **Nothing loops forever.** The hero row runs once. The old settlement
    stream looped on a `setInterval` and read as a screensaver.
27. **`prefers-reduced-motion` is honoured in both CSS and JS** — 3 CSS blocks
    and 8 JS branches. New motion needs both.
28. **Zero third-party requests at runtime.** Fonts are three self-hosted
    variable woff2 files, preloaded. Do not add a CDN.

### Accessibility

29. **One deterministic `:focus-visible` ring**, ink on light grounds and paper
    on the dark band. Do not set `outline: none` without replacing it.
30. **44px minimum tap targets.** The note badge keeps a 16px look with a 44px
    `::after` hit area. Inline links inside a sentence are exempt per WCAG
    2.5.8 and are deliberately left alone.
31. **UI boundaries need 3:1**, which axe does not check. Form fields use
    `--on-dark-edge` for this reason. Rail dots are the one accepted exception:
    aria-hidden decoration where an inactive dot is *meant* to read as not-yet.
32. **Single h1, no skipped heading levels.**
33. **The rail is decorative**: `aria-hidden`, no focusable children,
    `pointer-events: none`. It duplicates what the page states in text.

### Structure (revised brief)

39. **Six sections, not twelve.** Hero, How it works, Proof, Safety and
    custody, Pricing, Demo. One eyebrow, one headline and one closing thought
    each. If a merged section has two headlines it has not been merged. The
    twelve-section version was deck geometry: slide chrome repeated twelve
    times for a page read without a narrator.
40. **The hero is the settlement cost comparison.** Two bars on a shared
    track, a corridor toggle and a volume slider, where the gap between the
    bars is the saving. It replaced the continuous-feed settlement statement,
    whose perforation strip carried a second rendering of the rail's four
    states; with that gone there is ONE rendering of the state model, and the
    page-edge rail no longer hides at the top of the page.
    **The bar width and the bracket's left edge both read `--setlz-w`, set in
    exactly one place in app.js.** Never set them independently: they would
    drift at some viewport width and the graphic's entire claim breaks. Verify
    by measuring `bracket.left - barFill.right` at several widths, which is how
    the alignment is checked; it is 0 at 360 through 1920 in both corridors.
41. **No /why page, and no competitive teardown on the site.** "Why won't you
    get killed" is raise material and the deck carries it. "Why not the thing
    I am currently considering" is product material and lives in the
    four-option comparison in How it works, at 150 words maximum, factual,
    with no defensibility language. **Building it in-house is the real
    default and must stay in that list.**
42. **Banned vocabulary:** moat, defensibility, TAM, beachhead, wedge, land
    and expand, first mover, why now. If a sentence only makes sense to
    someone deciding whether to invest, it does not belong.
43. **No market sizing.** A buyer does not size our market before buying.
44. **Regulation is stated as a liability position**, never as a moat: where
    the funds sit today, what the licence changes, and who carries the
    settlement leg either way.
45. **Anything moved onto the dark band must have its colours rechecked.**
    This bug has now shipped twice: the demo form in 7.2 and the team in this
    pass, both left as ink text on ink at 2.15:1 after being relocated.
    Moving a block is a colour change, not just a layout change.
46. **Three money figures, never blurred and never compared against each
    other.** *Our price* is what the customer pays us. *Our cost* is what the
    rail costs us to run. *Their price* is what incumbents charge the
    customer. Any comparison must be price against price or cost against
    cost, never one of each. The old comparison table put "near zero
    on-chain" (our cost) opposite "2 to 6% plus FX spread" (their price),
    which is the first line a head of payments would catch. Our cost may only
    appear under a label that says it is ours, as "What the network costs us"
    now does; if a figure needs a footnote to stop it being misread, the
    figure is wrong, not the footnote.
47. **The tiered pricing table is the only place a rate of ours appears in
    prose.** 100 to 150 bps mid-market, 40 to 80 bps large platform, 15 to 35
    bps enterprise. No single headline rate, no bps figure, no asterisk
    anywhere else. ONE guarded exception: the hero's note states our 1.50%
    mid-market rate, because the hero's own amounts derive it anyway and
    stating the assumption is more honest than letting a reader reverse it out.
    That exception is conditional on the note also saying larger platforms pay
    less than shown (rule 54). A single figure in prose anchors the public price at
    the most expensive number we charge anyone and costs us the large and
    enterprise accounts, which is why "about 150 bps" came out of the pricing
    support copy. The 40% gap is expressed as one range against another.
    **"Blended" is banned** as a modifier on the fee: it implies revenue
    lines beyond the transaction fee. In the hero statement the fee line
    reads "Setlz fee" with an **amount**, never a rate, and the legs must
    reconcile exactly to the live row's total.
48. **Never publish the unit economics.** The cost stack, the gross profit
    per transaction, the transaction gross margin. Investor content. This
    includes prose in repo files: the README's deck-revision notes used to
    restate the figures in its own list of things kept off the site, in a
    public repo.
49. **`setlz-deck FINAL.html` is the only source of truth for how we make
    money.** Its business-model slide: two lines, licence fee at cost
    (onboarding, integration, support, priced to cover cost so we earn only
    when you transact) and a transaction fee **set 40% below what a card
    processor would charge on the same settlement**. Everything else on that
    deck about money is investor content and stays off: the volume-to-revenue
    projection, the take-rate percentage, the tier revenue lines, the raise,
    the token pool. Do not derive the model from an older deck or from the
    site's own previous copy, both of which drifted.
50. **Our cost is always shown against the incumbent's, never alone.** A
    number on its own invites the reader to supply their own comparison. The
    hero does this at settled-volume scale: incumbent rails against Setlz on
    the same volume, both as amounts. The `€15.00 against €25.00` fee pair in
    the old statement hero did the same job at single-transaction scale and
    went with it.
    All five rates live in `HERO_RATES` at the top of the module. The five are
    the only place they may be edited, and `assertHeroRates()` throws if one is
    unset or if our rate is not below theirs. There is no build step in this
    repo, so that assertion is the substitute for failing a build: it throws,
    logs, and renders a visible failure notice instead of a comparison drawn
    from a missing number.
51. **Nothing of ours states what a customer charges its own customers.**
    No commission, no take rate, no split, in the hero or anywhere else. We do
    not know that number and must never assert it. This has now been caught
    twice: a `Platform €100.00` line (their revenue, on their own supplier) and
    a `Tax €20.00` line (we are not a tax authority; we take a facilitation fee
    and nothing else), both in the old statement hero. The customer's own
    splits still appear in the escrow and anatomy demos, which is correct:
    those are their payouts, in their context, with no fee of ours beside them.
52. **The incumbent anchor stays at the conservative end of the sourced
    range.** 2.50% is the BOTTOM of the 2 to 6% band (World Bank, BIS 2026)
    and must not be raised to widen the gap. It is the most checkable number
    on the page: a head of payments knows their own effective rate to the
    basis point, so a flattering anchor loses the meeting rather than winning
    it. The note says we use the low end, deliberately.
53. **The FX leg is cross-border only.** `incumbentFx` and `setlzFx` are added
    only in the cross-border state and never to EU to EU, which is why the
    saving reads 40% on one and 64% on the other. EU to EU is the default
    because it is the day-one position. Our own FX figure is a **placeholder**
    marked `TODO(setlz-fx)`; confirm it against real corridor execution before
    this hero is shown outside the team.
54. **The hero shows the mid-market tier only**, which is why the slider caps
    at 250: above that the rate tiers down and the percentages change. The
    note must keep saying that larger platforms pay less than shown, or the
    hero becomes a single universal rate, which is exactly what rule 47 exists
    to prevent.

### Verify by measuring, not by reading

The recurring lesson of this rebuild. Bugs that a diff read would not have
caught, all found by measuring in a browser:

- The map race **never completed**: `id="wm-setld"` versus a `wm-settled`
  lookup, throwing at the exact moment the arc finished.
- The rail's dots **painted on top of the headline** at 1126px. Every earlier
  check measured the rail's own state, never its position relative to content.
- The demo form was **ink on ink** after the shells were flattened, with one
  heading at 1:1.
- A blanket string-replace **ate trailing spaces** in three concatenations,
  producing "Wire · day3".
- Mobile spacing tiers were **silently flattened** by a later media block of
  equal specificity.

Before claiming something works: exercise it, measure it, and check the state
you did not change as well as the one you did.
