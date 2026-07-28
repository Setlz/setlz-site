# Phase 2 design plan

**Status: awaiting approval. No code written.**

Deck tokens are authoritative. Palette unchanged, no new hue or tint. Space Grotesk
stays display, Inter stays body. Light is the base. The mono is the one axis changed.

---

## 0. The honest starting position

The brief warns that warm paper plus Space Grotesk plus Inter is close to a default
look, and that if the plan leans on the palette for distinctiveness it has failed. It
does not. **Every colour and two of three faces are fixed, so they are table stakes, not
differentiation.** Three things carry this design, and if any of them is cut the page
reverts to generic:

1. **The mono at true display scale.** Fintech sites use a mono at 11px for labels.
   Using one at 116px for the settlement figure is the single most subject-native move
   available, because a settlement message *is* monospaced.
2. **One atom, repeated.** The label/value ledger row is the hero, the comparison, the
   proof stats, the pricing, the team and the notes. Most sites use a different component
   per section. One primitive everywhere is unusual and reads as a system.
3. **The rail as scroll-driven state**, promoting the deck's own settlement line from
   illustration to interface.

---

## 1. Palette as tokens, and which value goes where

Deck values, adopted verbatim:

| Token | Value | Role |
|---|---|---|
| `--paper` | `#FBFAF7` | default band ground |
| `--ink` | `#15171A` | primary text, rules, data values, active dots |
| `--ink-soft` | `#4A4E54` | secondary text, column labels |
| `--mist` | `#E9E7E0` | recessed band ground, inactive dots and fills |
| `--line` | `#DAD7CE` | hairlines, group top rules |
| `--signal` | `#1CA964` | **settled state only** (see below) |
| `--signal-deep` | `#0A6E48` | **calls to action only** (reserved) |
| `--signal-wash` | `#E8F5EE` | the settled node's ring, nothing else |

### Which green is reserved for CTAs: `--signal-deep`, and the reason is contrast, not taste

I checked both greens against the paper ground and against white before deciding. The
numbers make the decision for us:

| Pairing | Ratio | Verdict |
|---|---|---|
| `--signal` `#1CA964` on paper | **2.9:1** | fails AA for text at any size below 18px bold; also under the 3:1 floor for a meaningful UI boundary |
| `--signal-deep` `#0A6E48` on paper | **7.4:1** | passes AA and AAA for body text |
| white on `--signal` | **3.0:1** | fails AA for a 16px button label |
| white on `--signal-deep` | **6.3:1** | passes AA comfortably |

So `--signal` **cannot** carry a button label, an eyebrow, or a data value regardless of
what we would prefer. That settles it:

- **`--signal-deep` is the CTA fill, with a white label, and appears nowhere else.**
- **`--signal` never carries text.** It survives in exactly one place: the settled node
  on the rail.

### The consequence, which I think is the best thing in this plan

The deck uses `signal-deep` for data values, eyebrows and emphasis. Reserving it for CTAs
means **all of that moves to ink**. The page becomes ink on paper, with green appearing in
only two situations:

> **Green means money landed, or click here.** Nothing else.

Data values: ink. Eyebrow rules: `--line`. Active states: ink fill plus weight change.
Hover: ink. Table win-cells: ink at 600 weight, not green. For a company one step from the
token world, a page where green is *only* ever completion or action is a real position, and
it is enforced by a contrast fact rather than by preference. This also kills the current
site's habit of painting green on nine decorative things.

Dark ground: **one** section, the closing CTA, on `--ink`. The deck runs dark on 5 of 27
slides; one of roughly nine sections is the same proportion. The brief permits two; I am
spending one and would rather bank the restraint.

---

## 2. Type scale

### The mono: recommendation

| | Face | Why |
|---|---|---|
| **Free pick** | **Martian Mono** (Evil Martians, OFL) | Drawn as a display-capable mono rather than a code face pushed large. Superelliptical bowls and a wide advance make a figure read engineered. Variable 100–800 covers label and hero weight from one file. Width is an asset in a ledger row. |
| **Paid pick** | **Pitch** (Klim Type Foundry) | One of very few monospaces drawn explicitly for text *and* display. Numerals have personality without novelty, and it carries warmth that suits paper better than the engineered grotesques. Licenses cleanly at a startup tier. |
| Hedge | Azeret Mono (Displaay, OFL) | If Martian reads too wide in the real grid. Narrower, more severe, more terminal. |

