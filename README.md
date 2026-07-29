# Setlz demo site

Demo marketing site for Setlz, whitelabelled delivery-triggered settlement infrastructure.

See `CLAUDE.md` for the structural map, the component inventory and the rebuild status.

**Demo site.**

## Run it

One command, from the repo root:

```
python -m http.server 8231
```

Then open http://localhost:8231.

No Python? Any static file server works:

```
npx serve . -l 8231
```

There is no build step, no backend, and no tracking. `index.html`, `verticals/index.html`, `styles.css`, `app.js`, `map-dots.js` (generated dot-matrix land grid) and three self-hosted variable fonts in `fonts/`. The site makes no external requests at runtime, which as of Phase 2.2 is finally true: the Google Fonts links are gone.

## World map race (v2.3, repaired in the v3 rebuild)

The comparison section opens with an animated map race: the same payment sent on Setlz rails (2 second great-circle arc with a mid-Atlantic USDC to EURC coin flip, then a time-lapsed SEPA Instant bank-credit stage) versus a traditional wire crawling through correspondent hops with a day counter, a ticking fee meter, and a banking hours stall. Three corridor presets (Detroit to Paris, Malaga to Dublin, Accra to Rotterdam, the last labelled exploratory). All corridor data (pins, hops, viewBoxes, captions, payoff lines, timings) lives in `WM_CONFIG` at the top of the map block in `app.js`. The dot grid in `map-dots.js` was generated offline from public-domain world polygons (`tools` scratch script); regenerate only if the crop needs to change. Reduced motion renders the completed diagram with meters filled.

The race never actually finished before the rebuild: the markup carried `id="wm-settled"` while `app.js` looks up `wm-settled`, so the frame loop threw at the moment the arc completed. The brand-spelling rule below applies to rendered strings only, never to ids or classes.

## Escrow simulator (v2.2, flattened in Phase 2.3)

The Hold section centres on an interactive escrow demo: payment streams into on-chain escrow, a visible release rule holds it, the visitor confirms the condition (or opens a dispute) and watches the atomic split fire in under a second. All demo values (amounts, split, rule text, stage labels, copy beats, timings) live in one `ESCROW_CONFIG` object at the top of the simulator block in `app.js`. The tx hash is deliberately fake (`0xSIM…DEMO`, labelled simulated). Reduced motion is respected (fades, no particles) and state changes are announced via aria-live.

v2.4 universalised the labels: the widget defaults to a generic marketplace (Payer, Seller, Partner, Platform, delivery confirmed) with scenario presets for Short-term rental (Guest, Host, check-in) and B2B trade (Supplier, milestone, tagged exploratory). Labels only: amounts and mechanics are identical in every scenario, all defined in `ESCROW_CONFIG.scenarios`. v2.5 added the CARD | EURC | USDC rail chips plus a ghost "+ any Base stablecoin" chip (cosmetic; EURC stays the demo settlement path) and the multi-coin strip after How it works. FX claims are always scoped ("basis-point spreads on deep pools", never a rate promise); tGBP is named once, with the FCA-registered/live-on-Base facts and the not-a-partnership footnote; "integration-ready" describes stack effort, not market depth. The any-stablecoin framing stays off the Circle deck.

## Hero: settlement cost comparison (v3.3)

A platform's annual settlement cost on incumbent rails against the same volume
on Setlz. Two bars on a shared track, a corridor toggle (EU to EU by default,
cross-border) and a volume slider (25 to 250 million euro, step 5, default 100).
**The gap between the two bars is the saving**, bracketed, with the annual figure
and the same saving over three years beneath it. Replaced the continuous-feed
settlement statement, which in turn replaced a `setInterval` stream that looped
forever and read as a screensaver.

**All five rates live in `HERO_RATES` at the top of the module in `app.js`.** That
is the only place to edit them:

| Rate | Value | Whose | Applies |
|---|---|---|---|
| `incumbentProcessing` | 2.50% | theirs | always |
| `setlzProcessing` | 1.50% | ours, mid-market tier | always |
| `incumbentFx` | 2.00% | theirs | **cross-border only** |
| `setlzFx` | 0.10% | ours, **PLACEHOLDER** | **cross-border only** |
| `cumulativeYears` | 3 | — | — |

