/* ============================================================
   SETLZ DEMO SITE
   Brand name lives in ONE variable for instant rename.
============================================================ */

const BRAND_NAME = "Setlz"; // swap here to rename the whole site

document.querySelectorAll("[data-brand]").forEach((el) => (el.textContent = BRAND_NAME));
document.querySelectorAll("[data-brand-upper]").forEach((el) => (el.textContent = BRAND_NAME.toUpperCase()));
// Only fill the title if the page did not set one. Pages carry a real static
// <title> so crawlers and no-JS clients see it; this is the fallback only.
if (!document.title) document.title = BRAND_NAME;

// Logo lockup: lowercase wordmark with the final letter in brand green,
// matching the Setlz logo. Runs after the generic injection above.
document.querySelectorAll(".logo-word").forEach((el) => {
  const word = BRAND_NAME.toLowerCase();
  el.textContent = "";
  el.append(word.slice(0, -1));
  const z = document.createElement("span");
  z.className = "logo-z";
  z.textContent = word.slice(-1);
  el.appendChild(z);
});

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- helpers ---------- */

function randomHash(len = 8) {
  const chars = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

/* ============================================================
   SETTLEMENT RAIL AND STATEMENT (Phase 3.2, revised brief)

   The four settlement states, rendered as the persistent rail at the page edge.
   The old statement hero carried a second rendering of the same state in its
   perforation strip; the cost-comparison hero does not, so there is one
   rendering and the rail no longer hides at the top of the page.

   State is mapped to NAMED SECTIONS, never pixel offsets, so editing content
   cannot silently break it. Driven by IntersectionObserver with a rootMargin
   that collapses the viewport to a thin band, so exactly one section is
   current. No scroll listener, and no geometry read in the callback.
============================================================ */

const SETTLEMENT = (() => {
  // Node order and labels are the deck's settlement line.
  const STAGES = [
    { label: "Customer pays",                ids: ["hero"] },
    { label: "Held in escrow",               ids: ["how"] },
    { label: "Stablecoin service delivered", ids: ["proof", "safety"] },
    { label: "Provider paid",                ids: ["pricing", "team"] },
  ];
  const LAST = STAGES.length - 1;

  const rail = document.getElementById("rail");
  const nodes = rail ? Array.from(rail.querySelectorAll(".rail-node")) : [];
  const segs = rail ? Array.from(rail.querySelectorAll(".rail-seg")) : [];

  let stage = -1;

  function paint(next) {
    if (next === stage) return;
    stage = next;
    nodes.forEach((n, i) => {
      n.classList.toggle("is-done", i < stage);
      n.classList.toggle("is-current", i === stage && stage < LAST);
      n.classList.toggle("is-settled", i === LAST && stage === LAST);
    });
    segs.forEach((sg, i) => {
      sg.classList.toggle("is-filled", i < stage);
      sg.classList.toggle("is-settling", i === stage && stage < LAST);
    });
  }

  function observe() {
    const stageOf = new Map();
    STAGES.forEach((s, i) => s.ids.forEach((id) => stageOf.set(id, i)));
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const s = stageOf.get(e.target.id);
          if (s !== undefined) paint(s);
        }
      },
      { rootMargin: "-42% 0px -56% 0px", threshold: 0 }
    );
    stageOf.forEach((_s, id) => {
      const el = document.getElementById(id);
      if (el) io.observe(el);
    });
  }

  // The rail used to hide while the hero was on screen, because the old
  // statement hero carried the same four states in its perforation strip and it
  // would have been the same indicator twice. The cost-comparison hero has no
  // second rendering of the state, so the rail is visible from the top.

  return { paint, observe, LAST, STAGES };
})();

if (prefersReducedMotion) {
  SETTLEMENT.paint(0);
} else {
  SETTLEMENT.paint(0);
  if ("IntersectionObserver" in window) {
    SETTLEMENT.observe();
  }
}

/* ============================================================
   HERO  ·  SETTLEMENT COST COMPARISON

   A platform's annual settlement cost on incumbent rails against the same
   volume on Setlz. The gap between the two bars IS the saving, so the graphic
   is only honest if three things hold, and all three are enforced here rather
   than trusted:

   1. The amounts reconcile. Incumbent minus Setlz equals the saving at every
      slider position and in both corridor states. Guaranteed by rounding to
      whole euro FIRST and deriving the saving from the rounded pair, not by
      rounding three independent floats and hoping they agree.
   2. The bracket agrees with the bar end. Both read --setlz-w, which is set in
      exactly one place, below. Neither is ever set independently.
   3. Nothing here describes what the platform charges its own customers. No
      commission, no take rate, no split. We do not know it and must not assert
      it. Every figure is our own published rate or a sourced third-party one.

   The FX leg applies to cross-border only and is never added to EU to EU.
============================================================ */

/* ---------- rates, banded by settled volume ----------

   RATES TIER ON BOTH SIDES. Tiering our rate down while holding the incumbent
   flat would inflate the gap artificially, and a head of payments at a
   billion-euro platform knows their effective rate to the basis point. That
   asymmetry would be the most catchable error on this page, so the incumbent
   tiers too.

   Every rate carries a `source`. A number without a source is not shippable:
   assertHeroRates() throws on either a missing value OR a missing source, so
   an estimate cannot quietly become the claim under the headline.

   SOURCED FROM THE DECK (setlz-deck FINAL.html), except one.
   Incumbent processing tiers 250 / 200 / 150 bps. Every value sits at or below
   the conservative end of a range the deck cites: the 2 to 6% incumbent band,
   floored at the 1.5% bottom of Stripe's 1.5 to 4.4% at enterprise volume. It
   tiers because incumbent pricing tiers; holding it flat while ours falls
   would inflate the gap.
   Incumbent FX is derived arithmetic on two cited ranges rather than a fourth
   number: correspondent banking 3 to 7% has a 300 bps floor, processing has a
   150 bps floor, so the FX leg is 150 bps. Flat, because the deck gives no
   basis for tiering it, and flat is the conservative choice.

   STILL NULL, AND STILL BLOCKING: setlzFx. Our own cross-border spread is not
   in the deck in any form. The brief flagged it as blocking on its own terms,
   and it now drives the headline claim, so the gate stays shut until it is
   confirmed against real corridor execution.

   Setlz processing figures are fixed by the published tiers in #pricing.
   NOTE, flagged rather than silently resolved: the brief calls these
   "midpoints of our published tiers" and gives 150 / 60 / 25. 60 and 25 are
   the midpoints of 40-80 and 15-35. 150 is the CEILING of 100-150, not its
   midpoint (that would be 125). The brief's explicit number is used; if the
   midpoint was intended, change the one value below. */

