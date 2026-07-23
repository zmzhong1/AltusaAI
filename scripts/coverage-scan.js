#!/usr/bin/env node
/**
 * Feature-coverage scanner for the Altusa WMS demo.
 * Heuristic: checks for marker text/patterns of each WMS Feature-Catalog feature
 * across the 3 style variants. Presence ≠ full correctness — it's a fast tripwire
 * to see what's wired in each variant and flag divergence. Re-run after each build wave.
 *
 *   node scripts/coverage-scan.js
 */
const fs = require("fs");
const path = require("path");

const files = ["index-minimal.html", "index-tech.html", "index-warm.html"];
const src = files.map((f) => ({
  key: f.replace("index-", "").replace(".html", ""),
  text: fs.readFileSync(path.join(__dirname, "..", "styles", f), "utf8"),
}));

// scope: ui = should be a working UI feature in the web demo
//        text = represented as label / trust copy
//        out = backend/integration/python — belongs in a diagram or the real repo, not a single-file mock
//        roadmap = honestly-labeled "planned"
const F = [
  ["Access & Trust", null, null],
  ["PIN keypad login", /\bPIN\b|keypad|passcode/i, "ui"],
  ["Roles: admin/manager/staff", /manager\s*[▸>]\s*staff|admin.{0,3}manager.{0,3}staff/i, "text"],
  ["Field-level security (staff can't touch prices)", /never touch prices|field-level/i, "text"],
  ["Immutable audit log", /audit ?log/i, "out"],
  ["Nightly backup", /\bbackup\b/i, "out"],
  ["PIN lockout / cooldown", /lockout|cooldown/i, "out"],

  ["Inventory & Bins", null, null],
  ["Item / SKU / barcode search", /search (sku|item)|search.{0,10}barcode/i, "ui"],
  ["Barcode scanning (camera/HID)", /camera|barcode scan|hid scanner|scanner/i, "ui"],
  ["Guided BinPicker (aisle→section→level)", /binpicker|bin picker|aisle.{0,8}section.{0,8}level/i, "ui"],
  ["Multi-bin (add/replace/remove)", /multi-?bin|multiple bins/i, "ui"],
  ["Default-bin ⭐", /default bin|defaultBin|⭐|★/i, "ui"],
  ["HOLD / NEW staging bins", /\bHOLD\b|staging/i, "text"],
  ["Unbinned / low-stock drilldowns", /drilldown|low stock|unbinned/i, "ui"],
  ["Live bin-activity feed", /last activity|bin activity/i, "ui"],
  ["Bulk CSV import / export", /csv import|bulk import|import.{0,12}csv|legacy oms/i, "ui"],

  ["Picking & Orders", null, null],
  ["Pick-list PDF parsing → order", /parse.{0,12}pick|pick.?list.{0,12}pdf|pdf.{0,12}order/i, "out"],
  ["Snake walk-path optimization", /walk|\bgo to\b|serpentine/i, "ui"],
  ["Live collaborative picking", /collaborat|active picker|multi.?picker|avatars/i, "out"],
  ["Session resume", /session resume|resume.{0,10}pick/i, "out"],
  ["Skip / requeue blocked item", /\bskip\b|requeue/i, "ui"],
  ["Short-pick → discrepancy", /short|discrepanc/i, "ui"],
  ["3-stage review (Picker→Reviewer→Editor)", /reviewer|mark reviewed/i, "ui"],
  ["EDITED badge", /\bedited\b/i, "ui"],
  ["Order board (kanban)", /kanban|order board/i, "ui"],
  ["Order history", /order history|completed/i, "ui"],
  ["Order notes / refunds", /refund|order note/i, "out"],
  ["Per-order PDF attachment", /attach/i, "out"],
  ["Shipping info", /shipping|\bship\b/i, "ui"],

  ["Communications & Integrations", null, null],
  ["Email→PDF→order pipeline", /gmail|email.{0,12}pdf|processpickup/i, "out"],
  ["On-prem folder-watcher bridge", /watcher|print to pdf|on-?prem/i, "out"],
  ["Telegram notifications + bot", /telegram/i, "out"],
  ["Scheduled shift digest", /shift (summary|digest)|end.of.shift/i, "out"],
  ["Team chat", /team chat/i, "out"],
  ["Dashboard stats & pick performance", /dashboard/i, "ui"],

  ["Facility Layer", null, null],
  ["Interactive warehouse map", /receiving|shipping|floor|occupancy/i, "ui"],
  ["Aisle-sign generator (PDF)", /aisle sign|signage|reportlab/i, "out"],
  ["Section labels / bin barcodes", /section label|bin barcode/i, "out"],

  ["Platform", null, null],
  ["PWA install / offline", /manifest|service.?worker|standalone|offline/i, "ui"],
  ["Dark mode", /prefers-color-scheme|data-theme|dark mode/i, "ui"],
  ["Audio / haptic feedback", /vibrate|haptic/i, "out"],

  ["Roadmap (label as planned)", null, null],
  ["Pack-out photos", /pack.?out/i, "roadmap"],
  ["Forecasting / intelligence", /forecast/i, "roadmap"],
];

const mark = (present) => (present ? "✓" : "·");
let rows = [];
let uiTotal = 0, uiAllThree = 0;
for (const [label, re, scope] of F) {
  if (!re) { rows.push(`\n**${label}**`); continue; }
  const hits = src.map((s) => re.test(s.text));
  const n = hits.filter(Boolean).length;
  if (scope === "ui") { uiTotal++; if (n === 3) uiAllThree++; }
  const scopeTag = { ui: "UI", text: "copy", out: "backend/diagram", roadmap: "roadmap" }[scope];
  rows.push(`${mark(hits[0])} ${mark(hits[1])} ${mark(hits[2])}  [${scopeTag}]  ${label}`);
}

console.log("Marker presence — columns: minimal / tech / warm  (✓ found · missing)");
console.log("Scope: UI = should be a working screen · copy = shown as text · backend/diagram = not for a single-file mock · roadmap = planned\n");
console.log(rows.join("\n"));
console.log(`\nUI features present in all 3 variants: ${uiAllThree}/${uiTotal}`);