Which gives 40% on EU to EU and about 64% cross-border. The headline spells the
percentage out and computes it, so it is never hardcoded in copy.

Three things the code enforces rather than trusts:

1. **Amounts reconcile.** Rounding happens once, to whole euro, and the saving is
   derived from the rounded pair. Verified across all 92 slider-and-corridor
   combinations.
2. **The bracket agrees with the bar end.** Both read `--setlz-w`, set in exactly
   one place. Measured at 0px difference from 360 to 1920 in both corridors. If
   these are ever set independently they will drift and the graphic's claim
   breaks.
3. **`assertHeroRates()` throws** if a rate is unset, or if ours is not below
   theirs, and the hero renders a visible failure notice. The brief asked for a
   build failure; there is no build step in this repo, so this is the substitute.

The intro runs once and never loops. The incumbent bar deliberately takes longer
to draw (920ms) than ours (560ms) — same speed, longer distance, so ours finishes
visibly early. Per-frame deltas are clamped to 50ms so a backgrounded tab cannot
skip to the end. Any interaction during the intro completes it, so the reader's
input always wins. Reduced motion renders the completed state with no counting.

With JavaScript disabled the static markup is the completed EU-to-EU state at
€100M, bars at final widths and bracket visible, verified in a script-blocked
sandboxed frame.

## Settlement rail (v3.1)

A persistent vertical rail in the left gutter, carrying the deck's settlement
line: four nodes (Customer pays, Held in escrow, Stablecoin service delivered,
Provider paid) whose dots run mist to ink to signal with a wash ring at settled.
State advances as the reader scrolls, so the reader moving down the page is the
transaction settling, and green appears only at the last stage.

State is mapped to **named sections** in `RAIL_STAGES` in `app.js`, never to
pixel offsets, so content edits cannot silently break it. Driven by an
IntersectionObserver with a thin rootMargin band; there is no scroll listener
anywhere in the codebase. Decorative: `aria-hidden`, no focusable children.
Hidden below 760px (it cannot earn a gutter at 390px) and labels drop below
1200px. Reduced motion renders it static and complete.

## Rename in one line

The product name lives in a single variable at the top of `app.js`:

```js
const BRAND_NAME = "Setlz";
```

Every mention on the page (including the uppercase eyebrow) is injected from that constant via `data-brand` attributes.

The accent colour is also one variable, at the top of `styles.css`:

```css
--accent: #27A55E; /* Setlz emerald, eyedropper approximation from the logo */
```

Palette (matched to the Setlz logo, Jul 2026): white base, emerald green accent, charcoal near-black ink (`#17191C`) for type, cool neutral greys, near-black full-bleed sections with green accents. The hexes are eyedropper approximations; refine them when the high-quality logo asset lands. The nav/footer mark is a CSS stand-in (charcoal square, three bars, green centre) and the wordmark renders lowercase with a green final letter, both built from `BRAND_NAME`. Green is never used for text below 18px bold on white; smaller accents are badges (white on green) or ink.

## Demo request form (v2.7, NOT WIRED)

The closing dark section (`#request-demo`) holds a front-end-only demo request form. It is honestly unwired: client-side validation only, no storage, no cookies, no network call, payload logged to console on localhost only and discarded. The confirmation state states explicitly that the form is not connected and shows an obvious placeholder address (`demo@[settles-domain-pending].example`). All labels, options, copy, timings, and the placeholder email live in `DEMO_CONFIG` in `app.js`; a commented WIRING SLOT in the markup and the submit handler marks where the endpoint, consent checkbox, and privacy policy link must go the moment it is connected (they become mandatory then).

Spelling (REVERSED in Phase 5.1, Jul 2026): the site previously wrote the settle
word-family in a deliberate brand misspelling (setl, setlz, setld, setling, setlment).
**That rule is dead. Do not reinstate it.** A payments buyer read it as a typo before
they read it as branding, and it made the site unrankable for the exact terms it most
needs, since the words "settlement" and "settlement infrastructure" appeared nowhere.

The rule now:

- **`Setlz` is the brand and never changes** — wordmark, `BRAND_NAME`, page title,
  company name, and brand-derived identifiers (`.wm-pulse-setlz`, `.wm-lane-setlz`,
  `.th-setlz`).
- **Everything else uses correct English**: settle, settles, settled, settling,
  settlement.