const HERO_RATE_BANDS = [
  {
    // Applies at and below this volume, flat.
    anchorVolumeM: 250,
    incumbentProcessing: { bps: 250, source: "Incumbent band 2 to 6% (deck), conservative end, tiering to the Stripe 1.5% floor (World Bank, BIS 2026) at enterprise volume" },
    incumbentFx:         { bps: 150, source: "Correspondent banking 3 to 7% floor, 300 bps, less the processing floor, 150 bps (World Bank, BIS 2026)" },
    setlzProcessing:     { bps: 150, source: "Published mid-market tier, 100 to 150 bps, #pricing" },
    setlzFx:             { bps: null, source: null },
  },
  {
    anchorVolumeM: 2000,
    incumbentProcessing: { bps: 200, source: "Incumbent band 2 to 6% (deck), conservative end, tiering to the Stripe 1.5% floor (World Bank, BIS 2026) at enterprise volume" },
    incumbentFx:         { bps: 150, source: "Correspondent banking 3 to 7% floor, 300 bps, less the processing floor, 150 bps (World Bank, BIS 2026)" },
    setlzProcessing:     { bps: 60, source: "Published large-platform tier, 40 to 80 bps, #pricing" },
    setlzFx:             { bps: null, source: null },
  },
  {
    // Applies at and above this volume, flat.
    anchorVolumeM: 10000,
    incumbentProcessing: { bps: 150, source: "Incumbent band 2 to 6% (deck), conservative end, tiering to the Stripe 1.5% floor (World Bank, BIS 2026) at enterprise volume" },
    incumbentFx:         { bps: 150, source: "Correspondent banking 3 to 7% floor, 300 bps, less the processing floor, 150 bps (World Bank, BIS 2026)" },
    setlzProcessing:     { bps: 25, source: "Published enterprise tier, 15 to 35 bps, #pricing" },
    setlzFx:             { bps: null, source: null },
  },
];

/* PROVISIONAL SHAPE DATA, NOT SHIPPABLE.

   The brief supplies these as "indicative only, for scale, to be replaced not
   adopted" and says explicitly: do not substitute estimates. They are kept
   here, separate from the config above and OFF by default, purely so the
   interpolation, the bar geometry and the counters can be exercised before the
   real figures arrive. Flipping the constant below to true does NOT make them
   sourced; it only lets the component render locally for review.

   Shape: incumbent processing ~250 bps at 100M falling toward ~150 bps at 1B
   as platforms negotiate interchange-plus; incumbent FX ~200 bps falling
   toward ~100 bps across the same range. The band anchors below are solved so
   the curve passes through those two points.

   REPLACE, then delete this block and this constant. */
const USE_PROVISIONAL_RATES = false;

const PROVISIONAL_BPS = [
  { incumbentProcessing: 250, incumbentFx: 200, setlzFx: 10 },
  { incumbentProcessing: 100, incumbentFx:  50, setlzFx: 10 },
  { incumbentProcessing:  75, incumbentFx:  35, setlzFx: 10 },
];

const HERO_CUMULATIVE_YEARS = 3;

const RATE_KEYS = ["incumbentProcessing", "incumbentFx", "setlzProcessing", "setlzFx"];

/* The brief asks to fail the build on any unset value. THERE IS NO BUILD STEP
   in this repo (no package.json, no bundler; CLAUDE.md section 1), so this
   throws at module init instead, and the hero renders a visible failure notice
   rather than a comparison drawn from a number nobody sourced. */
function assertHeroRates(bands) {
  const unset = [];
  const unsourced = [];

  bands.forEach((band, i) => {
    RATE_KEYS.forEach((key) => {
      const r = band[key];
      if (!r || typeof r.bps !== "number" || !isFinite(r.bps) || r.bps < 0) {
        unset.push("band " + i + " " + key);
      } else if (typeof r.source !== "string" || !r.source.trim()) {
        unsourced.push("band " + i + " " + key);
      }
    });
    if (i > 0 && band.anchorVolumeM <= bands[i - 1].anchorVolumeM) {
      throw new Error("HERO_RATE_BANDS anchors must ascend: band " + i);
    }
  });

  if (unset.length) {
    throw new Error(
      "HERO_RATE_BANDS has unset rates: " + unset.join(", ") +
      ". Every rate must be a finite non-negative bps figure."
    );
  }
  if (unsourced.length) {
    throw new Error(
      "HERO_RATE_BANDS has unsourced rates: " + unsourced.join(", ") +
      ". A figure without a source is an estimate, and estimates do not ship " +
      "under the headline claim."
    );
  }

  // Our side must sit below theirs in every band, or the comparison inverts
  // and the hero claims the opposite of what it means.
  bands.forEach((band, i) => {
    const ours = band.setlzProcessing.bps + band.setlzFx.bps;
    const theirs = band.incumbentProcessing.bps + band.incumbentFx.bps;
    if (ours >= theirs) {
      throw new Error("HERO_RATE_BANDS band " + i + ": Setlz total is not below the incumbent total.");
    }
  });
}

/* Interpolated on log10(volume), so the curve is smooth and there is no step
   at a band edge: a visible jump in the saving while dragging reads as a bug.
   Flat outside the outermost anchors. */
function ratesAtVolume(volumeM) {
  const bands = HERO_RATE_BANDS;
  const first = bands[0];
  const last = bands[bands.length - 1];
  const pick = (b, k) => b[k].bps / 10000;

  if (volumeM <= first.anchorVolumeM) {
    return {
      incumbentProcessing: pick(first, "incumbentProcessing"),
      incumbentFx: pick(first, "incumbentFx"),
      setlzProcessing: pick(first, "setlzProcessing"),
      setlzFx: pick(first, "setlzFx"),
    };
  }
  if (volumeM >= last.anchorVolumeM) {
    return {
      incumbentProcessing: pick(last, "incumbentProcessing"),
      incumbentFx: pick(last, "incumbentFx"),
      setlzProcessing: pick(last, "setlzProcessing"),
      setlzFx: pick(last, "setlzFx"),
    };
  }

  let lo = bands[0], hi = bands[1];
  for (let i = 0; i < bands.length - 1; i++) {
    if (volumeM > bands[i].anchorVolumeM && volumeM <= bands[i + 1].anchorVolumeM) {
      lo = bands[i]; hi = bands[i + 1]; break;
    }
  }
  const t =
    (Math.log10(volumeM) - Math.log10(lo.anchorVolumeM)) /
    (Math.log10(hi.anchorVolumeM) - Math.log10(lo.anchorVolumeM));

  const mix = (k) => pick(lo, k) + (pick(hi, k) - pick(lo, k)) * t;
  return {
    incumbentProcessing: mix("incumbentProcessing"),
    incumbentFx: mix("incumbentFx"),
    setlzProcessing: mix("setlzProcessing"),
    setlzFx: mix("setlzFx"),
  };
}

const costComparison = document.getElementById("cc");

