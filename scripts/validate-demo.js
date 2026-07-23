#!/usr/bin/env node
/**
 * Repeatable static/data gate for the Altusa WMS demo.
 *
 * This complements browser interaction tests. It verifies the canonical fictional
 * dataset, each HTML file's embedded copy, inline JavaScript syntax, offline-only
 * constraints, and a few deployment-critical markers.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const stylesDir = path.join(root, "styles");
const styleFiles = ["index-minimal.html", "index-tech.html", "index-warm.html"];
const supportingPages = ["features.html"];
const canonical = JSON.parse(fs.readFileSync(path.join(root, "data", "demo-warehouse.json"), "utf8"));
const failures = [];
const privateSourcePattern = new RegExp(
  ["so" + "nice", "ver" + "non", ("so" + "nice") + "-warehouse"].join("|"),
  "i"
);

function fail(message) {
  failures.push(message);
}

function findJsonEnd(text, start) {
  let depth = 0;
  let inString = false;
  let escaped = false;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (ch === "\\") escaped = true;
      else if (ch === '"') inString = false;
      continue;
    }
    if (ch === '"') inString = true;
    else if (ch === "{") depth++;
    else if (ch === "}" && --depth === 0) return i;
  }
  return -1;
}

function embeddedData(html, file) {
  const match = html.match(/(?:var|let|const)\s+\w+\s*=\s*(?=\{\s*"meta")/);
  if (!match) {
    fail(`${file}: embedded demo data declaration missing`);
    return null;
  }
  const start = match.index + match[0].length;
  const end = findJsonEnd(html, start);
  if (end < start) {
    fail(`${file}: embedded demo data is unbalanced`);
    return null;
  }
  try {
    return JSON.parse(html.slice(start, end + 1));
  } catch (error) {
    fail(`${file}: embedded demo data is invalid JSON (${error.message})`);
    return null;
  }
}

const validBins = new Set(
  canonical.floor.aisles.flatMap((aisle) =>
    canonical.floor.sections.flatMap((section) =>
      canonical.floor.levels.map((level) => `${aisle}-${section}-${level}`)
    )
  )
);
const skuSet = new Set();
const barcodeSet = new Set();

for (const item of canonical.items) {
  if (!item.sku.startsWith("DEMO-")) fail(`non-fictional SKU: ${item.sku}`);
  if (skuSet.has(item.sku)) fail(`duplicate SKU: ${item.sku}`);
  if (barcodeSet.has(item.barcode)) fail(`duplicate barcode: ${item.barcode}`);
  skuSet.add(item.sku);
  barcodeSet.add(item.barcode);
  for (const bin of item.bins) if (!validBins.has(bin)) fail(`${item.sku}: invalid bin ${bin}`);
  if ((item.bins.length === 0) !== item.unbinned) fail(`${item.sku}: unbinned flag mismatch`);
  if (item.defaultBin && !item.bins.includes(item.defaultBin)) fail(`${item.sku}: default bin is absent from bins`);
  if (item.defaultBin && item.defaultBin.endsWith("-0")) fail(`${item.sku}: staging bin used as default`);
  if (item.lowStock !== (item.stock <= 10)) fail(`${item.sku}: low-stock flag mismatch`);
}

const derivedStats = {
  totalSkus: canonical.items.length,
  totalUnits: canonical.items.reduce((sum, item) => sum + item.stock, 0),
  lowStock: canonical.items.filter((item) => item.lowStock).length,
  unbinned: canonical.items.filter((item) => item.unbinned).length,
  multiBin: canonical.items.filter((item) => item.bins.length > 1).length,
  binsOccupied: new Set(canonical.items.flatMap((item) => item.bins)).size,
  binsTotal: validBins.size,
};
for (const [key, value] of Object.entries(derivedStats)) {
  if (canonical.stats[key] !== value) fail(`inventory stat ${key}: ${canonical.stats[key]} != ${value}`);
}

const aisleOrder = Object.fromEntries(canonical.floor.aisles.map((aisle, index) => [aisle, index]));
const levelPriority = { 1: 0, 2: 1, 0: 2, 3: 3 };
function walkKey(bin) {
  const [aisle, sectionText, levelText] = bin.split("-");
  const aisleIndex = aisleOrder[aisle];
  const section = aisleIndex % 2 ? 9 - Number(sectionText) : Number(sectionText);
  return [aisleIndex, section, levelPriority[levelText]];
}
function compareBins(left, right) {
  const a = walkKey(left);
  const b = walkKey(right);
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return a[i] - b[i];
  return 0;
}

for (const order of canonical.orders) {
  const pickedUnits = order.lines.reduce((sum, line) => sum + line.pickedQty, 0);
  const unitCount = order.lines.reduce((sum, line) => sum + line.qty, 0);
  const discrepancy = order.lines.some((line) => line.shortPick);
  if (order.pickedUnits !== pickedUnits) fail(`${order.id}: pickedUnits mismatch`);
  if (order.unitCount !== unitCount) fail(`${order.id}: unitCount mismatch`);
  if (order.itemCount !== order.lines.length) fail(`${order.id}: itemCount mismatch`);
  if (order.hasDiscrepancy !== discrepancy) fail(`${order.id}: discrepancy mismatch`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(order.createdDate || "")) fail(`${order.id}: invalid createdDate`);
  if (order.orderMonth !== String(order.createdDate || "").slice(0, 7)) fail(`${order.id}: orderMonth mismatch`);
  if (!order.shipping || !order.shipping.service || !order.shipping.city || !order.shipping.region ||
      !order.shipping.postal || !order.shipping.dock || !order.shipping.shipBy ||
      !Number.isInteger(order.shipping.packages) || order.shipping.packages < 1) {
    fail(`${order.id}: incomplete shipping data`);
  }
  const stageKeys = Array.isArray(order.stages) ? order.stages.map((stage) => stage.key) : [];
  if (stageKeys.join(",") !== "picker,reviewer,editor") fail(`${order.id}: invalid stage timeline`);
  for (const stage of order.stages || []) {
    if (!["pending", "active", "complete"].includes(stage.state)) fail(`${order.id}: invalid ${stage.key} stage state`);
  }
  for (const key of ["notes", "refunds", "attachments"]) {
    if (!Array.isArray(order[key])) fail(`${order.id}: ${key} must be an array`);
  }
  if (/\b\d{1,2}:\d{2}[ap]\b/i.test(order.createdAt)) fail(`${order.id}: abbreviated am/pm timestamp`);
  if (order.status === "completed") {
    if (!order.completedAt || !/(?:am|pm)$/i.test(order.completedAt)) fail(`${order.id}: completedAt missing am/pm`);
    if (!Number.isInteger(order.completionMinutes) || order.completionMinutes < 1) fail(`${order.id}: invalid completionMinutes`);
    if ((order.stages || []).some((stage) => stage.state !== "complete")) fail(`${order.id}: completed order has unfinished stage`);
  }
  order.lines.forEach((line) => {
    if (!skuSet.has(line.sku)) fail(`${order.id}: unknown SKU ${line.sku}`);
    if (!validBins.has(line.bin)) fail(`${order.id}: invalid bin ${line.bin}`);
    if (!Number.isInteger(line.qty) || line.qty < 1) fail(`${order.id}: invalid quantity ${line.qty}`);
    if (line.pickedQty < 0 || line.pickedQty > line.qty) fail(`${order.id}: picked quantity out of range`);
  });
  for (let i = 1; i < order.lines.length; i++) {
    if (compareBins(order.lines[i - 1].bin, order.lines[i].bin) > 0) {
      fail(`${order.id}: line ${i + 1} breaks walk order`);
    }
  }
}

const todayOrders = canonical.orders.filter((order) => order.createdDate === "2026-07-23");
if (canonical.orderStats.today !== todayOrders.length) fail("orderStats.today mismatch");
if (canonical.orderStats.completed !== todayOrders.filter((order) => order.status === "completed").length) {
  fail("orderStats.completed must count completed orders from today only");
}
if (canonical.orderStats.unitsPickedToday !== todayOrders.reduce((sum, order) => sum + order.pickedUnits, 0)) {
  fail("orderStats.unitsPickedToday mismatch");
}

for (const file of styleFiles) {
  const html = fs.readFileSync(path.join(stylesDir, file), "utf8");
  const data = embeddedData(html, file);
  if (data && JSON.stringify(data) !== JSON.stringify(canonical)) fail(`${file}: embedded data differs from canonical JSON`);
  if (privateSourcePattern.test(html)) fail(`${file}: private-source identifier found`);
  if (/<(?:script|img|link)\b[^>]*(?:src|href)\s*=\s*["']https?:/i.test(html) ||
      /@import\s+(?:url\()?["']?https?:/i.test(html) ||
      /\bfetch\s*\(\s*["']https?:/i.test(html)) {
    fail(`${file}: external-request marker found`);
  }

  const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;
  let scriptCount = 0;
  while ((match = scriptPattern.exec(html))) {
    if (/type\s*=\s*["']application\/(ld\+)?json["']/i.test(match[1])) continue;
    scriptCount++;
    try {
      new Function(match[2]);
    } catch (error) {
      fail(`${file}: inline script ${scriptCount} syntax error (${error.message})`);
    }
  }
  if (!scriptCount) fail(`${file}: no executable inline script found`);
}

const minimal = fs.readFileSync(path.join(stylesDir, "index-minimal.html"), "utf8");
for (const marker of [
  "Import legacy CSV", "CSV_SAMPLE", "quantity must be 1 or more", "Demo OCR — simulated",
  "Manager review required", "orderTimingText", "Shipping", "Picker → Reviewer → Editor",
  "EDITED", "Notification &amp; activity history", "Scan barcode", "Export inventory",
  "Recent searches", "Order notes", "Record refund", "Attach a PDF", "Planned — not in demo"
]) {
  if (!minimal.includes(marker)) fail(`index-minimal.html: missing feature marker "${marker}"`);
}

for (const file of supportingPages) {
  const html = fs.readFileSync(path.join(stylesDir, file), "utf8");
  if (privateSourcePattern.test(html)) fail(`${file}: private-source identifier found`);
  if (/<(?:script|img|link)\b[^>]*(?:src|href)\s*=\s*["']https?:/i.test(html) ||
      /@import\s+(?:url\()?["']?https?:/i.test(html) ||
      /\bfetch\s*\(\s*["']https?:/i.test(html)) {
    fail(`${file}: external-request marker found`);
  }
  for (const marker of [
    "Launch interactive demo", "Guided product tour", "Prototype scope", "index-minimal.html",
    "scrollProgress", "data-feature-filter", "IntersectionObserver", "prefers-reduced-motion"
  ]) {
    if (!html.includes(marker)) fail(`${file}: missing feature-page marker "${marker}"`);
  }
  const scriptPattern = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
  let match;
  let scriptCount = 0;
  while ((match = scriptPattern.exec(html))) {
    if (/type\s*=\s*["']application\/(ld\+)?json["']/i.test(match[1])) continue;
    scriptCount++;
    try {
      new Function(match[2]);
    } catch (error) {
      fail(`${file}: inline script ${scriptCount} syntax error (${error.message})`);
    }
  }
  if (!scriptCount) fail(`${file}: no executable inline script found`);
}

const firebase = JSON.parse(fs.readFileSync(path.join(root, "firebase.json"), "utf8"));
if (firebase.hosting.public !== "styles") fail("firebase.json: hosting.public must be styles");
if (!firebase.hosting.rewrites?.some((rule) => rule.source === "/" && rule.destination === "/index-minimal.html")) {
  fail("firebase.json: root must rewrite to index-minimal.html");
}
if (!firebase.hosting.rewrites?.some((rule) => rule.source === "/features" && rule.destination === "/features.html")) {
  fail("firebase.json: /features must rewrite to features.html");
}

if (failures.length) {
  console.error(`Demo validation failed (${failures.length}):`);
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log(`Demo validation passed: ${canonical.items.length} items, ${canonical.orders.length} orders, ${validBins.size} bins, ${styleFiles.length} HTML variants, ${supportingPages.length} feature page.`);