- **Never use the brand as a verb.** If a sentence wants "Setlz settles X", rewrite it
  so the brand is a noun and the verb is ordinary English ("the same rail settles X").
- Code identifiers, CSS classes, element ids and config keys were always correct
  spelling and stay that way (`#demo-settling`, `is-settled`, `paid_settling`).

63 replacements across the site files in the reversal, plus 21 in the docs.

## Deck alignment (Jul 2026, settles-deck-final.html)

The site now carries the investor deck's positioning: whitelabelled, delivery-triggered settlement infrastructure for any pay-before-deliver business (float framing in the hero), fiat in / fiat out, the four switch stats (minutes, near zero, whitelabel, 40% less), production proof (under 30 min provider payout, 11 min round trip with the cron footnote, 99.9% uptime), the business model strip (licence at cost, transaction fee 40% under), the moat strip (regulatory position, integration depth, trigger and dispute library, the Stripe assembly answer), the why-now strip (MiCA/GENIUS, 77% corporates, rails at cents), a Fintech and PSPs use case, and the team section. Deliberately kept OFF the site from the deck: the token and guarantee pool (no-token guardrail stands), the raise, EMI acquisition economics and roadmap phases, revenue projections and SAM tables, competitor volume/acquisition figures, BVNK partner speculation, and the word "safeguarded" (protection-scheme guardrail).

Second deck revision (Jul 2026, Setlz-Deck.pdf, 25 slides): proof language walked back site-wide from "in production / live" to "built and tested end to end, across repeated runs" (race caption, stream note, flagship and travel tags, camp two, trump card, team section, demo chip). Slide-1 timing is ~11 minutes (flow diagram updated), the execution stat is "Settlement execution: cents", the 77% stat is sourced to EY-Parthenon 2025, and the moat's regulatory line is per-vertical liability + MoR posture. Kept OFF the site from this deck: the raise ($6M at $24M pre-money), EMI acquisition pipeline and costs, seed deliverables, the unit economics (figures deliberately not restated here), token/backstop-pool slide, risk slide, beachhead trade figures (€4T/€1.3T), BVNK/Mastercard, and the word "audited" for the settlement contract (still gated behind the v2.9 audit condition).

Third deck revision (Jul 2026, settles-deck-final_2.html, 27 slides). Carried onto the site: "utilising stablecoins" in the hero lede; the ownership framing ("a settlement rail they own, not rent") on the What it is statement, with a WHITELABELLED RAIL node added to the flow diagram; a fine-print line under the four switch stats scoping execution cost to the stablecoin leg (not the all-in cost of a regulated payment) and ownership to a branded rail rather than a facilitator's; "Owned end to end." on the How it works heading; the expanded Why now strip (the volume and projection figures were CUT again in Phase 5.3 as unsourceable; only MiCA/GENIUS, the EY-Parthenon 77%, and rails-at-cents survive); the moat lede (we assemble the pieces, we do not claim the pieces are unbuildable) and the "why they will not follow us down" horizontal-by-design line; the business model "what you are paying for" line and the facilitator/commodity punch; the use-cases lede (common thread is the float, identical mechanics, different trigger event); a Where we are strip (live travel, next freight and fintech pilots, exploratory stablecoin infra partners, proof first partners second); and the rewritten team section (deck order, Andrew Deighan now CPO product and settlement, Adam Bates's Cardano/IOHK and BBDO credentials, fuller Samuel/Jake/Edison/Mark bios, plus the advisors line). Footer parent attribution is now "A product of Setlz HoldCo LTD." Kept OFF from this deck, unchanged from before: the raise ($6M on a $30M post-money SAFE cap), EMI acquisition pipeline, costs and roadmap phases, seed deliverables, the unit economics (figures deliberately not restated here), the $500M-to-$7.5M revenue projection, SAM tables, the beachhead EU trade figures, the token and backstop pool, the risk slide, the competitor table with its volume and acquisition figures (Stripe/Bridge $1.1bn, BVNK/Mastercard, $30B+ flows), and the deck's "group structure" phrasing for shared customer roles.

## Content guardrails baked into the copy

