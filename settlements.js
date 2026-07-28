/* ============================================================
   SIMULATED SETTLEMENTS  ·  the anatomy demo

   These are ILLUSTRATIVE settlements, not chain records. Every hash is
   prefixed `0xsim` so it can never be mistaken for a real one, and the
   section labels itself as simulated.

   The point of the element is not the hash. It is that one payment becomes
   one transaction with several payouts, released on a condition. That is the
   product, and it is what a decorative random hash never showed.

   When real production hashes exist, this file is where they go: swap the
   0xsim values for full 66-character Base hashes, drop `simulated: true`,
   and the renderer will link each one to the block explorer instead of
   labelling it simulated.
============================================================ */

const SETTLEMENTS = {
  simulated: true,
  network: "Base",
  explorer: "https://basescan.org/tx/",

  // Settlement contracts have been audited by Hacken. Report URL and audit
  // date still to be supplied; the renderer omits the link until it is.
  audit: {
    firm: "Hacken",
    reportUrl: "", // TODO: paste the published Hacken report URL
    date: "",      // TODO: audit date, e.g. "June 2026"
  },

  entries: [
    {
      hash: "0xsim7f3c9e21a4f2",
      trigger: "Check-in confirmed",
      date: "14 Jun 2026",
      amount: "€1,240.00",
      elapsed: "11m 04s",
      steps: [
        { t: "00.00s", what: "Payment captured", detail: "Card, guest-facing", amount: "€1,240.00" },
        { t: "00.42s", what: "Setld to escrow", detail: "EURC on " + "Base" },
        { t: "—", what: "Held by rule", detail: "Release on check-in confirmation" },
        { t: "11m 04s", what: "Condition met, released", detail: "Split executed atomically" },
      ],
      legs: [
        { to: "Host", amount: "€1,091.20" },
        { to: "Service partner", amount: "€24.80" },
        { to: "Platform", amount: "€124.00" },
      ],
    },
    {
      hash: "0xsim2b81d40c77e5",
      trigger: "Proof of delivery",
      date: "02 Jul 2026",
      amount: "€8,410.00",
      elapsed: "09m 51s",
      steps: [
        { t: "00.00s", what: "Payment captured", detail: "Bank transfer, shipper", amount: "€8,410.00" },
        { t: "00.38s", what: "Setld to escrow", detail: "EURC on Base" },
        { t: "—", what: "Held by rule", detail: "Release on signed proof of delivery" },
        { t: "09m 51s", what: "Condition met, released", detail: "Split executed atomically" },
      ],
      legs: [
        { to: "Carrier", amount: "€7,148.50" },
        { to: "Forwarder", amount: "€841.00" },
        { to: "Platform", amount: "€420.50" },
      ],
    },
    {
      hash: "0xsimc0a65f9b31da",
      trigger: "Milestone approved",
      date: "19 Jul 2026",
      amount: "€26,000.00",
      elapsed: "12m 17s",
      steps: [
        { t: "00.00s", what: "Payment captured", detail: "Bank transfer, buyer", amount: "€26,000.00" },
        { t: "00.51s", what: "Setld to escrow", detail: "EURC on Base" },
        { t: "—", what: "Held by rule", detail: "Release against shipping documents" },
        { t: "12m 17s", what: "Condition met, released", detail: "Split executed atomically" },
      ],
      legs: [
        { to: "Supplier", amount: "€24,700.00" },
        { to: "Inspection agent", amount: "€520.00" },
        { to: "Platform", amount: "€780.00" },
      ],
    },
  ],
};