if (costComparison) {
  const el = {
    root:     costComparison,
    bars:     document.getElementById("cc-bars"),
    pctWord:  document.getElementById("cc-pct-word"),
    incAmt:   document.getElementById("cc-inc-amt"),
    incFill:  document.getElementById("cc-inc-fill"),
    setAmt:   document.getElementById("cc-setlz-amt"),
    setFill:  document.getElementById("cc-setlz-fill"),
    bracket:  document.getElementById("cc-bracket"),
    saving:   document.getElementById("cc-saving"),
    savAmt:   document.getElementById("cc-saving-amt"),
    cume:     document.getElementById("cc-cume"),
    cumeAmt:  document.getElementById("cc-cume-amt"),
    range:    document.getElementById("cc-volume"),
    volOut:   document.getElementById("cc-volume-out"),
    radios:   Array.from(document.querySelectorAll('input[name="cc-corridor"]')),
    assume:   document.getElementById("cc-assume"),
    live:     document.getElementById("cc-live"),
  };

  try {
    if (USE_PROVISIONAL_RATES) {
      // Local review only. Does not make these figures sourced.
      HERO_RATE_BANDS.forEach((b, i) => {
        b.incumbentProcessing = { bps: PROVISIONAL_BPS[i].incumbentProcessing, source: "PROVISIONAL, unsourced" };
        b.incumbentFx = { bps: PROVISIONAL_BPS[i].incumbentFx, source: "PROVISIONAL, unsourced" };
        b.setlzFx = { bps: PROVISIONAL_BPS[i].setlzFx, source: "PROVISIONAL, unsourced" };
      });
    }
    assertHeroRates(HERO_RATE_BANDS);
    initCostComparison(el);
  } catch (err) {
    // Loud, visible, and it does not take the rest of the page down with it.
    console.error("[hero] settlement cost comparison disabled:", err);
    el.root.dataset.configError = "1";
    const p = document.createElement("p");
    p.className = "cc-config-error";
    p.textContent =
      "Settlement cost comparison unavailable: rate configuration incomplete.";
    el.root.appendChild(p);
  }
}

