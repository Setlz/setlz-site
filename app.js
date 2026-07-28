/* ============================================================
   SETLZ DEMO SITE
   Brand name lives in ONE variable for instant rename.
============================================================ */

const BRAND_NAME = "Setlz"; // pending clearance: swap here to rename the whole site

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
   HERO SETTLEMENT ROW (Phase 3.2)

   Replaces the settlement stream, which looped on a setInterval forever and
   read as a screensaver. This runs ONCE on load and stops.

   The elapsed figure counts in real time and lands in the low hundreds of
   milliseconds. Driven by requestAnimationFrame with delta accumulation, the
   same approach the map race uses, so a backgrounded tab cannot make it jump
   to the end.
============================================================ */

const hrow = document.getElementById("hrow");

if (hrow) {
  const elapsedEl = document.getElementById("hrow-elapsed");
  const statusEl = document.getElementById("hrow-status");
  const cells = Array.from(hrow.querySelectorAll(".hrow-cell"));

  // Where the figure lands. Low hundreds of ms, per the brief.
  const HERO_TARGET_MS = 420;
  const CELL_STAGGER_MS = 70;

  function settle() {
    hrow.dataset.state = "settled";
    elapsedEl.textContent = (HERO_TARGET_MS / 1000).toFixed(2) + "s";
    statusEl.textContent = "Settled on Base";
  }

  if (prefersReducedMotion) {
    // Completed row immediately, no execution animation.
    settle();
  } else {
    hrow.dataset.state = "running";
    // Cells arrive left to right, so the row reads as it fills.
    cells.forEach((c, i) => {
      c.style.opacity = "0";
      setTimeout(() => { c.style.opacity = "1"; }, i * CELL_STAGGER_MS);
    });

    let ms = 0, prev = null;
    const MAX_FRAME_MS = 50;

    function tick(now) {
      ms += prev === null ? 0 : Math.min(now - prev, MAX_FRAME_MS);
      prev = now;
      if (ms >= HERO_TARGET_MS) { settle(); return; }
      elapsedEl.textContent = (ms / 1000).toFixed(2) + "s";
      requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
}

/* ============================================================
   ESCROW SIMULATOR (change order v2.2)
   IDLE → PAID_SETTLING → HELD → RELEASING → SETTLED,
   with a DISPUTE branch off HELD.
   All demo values live in ESCROW_CONFIG. Simulated only.
============================================================ */

const ESCROW_CONFIG = {
  amountIn: "€1,000",
  lockedLabel: "LOCKED: €1,000 EURC",
  splits: [
    { wallet: "seller", amount: "€880" },
    { wallet: "partner", amount: "€20" },
    { wallet: "platform", amount: "€100" },
  ],
  finalityCopy: "SETTLED ON BASE · ABOUT 2 SECONDS", // speed harmonised site-wide (v2.9)
  // Hash is deliberately fake: SIM prefix, DEMO suffix, labelled simulated.
  hashText: () => "TX 0xSIM" + randomHash(4).toUpperCase() + "…DEMO · SIMULATED",
  stageLabels: {
    idle: "01 PAYMENT",
    paid_settling: "01 PAYMENT",
    held: "02 HOLD",
    dispute: "02 HOLD · DISPUTE WINDOW",
    releasing: "03 RELEASE",
    settled: "04 SETTLED",
  },
  announce: {
    idle: "Escrow demo ready. Press the simulate button.",
    paid_settling: "Payment settling into on-chain escrow.",
    held: "Funds locked in escrow. Release fires when the condition is met.",
    dispute: "Dispute open. Funds remain secured while the window runs.",
    releasing: "Condition met. Releasing and splitting atomically.",
    settled: "Settled. One transaction, three payouts, zero reconciliation.",
  },
  stampSplit: "One transaction. Three payouts. Zero reconciliation.",
  stampDispute: "Rule-based outcomes. No chargeback tail.",
  paymentMs: 1100,
  releaseMs: 520, // press to stamps must stay under one second
  // Scenario presets (change order v2.4): labels only, amounts and
  // mechanics identical across all three.
  scenarios: [
    {
      key: "marketplace",
      label: "MARKETPLACE",
      payer: "PAYER",
      wallets: { seller: "SELLER", partner: "PARTNER", platform: "PLATFORM" },
      views: ["PAYER VIEW", "SELLER VIEW"],
      rule: "RELEASE RULE: DELIVERY CONFIRMED, THEN RELEASE",
      cond: "DELIVERY",
      simulate: "Simulate a purchase",
      confirm: "Confirm delivery",
      refund: "Refund payer",
      release: "Release to seller",
    },
    {
      key: "str",
      label: "SHORT-TERM RENTAL",
      payer: "GUEST",
      wallets: { seller: "HOST", partner: "SERVICE PARTNER", platform: "PLATFORM" },
      views: ["GUEST VIEW", "HOST VIEW"],
      rule: "RELEASE RULE: CHECK-IN CONFIRMED, THEN RELEASE",
      cond: "CHECK-IN",
      simulate: "Simulate a booking",
      confirm: "Confirm check-in",
      refund: "Refund guest",
      release: "Release to host",
    },
    {
      key: "b2b",
      label: "B2B TRADE",
      tag: "EXPLORATORY",
      payer: "PAYER",
      wallets: { seller: "SUPPLIER", partner: "PARTNER", platform: "PLATFORM" },
      views: ["PAYER VIEW", "SUPPLIER VIEW"],
      rule: "RELEASE RULE: MILESTONE CONFIRMED, THEN RELEASE",
      cond: "MILESTONE",
      simulate: "Simulate a trade",
      confirm: "Confirm milestone",
      refund: "Refund payer",
      release: "Release to supplier",
    },
  ],
};

const esc = document.getElementById("esc");

if (esc) {
  const el = {
    stage: document.getElementById("esc-stage"),
    board: document.getElementById("esc-board"),
    payer: document.getElementById("esc-payer"),
    payerLabel: document.getElementById("esc-payer-label"),
    payerSub: document.getElementById("esc-payer-sub"),
    payerStatus: document.getElementById("esc-payer-status"),
    scenarios: document.getElementById("esc-scenarios"),
    ruleLine: document.getElementById("esc-rule-line"),
    viewA: document.getElementById("esc-view-a"),
    viewB: document.getElementById("esc-view-b"),
    vault: document.getElementById("esc-vault"),
    vaultAmt: document.getElementById("esc-vault-amt"),
    chip: document.getElementById("esc-chip"),
    hash: document.getElementById("esc-hash"),
    beat: document.getElementById("esc-beat"),
    rule: document.getElementById("esc-rule"),
    cond: document.getElementById("esc-cond"),
    views: document.getElementById("esc-views"),
    viewsCaption: document.getElementById("esc-views-caption"),
    compare: document.getElementById("esc-compare"),
    banner: document.getElementById("esc-banner"),
    primary: document.getElementById("esc-primary"),
    disputeBtn: document.getElementById("esc-dispute-btn"),
    refundBtn: document.getElementById("esc-refund-btn"),
    releaseBtn: document.getElementById("esc-release-btn"),
    stamp: document.getElementById("esc-stamp"),
    receipt: document.getElementById("esc-receipt"),
    live: document.getElementById("esc-live"),
    wallets: Array.from(document.querySelectorAll(".esc-wallet")),
  };

  let escState = "idle";
  let busy = false;
  let scenario = ESCROW_CONFIG.scenarios[0];

  function setEscState(state) {
    escState = state;
    esc.dataset.state = state;
    el.stage.textContent = ESCROW_CONFIG.stageLabels[state];
    el.live.textContent = ESCROW_CONFIG.announce[state];
  }

  // Particle-dot stream between two nodes, in board coordinates.
  function streamDots(fromEl, toEl, duration) {
    if (prefersReducedMotion) return Promise.resolve();
    const board = el.board.getBoundingClientRect();
    const a = fromEl.getBoundingClientRect();
    const b = toEl.getBoundingClientRect();
    const x1 = a.left + a.width / 2 - board.left;
    const y1 = a.top + a.height / 2 - board.top;
    const x2 = b.left + b.width / 2 - board.left;
    const y2 = b.top + b.height / 2 - board.top;
    const COUNT = 9;
    const stagger = Math.max((duration * 0.55) / COUNT, 18);
    const dots = [];
    for (let i = 0; i < COUNT; i++) {
      const dot = document.createElement("span");
      dot.className = "esc-dot";
      el.board.appendChild(dot);
      dots.push(dot);
      dot.animate(
        [
          { transform: "translate(" + x1 + "px," + y1 + "px)", opacity: 0 },
          { opacity: 1, offset: 0.15 },
          { opacity: 1, offset: 0.85 },
          { transform: "translate(" + x2 + "px," + y2 + "px)", opacity: 0 },
        ],
        { duration, delay: i * stagger, easing: "cubic-bezier(0.35, 0, 0.25, 1)", fill: "forwards" }
      );
    }
    return new Promise((res) =>
      setTimeout(() => {
        dots.forEach((d) => d.remove());
        res();
      }, duration + stagger * COUNT)
    );
  }

  function startPayment() {
    if (busy || escState !== "idle") return;
    busy = true;
    setEscState("paid_settling");
    el.primary.hidden = true;
    el.chip.textContent = "SETTLING…";
    el.payerStatus.textContent = "PAID · SIMULATED";
    el.payer.classList.add("is-stamped");

    streamDots(el.payer, el.vault, ESCROW_CONFIG.paymentMs).then(() => {
      el.vaultAmt.textContent = ESCROW_CONFIG.lockedLabel;
      el.chip.textContent = ESCROW_CONFIG.finalityCopy;
      el.chip.classList.add("is-live");
      el.hash.textContent = ESCROW_CONFIG.hashText();
      el.hash.hidden = false;
      el.beat.hidden = false;
      el.rule.hidden = false;
      el.views.hidden = false;
      el.viewsCaption.hidden = false;
      el.compare.hidden = false;
      el.primary.textContent = scenario.confirm;
      el.primary.hidden = false;
      el.disputeBtn.hidden = false;
      setEscState("held");
      busy = false;
    });
  }

  function runSplit(stampText) {
    busy = true;
    el.cond.textContent = scenario.cond + ": MET ✓";
    el.cond.classList.add("is-met");
    el.primary.hidden = true;
    el.disputeBtn.hidden = true;
    el.refundBtn.hidden = true;
    el.releaseBtn.hidden = true;
    el.banner.hidden = true;
    setEscState("releasing");
    const pressAt = performance.now();

    const streams = el.wallets.map((w) => streamDots(el.vault, w, ESCROW_CONFIG.releaseMs));
    Promise.all(streams).then(() => {
      const t = ((performance.now() - pressAt) / 1000).toFixed(1) + "s";
      el.wallets.forEach((w) => {
        w.classList.add("is-settled");
        w.querySelector(".esc-node-status").textContent = "SETTLED · " + t;
      });
      el.vaultAmt.textContent = "€0";
      el.chip.textContent = "RELEASED · SPLIT EXECUTED";
      el.views.hidden = true;
      el.viewsCaption.hidden = true;
      el.compare.hidden = true;
      el.beat.hidden = true;
      el.stamp.textContent = stampText;
      el.stamp.hidden = false;
      el.receipt.hidden = false;
      el.primary.textContent = "Replay";
      el.primary.hidden = false;
      setEscState("settled");
      busy = false;
    });
  }

  function openDispute() {
    if (busy || escState !== "held") return;
    el.primary.hidden = true;
    el.disputeBtn.hidden = true;
    el.banner.hidden = false;
    el.refundBtn.hidden = false;
    el.releaseBtn.hidden = false;
    setEscState("dispute");
  }

  function refundPayer() {
    if (busy || escState !== "dispute") return;
    busy = true;
    el.refundBtn.hidden = true;
    el.releaseBtn.hidden = true;
    el.banner.hidden = true;
    setEscState("releasing");

    streamDots(el.vault, el.payer, ESCROW_CONFIG.releaseMs).then(() => {
      el.payerStatus.textContent = "REFUNDED · " + ESCROW_CONFIG.amountIn;
      el.vaultAmt.textContent = "€0";
      el.chip.textContent = "RELEASED · FULL REFUND";
      el.views.hidden = true;
      el.viewsCaption.hidden = true;
      el.compare.hidden = true;
      el.beat.hidden = true;
      el.stamp.textContent = ESCROW_CONFIG.stampDispute;
      el.stamp.hidden = false;
      el.receipt.hidden = false;
      el.primary.textContent = "Replay";
      el.primary.hidden = false;
      setEscState("settled");
      busy = false;
    });
  }

  function resetDemo() {
    el.payer.classList.remove("is-stamped");
    el.payerStatus.textContent = "READY";
    el.vaultAmt.textContent = "€0";
    el.chip.textContent = "AWAITING PAYMENT";
    el.chip.classList.remove("is-live");
    el.hash.hidden = true;
    el.beat.hidden = true;
    el.rule.hidden = true;
    el.cond.textContent = scenario.cond + ": PENDING";
    el.cond.classList.remove("is-met");
    el.views.hidden = true;
    el.viewsCaption.hidden = true;
    el.compare.hidden = true;
    el.banner.hidden = true;
    el.stamp.hidden = true;
    el.receipt.hidden = true;
    el.wallets.forEach((w) => {
      w.classList.remove("is-settled");
      w.querySelector(".esc-node-status").textContent = "AWAITING";
    });
    el.disputeBtn.hidden = true;
    el.refundBtn.hidden = true;
    el.releaseBtn.hidden = true;
    el.primary.textContent = scenario.simulate;
    el.primary.hidden = false;
    setEscState("idle");
  }

  // Scenario presets: labels only, amounts and mechanics identical.
  function applyScenario(s) {
    scenario = s;
    el.payerLabel.textContent = s.payer;
    el.wallets.forEach((w) => {
      w.querySelector(".esc-node-label").textContent = s.wallets[w.dataset.wallet];
    });
    el.viewA.textContent = s.views[0];
    el.viewB.textContent = s.views[1];
    el.ruleLine.textContent = s.rule;
    el.refundBtn.textContent = s.refund;
    el.releaseBtn.textContent = s.release;
    resetDemo();
  }

  ESCROW_CONFIG.scenarios.forEach((s, i) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mono esc-scenario-btn" + (i === 0 ? " is-on" : "");
    btn.textContent = s.tag ? s.label + " · " + s.tag : s.label;
    btn.addEventListener("click", () => {
      if (busy) return;
      el.scenarios.querySelectorAll(".esc-scenario-btn").forEach((b) => b.classList.remove("is-on"));
      btn.classList.add("is-on");
      applyScenario(s);
    });
    el.scenarios.appendChild(btn);
  });

  el.primary.addEventListener("click", () => {
    if (escState === "idle") startPayment();
    else if (escState === "held") runSplit(ESCROW_CONFIG.stampSplit);
    else if (escState === "settled") resetDemo();
  });
  el.disputeBtn.addEventListener("click", openDispute);
  el.refundBtn.addEventListener("click", refundPayer);
  el.releaseBtn.addEventListener("click", () => {
    if (busy || escState !== "dispute") return;
    runSplit(ESCROW_CONFIG.stampDispute);
  });

  // Cosmetic rail toggle. EURC stays the settlement path either way.
  document.querySelectorAll(".esc-rail-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".esc-rail-btn").forEach((b) => b.classList.remove("is-on"));
      btn.classList.add("is-on");
      el.payerSub.textContent = "PAYS VIA " + btn.dataset.rail.toUpperCase();
    });
  });

  // Auto-play once when the widget scrolls into view.
  if ("IntersectionObserver" in window) {
    const escIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            escIO.disconnect();
            if (escState === "idle") startPayment();
          }
        });
      },
      { threshold: 0.45 }
    );
    escIO.observe(esc);
  }

  setEscState("idle");
}

