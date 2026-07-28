# Setlz demo site

Demo marketing site for Setlz, whitelabelled delivery-triggered setlment infrastructure.

See `CLAUDE.md` for the structural map, the component inventory and the rebuild status.

**Demo site. Not an offer of services. Do not deploy.**

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

The race never actually finished before the rebuild: the markup carried `id="wm-setld"` while `app.js` looks up `wm-settled`, so the frame loop threw at the moment the arc completed. The brand-spelling rule below applies to rendered strings only, never to ids or classes.

## Escrow simulator (v2.2, flattened in Phase 2.3)

The Hold section centres on an interactive escrow demo: payment streams into on-chain escrow, a visible release rule holds it, the visitor confirms the condition (or opens a dispute) and watches the atomic split fire in under a second. All demo values (amounts, split, rule text, stage labels, copy beats, timings) live in one `ESCROW_CONFIG` object at the top of the simulator block in `app.js`. The tx hash is deliberately fake (`0xSIM…DEMO`, labelled simulated). Reduced motion is respected (fades, no particles) and state changes are announced via aria-live.

v2.4 universalised the labels: the widget defaults to a generic marketplace (Payer, Seller, Partner, Platform, delivery confirmed) with scenario presets for Short-term rental (Guest, Host, check-in) and B2B trade (Supplier, milestone, tagged exploratory). Labels only: amounts and mechanics are identical in every scenario, all defined in `ESCROW_CONFIG.scenarios`. v2.5 added the CARD | EURC | USDC rail chips plus a ghost "+ any Base stablecoin" chip (cosmetic; EURC stays the demo settlement path) and the multi-coin strip after How it works. FX claims are always scoped ("basis-point spreads on deep pools", never a rate promise); tGBP is named once, with the FCA-registered/live-on-Base facts and the not-a-partnership footnote; "integration-ready" describes stack effort, not market depth. The any-stablecoin framing stays off the Circle deck.

## Hero settlement row (v3.2)

The hero is one ledger row: counterparties, amount, split and elapsed time as
columns. It executes **once** on load and stops; the previous settlement stream
looped on a `setInterval` forever and read as a screensaver. The elapsed figure
is the largest numeral on the page but lives inside the row as the ELAPSED
column's value, under that column's own label, so it is a table cell rather than
a stat tile. `HERO_TARGET_MS` in `app.js` sets where it lands. Reduced motion
renders the completed row with no execution animation.

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

The closing dark section (`#request-demo`) holds a front-end-only demo request form. It is honestly unwired: client-side validation only, no storage, no cookies, no network call, payload logged to console on localhost only and discarded. The confirmation state states explicitly that the form is not connected and shows an obvious placeholder address (`demo@[setlz-domain-pending].example`). All labels, options, copy, timings, and the placeholder email live in `DEMO_CONFIG` in `app.js`; a commented WIRING SLOT in the markup and the submit handler marks where the endpoint, consent checkbox, and privacy policy link must go the moment it is connected (they become mandatory then).

Brand verb (Jul 2026): everywhere on the site the settle word-family is written in brand spelling: settle → setl, settles → setlz, settled → setld, settling → setling, settlement → setlment (all case variants, e.g. "Money that setlz before the page reloads.", "SETLD ON BASE", "MARKETPLACE SETLMENT ENGINE"). Keep this rule when writing new copy. Code identifiers, CSS classes, element ids, and config keys keep normal spelling (e.g. `#demo-settling`, `is-settled`, `paid_settling`); only rendered strings use the brand spelling.

## Deck alignment (Jul 2026, setlz-deck-final.html)

The site now carries the investor deck's positioning: whitelabelled, delivery-triggered setlment infrastructure for any pay-before-deliver business (float framing in the hero), fiat in / fiat out, the four switch stats (minutes, near zero, whitelabel, 40% less), production proof (AtlasOra named as first and reference customer; under 30 min provider payout, 11 min round trip with the cron footnote, 99.9% uptime), the business model strip (licence at cost, transaction fee 40% under), the moat strip (regulatory position, integration depth, trigger and dispute library, the Stripe assembly answer), the why-now strip (MiCA/GENIUS, 77% corporates, rails at cents), a Fintech and PSPs use case, and the team section. Deliberately kept OFF the site from the deck: the token and guarantee pool (no-token guardrail stands), the raise, EMI acquisition economics and roadmap phases, revenue projections and SAM tables, competitor volume/acquisition figures, BVNK partner speculation, and the word "safeguarded" (protection-scheme guardrail).

Second deck revision (Jul 2026, Setlz-Deck.pdf, 25 slides): proof language walked back site-wide from "in production / live" to "built and tested end to end, across repeated runs with AtlasOra, our first reference customer" (race caption, stream note, flagship and travel tags, camp two, trump card, team section, demo chip). Slide-1 timing is ~11 minutes (flow diagram updated), the execution stat is "Setlment execution: cents", the 77% stat is sourced to EY-Parthenon 2025, and the moat's regulatory line is per-vertical liability + MoR posture. Kept OFF the site from this deck: the raise ($6M at $24M pre-money), EMI acquisition pipeline and costs, seed deliverables, unit economics (150/75 bps), token/backstop-pool slide, risk slide, beachhead trade figures (€4T/€1.3T), BVNK/Mastercard, and the word "audited" for the settlement contract (still gated behind the v2.9 audit condition).