Rendered specimen: **`design/mono-specimen.html`** — all three set in the actual Phase 3.2
hero pattern, live webfonts, with JetBrains Mono last as the incumbent baseline. Pitch
cannot be rendered without a licence and I have not substituted a lookalike; the specimen
says so and links to Klim.

Measured at 95px, the hero string `0.42s` sets 317px in Martian, 294px in Azeret, 277px in
JetBrains. Martian is 14% wider than the incumbent, which the grid absorbs.

### Scale

Sizes are the token set. Every value below becomes a variable in 2.2; nothing is inline.

**Mono — Martian Mono, tabular figures on everywhere numerals appear**

| Token | Size | Weight | Tracking | Use |
|---|---|---|---|---|
| `--mono-hero` | `clamp(56px, 8vw, 116px)` | 600 | `-0.03em` | the elapsed figure in the hero row |
| `--mono-display` | `clamp(28px, 3.4vw, 44px)` | 500 | `-0.015em` | section-level figures, the pricing bps band |
| `--mono-row` | `15px` | 400 | `0` | ledger data values |
| `--mono-row-strong` | `15px` | 600 | `0` | the winning cell in a comparison row |
| `--mono-label` | `11px` | 500 | `+0.16em`, uppercase | data-column labels only |

**Display — Space Grotesk**

| Token | Size | Weight | Tracking | Use |
|---|---|---|---|---|
| `--display-1` | `clamp(34px, 5vw, 72px)` | 700 | `-0.025em` | the demoted hero headline |
| `--display-2` | `clamp(28px, 3.7vw, 52px)` | 700 | `-0.02em` | section headings |
| `--display-3` | `20px` | 600 | `-0.01em` | sub-headings |
| `--display-kicker` | `clamp(19px, 2.2vw, 24px)` | 600 | `-0.015em` | the four surviving kickers |

**Body — Inter** (note: **Inter**, not Inter Tight, which is what the site loads today)

| Token | Size | Weight | Tracking | Use |
|---|---|---|---|---|
| `--body-lede` | `clamp(17px, 1.3vw, 20px)` | 400 | `0` | section ledes |
| `--body` | `16px` | 400 | `0` | prose |
| `--body-strong` | `16px` | 600 | `0` | emphasis inside prose |
| `--body-small` | `13.5px` | 400 | `0` | notes, methodology, fine print |
| `--body-eyebrow` | `13px` | 500 | `0` | see the deviation below |

---

## 3. Layout concept

### The idea

**The page is one account statement.** Not a landing page with sections, a ledger read top
to bottom. Sections are bands in it. Every piece of data on the site is the same thing: a
label above a value, separated by a hairline, grouped under a 2px top rule. The deck
already has this device — `border-top: 2px solid --line` with a mono label above a
display-weight value — and it is the better of the deck's two contradictory systems. We
standardise on it and the 14px white cards go.

**Grouping is ground, not boxes.** Two grounds, used semantically rather than for rhythm:
`--paper` is the default, and `--mist` marks *supporting* material only — the comparison
and the notes. A visitor learns that a recessed band means backing detail. This is the one
place I diverge from the obvious move, which would be to alternate grounds for visual
rhythm; alternating for rhythm is decoration, and it teaches the reader nothing.

**Containment budget: one level.** A band is ground, not containment. Inside a band, a data
group (top rule plus rows) is level one. Nothing inside a group gets its own box, border,
or fill. The escrow demo, currently four to five levels deep, flattens to a single group of
rows plus the vault figure.

**Hairlines are for data only.** They separate rows inside a group and close a group. They
never divide columns, never sit between paragraphs, and never run vertically. That
restriction is deliberate: vertical rules plus a warm ground plus a serif-ish mono is the
newspaper-column look the brief rules out.

**No radius anywhere.** Default `--radius: 0`. The one exception I will ask for is the note
popover from Phase 1.3, at 4px, because it floats above the page and needs to read as a
layer rather than a torn edge.