function initCostComparison(el) {
  const EUR = new Intl.NumberFormat("en-GB", {
    style: "currency", currency: "EUR", maximumFractionDigits: 0,
  });

  const ONES = [
    "zero", "one", "two", "three", "four", "five", "six", "seven", "eight",
    "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen",
    "sixteen", "seventeen", "eighteen", "nineteen",
  ];
  const TENS = [
    "", "", "twenty", "thirty", "forty", "fifty", "sixty", "seventy",
    "eighty", "ninety",
  ];

  // The headline's percentage is spelled out, and computed. Never hardcoded:
  // it reads "Forty" on EU to EU and "Sixty-four" on cross-border.
  function inWords(n) {
    n = Math.round(n);
    if (n < 0 || n > 99) return String(n);
    const w = n < 20
      ? ONES[n]
      : TENS[Math.floor(n / 10)] + (n % 10 ? "-" + ONES[n % 10] : "");
    return w.charAt(0).toUpperCase() + w.slice(1);
  }

  /* One computation, one set of numbers, everything derived from it. Rounding
     happens here and only here, so the displayed figures reconcile by
     construction rather than by luck. */
  function compute(volumeM, corridor) {
    const volume = volumeM * 1e6;
    const crossBorder = corridor === "xb";
    const r = ratesAtVolume(volumeM);

    // The FX leg is cross-border only. Never added to EU to EU.
    const incRate = r.incumbentProcessing + (crossBorder ? r.incumbentFx : 0);
    const setRate = r.setlzProcessing + (crossBorder ? r.setlzFx : 0);

    const incumbent = Math.round(volume * incRate);
    const setlz = Math.round(volume * setRate);
    const saving = incumbent - setlz;            // reconciles by definition

    return {
      incumbent, setlz, saving,
      cumulative: saving * HERO_CUMULATIVE_YEARS,
      // The incumbent side of the assumption line, at THIS volume.
      incProcPct: r.incumbentProcessing * 100,
      incFxPct: r.incumbentFx * 100,
      crossBorder,
      // Both the bar width and the bracket offset come from this one ratio.
      widthPct: (setlz / incumbent) * 100,
      savingPct: (1 - setlz / incumbent) * 100,
    };
  }

  function state() {
    const checked = el.radios.find((r) => r.checked) || el.radios[0];
    return { volumeM: Number(el.range.value), corridor: checked.value };
  }

  // ---- timeline. Runs once on load, never loops. ----
  const T = {
    incStart: 260,  incGrow: 920,     // theirs draws SLOWLY
    setStart: 1320, setGrow: 560,     // ours draws in less than half the time
    brStart:  2020, brFade:  340, savCount: 760,
  };
  const END = T.brStart + T.savCount;
  const EASE = "cubic-bezier(0.22, 0.61, 0.36, 1)";
  const MAX_FRAME_MS = 50;   // a backgrounded tab must not skip to the end

  function easeOut(p) { return 1 - Math.pow(1 - p, 3); }
  function clamp01(n) { return n < 0 ? 0 : n > 1 ? 1 : n; }

  let introRunning = false;
  let announceTimer = null;

  function setWidths(d) {
    // THE single assignment. The Setlz bar reads --setlz-w as its width and the
    // bracket reads it as its left margin, so they cannot disagree.
    el.bars.style.setProperty("--setlz-w", d.widthPct.toFixed(4) + "%");
  }

  function paintFigures(d) {
    el.incAmt.textContent = EUR.format(d.incumbent);
    el.setAmt.textContent = EUR.format(d.setlz);
    el.savAmt.textContent = EUR.format(d.saving);
    el.cumeAmt.textContent = EUR.format(d.cumulative);
    el.pctWord.textContent = inWords(d.savingPct);
    if (el.assume) {
      const pc = (n) => n.toFixed(2) + "%";
      el.assume.textContent = d.crossBorder
        ? "Assumes " + pc(d.incProcPct) + " processing and " + pc(d.incFxPct) +
          " FX at this volume, typical of negotiated enterprise pricing."
        : "Assumes " + pc(d.incProcPct) +
          " processing at this volume, typical of negotiated enterprise pricing.";
    }
  }

  function reveal() {
    el.bracket.classList.add("is-shown");
    el.saving.classList.add("is-shown");
    el.cume.classList.add("is-shown");
  }

  function announce(s, d) {
    const corridor = s.corridor === "xb" ? "Cross-border" : "EU to EU";
    el.live.textContent =
      corridor + ", " + EUR.format(s.volumeM * 1e6) + " settled a year. " +
      "Incumbent rails " + EUR.format(d.incumbent) + ", " +
      "Setlz " + EUR.format(d.setlz) + ". " +
      "Saving " + EUR.format(d.saving) + ", " +
      inWords(d.savingPct).toLowerCase() + " percent less.";
  }

  // Instant update. Used after the intro, and for every slider and toggle
  // change. The bar width transition re-runs on a corridor change because the
  // proportion actually changes; a volume change leaves the proportion alone,
  // so nothing re-animates.
  function update({ announceNow = true } = {}) {
    const s = state();
    const d = compute(s.volumeM, s.corridor);
    el.volOut.textContent = "€" + s.volumeM + "M";
    paintFigures(d);
    setWidths(d);
    if (!announceNow) return;
    clearTimeout(announceTimer);
    announceTimer = setTimeout(() => announce(s, d), 400);
  }

  function finishIntro() {
    introRunning = false;
    update({ announceNow: false });
    reveal();
  }

  function runIntro() {
    const s = state();
    const d = compute(s.volumeM, s.corridor);

    // Start state, with transitions off so priming is not itself animated.
    el.incFill.style.transition = "none";
    el.setFill.style.transition = "none";
    el.incFill.style.width = "0%";
    el.bars.style.setProperty("--setlz-w", "0%");
    el.bracket.classList.remove("is-shown");
    el.saving.classList.remove("is-shown");
    el.cume.classList.remove("is-shown");
    el.incAmt.textContent = EUR.format(0);
    el.setAmt.textContent = EUR.format(0);
    el.savAmt.textContent = EUR.format(0);
    void el.bars.offsetWidth;                       // one forced reflow

    el.incFill.style.transition = "width " + T.incGrow + "ms " + EASE;
    el.setFill.style.transition = "width " + T.setGrow + "ms " + EASE;
    el.bracket.style.transition =
      "opacity " + T.brFade + "ms " + EASE +
      ", margin-left " + T.setGrow + "ms " + EASE;

    introRunning = true;
    let t = 0, prev = null, incGo = false, setGo = false, brGo = false, cumeGo = false;

    function frame(now) {
      if (!introRunning) return;
      t += prev === null ? 0 : Math.min(now - prev, MAX_FRAME_MS);
      prev = now;

      if (!incGo && t >= T.incStart) { incGo = true; el.incFill.style.width = "100%"; }
      if (!setGo && t >= T.setStart) { setGo = true; setWidths(d); }
      if (!brGo && t >= T.brStart) {
        brGo = true;
        el.bracket.classList.add("is-shown");
        el.saving.classList.add("is-shown");
      }
      if (!cumeGo && t >= END) { cumeGo = true; el.cume.classList.add("is-shown"); }

      el.incAmt.textContent = EUR.format(
        Math.round(d.incumbent * easeOut(clamp01((t - T.incStart) / T.incGrow)))
      );
      el.setAmt.textContent = EUR.format(
        Math.round(d.setlz * easeOut(clamp01((t - T.setStart) / T.setGrow)))
      );
      el.savAmt.textContent = EUR.format(
        Math.round(d.saving * easeOut(clamp01((t - T.brStart) / T.savCount)))
      );

      if (t >= END) { finishIntro(); return; }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // ---- wiring ----
  // Any interaction during the intro completes it first, so the reader's input
  // always wins over the animation rather than fighting it.
  function onInput() {
    if (introRunning) { introRunning = false; reveal(); }
    update();
  }
  el.range.addEventListener("input", onInput);
  el.radios.forEach((r) => r.addEventListener("change", onInput));

  /* The intro primes both bars to zero and lets requestAnimationFrame walk them
     up. If rAF never fires, that zero is what the reader gets, forever.

     That is not hypothetical: a document reporting visibilityState "hidden"
     gets no frames at all (measured: 0 frames in 600ms), and some embedded and
     preview contexts report hidden permanently rather than transiently. The
     hero sat at €0 in one.

     So: only animate when there is somebody to watch it. Otherwise render the
     finished comparison. This is NOT the wall-clock fallback that convention 25
     forbids: the animation is still driven by clamped frame deltas and never by
     elapsed time. It just is not started when it cannot run. Correct figures
     beat an animation nobody can see. */
  const canAnimate = !prefersReducedMotion && document.visibilityState === "visible";

  update({ announceNow: false });
  if (canAnimate) runIntro();
  else reveal();
}

/* ============================================================
   WORLD MAP RACE (change order v2.3)
   Setlz rails vs a traditional international wire, same map.
   Dot grid comes from map-dots.js (baked at build time, no
   external requests). All corridor data lives in WM_CONFIG.
============================================================ */

/* Ports. Real lat/lon only: every pixel on the map is derived from these
   through proj(), which reads MAP_GRID. There is no hardcoded pixel position
   anywhere in this file, and changing a lat/lon here moves the pin. */
const WM_PORTS = {
  rotterdam: { name: "Rotterdam",   lat: 51.95, lon:   4.48 },
  hamburg:   { name: "Hamburg",     lat: 53.55, lon:  10.00 },
  genoa:     { name: "Genoa",       lat: 44.41, lon:   8.93 },
  shanghai:  { name: "Shanghai",    lat: 31.23, lon: 121.47 },
  busan:     { name: "Busan",       lat: 35.10, lon: 129.04 },
  shenzhen:  { name: "Shenzhen",    lat: 22.54, lon: 114.06 },
  hochiminh: { name: "Ho Chi Minh", lat: 10.82, lon: 106.63 },
  singapore: { name: "Singapore",   lat:  1.35, lon: 103.82 },
};

/* Correspondent banks on the legacy chain. Their positions are real too.

   NEW YORK HAS NO PIN. It sits at 74W, off this artboard, and rather than
   invent a coordinate it is not plotted at all. It is NOT dropped from the
   argument: a KRW or VND to EUR payment routinely clears through a USD
   intermediary though neither end is American, so the hop stays in the text
   chain under the map, where it is named with its elapsed day. Plotted chain
   and stated chain are separate lists for exactly this reason. */
const WM_HOPS = {
  hongkong:  { name: "Regional correspondent · Hong Kong", lat: 22.32, lon: 114.17 },
  /* Text only, never plotted. See the note above. */
  newyork:   { name: "US correspondent · New York",        lat: 40.71, lon: -74.00, plot: false },
  frankfurt: { name: "European correspondent · Frankfurt", lat: 50.11, lon:   8.68 },
};

const WM_CONFIG = {
  arcMs: 2000,          // Setlz crosses in 2 seconds real time
  wireSegMs: 2400,      // wire pulse per hop segment
  wirePauseMs: 550,     // dwell at each intermediate hop
  wireStallMs: 2600,    // extra stall with the banking hours label
  lapseMs: 2600,        // stage 2 time-lapse duration
  feeTicks: ["~$9", "~$18", "~$27", "$30 to 40 typical"],

  /* One viewBox, the whole artboard, derived from the generated grid. The
     previous version cropped per corridor with hardcoded rectangles, which is
     how half the world came to be silently excluded. Padding is CSS. */
  viewBox: [0, 0, MAP_GRID.w, MAP_GRID.h],

  /* Modelled payment-chain durations, ILLUSTRATIVE, not measured. Shown as
     elapsed days at each hop. transitDays is the container transit for the
     lane and is the single source shared with the transit timeline. */
  corridors: [
    { key: "busan-rotterdam",    from: "busan",     to: "rotterdam", transitDays: 38,
      chain: ["hongkong", "newyork", "frankfurt"], hopDays: [0, 1, 3, 4, 5] },
    { key: "shanghai-rotterdam", from: "shanghai",  to: "rotterdam", transitDays: 35,
      chain: ["hongkong", "newyork", "frankfurt"], hopDays: [0, 1, 3, 4, 5] },
    { key: "busan-hamburg",      from: "busan",     to: "hamburg",   transitDays: 36,
      chain: ["hongkong", "newyork", "frankfurt"], hopDays: [0, 1, 3, 4, 5] },
    { key: "hochiminh-genoa",    from: "hochiminh", to: "genoa",     transitDays: 32,
      chain: ["hongkong", "newyork", "frankfurt"], hopDays: [0, 1, 3, 4, 5] },
    /* Intra-APAC: no USD intermediary and no European correspondent. Fewer
       hops and fewer days, which is a real difference and worth showing. */
    { key: "busan-singapore",    from: "busan",     to: "singapore", transitDays: 7,
      chain: ["hongkong"], hopDays: [0, 1, 2] },
    { key: "shenzhen-singapore", from: "shenzhen",  to: "singapore", transitDays: 4,
      chain: ["hongkong"], hopDays: [0, 1, 2] },
  ],
};

/* Expand the compact corridor rows into what the renderer reads. Labels, hop
   lists and payoff lines are all derived, so a corridor is six fields and
   cannot drift from its own name. */
WM_CONFIG.corridors = WM_CONFIG.corridors.map((c) => {
  const from = WM_PORTS[c.from];
  const to = WM_PORTS[c.to];
  const stated = c.chain.map((k) => WM_HOPS[k]);          // every hop, for the text
  const mid = stated.filter((h) => h.plot !== false);     // only those on the artboard
  const eastbound = from.lon > to.lon;
  return {
    key: c.key,
    label: from.name + " \u2192 " + to.name,
    transitDays: c.transitDays,
    hopDays: c.hopDays,
    viewBox: WM_CONFIG.viewBox,
    dotR: 0.62,
    from: { ...from, la: [eastbound ? 7 : -7, -7, eastbound ? "start" : "end"] },
    to: { ...to, la: [eastbound ? -7 : 7, -7, eastbound ? "end" : "start"] },
    pulseStart: "USDC",
    pulseEnd: "EURC",
    flip: c.chain.length > 1,
    midCaption: "EURC on Base. One hop, no correspondent chain.",
    wireHops: [
      { name: from.name + " bank", lat: from.lat, lon: from.lon, lbl: false },
      ...mid.map((h) => ({
        name: h.name + " \u00b7 day " + c.hopDays[stated.indexOf(h) + 1],
        lat: h.lat, lon: h.lon,
        la: [7, stated.indexOf(h) % 2 ? -7 : 14, "start"],
      })),
      { name: to.name + " bank", lat: to.lat, lon: to.lon, lbl: false },
    ],
    // Full chain including any hop with no pin. This is what the text list
    // under the map reads, so the argument survives the graphic being absent.
    statedChain: [
      from.name + " bank \u00b7 day " + c.hopDays[0],
      ...stated.map((h, i) => h.name + " \u00b7 day " + c.hopDays[i + 1]),
      to.name + " bank \u00b7 day " + c.hopDays[c.hopDays.length - 1],
    ],
    stallHop: mid.length > 1 ? 2 : 1,
    payoff: "The money is in " + to.name + " before the wire has cleared its first correspondent.",
  };
});

const wm = document.getElementById("wm");

if (wm && typeof MAP_DOTS !== "undefined") {
  const SVG_NS = "http://www.w3.org/2000/svg";
  const svg = document.getElementById("wm-svg");
  const wEl = {
    map: document.getElementById("wm-map"),
    corridors: document.getElementById("wm-corridors"),
    replay: document.getElementById("wm-replay"),
    daybox: document.getElementById("wm-daybox"),
    stall: document.getElementById("wm-stall"),
    flipcap: document.getElementById("wm-flipcap"),
    dest: document.getElementById("wm-dest"),
    settled: document.getElementById("wm-settled"),
    stage2: document.getElementById("wm-stage2"),
    fin: document.getElementById("wm-fin"),
    credit: document.getElementById("wm-credit"),
    elapsed: document.getElementById("wm-elapsed"),
    fees: document.getElementById("wm-fees"),
    payoff: document.getElementById("wm-payoff"),
    live: document.getElementById("wm-live"),
    brand: document.getElementById("wm-lane-brand"),
  };
  wEl.brand.textContent = BRAND_NAME;

  const proj = (lat, lon) => ({
    x: (lon - MAP_GRID.lonMin) * MAP_GRID.scale,
    y: (MAP_GRID.latMax - lat) * MAP_GRID.scale,
  });

  function elNS(tag, attrs, parent) {
    const n = document.createElementNS(SVG_NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  // Great-circle points between two lat/lon pairs.
  function greatCircle(a, b, steps) {
    const rad = Math.PI / 180;
    const toVec = (p) => {
      const la = p.lat * rad, lo = p.lon * rad;
      return [Math.cos(la) * Math.cos(lo), Math.cos(la) * Math.sin(lo), Math.sin(la)];
    };
    const va = toVec(a), vb = toVec(b);
    const dot = Math.max(-1, Math.min(1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2]));
    const w = Math.acos(dot);
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const s1 = Math.sin((1 - t) * w) / Math.sin(w);
      const s2 = Math.sin(t * w) / Math.sin(w);
      const x = s1 * va[0] + s2 * vb[0];
      const y = s1 * va[1] + s2 * vb[1];
      const z = s1 * va[2] + s2 * vb[2];
      const lat = Math.asin(z) / rad;
      const lon = Math.atan2(y, x) / rad;
      pts.push(proj(lat, lon));
    }
    return pts;
  }

  const pathD = (pts) => pts.map((p, i) => (i ? "L" : "M") + p.x.toFixed(1) + " " + p.y.toFixed(1)).join("");

  // Land grid: one <path> of circular subpaths rather than 6,216 <circle>
  // elements. Same rendering, but the dots were 91% of the document's DOM
  // nodes, so every style recalc on the page was walking them. The radius
  // is per-corridor, so the path is rebuilt on change and cached by radius
  // (three corridors, so at most three builds).
  const step = MAP_GRID.step * MAP_GRID.scale;
  const dotPathCache = new Map();

  function dotPathFor(r) {
    if (dotPathCache.has(r)) return dotPathCache.get(r);
    const d = new Array(MAP_DOTS.length / 2);
    const dia = (r * 2).toFixed(2);
    const rr = r.toFixed(2);
    for (let i = 0, n = 0; i < MAP_DOTS.length; i += 2, n++) {
      const cx = (MAP_DOTS[i] + 0.5) * step;
      const cy = (MAP_DOTS[i + 1] + 0.5) * step;
      // Two half-arcs make a full circle, matching the old <circle r>.
      d[n] = "M" + (cx - r).toFixed(1) + " " + cy.toFixed(1) +
        "a" + rr + " " + rr + " 0 1 0 " + dia + " 0" +
        "a" + rr + " " + rr + " 0 1 0 -" + dia + " 0";
    }
    const out = d.join("");
    dotPathCache.set(r, out);
    return out;
  }

  const dotsPath = elNS("path", { id: "map-dots-g", class: "wm-dots" }, svg);
  let dotsRadius = null;

  function setDotRadius(r) {
    if (r === dotsRadius) return;
    dotsRadius = r;
    dotsPath.setAttribute("d", dotPathFor(r));
  }

  const gDyn = elNS("g", {}, svg);
  const isMobileMap = () => window.matchMedia("(max-width: 760px)").matches;

  let active = WM_CONFIG.corridors[0];
  let raceId = 0;
  let layer = null; // per-corridor svg refs

  function pct(pt, vb) {
    return { left: ((pt.x - vb[0]) / vb[2]) * 100, top: ((pt.y - vb[1]) / vb[3]) * 100 };
  }

  function placeOverlay(node, pt, vb) {
    const p = pct(pt, vb);
    node.style.left = p.left + "%";
    node.style.top = p.top + "%";
  }

  function renderCorridor(c) {
    const vb = WM_CONFIG.viewBox;   // one artboard, never a crop
    svg.setAttribute("viewBox", vb.join(" "));
    const u = vb[2] / 440; // proportional unit so widths/labels stay screen-constant
    setDotRadius(c.dotR);
    gDyn.innerHTML = "";

    const A = proj(c.from.lat, c.from.lon);
    const B = proj(c.to.lat, c.to.lon);
    const arcPts = greatCircle(c.from, c.to, 72);
    const hops = c.wireHops.map((h) => ({ ...h, p: proj(h.lat, h.lon) }));

    // Wire base path, trail, nodes, labels.
    const wireD = pathD(hops.map((h) => h.p));
    elNS("path", { class: "wm-wire-path", d: wireD, "stroke-width": 1.4 * u, "stroke-dasharray": 3.5 * u + " " + 2.5 * u }, gDyn);
    const wireTrail = elNS("path", { class: "wm-wire-trail", d: wireD, "stroke-width": 1.7 * u }, gDyn);
    hops.forEach((h, i) => {
      if (i > 0 && i < hops.length - 1) {
        elNS("circle", { class: "wm-wire-node", cx: h.p.x, cy: h.p.y, r: 2.6 * u, "stroke-width": 1.2 * u }, gDyn);
        if (h.lbl !== false && h.la) {
          const t = elNS("text", {
            class: "wm-wire-label", x: h.p.x + h.la[0] * u, y: h.p.y + h.la[1] * u,
            "text-anchor": h.la[2], "font-size": 5.2 * u,
          }, gDyn);
          t.textContent = h.name;
        }
      }
    });

    // Setlz arc trail (drawn behind the pulse).
    const arc = elNS("path", { class: "wm-arc-trail", d: pathD(arcPts), "stroke-width": 2.2 * u }, gDyn);
    const arcLen = arc.getTotalLength();
    arc.setAttribute("stroke-dasharray", arcLen);
    arc.setAttribute("stroke-dashoffset", arcLen);

    // Pins and labels.
    [ { pin: c.from, p: A }, { pin: c.to, p: B } ].forEach(({ pin, p }) => {
      elNS("circle", { class: "wm-pin", cx: p.x, cy: p.y, r: 3.2 * u }, gDyn);
      const t = elNS("text", {
        class: "wm-pin-label", x: p.x + pin.la[0] * u, y: p.y + pin.la[1] * u,
        "text-anchor": pin.la[2], "font-size": 6.2 * u,
      }, gDyn);
      t.textContent = pin.name;
    });

    // Pulses and the coin badge.
    const wirePulse = elNS("circle", { class: "wm-pulse-wire", r: 3 * u, opacity: 0 }, gDyn);
    const setPulse = elNS("circle", { class: "wm-pulse-setlz", r: 3.6 * u, opacity: 0 }, gDyn);
    const badge = elNS("g", { opacity: 0 }, gDyn);
    const badgeRect = elNS("rect", { class: "wm-badge-rect", rx: 3 * u, height: 11 * u }, badge);
    const badgeText = elNS("text", { class: "wm-badge-text", "font-size": 6 * u, "text-anchor": "middle" }, badge);

    function setBadgeLabel(label) {
      badgeText.textContent = label;
      const w = (label.length * 3.9 + 9) * u;
      badgeRect.setAttribute("width", w);
      badgeRect.setAttribute("x", -w / 2);
      badgeRect.setAttribute("y", -20 * u);
      badgeText.setAttribute("y", -12 * u);
      badgeText.setAttribute("x", 0);
    }
    setBadgeLabel(c.pulseStart);

    // Hop cumulative lengths for the wire trail.
    const segLens = [];
    let wireTotal = 0;
    for (let i = 0; i < hops.length - 1; i++) {
      const dx = hops[i + 1].p.x - hops[i].p.x;
      const dy = hops[i + 1].p.y - hops[i].p.y;
      const L = Math.hypot(dx, dy);
      segLens.push(L);
      wireTotal += L;
    }
    wireTrail.setAttribute("stroke-dasharray", wireTotal);
    wireTrail.setAttribute("stroke-dashoffset", wireTotal);

    // Only the small stall chip is anchored to map coordinates; the
    // narrative boxes live in fixed corners so they never cover the routes.
    placeOverlay(wEl.stall, hops[c.stallHop].p, vb);

    layer = { vb, u, arc, arcLen, arcPts, hops, segLens, wireTotal, wireTrail, setPulse, wirePulse, badge, setBadgeLabel };
  }

  function resetPanels() {
    wEl.fin.textContent = "0.0s";
    wEl.credit.textContent = "SEPA instant · pending";
    wEl.elapsed.textContent = "Not started";
    wEl.fees.textContent = "$0";
    wEl.daybox.hidden = true;
    wEl.stall.hidden = true;
    wEl.flipcap.hidden = true;
    wEl.dest.hidden = true;
    wEl.stage2.hidden = true;
    wEl.payoff.hidden = true;
  }

  function arcPointAt(p) {
    return layer.arc.getPointAtLength(layer.arcLen * p);
  }

  // Time → wire distance plus dwell metadata.
  function buildWireSchedule(c) {
    const sched = [];
    let t = 0, dist = 0;
    for (let i = 0; i < layer.segLens.length; i++) {
      sched.push({ kind: "move", t0: t, t1: t + WM_CONFIG.wireSegMs, d0: dist, d1: dist + layer.segLens[i], endHop: i + 1 });
      t += WM_CONFIG.wireSegMs;
      dist += layer.segLens[i];
      const isLast = i === layer.segLens.length - 1;
      if (!isLast) {
        const dwell = WM_CONFIG.wirePauseMs + (i + 1 === c.stallHop ? WM_CONFIG.wireStallMs : 0);
        sched.push({ kind: "dwell", t0: t, t1: t + dwell, d0: dist, d1: dist, hop: i + 1, stalled: i + 1 === c.stallHop });
        t += dwell;
      }
    }
    return { sched, total: t };
  }

  function wireStateAt(ms, plan) {
    for (const s of plan.sched) {
      if (ms < s.t1) {
        const f = s.t1 === s.t0 ? 1 : (ms - s.t0) / (s.t1 - s.t0);
        return { dist: s.d0 + (s.d1 - s.d0) * f, entry: s };
      }
    }
    return { dist: layer.wireTotal, entry: null };
  }

  function wirePointAt(dist) {
    let acc = 0;
    for (let i = 0; i < layer.segLens.length; i++) {
      if (dist <= acc + layer.segLens[i] || i === layer.segLens.length - 1) {
        const f = layer.segLens[i] ? (dist - acc) / layer.segLens[i] : 1;
        const a = layer.hops[i].p, b = layer.hops[i + 1].p;
        return { x: a.x + (b.x - a.x) * Math.min(f, 1), y: a.y + (b.y - a.y) * Math.min(f, 1) };
      }
      acc += layer.segLens[i];
    }
    return layer.hops[layer.hops.length - 1].p;
  }

  const fmtLapse = (s) => {
    const m = Math.floor(s / 60), ss = Math.floor(s % 60);
    return String(m).padStart(2, "0") + ":" + String(ss).padStart(2, "0");
  };

  function finishState(c) {
    // Completed-state diagram: both routes drawn, meters filled.
    layer.arc.setAttribute("stroke-dashoffset", 0);
    layer.wireTrail.setAttribute("stroke-dashoffset", 0);
    wEl.fin.textContent = "2.0s";
    wEl.credit.textContent = "Typically under 30 min · provider dependent";
    wEl.elapsed.textContent = "1 to 5 business days";
    wEl.fees.textContent = "$30 to 40 typical";
    wEl.daybox.hidden = false;
    wEl.daybox.textContent = "Wire · still subject to banking hours";
    wEl.dest.hidden = false;
    wEl.settled.textContent = "Settled on Base · 2.0s · simulated";
    wEl.stage2.hidden = false;
    wEl.stage2.innerHTML = '<span class="is-strong">EURC → EUR · SEPA Instant</span><span>Bank account credited</span><span>Typically under 30 min · provider dependent</span>';
    wEl.payoff.textContent = c.payoff;
    wEl.payoff.hidden = false;
  }

  function runRaceMap(c) {
    const id = ++raceId;
    renderCorridor(c);
    resetPanels();

    if (prefersReducedMotion) {
      finishState(c);
      wEl.live.textContent = c.label + ". " + c.payoff;
      return;
    }

    const plan = buildWireSchedule(c);
    let flipped = false, settledArc = false, lapseStart = 0, lapseDone = false, wireDone = false;
    let lastFeeIdx = -1;
    wEl.live.textContent = "Race started: " + c.label + ".";
    wEl.daybox.hidden = false;

    layer.setPulse.setAttribute("opacity", 1);
    layer.wirePulse.setAttribute("opacity", 1);
    layer.badge.setAttribute("opacity", 1);

    // Elapsed time accumulates from per-frame deltas rather than wall clock.
    // requestAnimationFrame stops while the tab is hidden, so a wall-clock
    // race jumped straight to its finished state when the visitor came back,
    // skipping the whole animation. Deltas are clamped so a long gap costs
    // one frame, not the race.
    let ms = 0;
    let prev = null;
    const MAX_FRAME_MS = 50;

    function frame(now) {
      if (id !== raceId) return;
      ms += prev === null ? 0 : Math.min(now - prev, MAX_FRAME_MS);
      prev = now;

      // Setlz arc.
      const p = Math.min(ms / WM_CONFIG.arcMs, 1);
      const pt = arcPointAt(p);
      layer.setPulse.setAttribute("cx", pt.x);
      layer.setPulse.setAttribute("cy", pt.y);
      layer.badge.setAttribute("transform", "translate(" + pt.x + "," + pt.y + ")");
      layer.arc.setAttribute("stroke-dashoffset", layer.arcLen * (1 - p));
      if (!settledArc) wEl.fin.textContent = (p * 2).toFixed(1) + "s";

      if (c.flip && !flipped && p >= 0.5) {
        flipped = true;
        layer.setBadgeLabel(c.pulseEnd);
        wEl.flipcap.textContent = c.midCaption;
        wEl.flipcap.hidden = false;
      }
      if (!c.flip && !flipped && p >= 0.5) {
        flipped = true;
        wEl.flipcap.textContent = c.midCaption;
        wEl.flipcap.hidden = false;
      }

      if (p >= 1 && !settledArc) {
        settledArc = true;
        lapseStart = ms;
        layer.setPulse.setAttribute("opacity", 0);
        layer.badge.setAttribute("opacity", 0);
        wEl.flipcap.hidden = true; // declutter: the destination card takes over
        wEl.fin.textContent = "2.0s";
        wEl.dest.hidden = false;
        wEl.settled.textContent = "Settled on Base · 2.0s · simulated";
        wEl.live.textContent = BRAND_NAME + " settled on Base in about 2 seconds. Wire still in transit.";
      }

      // Stage 2 time-lapse: EURC to EUR, SEPA Instant.
      if (settledArc && !lapseDone) {
        const lf = Math.min((ms - lapseStart) / WM_CONFIG.lapseMs, 1);
        wEl.stage2.hidden = false;
        if (lf < 1) {
          const eased = 1 - Math.pow(1 - lf, 2);
          wEl.stage2.innerHTML = '<span class="is-strong">EURC → EUR · SEPA Instant</span><span>Time-lapse · ' + fmtLapse(eased * 28 * 60) + "</span>";
        } else {
          lapseDone = true;
          wEl.stage2.innerHTML = '<span class="is-strong">EURC → EUR · SEPA Instant</span><span>Bank account credited</span><span>Typically under 30 min · provider dependent</span>';
          wEl.credit.textContent = "Typically under 30 min · provider dependent";
          wEl.live.textContent = "Bank account credited, typically under 30 minutes via SEPA Instant, provider dependent.";
        }
      }

      // Wire crawl.
      if (!wireDone) {
        const ws = wireStateAt(ms, plan);
        const wpt = wirePointAt(ws.dist);
        layer.wirePulse.setAttribute("cx", wpt.x);
        layer.wirePulse.setAttribute("cy", wpt.y);
        layer.wireTrail.setAttribute("stroke-dashoffset", layer.wireTotal - ws.dist);

        const frac = Math.min(ms / plan.total, 1);
        const day = Math.min(3, 1 + Math.floor(frac * 3));
        wEl.daybox.textContent = "Wire · day " + day + " · in transit";
        wEl.elapsed.textContent = "Day " + day + " (1 to 5 typical)";

        const hopReached = ws.entry && ws.entry.kind === "dwell" ? ws.entry.hop : ws.entry && ws.entry.kind === "move" ? ws.entry.endHop - 1 : layer.hops.length - 1;
        const feeIdx = Math.min(hopReached, WM_CONFIG.feeTicks.length) - 1;
        if (feeIdx > lastFeeIdx && feeIdx >= 0) {
          lastFeeIdx = feeIdx;
          wEl.fees.textContent = WM_CONFIG.feeTicks[feeIdx];
        }

        wEl.stall.hidden = !(ws.entry && ws.entry.kind === "dwell" && ws.entry.stalled);

        if (ms >= plan.total) {
          wireDone = true;
          layer.wirePulse.setAttribute("opacity", 0);
          wEl.daybox.textContent = "Wire · credited · day 3";
          wEl.elapsed.textContent = "1 to 5 business days";
          wEl.fees.textContent = "$30 to 40 typical";
          wEl.payoff.textContent = c.payoff;
          wEl.payoff.hidden = false;
          wEl.live.textContent = c.payoff;
        }
      }

      if (!wireDone || !lapseDone) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  // Corridor preset chips. A toggle group, so the selected state is exposed
  // via aria-pressed and not left to the visual is-on class alone.
  WM_CONFIG.corridors.forEach((c, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "wm-corridor-btn" + (i === 0 ? " is-on" : "");
    btn.setAttribute("aria-pressed", i === 0 ? "true" : "false");
    btn.textContent = c.tag ? c.label + " · " + c.tag : c.label;
    btn.addEventListener("click", () => {
      wEl.corridors.querySelectorAll(".wm-corridor-btn").forEach((b) => {
        b.classList.remove("is-on");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-on");
      btn.setAttribute("aria-pressed", "true");
      active = c;
      runRaceMap(c);
    });
    wEl.corridors.appendChild(btn);
  });

  wEl.replay.addEventListener("click", () => runRaceMap(active));

  // Re-render on a breakpoint change. Each corridor carries a separate mobile
  // crop, chosen at render time, so without this a rotation or window resize
  // left the map framed for the wrong width.
  const mapBreakpoint = window.matchMedia("(max-width: 760px)");
  const onBreakpoint = () => {
    renderCorridor(active);
    if (prefersReducedMotion) finishState(active);
    else runRaceMap(active);
  };
  if (mapBreakpoint.addEventListener) mapBreakpoint.addEventListener("change", onBreakpoint);
  else mapBreakpoint.addListener(onBreakpoint); // Safari < 14

  // Draw the idle map immediately; race auto-plays on scroll into view.
  renderCorridor(active);
  resetPanels();

  // Start only when the document is actually visible. Autoplaying into a
  // hidden tab used to burn the one-shot observer, so a visitor who opened
  // the page in a background tab never saw the race at all.
  function startWhenVisible() {
    if (!document.hidden) {
      runRaceMap(active);
      return;
    }
    const onVisible = () => {
      if (document.hidden) return;
      document.removeEventListener("visibilitychange", onVisible);
      runRaceMap(active);
    };
    document.addEventListener("visibilitychange", onVisible);
  }

  if (prefersReducedMotion) {
    finishState(active);
  } else if ("IntersectionObserver" in window) {
    const wmIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            wmIO.disconnect();
            startWhenVisible();
          }
        });
      },
      { threshold: 0.35 }
    );
    wmIO.observe(wm);
  } else {
    startWhenVisible();
  }
}

/* ============================================================
   ANATOMY OF A SETTLEMENT (Phase 4.1, reworked)

   Replaces the decorative random hash. A hash on its own proves nothing and
   says nothing about the product; opening a row shows one payment becoming
   one transaction with several payouts, released on a condition.

   Simulated, and it says so. Hashes are prefixed 0xsim in settlements.js and
   are never linked, because a link that 404s is worse than no link. The same
   renderer will link them to the block explorer the moment real 66-character
   hashes replace them and `simulated` is dropped.

   Rows are real buttons: keyboard operable, aria-expanded, aria-controls.
============================================================ */

const anatRows = document.getElementById("anat-rows");

if (anatRows && typeof SETTLEMENTS !== "undefined") {
  const foot = document.getElementById("anat-foot");
  const live = document.getElementById("anat-live");
  const HASH_RE = /^0x[0-9a-fA-F]{64}$/;
  const isReal = SETTLEMENTS.simulated !== true;

  function cell(cls, text) {
    const s = document.createElement("span");
    s.className = cls;
    s.textContent = text;
    return s;
  }

  (SETTLEMENTS.entries || []).forEach((e, i) => {
    const wrap = document.createElement("div");
    wrap.className = "grow anat";

    const panelId = "anat-panel-" + i;

    // ---- collapsed header: the ledger row ----
    const head = document.createElement("button");
    head.className = "anat-head";
    head.type = "button";
    head.setAttribute("aria-expanded", "false");
    head.setAttribute("aria-controls", panelId);

    head.appendChild(cell("glabel", e.trigger + " · " + e.date));

    const cells = document.createElement("span");
    cells.className = "anat-cells";
    cells.appendChild(cell("gval", e.amount));
    cells.appendChild(cell("anat-elapsed", e.elapsed));

    // The hash links only when it is genuinely a chain record.
    if (isReal && HASH_RE.test(e.hash)) {
      const a = document.createElement("a");
      a.className = "anat-hash";
      a.href = SETTLEMENTS.explorer + e.hash;
      a.target = "_blank";
      a.rel = "noopener";
      a.textContent = e.hash.slice(0, 10) + "…" + e.hash.slice(-8);
      cells.appendChild(a);
    } else {
      cells.appendChild(cell("anat-hash is-sim", e.hash + " · sim"));
    }
    cells.appendChild(cell("anat-toggle", "+"));
    head.appendChild(cells);
    wrap.appendChild(head);

    // ---- expanded panel: what actually happened ----
    const panel = document.createElement("div");
    panel.className = "anat-panel";
    panel.id = panelId;
    panel.hidden = true;

    (e.steps || []).forEach((st) => {
      const r = document.createElement("div");
      r.className = "anat-step";
      r.appendChild(cell("anat-t", st.t));
      const w = document.createElement("span");
      w.className = "anat-what";
      w.appendChild(cell("anat-what-main", st.what));
      if (st.detail) w.appendChild(cell("anat-detail", st.detail));
      r.appendChild(w);
      r.appendChild(cell("anat-amt", st.amount || ""));
      panel.appendChild(r);
    });

    if (e.legs && e.legs.length) {
      const legs = document.createElement("div");
      legs.className = "anat-legs";
      legs.appendChild(cell("glabel", "Paid out, same transaction"));
      e.legs.forEach((lg) => {
        const r = document.createElement("div");
        r.className = "anat-leg";
        r.appendChild(cell("anat-leg-to", lg.to));
        r.appendChild(cell("anat-amt", lg.amount));
        legs.appendChild(r);
      });
      panel.appendChild(legs);

      const stamp = document.createElement("p");
      stamp.className = "anat-stamp";
      stamp.textContent = "One transaction. " + e.legs.length + " payouts. Zero reconciliation.";
      panel.appendChild(stamp);
    }

    wrap.appendChild(panel);
    anatRows.appendChild(wrap);

    head.addEventListener("click", () => {
      const open = head.getAttribute("aria-expanded") === "true";
      head.setAttribute("aria-expanded", open ? "false" : "true");
      panel.hidden = open;
      wrap.classList.toggle("is-open", !open);
      live.textContent = open
        ? e.trigger + " collapsed."
        : e.trigger + " expanded. " + (e.legs ? e.legs.length + " payouts in one transaction." : "");
    });
  });

  // Footnote states what these are, and the audit fact if one is recorded.
  const bits = [];
  bits.push(isReal
    ? "Recorded on " + SETTLEMENTS.network + ". Follow any hash to verify it."
    : "Illustrative settlements, not chain records. Every hash is prefixed 0xsim and is not linked.");
  if (SETTLEMENTS.audit && SETTLEMENTS.audit.firm) {
    let a = "Settlement contracts audited by " + SETTLEMENTS.audit.firm;
    if (SETTLEMENTS.audit.date) a += ", " + SETTLEMENTS.audit.date;
    bits.push(a + ".");
  }
  foot.textContent = bits.join(" ");

  // Link the audit report only once a URL exists.
  if (SETTLEMENTS.audit && SETTLEMENTS.audit.firm && SETTLEMENTS.audit.reportUrl) {
    const a = document.createElement("a");
    a.className = "anat-audit-link";
    a.href = SETTLEMENTS.audit.reportUrl;
    a.target = "_blank";
    a.rel = "noopener";
    a.textContent = "Read the " + SETTLEMENTS.audit.firm + " report";
    foot.appendChild(document.createTextNode(" "));
    foot.appendChild(a);
  }
}

/* ============================================================
   REVEAL ON SCROLL
============================================================ */

const revealEls = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window && !prefersReducedMotion) {
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => io.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-visible"));
}