Third deck revision (Jul 2026, setlz-deck-final_2.html, 27 slides). Carried onto the site: "utilising stablecoins" in the hero lede; the ownership framing ("a setlment rail they own, not rent") on the What it is statement, with a WHITELABELLED RAIL node added to the flow diagram; a fine-print line under the four switch stats scoping execution cost to the stablecoin leg (not the all-in cost of a regulated payment) and ownership to a branded rail rather than a facilitator's; "Owned end to end." on the How it works heading; the expanded Why now strip ($33tn setld in 2025, 43% of SEA B2B cross-border, $50tn+ projected 2026, plus the "every provider stops at the plumbing" punch); the moat lede (we assemble the pieces, we do not claim the pieces are unbuildable) and the "why they will not follow us down" horizontal-by-design line; the business model "what you are paying for" line and the facilitator/commodity punch; the use-cases lede (common thread is the float, identical mechanics, different trigger event); a Where we are strip (live AtlasOra travel, next freight and fintech pilots, exploratory stablecoin infra partners, proof first partners second); and the rewritten team section (deck order, Andrew Deighan now CPO product and setlment, Adam Bates's Cardano/IOHK and BBDO credentials, fuller Samuel/Jake/Edison/Mark bios, plus the advisors line). Footer parent attribution is now "A product of Setlz HoldCo LTD." Kept OFF from this deck, unchanged from before: the raise ($6M on a $30M post-money SAFE cap), EMI acquisition pipeline, costs and roadmap phases, seed deliverables, unit economics (150/75 bps), the $500M-to-$7.5M revenue projection, SAM tables, the beachhead EU trade figures, the token and backstop pool, the risk slide, the competitor table with its volume and acquisition figures (Stripe/Bridge $1.1bn, BVNK/Mastercard, $30B+ flows), and the deck's "group structure" phrasing for shared AtlasOra roles.

## Content guardrails baked into the copy

- Proof framing: built and tested end to end with AtlasOra as first reference customer (per the deck). No production or live-service claims, no GMV or revenue figures; the only public numbers are speed and uptime.
- No token content anywhere.
- Competitor comparisons are capability-level and named for comparison only. No competitor pricing, incidents, or disparagement.
- The 15.5% figure appears only inside the STR use-case story.
- The hero stream and race confirmation are labelled as simulated demo flows.
- No em or en dashes, no exclamation marks, no fabricated logos or testimonials.
- Footer attribution to Setlz HoldCo LTD is flagged `PENDING LEGAL REVIEW` in an HTML comment.

Use-case architecture (v2.6): flagship STR banner (the only card without an exploratory tag) + 8 cards (travel supply, property management, marketplace payouts, logistics, commodities and documentary trade, creator escrow, ticketing, platform treasury) + a 12-item pattern grid. Excluded categories that must never appear in any form: gambling and iGaming, adult content, weapons, sanctioned goods, oil and energy trade by name, securities and equity crowdfunding, insurance claims, regulated tenancy deposit schemes, remittance or money-transfer framing, exchange or custody settlement. Damage holds are framed for holiday and equipment rentals only, never tenancy deposits. Only the brief's hedged ranges (2 to 3% virtual cards, 30 to 90 day freight terms, 1 to 5% factoring, around 1% for letters of credit). Structural note: settlement-as-a-service patterns beyond the current MoR model raise MiCA CASP questions; showing patterns is fine, productising any of them is a Gavin decision first.

Claim gate (v2.9, do not relax): banned anywhere rendered on the site until the wallet architecture memo, third-party audit, and Gavin sign-off all land: non-custodial, immutable, we cannot alter, no admin keys, trustless, not our liability, if we disappeared tomorrow. The tech strip says "on-chain wallets" until then. A prepared trust centerpiece block sits commented out in `index.html` (search PREPARED TRUST CENTERPIECE) with the enable conditions listed; its styles are already in the CSS. Speed claims are harmonised site-wide: "settled on Base in seconds", numbers always "about 2 seconds". MoR, TOMS, and VAT appear only in the STR flagship card and the camp two credibility line. Compliance framing is always "your policy, executable on our rails": never "we handle compliance", never "we perform KYC for you". Dispute language stays mechanics-only (rule-based outcomes, defined window); nothing about who resolves or signs.

Escrow guardrails (v2.1, Gavin-flavoured):

- Idle-balance treasury routing is never connected to escrowed, held, or guest funds anywhere in copy. No yield language near escrow.
- Escrow is described as rule-based and on-chain, never as a guarantee of outcome. No guaranteed, insured, or protection-scheme language.
- Wallet provider and yield venues are never named.
