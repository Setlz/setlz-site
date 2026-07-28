/* ============================================================
   PAGE MEASUREMENT SNIPPET
   Produces the numbers in design/baseline/metrics.json.

   There is no Node on this machine, so there is no CLI runner.
   To regenerate: open the site, set the viewport to each target
   width (1440x900, 768x1024, 390x844), paste this in the console,
   and record the output. See design/README.md for why.

   Run it at each width separately. Scroll position does not matter,
   but reveal-gated elements must be visible or heights read short,
   so the snippet force-reveals them first.
============================================================ */

(() => {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));

  const d = document.documentElement;
  const sections = {};
  document.querySelectorAll("main > section, footer").forEach((s) => {
    sections[s.id || s.className.split(" ")[0]] = Math.round(s.getBoundingClientRect().height);
  });

  // Overflow check: SVG map dots legitimately extend past the crop, so
  // only flag document-level overflow, not per-element.
  return {
    viewport: { w: window.innerWidth, h: window.innerHeight },
    documentHeight: d.scrollHeight,
    screens: +(d.scrollHeight / window.innerHeight).toFixed(1),
    overflowX: d.scrollWidth > window.innerWidth,
    sections,
  };
})();