### Wireframe: hero

```
─────────────────────────────────────────────────────────────────────────────
▬ setlz                        how it works   see it settle   [Request demo]   hairline bottom, no blur
─────────────────────────────────────────────────────────────────────────────
│
│   ──── The stablecoin settlement layer                    eyebrow: 22×1.5 line rule + Inter 13px
│
│   ═══════════════════════════════════════════════════════  2px ink top rule, opens the group
│   FROM           TO              AMOUNT      SPLIT  ELAPSED  mono-label 11px +.16em
│   ───────────────────────────────────────────────────────── hairline
│                                                    ┌──────┐
│   Guest booking  Host · Málaga   €1,000.00  3 ways │0.42s │  mono-hero 116px, tabular,
│                                                    └──────┘  right-aligned IN the ELAPSED
│   ─────────────────────────────────────────────────────────  column. closing hairline
│
│   The money arrives the moment
│   the service does.                                          display-1, demoted
│
│   Every business that takes payment before it delivers        body-lede, ONE sentence
│   sits on a float.
│
│   [ Request a demo ]   See it settle →                        1 primary (signal-deep),
│                                                               1 text link. no ghost button
rail
```

The hero numeral is **the last cell of a table row that happens to be 116px**. It sits under
its own column label, aligned to its column, on the row's baseline. It is not centred, not
floating, and has no caption beneath it. That is what keeps it out of the
big-number-over-small-label pattern the brief bans — the label is a column header, and the
number is data in a row, not a stat in a tile.

### Wireframe: a content section (the comparison)

```
════════════════════════════════════════════════════════════ band edge, --mist begins, full bleed

    ──── The comparison

    Why traditional rails lose.                              display-2

    ═════════════════════════════════════════════════════    2px top rule
                        SETLZ              CARDS + BANK      mono-label
    ─────────────────────────────────────────────────────    hairline
    Settlement          Seconds            T+2 or worse      body / mono-row
    ─────────────────────────────────────────────────────
    Cost                Cents ¹            2 to 6%           ¹ = note affordance
    ─────────────────────────────────────────────────────
    FX                  Basis points       1 to 4% hidden
    ─────────────────────────────────────────────────────
    Chargebacks         None on-chain      Weeks
    ─────────────────────────────────────────────────────
    Uptime              24/7               Banking hours
    ─────────────────────────────────────────────────────

    Every row above is money.                                display-kicker, one per section max
```

Identical primitive to the hero. Winning cells are ink at 600 weight — **not** green.

---

## 4. The signature element

**A persistent vertical settlement rail at the left gutter, whose state advances as the
reader scrolls. The reader scrolling the page is the transaction settling.**

This extends the deck's settlement line rather than replacing it. Same four nodes, same
labels, same dot states, same gradient sweep on the currently-settling segment. What
changes is orientation and that state is driven by position rather than being static — the
device finally runs in a medium that can run it.

| Deck (static, 2 slides) | Site (scroll-driven spine) |
|---|---|
| Horizontal, 900px wide | Vertical, left gutter, full viewport height |
| Node 1 Customer pays | hero + what it is |
| Node 2 Held in escrow | how it works + the hold demo |
| Node 3 Stablecoin service delivered | comparison + why we win |
| Node 4 Provider paid | use cases + team + closing CTA |
| Dots: mist → ink → signal, wash ring at settled | identical |
| Segments fill ink; settling segment sweeps | identical |

State is mapped to **named sections**, not pixel offsets, so content edits do not break it.
Driven by IntersectionObserver, never a scroll listener.

The settled node is the **only** place `--signal` and `--signal-wash` appear outside a CTA,
and it is semantic rather than decorative: it is the moment the money lands. That is the
second half of the "green means money landed, or click here" rule.

**Mobile:** hidden below 760px. It cannot earn a gutter on a 390px viewport, and shrinking
it makes four labels illegible. Hidden, not shrunk.

**Reduced motion:** rendered static in its complete state, no transitions.

**Accessibility:** `aria-hidden`, not focusable, not announced. It duplicates information
the page already states in text.