/* ============================================================
   WORLD MAP RACE (change order v2.3)
   Setlz rails vs a traditional international wire, same map.
   Dot grid comes from map-dots.js (baked at build time, no
   external requests). All corridor data lives in WM_CONFIG.
============================================================ */

const WM_CONFIG = {
  arcMs: 2000,          // Setlz crosses in 2 seconds real time
  wireSegMs: 2400,      // wire pulse per hop segment
  wirePauseMs: 550,     // dwell at each intermediate hop
  wireStallMs: 2600,    // extra stall with the banking hours label
  lapseMs: 2600,        // stage 2 time-lapse duration
  feeTicks: ["~$9", "~$18", "~$27", "$30 TO 40 TYPICAL"],
  corridors: [
    {
      key: "detroit-paris",
      label: "DETROIT → PARIS",
      viewBox: [85, 18, 440, 176],
      viewBoxMobile: [105, 25, 380, 165],
      dotR: 1.15,
      from: { name: "DETROIT", lat: 42.33, lon: -83.05, la: [-6, -8, "end"] },
      to: { name: "PARIS", lat: 48.86, lon: 2.35, la: [6, -8, "start"] },
      pulseStart: "$1,000 · USDC",
      pulseEnd: "EURC",
      flip: true,
      midCaption: "The FX event: USDC to EURC, transparent on-chain rate, executed in the same second.",
      wireHops: [
        { name: "DETROIT BANK", lat: 42.33, lon: -83.05, lbl: false },
        { name: "US CORRESPONDENT · NEW YORK", lat: 40.71, lon: -74.0, la: [7, 15, "start"] },
        { name: "SWIFT NETWORK", lat: 38.0, lon: -38.0, la: [0, 16, "middle"] },
        { name: "EU CORRESPONDENT · FRANKFURT", lat: 50.11, lon: 8.68, la: [8, 15, "end"] },
        { name: "PARIS BANK", lat: 48.86, lon: 2.35, lbl: false },
      ],
      stallHop: 3,
      payoff: "The money is in Paris before the wire form is finished.",
    },
    {
      key: "malaga-dublin",
      label: "MALAGA → DUBLIN",
      viewBox: [340, 28, 175, 105],
      viewBoxMobile: [372, 32, 130, 102],
      dotR: 0.62,
      from: { name: "MALAGA", lat: 36.72, lon: -4.42, la: [7, 11, "start"] },
      to: { name: "DUBLIN", lat: 53.35, lon: -6.26, la: [7, -6, "start"] },
      pulseStart: "EURC",
      pulseEnd: "EURC",
      flip: false,
      midCaption: "EU internal: EURC end to end, no coin flip needed.",
      wireHops: [
        { name: "MALAGA BANK", lat: 36.72, lon: -4.42, lbl: false },
        { name: "ES CORRESPONDENT · MADRID", lat: 40.42, lon: -3.7, la: [7, 4, "start"] },
        { name: "SWIFT NETWORK", lat: 46.0, lon: -14.0, la: [-7, 4, "end"] },
        { name: "IE CORRESPONDENT", lat: 52.3, lon: -8.6, la: [-7, 10, "end"] },
        { name: "DUBLIN BANK", lat: 53.35, lon: -6.26, lbl: false },
      ],
      stallHop: 3,
      payoff: "The money is in Dublin before the wire form is finished.",
    },
    {
      key: "accra-rotterdam",
      label: "ACCRA → ROTTERDAM",
      tag: "EXPLORATORY · B2B CORRIDOR",
      viewBox: [330, 28, 245, 238],
      viewBoxMobile: [372, 30, 165, 236],
      dotR: 0.85,
      from: { name: "ACCRA", lat: 5.6, lon: -0.19, la: [8, 4, "start"] },
      to: { name: "ROTTERDAM", lat: 51.92, lon: 4.48, la: [8, -6, "start"] },
      pulseStart: "USDC",
      pulseEnd: "EURC",
      flip: true,
      midCaption: "The FX event: USDC to EURC, transparent on-chain rate, executed in the same second.",
      wireHops: [
        { name: "ACCRA BANK", lat: 5.6, lon: -0.19, lbl: false },
        { name: "REGIONAL CORRESPONDENT", lat: 14.7, lon: -17.5, la: [7, 14, "start"] },
        { name: "SWIFT NETWORK", lat: 30.0, lon: -22.0, la: [7, -7, "start"] },
        { name: "EU CORRESPONDENT · FRANKFURT", lat: 50.11, lon: 8.68, la: [7, 14, "end"] },
        { name: "ROTTERDAM BANK", lat: 51.92, lon: 4.48, lbl: false },
      ],
      stallHop: 3,
      payoff: "The money is in Rotterdam before the wire form is finished.",
    },
  ],
};

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
  wEl.brand.textContent = BRAND_NAME.toUpperCase();

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
    const vb = isMobileMap() && c.viewBoxMobile ? c.viewBoxMobile : c.viewBox;
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
    wEl.credit.textContent = "SEPA INSTANT · PENDING";
    wEl.elapsed.textContent = "NOT STARTED";
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
    wEl.credit.textContent = "TYPICALLY UNDER 30 MIN · PROVIDER DEPENDENT";
    wEl.elapsed.textContent = "1 TO 5 BUSINESS DAYS";
    wEl.fees.textContent = "$30 TO 40 TYPICAL";
    wEl.daybox.hidden = false;
    wEl.daybox.textContent = "WIRE · STILL SUBJECT TO BANKING HOURS";
    wEl.dest.hidden = false;
    wEl.settled.textContent = "SETTLED ON BASE · 2.0s · SIMULATED";
    wEl.stage2.hidden = false;
    wEl.stage2.innerHTML = '<span class="is-strong">EURC → EUR · SEPA INSTANT</span><span>BANK ACCOUNT CREDITED</span><span>TYPICALLY UNDER 30 MIN · PROVIDER DEPENDENT</span>';
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
        wEl.settled.textContent = "SETTLED ON BASE · 2.0s · SIMULATED";
        wEl.live.textContent = BRAND_NAME + " settled on Base in about 2 seconds. Wire still in transit.";
      }

      // Stage 2 time-lapse: EURC to EUR, SEPA Instant.
      if (settledArc && !lapseDone) {
        const lf = Math.min((ms - lapseStart) / WM_CONFIG.lapseMs, 1);
        wEl.stage2.hidden = false;
        if (lf < 1) {
          const eased = 1 - Math.pow(1 - lf, 2);
          wEl.stage2.innerHTML = '<span class="is-strong">EURC → EUR · SEPA INSTANT</span><span>TIME-LAPSE · ' + fmtLapse(eased * 28 * 60) + "</span>";
        } else {
          lapseDone = true;
          wEl.stage2.innerHTML = '<span class="is-strong">EURC → EUR · SEPA INSTANT</span><span>BANK ACCOUNT CREDITED</span><span>TYPICALLY UNDER 30 MIN · PROVIDER DEPENDENT</span>';
          wEl.credit.textContent = "TYPICALLY UNDER 30 MIN · PROVIDER DEPENDENT";
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
        wEl.daybox.textContent = "WIRE · DAY " + day + " · IN TRANSIT";
        wEl.elapsed.textContent = "DAY " + day + " (1 TO 5 TYPICAL)";

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
          wEl.daybox.textContent = "WIRE · CREDITED · DAY 3";
          wEl.elapsed.textContent = "1 TO 5 BUSINESS DAYS";
          wEl.fees.textContent = "$30 TO 40 TYPICAL";
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
   DEMO REQUEST FORM (change order v2.7)
   Front-end only, honestly unwired: no storage, no cookies,
   no network call. All copy and the placeholder email live in
   DEMO_CONFIG so wiring or renaming later is one edit.
============================================================ */

const DEMO_CONFIG = {
  labels: {
    name: "NAME",
    email: "WORK EMAIL",
    company: "COMPANY",
    settling: "WHAT ARE YOU SETTLING?",
    notes: "ANYTHING WE SHOULD KNOW? (OPTIONAL)",
  },
  options: ["Marketplace payouts", "Travel supply", "Property management", "Cross-border B2B", "Other"],
  submitLabel: "Request a demo",
  settlingLabel: "Settling…",
  settleMs: 900,
  confirmHead: "Request received.",
  confirmLine: "Demo build note: this form is not connected yet. To reach us now, email the address below.",
  // Placeholder must look like a placeholder until a real address exists.
  emailDisplay: () => "demo@[" + BRAND_NAME.toLowerCase() + "-domain-pending].example",
  emailHref: () => "mailto:demo@" + BRAND_NAME.toLowerCase() + "-domain-pending.example",
  fine: "DEMO SITE. FORM NOT YET CONNECTED. NO DATA IS STORED OR TRANSMITTED.",
  errors: { required: "REQUIRED", email: "ENTER A VALID EMAIL ADDRESS" },
};

const demoForm = document.getElementById("demo-form");

if (demoForm) {
  const dEl = {
    submit: document.getElementById("demo-submit"),
    confirm: document.getElementById("demo-confirm"),
    confirmHead: document.getElementById("demo-confirm-head"),
    confirmLine: document.getElementById("demo-confirm-line"),
    mailto: document.getElementById("demo-mailto"),
    confirmFine: document.getElementById("demo-confirm-fine"),
    live: document.getElementById("demo-live"),
    select: document.getElementById("demo-settling"),
  };

  // Populate labels, options, and confirmation copy from the config.
  demoForm.querySelectorAll("[data-demo-label]").forEach((l) => {
    l.textContent = DEMO_CONFIG.labels[l.dataset.demoLabel];
  });
  DEMO_CONFIG.options.forEach((o) => {
    const opt = document.createElement("option");
    opt.value = o;
    opt.textContent = o;
    dEl.select.appendChild(opt);
  });
  dEl.submit.textContent = DEMO_CONFIG.submitLabel;
  dEl.confirmHead.textContent = DEMO_CONFIG.confirmHead;
  dEl.confirmLine.textContent = DEMO_CONFIG.confirmLine;
  dEl.mailto.textContent = DEMO_CONFIG.emailDisplay();
  dEl.mailto.setAttribute("href", DEMO_CONFIG.emailHref());
  dEl.confirmFine.textContent = DEMO_CONFIG.fine;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setFieldError(id, message) {
    const input = document.getElementById(id);
    const err = document.getElementById(id + "-err");
    const wrap = input.closest(".demo-field");
    if (message) {
      wrap.classList.add("is-invalid");
      err.textContent = message;
      err.hidden = false;
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", id + "-err");
    } else {
      wrap.classList.remove("is-invalid");
      err.hidden = true;
      input.removeAttribute("aria-invalid");
    }
  }

  demoForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("demo-name").value.trim();
    const email = document.getElementById("demo-email").value.trim();
    const company = document.getElementById("demo-company").value.trim();

    setFieldError("demo-name", name ? "" : DEMO_CONFIG.errors.required);
    setFieldError("demo-email", email ? (EMAIL_RE.test(email) ? "" : DEMO_CONFIG.errors.email) : DEMO_CONFIG.errors.required);
    setFieldError("demo-company", company ? "" : DEMO_CONFIG.errors.required);

    const firstInvalid = demoForm.querySelector(".is-invalid input");
    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    // WIRING SLOT: when a real endpoint exists, POST the payload here
    // (and add the consent checkbox + privacy policy link in the markup
    // slot above the submit button). Until then: no storage, no network.
    const payload = {
      name,
      email,
      company,
      settling: dEl.select.value,
      notes: document.getElementById("demo-notes").value.trim(),
    };
    if (["localhost", "127.0.0.1"].includes(window.location.hostname)) {
      console.log("[demo-form] not wired, payload discarded:", payload);
    }

    const finish = () => {
      demoForm.hidden = true;
      dEl.confirm.hidden = false;
      dEl.live.textContent = DEMO_CONFIG.confirmHead + " " + DEMO_CONFIG.confirmLine;
    };

    if (prefersReducedMotion) {
      finish();
    } else {
      dEl.submit.disabled = true;
      dEl.submit.textContent = DEMO_CONFIG.settlingLabel;
      dEl.submit.classList.add("is-settling");
      setTimeout(finish, DEMO_CONFIG.settleMs);
    }
  });
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
   SETTLEMENT RAIL (Phase 3.1)

   State is mapped to NAMED SECTIONS, never to pixel offsets, so editing or
   reordering content cannot silently break it. A section that disappears
   simply drops out of the map.

   Driven by IntersectionObserver with a rootMargin that collapses the
   viewport to a thin band at 42% height, so exactly one section is
   "current" at a time and no ratio arithmetic is needed. There is no
   scroll listener, and no geometry is read during the callback, so the rail
   cannot cause layout thrash. Work per stage change is a handful of class
   toggles on eight elements, and it only runs when the stage actually
   changes.
============================================================ */

const rail = document.getElementById("rail");

if (rail) {
  // Node order and labels are the deck's. Each stage lists the sections that
  // belong to it; unknown ids are ignored, missing ones are harmless.
  const RAIL_STAGES = [
    ["hero", "what"],                             // Customer pays
    ["how", "hold", "anatomy"],                   // Held in escrow
    ["compare", "why"],                           // Stablecoin service delivered
    ["cases", "team", "request-demo", "notes"],   // Provider paid
  ];
  const LAST = RAIL_STAGES.length - 1;

  const nodes = Array.from(rail.querySelectorAll(".rail-node"));
  const segs = Array.from(rail.querySelectorAll(".rail-seg"));

  function paint(stage) {
    nodes.forEach((n, i) => {
      n.classList.toggle("is-done", i < stage);
      n.classList.toggle("is-current", i === stage && stage < LAST);
      // The final node only turns green once the reader actually arrives.
      n.classList.toggle("is-settled", i === LAST && stage === LAST);
    });
    segs.forEach((sg, i) => {
      sg.classList.toggle("is-filled", i < stage);
      sg.classList.toggle("is-settling", i === stage && stage < LAST);
    });
  }

  if (prefersReducedMotion) {
    // Static, complete, no transitions: every node done and the last settled.
    rail.classList.add("is-static");
    paint(LAST);
  } else {
    let current = -1;
    const stageOf = new Map();
    RAIL_STAGES.forEach((ids, i) => ids.forEach((id) => stageOf.set(id, i)));

    paint(0);

    const railIO = new IntersectionObserver(
      (entries) => {
        // The band is thin enough that at most one section reports in.
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const stage = stageOf.get(entry.target.id);
          if (stage === undefined || stage === current) continue;
          current = stage;
          paint(stage);
        }
      },
      { rootMargin: "-42% 0px -56% 0px", threshold: 0 }
    );

    stageOf.forEach((_stage, id) => {
      const el = document.getElementById(id);
      if (el) railIO.observe(el);
    });
  }
}

