# Architecture

## Design goals

The demo is optimized for four properties:

1. Safe to publish: every record is fictional and deterministic.
2. Easy to evaluate: a browser and a four-digit demo PIN are enough.
3. Easy to host: Firebase serves static files only.
4. Honest about scope: simulated and roadmap capabilities are labeled.

## Runtime

Each page under `styles/` is self-contained. CSS, JavaScript, and the compact fictional
dataset are embedded directly in the page. There are no runtime dependencies or
network requests.

All mutations happen in memory:

- Picking and review state
- Quantity edits
- Notes, refunds, and PDF metadata
- Inventory imports and bin changes
- Recent searches and activity events

Refreshing the page restores the deterministic seed state.

## Data generation

`scripts/generate-demo-data.js` produces:

- 64 obviously fictional `DEMO-*` SKUs
- A fictional six-aisle floor with 192 addressable bins
- Six fictional staff names
- Sixteen seed orders across several months
- Shipping, stage, note, refund, and attachment metadata

`scripts/reembed-data.js` copies the canonical JSON into all three interactive style
variants using a brace- and string-aware scanner.

## Hosting

`firebase.json` serves `styles/` and rewrites:

- `/` → `/index-minimal.html`
- `/features` → `/features.html`

The configuration applies no-store caching, disables framing, blocks external
connections, and denies camera, microphone, and geolocation permissions.

## Release gates

`npm run validate` checks syntax, data invariants, embedded data, offline constraints,
feature markers, hosting routes, public-safety terms, and prohibited filenames.

GitHub Actions repeats those checks and runs gitleaks across repository history.
