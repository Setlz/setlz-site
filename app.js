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

function shortHash() {
  return "0x" + randomHash(4) + "…" + randomHash(4);
}

/* ============================================================
   SETTLEMENT STREAM (hero)
   Simulated flow for the demo; amounts are illustrative only.
============================================================ */

const lanesEl = document.getElementById("stream-lanes");
const ledgerEl = document.getElementById("ledger-list");

const AMOUNTS = [
  "€1,240.00", "€86.50", "€2,412.00", "€318.75",
  "€940.00", "€152.20", "€4,080.00", "€67.90",
  "€512.40", "€1,795.00",
];

let amountIdx = Math.floor(Math.random() * AMOUNTS.length);
const LANE_POSITIONS = [14, 44, 74]; // % from top of the lanes box
let laneIdx = 0;

function settleToLedger(amount, seconds) {
  const li = document.createElement("li");
  const amt = document.createElement("span");
  amt.className = "ledger-amt";
  amt.textContent = amount;
  const time = document.createElement("span");
  time.className = "ledger-time";
  time.textContent = seconds.toFixed(1) + "s";
  const hash = document.createElement("span");
  hash.className = "ledger-hash";
  hash.textContent = shortHash();
  li.append(amt, time, hash);
  ledgerEl.prepend(li);
  while (ledgerEl.children.length > 6) ledgerEl.lastElementChild.remove();
}

function spawnChip() {
  if (!lanesEl) return;
  const amount = AMOUNTS[amountIdx % AMOUNTS.length];
  amountIdx++;

  const travelSeconds = 0.9 + Math.random() * 1.5;

  if (prefersReducedMotion) {
    settleToLedger(amount, travelSeconds);
    return;
  }

  const chip = document.createElement("div");
  chip.className = "chip";
  chip.innerHTML = '<span class="chip-cur">EURC</span><span>' + amount + "</span>";
  chip.style.top = LANE_POSITIONS[laneIdx % LANE_POSITIONS.length] + "%";
  laneIdx++;
  lanesEl.appendChild(chip);

  const distance = lanesEl.clientWidth + 220;
  chip.style.transition = "transform " + travelSeconds + "s cubic-bezier(0.3, 0, 0.2, 1)";

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      chip.style.transform = "translateX(" + distance + "px)";
    });
  });

  setTimeout(() => {
    chip.remove();
    settleToLedger(amount, travelSeconds);
  }, travelSeconds * 1000);
}

if (lanesEl && ledgerEl) {
  // Seed the ledger so it never looks empty on load.
  settleToLedger(AMOUNTS[7], 1.3);
  settleToLedger(AMOUNTS[3], 2.1);
  spawnChip();
  setInterval(spawnChip, 1500);
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
  finalityCopy: "SETLD ON BASE · ABOUT 2 SECONDS", // speed harmonised site-wide (v2.9)
  // Hash is deliberately fake: SIM prefix, DEMO suffix, labelled simulated.
  hashText: () => "TX 0xSIM" + randomHash(4).toUpperCase() + "…DEMO · SIMULATED",
  stageLabels: {
    idle: "01 PAYMENT",
    paid_settling: "01 PAYMENT",
    held: "02 HOLD",
    dispute: "02 HOLD · DISPUTE WINDOW",
    releasing: "03 RELEASE",
    settled: "04 SETLD",
  },
  announce: {
    idle: "Escrow demo ready. Press the simulate button.",
    paid_settling: "Payment setling into on-chain escrow.",
    held: "Funds locked in escrow. Release fires when the condition is met.",
    dispute: "Dispute open. Funds remain secured while the window runs.",
    releasing: "Condition met. Releasing and splitting atomically.",
    settled: "Setld. One transaction, three payouts, zero reconciliation.",
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
    el.chip.textContent = "SETLING…";
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
        w.querySelector(".esc-node-status").textContent = "SETLD · " + t;
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
    settling: "WHAT ARE YOU SETLING?",
    notes: "ANYTHING WE SHOULD KNOW? (OPTIONAL)",
  },
  options: ["Marketplace payouts", "Travel supply", "Property management", "Cross-border B2B", "Other"],
  submitLabel: "Request a demo",
  settlingLabel: "Setling…",
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