/* ============================================================
   NOTE AFFORDANCES (change order: Phase 1.3)
   Replaces the per-component asterisked footnotes. CSS handles
   hover and focus-within; this adds the tap path, dismissal, and
   edge pinning so a popover never runs off screen.
============================================================ */

document.querySelectorAll(".note-ref").forEach((ref) => {
  const btn = ref.querySelector(".note-btn");
  const pop = ref.querySelector(".note-pop");
  if (!btn || !pop) return;

  function close() {
    pop.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
  }

  function open() {
    // Pin to whichever edge keeps it on screen. Measured after showing,
    // since a hidden element has no box.
    pop.classList.remove("pin-left", "pin-right");
    pop.classList.add("is-open");
    btn.setAttribute("aria-expanded", "true");
    const r = pop.getBoundingClientRect();
    if (r.left < 8) pop.classList.add("pin-left");
    else if (r.right > window.innerWidth - 8) pop.classList.add("pin-right");
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (pop.classList.contains("is-open")) close();
    else {
      document.querySelectorAll(".note-pop.is-open").forEach((p) => {
        p.classList.remove("is-open");
        p.closest(".note-ref").querySelector(".note-btn").setAttribute("aria-expanded", "false");
      });
      open();
    }
  });

  btn.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { close(); btn.blur(); }
  });

  // Same edge pinning for the hover and focus paths, which CSS drives.
  ref.addEventListener("pointerenter", () => {
    pop.classList.remove("pin-left", "pin-right");
    const r = pop.getBoundingClientRect();
    if (r.left < 8) pop.classList.add("pin-left");
    else if (r.right > window.innerWidth - 8) pop.classList.add("pin-right");
  });
});

document.addEventListener("click", () => {
  document.querySelectorAll(".note-pop.is-open").forEach((p) => {
    p.classList.remove("is-open");
    p.closest(".note-ref").querySelector(".note-btn").setAttribute("aria-expanded", "false");
  });
});

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