- Proof framing: built and tested end to end across repeated runs. **No customer is named on the site, ever** (see below). No production or live-service claims, no GMV or revenue figures; the only public numbers are speed and uptime.
- No token content anywhere.
- Competitor comparisons are capability-level and named for comparison only. No competitor pricing, incidents, or disparagement.
- The 15.5% figure appears only inside the STR use-case story.
- The hero stream and race confirmation are labelled as simulated demo flows.
- No em or en dashes, no exclamation marks, no fabricated logos or testimonials.

### Pricing hygiene (Jul 2026, do not relax)

**Source of truth for how we make money: `setlz-deck FINAL.html`, the
business-model slide. Nothing else** — not an older deck, not the site's own
previous copy, both of which drifted.

Two lines:

1. **Licence fee, at cost.** Recurring, covers onboarding, integration and
   support. Priced to cover cost, not to profit, so we earn only when the
   customer transacts. Say this plainly wherever the model is described; it is
   what makes the transaction fee legible.
2. **Transaction fee, set 40% below what a card processor would charge on the
   same settlement.** This is the whole commercial claim.

Off the site from that same deck: the volume-to-revenue projection, the
take-rate percentage, the per-tier revenue lines, the raise, the token pool.

**Our fee is always shown against the incumbent's, as amounts, never a rate.**
The hero statement carries the pair: `Setlz fee EUR 15.00` in the split, and
`Same settlement, card processor fee EUR 25.00` struck through beneath it. That
is exactly 40%, so the illustration and the claim reconcile. Change one figure
and you change both, then recheck the pricing prose.

**Nothing on our statement that is not ours.** Removed for this reason: the
customer's own platform commission (their revenue, on their own supplier) and a
tax line (we are not a tax authority; we take a facilitation fee and nothing
else). The customer's own splits still appear in the escrow and anatomy demos,
which is correct — those are their payouts, in their context, with no fee of
ours beside them.

### No customer is named on the site

Not once, anywhere: copy, HTML comments, alt text, JS config, metadata. A
customer is a customer. The unnamed version of the advantage is the part that
persuades anyway: the rail was built underneath a working marketplace rather
than from a specification, which is why the trigger and dispute logic covers
the cases it does. No disclosure line either — with no customer named there is
nothing to disclose.

Three separate things, never blurred and never compared against each other:

| | What it is | Where it may appear |
|---|---|---|
| **Our price** | what the customer pays us | the tiered table in `#pricing`, and nowhere else |
| **Our cost** | what the rail costs us to run | only under a label that says it is ours |
| **Their price** | what incumbents charge the customer | only under a label that says it is theirs |

The tiered table is the **only** place a rate of ours appears: 100 to 150 bps
mid-market, 40 to 80 bps large platform, 15 to 35 bps enterprise. No single
headline rate elsewhere, no percentage, no bps figure, no asterisk. Stating a
single figure in prose anchors the public price at the most expensive number
we charge anyone and costs us the large and enterprise accounts.

"Blended" is banned as a modifier on the fee: it invites a reader to think the
figure includes revenue lines beyond the transaction fee, which it does not.

In the hero statement the fee line reads "Setlz fee" with an **amount**, never
a rate. The four legs must reconcile exactly to the live row's total.

Never published here: the cost stack, the gross profit per transaction, the
transaction gross margin. Investor content, and the reason the figures are not
restated in the deck-revision notes above either.

"Licence at cost" stays stated plainly wherever the model is described. It is
what makes the transaction fee legible.

Use-case architecture (v2.6): flagship STR banner (the only card without an exploratory tag) + 8 cards (travel supply, property management, marketplace payouts, logistics, commodities and documentary trade, creator escrow, ticketing, platform treasury) + a 12-item pattern grid. Excluded categories that must never appear in any form: gambling and iGaming, adult content, weapons, sanctioned goods, oil and energy trade by name, securities and equity crowdfunding, insurance claims, regulated tenancy deposit schemes, remittance or money-transfer framing, exchange or custody settlement. Damage holds are framed for holiday and equipment rentals only, never tenancy deposits. Only the brief's hedged ranges (2 to 3% virtual cards, 30 to 90 day freight terms, 1 to 5% factoring, around 1% for letters of credit). Structural note: settlement-as-a-service patterns beyond the current MoR model raise MiCA CASP questions. The site shows patterns; it does not productise them.