Once the rail is the spine, the sticky nav is doing less work. My recommendation for 3.1:
drop the backdrop blur and the section links, keep the wordmark and a single CTA. The rail
tells you where you are; the nav only needs to let you act.

---

## 5. Self-critique

### What I would have produced for a generic "fintech infrastructure landing page"

Warm off-white ground, near-black ink, one green accent reserved for CTAs. A grotesk
display face, Inter for body, a mono for small labels. Wide-tracked uppercase mono
eyebrows. A big hero number. A hairline-ruled comparison table. Alternating light and
tinted section bands for rhythm. One dark section near the end. Tabular figures. Zero
radius.

### Comparison: what was identical

Uncomfortably close to everything above. Named honestly:

| Element | Same as generic? |
|---|---|
| Warm paper, ink, one green | **Identical** — but fixed by the brief, so it cannot count either way |
| Space Grotesk + Inter | **Identical** — also fixed |
| Accent reserved for CTAs | **Identical** in intent |
| Zero radius, tabular figures | **Identical** |
| Hairline-ruled comparison table | **Identical** |
| Mono for wide-tracked uppercase eyebrows | **Identical** |
| Alternating band grounds for rhythm | **Identical** |
| A big hero number | **Identical**, and adjacent to a banned pattern |
| One dark section | **Identical** |

Only the rail and the mono-at-display survived that comparison untouched. That is not
enough, so I revised four things.

### What I changed as a result

**1. The mono eyebrow is gone.** This is the biggest revision. If mono is promoted to
display, *also* using it at 11px wide-tracked for every eyebrow is the generic move and it
dilutes the promotion — the reader stops registering mono as meaningful because it is
everywhere. Eyebrows become **Inter 500, 13px, sentence case**, keeping the deck's 22×1.5px
signal rule. Mono then appears in exactly two registers: **data, and the hero figure.**
Which makes its display use read as a decision rather than as texture.

This is a deliberate deviation from the deck's eyebrow spec, and it is the one thing in
this plan most likely to be rejected. It also does most of the work Phase 5.2 asks for.

**2. Banding is semantic, not rhythmic.** Generic alternates grounds so the page does not
feel monotonous. Mine uses `--mist` *only* for supporting material, so ground carries
meaning. Fewer bands, each of them saying something.

**3. The hero figure is a table cell, not a stat.** Reinforced above: it lives in the
ELAPSED column, under that column's label, on the row's baseline. The generic version
floats a number over a caption. This one cannot be lifted out of the row without breaking.

**4. Hairlines are restricted to data.** No vertical rules, no paragraph dividers, no
column separators. Without this restriction the ruled layout drifts straight into the
newspaper-column look the brief bans.

### Where this plan is still weak, stated plainly

- **Space Grotesk is doing very little.** With mono carrying display figures and Inter
  carrying eyebrows and prose, the display face is reduced to headings and four kickers. It
  is fixed by the brief, so I am not proposing a change, but if it were negotiable I would
  question whether the site needs three faces.
- **`--mist` as a full-bleed band may be too heavy.** It is `#E9E7E0`, drawn for inactive
  fills rather than grounds. Adding a lighter step would mean a new tint, which the brief
  forbids, so 2.4 will test it at full bleed and I will report if it reads muddy rather
  than quietly inventing a value.
- **A 116px monospace figure is a bet.** If it reads as novelty rather than precision, the
  differentiation collapses to the rail alone. The specimen exists so that call is made
  before it is built.

---

## 6. Not proposed

Per the brief, and confirmed absent: hairline-ruled newspaper columns, bento grid, radial
glow behind the hero (the current `.hero-glow` is deleted), big-number-over-small-label stat
triplets, icons inside circles, glassmorphic nav (the current backdrop blur is deleted),
logo marquee, animated gradient text.

---

## 7. Open decisions for approval

1. **Mono:** Martian Mono now, or hold for a Pitch trial licence?
2. **The eyebrow deviation:** Inter sentence case, or keep the deck's mono uppercase?
3. **One dark section or two?** I propose one, the closing CTA.
4. **Radius exception** for the note popover at 4px: allowed or forced to 0?
