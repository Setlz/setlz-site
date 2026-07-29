# design/

Regression baselines for the site rebuild.

## Status: numeric baseline only, no pixel baseline

Phase 0.2 asked for full-page Playwright screenshots at 1440, 768 and 390, plus a
`shots` script. **That is not currently possible on this machine.** What blocked it:

| Route | Blocker |
|---|---|
| `npm i -D playwright` | No `node`, no `npm`, no `npx` installed. |
| Homebrew install | No `brew` installed. |
| Headless Chrome from the shell | Chrome 
is present at `/Applications/Google Chrome.app`, but the first invocation hung past a two-minute timeout (the hero's `setInterval` stream never idles, which starves `--virtual-time-budget`), and the retry was declined. |
| In-app browser pane | Screenshots work, but viewport-sized only. At 390px the page is 26,332px tall — 31 captures per width, returned as chat images rather than files. Not a diffable artefact. |

So `baseline/metrics.json` holds a **numeric** baseline instead: document height, per-section
heights and a page inventory, at all three widths. It catches the thing Phase 1 is most
likely to get wrong — deleting less than intended — and it feeds Phase 7.1's
before/after page-height report directly. It does not catch visual regressions.

Git is the real safety net in the meantime: every phase is a separate commit, so any step
is revertable.

## To enable real pixel baselines

Either route works. Node is the more standard one.

**Node route:**

```bash
brew install node
```

Then, from the repo root:

```bash
npm init -y && npm i -D playwright && npx playwright install chromium
```

**Python-only route** (no Node, no Homebrew; uses the system Python 3.9):

```bash
pip3 install --user playwright && python3 -m playwright install chromium
```

Once either is in place, ask for the `shots` script and it will be written to capture
full-page PNGs into `baseline/` and `current/` for diffing.

One thing the script must handle: **the hero settlement stream loops forever**
(`setInterval`, `app.js:112`). Any capture has to either stub that interval or wait a
fixed delay rather than for network/animation idle, or it will hang the way headless
Chrome did. Phase 3.2 replaces that hero with a run-once animation, which removes the
problem.

## Files

| File | Purpose |
|---|---|
| `measure.js` | The console snippet that produced `metrics.json`. Paste at each width. |
| `baseline/metrics.json` | Pre-Phase-1 numbers, at commit `89b1a1b`. |
| `current/` | Created when a comparison run is made. |

## Accessibility audit (Phase 7.2)

axe-core is used for the audit but deliberately **not committed** — it is a
553KB dev dependency in a repo whose entire shipped payload is smaller than
that, and nothing on the site links to it. `design/vendor/` is gitignored.

To re-run:

```bash
curl -sL https://cdn.jsdelivr.net/npm/axe-core@4.10.2/axe.min.js -o design/vendor/axe.min.js
```

Then, with the site open, inject `/design/vendor/axe.min.js` and call
`axe.run(document, {runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa','best-practice']}})`.

Force `.reveal` elements visible first (`document.querySelectorAll('.reveal')
.forEach(e=>e.classList.add('is-visible'))`) or scroll-gated content is
audited while transparent and contrast checks come back incomplete.

## Open Graph image

`design/og-image.svg` is the source for the site's `og-image.png`. It reuses the
hero's statement device, so a link preview shows the same object the page opens
with, and it is built only from the design tokens.

Regenerate with the command in the root README's launch checklist. The
intermediate `design/og-image.svg.png` is a build artefact and is gitignored.