Claim gate (v2.9, do not relax): never used anywhere rendered on the site: non-custodial, immutable, we cannot alter, no admin keys, trustless, not our liability, if we disappeared tomorrow. The tech strip says "on-chain wallets" until then. A prepared trust centerpiece block sits commented out in `index.html` (search PREPARED TRUST CENTERPIECE) with the enable conditions listed; its styles are already in the CSS. Speed claims are harmonised site-wide: "settled on Base in seconds", numbers always "about 2 seconds". MoR, TOMS, and VAT appear only in the STR flagship card and the camp two credibility line. Compliance framing is always "your policy, executable on our rails": never "we handle compliance", never "we perform KYC for you". Dispute language stays mechanics-only (rule-based outcomes, defined window); nothing about who resolves or signs.

Escrow guardrails (v2.1):

- Idle-balance treasury routing is never connected to escrowed, held, or guest funds anywhere in copy. No yield language near escrow.
- Escrow is described as rule-based and on-chain, never as a guarantee of outcome. No guaranteed, insured, or protection-scheme language.
- Wallet provider and yield venues are never named.

## Launch checklist (Phase 6.2)

Everything below is deliberately unfinished while this is a demo. Each item is
a single, findable change rather than a value buried somewhere.

**1. The domain.** `TODO-SETLZ-DOMAIN` appears in `index.html`,
`verticals/index.html`, `robots.txt` and `sitemap.xml`. Find and replace it in
all four:

```bash
grep -rl TODO-SETLZ-DOMAIN . --exclude-dir=.git | xargs sed -i '' 's|TODO-SETLZ-DOMAIN|setlz.example|g'
```

Until that is done, the canonical, Open Graph and Twitter URLs point at a token
that is obviously not a hostname. That is on purpose: it cannot be mistaken for
a real value, and `robots.txt` disallows everything meanwhile, so nothing acts
on them.

**1b. The Open Graph image is stale.** `og-image.png` and its source
`design/og-image.svg` draw the old continuous-feed settlement statement, which
is no longer the hero. A link preview therefore shows an object the page does
not open with. Not urgent while `robots.txt` disallows everything and nothing
can unfurl the link, but it must be redrawn from the cost comparison before
launch, or the claim in `design/README.md` that the preview matches the hero
stops being true.

**1c. Registered company details.** The visible "company number to be added ·
registered office to be added" placeholders were removed from the footer: an
incomplete legal line reads worse than a short one. The requirement did not go
away — the footer needs the registered company number and registered office
before launch.

**2. Indexing.** Two independent fail-safes hold the site closed:

- `<meta name="robots" content="noindex, nofollow">` in both pages
- `Disallow: /` in `robots.txt`

To open it: remove the meta tag from both pages, and swap `robots.txt` for the
production block commented at the bottom of that file.

Honest limitation, and the one part of 6.2 that is not fully satisfiable here:
the brief asks for indexing to be environment-driven rather than a value
someone remembers to flip. That needs a build step or a host config, and this
repo has neither. The nearest correct thing once a host exists is an
`X-Robots-Tag: noindex` header on the staging origin only, leaving production
clean. Until then, noindex is the default so a demo can never be indexed by
omission, only by an explicit edit.

**3. Facts still required.**

| Where | What |
|---|---|
| footer, `index.html` | registered company number |
| footer, `index.html` | registered office address |
| footer, `index.html` | a real contact email. Contact currently points at the demo form, which is itself not wired, so there is no working route to a human yet |
| `settlements.js` | Hacken report URL and audit date |
| `#safety`, `index.html` | what backs the 99.9% uptime figure, and a named escalation path |

**4. The Open Graph image.** `og-image.png` is generated from
`design/og-image.svg`, which is built from the design tokens. To regenerate
after editing the SVG:

```bash
qlmanage -t -s 1200 -o design design/og-image.svg && sips -c 630 1200 design/og-image.svg.png --out og-image.png
```

The SVG is authored on a 1200x1200 square with the artwork centred, because
`qlmanage` renders into a square canvas and scales to fill it. Rendering square
and centre-cropping 630 rows back out is deterministic; rendering the 1200x630
artwork directly crops the right-hand columns.

**5. Still outstanding from Phase 6:** the form does not submit anywhere (6.1,
and it needs a destination decided first), and the team has no photos or
LinkedIn links (6.3).
