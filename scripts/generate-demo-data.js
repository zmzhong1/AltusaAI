#!/usr/bin/env node
/**
 * Altusa WMS Demo — fictional dataset generator.
 *
 * Produces a 100% made-up party-goods wholesaler: a fresh fictional floor plan
 * (not copied from any production geometry) and randomized fake catalog items. Every SKU is
 * prefixed "DEMO-" so it can never be mistaken for real inventory. Deterministic
 * (seeded) so re-runs are stable and the 3 style variants share identical data.
 *
 * Output: data/demo-warehouse.json
 */
const fs = require("fs");
const path = require("path");

// ---- deterministic PRNG (mulberry32) so output is stable across runs ----
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260721);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const randint = (lo, hi) => lo + Math.floor(rand() * (hi - lo + 1));

// ---- fictional floor plan (fresh geometry) ----
// 6 aisles A-F, each with 8 sections, each section 4 levels (0 = floor/staging).
const AISLES = ["A", "B", "C", "D", "E", "F"];
const SECTIONS = [1, 2, 3, 4, 5, 6, 7, 8];
const LEVELS = [0, 1, 2, 3]; // 0 = ground/staging, 1-3 = rack shelves
const ZONES = [
  { id: "RECV", name: "Receiving", kind: "dock", col: 0, row: 0 },
  { id: "RET", name: "Returns", kind: "hold", col: 7, row: 0 },
  { id: "SHIP", name: "Shipping", kind: "dock", col: 7, row: 5 },
  { id: "OFFICE", name: "Office", kind: "office", col: 0, row: 5 },
];

// ---- fictional catalog vocabulary (party goods, on-brand but invented) ----
const PRODUCTS = [
  ["Balloon Arch Kit", "BAL"],
  ["Latex Balloons 100ct", "BAL"],
  ["Foil Number Balloon", "BAL"],
  ["Confetti Cannon", "CFT"],
  ["Paper Lanterns 5ct", "DEC"],
  ["Tissue Pom Set", "DEC"],
  ["Crepe Streamer Roll", "DEC"],
  ["Bunting Banner", "DEC"],
  ["Backdrop Curtain", "DEC"],
  ["LED String Lights", "DEC"],
  ["Table Cover", "TBL"],
  ["Tablecloth Roll", "TBL"],
  ["Paper Plates 50ct", "TBL"],
  ["Napkins 100ct", "TBL"],
  ["Cutlery Set 24ct", "TBL"],
  ["Party Cups 50ct", "TBL"],
  ["Party Hats 12ct", "WEAR"],
  ["Cake Topper", "CAKE"],
  ["Candle Set", "CAKE"],
  ["Pinata", "GAME"],
  ["Gift Bags 10ct", "GIFT"],
  ["Tissue Wrap 20ct", "GIFT"],
  ["Themed Tableware Set", "SET"],
  ["Photo Booth Props", "FUN"],
];
const COLORS = [
  "Rose Gold", "Gold", "Silver", "Teal", "Coral", "Midnight Blue",
  "Blush Pink", "Emerald", "Sunset Orange", "Lavender", "Classic White",
  "Jet Black", "Rainbow", "Cream", "Ruby",
];
const THEMES = [
  "Birthday", "Wedding", "Baby Shower", "Fiesta", "Graduation",
  "Anniversary", "Retirement", "Halloween", "Luau", "Winter",
];
const VENDORS = [
  "Festiva Imports", "Luna Party Co", "Nordic Novelty", "Cabana Goods",
  "Marigold Supply", "Vela & Co", "Pinata Bros", "Aurora Wholesale",
];

function binId(a, s, l) { return `${a}-${s}-${l}`; }

// build the full set of pickable bins
const allBins = [];
for (const a of AISLES) for (const s of SECTIONS) for (const l of LEVELS) {
  allBins.push(binId(a, s, l));
}
// level 0 (ground/staging) can never be a default pick location — see BinPicker rule
const defaultBinPool = allBins.filter((b) => !b.endsWith('-0'));

// ---- generate items ----
const TOTAL = 64;
const items = [];
const usedSku = new Set();
for (let i = 0; i < TOTAL; i++) {
  const [pname, pcode] = pick(PRODUCTS);
  const color = pick(COLORS);
  const theme = rand() < 0.55 ? pick(THEMES) : null;
  const name = theme ? `${pname} — ${color} (${theme})` : `${pname} — ${color}`;

  let sku;
  do {
    sku = `DEMO-${pcode}-${String(randint(1000, 9999))}`;
  } while (usedSku.has(sku));
  usedSku.add(sku);

  const barcode = `999${String(randint(100000000, 999999999))}`; // 999-prefixed = obviously fake
  const stock = rand() < 0.14 ? randint(0, 8) : randint(12, 240); // ~14% low stock
  const vendor = pick(VENDORS);

  // bin assignment
  const bins = [];
  const unbinned = rand() < 0.08; // ~8% unbinned (sitting in Receiving)
  if (!unbinned) {
    const primary = pick(defaultBinPool);
    bins.push(primary);
    if (rand() < 0.18) { // ~18% multi-bin
      let extra = pick(allBins); // secondary bin may legitimately be a staging bin
      if (extra !== primary) bins.push(extra);
    }
  }

  items.push({
    sku,
    name,
    barcode,
    category: pcode,
    theme,
    color,
    vendor,
    stock,
    unit: "case",
    bins,
    defaultBin: bins[0] || null, // ⭐ preferred pick location
    lowStock: stock <= 10,
    unbinned,
  });
}

// ---- derived stats for the dashboard strip ----
const stats = {
  totalSkus: items.length,
  totalUnits: items.reduce((n, it) => n + it.stock, 0),
  lowStock: items.filter((it) => it.lowStock).length,
  unbinned: items.filter((it) => it.unbinned).length,
  multiBin: items.filter((it) => it.bins.length > 1).length,
  binsOccupied: new Set(items.flatMap((it) => it.bins)).size,
  binsTotal: allBins.length,
};

// ---- fictional staff + customers + fake orders ----
const STAFF = ["Alex", "Sam", "Jordan", "Casey", "Riley", "Morgan"];
const CUSTOMERS = [
  "Sunrise Events LLC", "Party Central #7", "Bella's Balloons",
  "Fiesta Rentals Co", "The Event Loft", "Confetti & Co",
  "Grand Celebrations", "Maple Street Market", "Harbor Banquet Hall",
  "Rosewood Weddings", "Downtown Diner Group", "Kids Kingdom Parties",
];
const AGES = ["4m ago", "11m ago", "23m ago", "38m ago", "52m ago",
  "1h ago", "2h ago", "3h ago", "Today 9:14am", "Today 8:02am"];
const COMPLETED_TIMES = ["Today 8:41am", "Today 9:18am", "Today 10:06am", "Today 10:47am", "Today 11:22am"];
const ORDER_DATES = [
  "2026-07-23", "2026-07-23", "2026-07-23", "2026-07-23",
  "2026-07-23", "2026-07-23", "2026-07-23", "2026-07-23",
  "2026-07-23", "2026-07-22", "2026-06-28", "2026-06-14",
  "2026-07-23", "2026-07-23", "2026-07-23", "2026-05-30",
];
const SHIP_TO = [
  ["Los Angeles", "CA", "90021"], ["Pasadena", "CA", "91101"],
  ["Long Beach", "CA", "90802"], ["Glendale", "CA", "91203"],
  ["Anaheim", "CA", "92805"], ["Santa Monica", "CA", "90401"],
];
const SHIP_SERVICES = ["Local route", "Ground", "Next-day", "Customer pickup"];

function clockFor(orderIndex, offsetMinutes = 0) {
  const minutes = 8 * 60 + orderIndex * 11 + offsetMinutes;
  const hour24 = Math.floor(minutes / 60) % 24;
  const minute = minutes % 60;
  const suffix = hour24 >= 12 ? "pm" : "am";
  const hour12 = hour24 % 12 || 12;
  const date = ORDER_DATES[orderIndex];
  const prefix = date === "2026-07-23"
    ? "Today"
    : new Date(`${date}T12:00:00`).toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${prefix} ${hour12}:${String(minute).padStart(2, "0")}${suffix}`;
}

// Snake walk-path: serpentine through aisles A→F, level priority 1→2→0→3.
const AISLE_ORDER = { A: 0, B: 1, C: 2, D: 3, E: 4, F: 5 };
const LEVEL_PRIORITY = { 1: 0, 2: 1, 0: 2, 3: 3 };
function walkKey(bin) {
  if (!bin) return [99, 0, 0];
  const [a, s, l] = bin.split("-");
  const ai = AISLE_ORDER[a] ?? 50;
  const sec = ai % 2 === 0 ? +s : 9 - +s; // serpentine: reverse odd aisles
  return [ai, sec, LEVEL_PRIORITY[+l] ?? 9];
}
function cmpWalk(a, b) {
  const k1 = walkKey(a), k2 = walkKey(b);
  for (let i = 0; i < 3; i++) if (k1[i] !== k2[i]) return k1[i] - k2[i];
  return 0;
}
function sample(arr, n) {
  const pool = arr.slice();
  const out = [];
  for (let i = 0; i < n && pool.length; i++) {
    out.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]);
  }
  return out;
}

const binnedItems = items.filter((it) => it.bins.length > 0);
// balanced spread across the order board
const ORDER_PLAN = [
  "new", "new", "new", "picking", "picking", "picking", "review", "review",
  "completed", "completed", "completed", "completed", "new", "picking", "review", "completed",
];
const orders = [];
let completedIndex = 0;
for (let i = 0; i < ORDER_PLAN.length; i++) {
  const status = ORDER_PLAN[i];
  const id = `SO-${1207 + i}`;
  const chosen = sample(binnedItems, randint(3, 9));
  const priority = rand() < 0.22 ? "rush" : "normal";
  const picker = status === "new" ? null : pick(STAFF);

  const lines = chosen.map((it) => ({
    sku: it.sku, name: it.name, bin: it.defaultBin,
    qty: randint(1, 12), pickedQty: 0, shortPick: false,
  }));
  lines.sort((a, b) => cmpWalk(a.bin, b.bin)); // walk-optimized sequence

  if (status === "picking") {
    const upto = Math.max(1, Math.floor(lines.length * (0.3 + rand() * 0.4)));
    lines.forEach((ln, idx) => { if (idx < upto) ln.pickedQty = ln.qty; });
  } else if (status === "review" || status === "completed") {
    lines.forEach((ln) => { ln.pickedQty = ln.qty; });
    if (rand() < 0.4) { // occasional short-pick → discrepancy
      const k = randint(0, lines.length - 1);
      lines[k].pickedQty = Math.max(0, lines[k].qty - randint(1, 2));
      lines[k].shortPick = true;
    }
  }

  const timing = {};
  if (status === "review" || status === "completed") {
    timing.pickMinutes = 12 + ((i * 7 + lines.length * 3) % 39);
  }
  if (status === "completed") {
    const completedClock = COMPLETED_TIMES[completedIndex++];
    timing.completedAt = ORDER_DATES[i] === "2026-07-23"
      ? completedClock
      : `${clockFor(i).split(" ").slice(0, 2).join(" ")} ${completedClock.replace(/^Today\s+/, "")}`;
    timing.completionMinutes = timing.pickMinutes;
  }

  const [city, region, postal] = SHIP_TO[i % SHIP_TO.length];
  const shipping = {
    service: SHIP_SERVICES[i % SHIP_SERVICES.length],
    city,
    region,
    postal,
    dock: i % 4 === 3 ? "Customer pickup desk" : `Dock ${1 + (i % 3)}`,
    packages: 1 + (i % 5),
    shipBy: ORDER_DATES[i] === "2026-07-23"
      ? (i % 3 === 0 ? "Today 4:00pm" : "Tomorrow 10:00am")
      : clockFor(i, 60),
  };
  const stages = [
    {
      key: "picker",
      label: "Picker",
      state: status === "new" ? "pending" : (status === "picking" ? "active" : "complete"),
      by: picker,
      at: status === "new" ? null : clockFor(i),
    },
    {
      key: "reviewer",
      label: "Reviewer",
      state: status === "completed" ? "complete" : (status === "review" ? "active" : "pending"),
      by: status === "completed" ? (i % 2 ? "Sam" : "Admin") : null,
      at: status === "completed" ? clockFor(i, 18) : null,
    },
    {
      key: "editor",
      label: "Editor",
      state: status === "completed" ? "complete" : "pending",
      by: status === "completed" ? (i % 2 ? "Admin" : "Sam") : null,
      at: status === "completed" ? clockFor(i, 27) : null,
    },
  ];
  const edited = status === "completed" && i % 2 === 0;
  const notes = i % 4 === 0
    ? [{ text: "Confirm delivery window with receiving contact.", by: picker || "Sam", at: clockFor(i, 3) }]
    : [];
  const refunds = status === "completed" && i % 3 === 0
    ? [{ amount: 18 + i, reason: "Short-picked item adjustment", by: "Sam", at: clockFor(i, 31) }]
    : [];
  const attachments = status === "completed" && i % 2 === 1
    ? [{ name: `${id}-pick-list.pdf`, size: 148000 + i * 1000, by: picker, at: clockFor(i, 4) }]
    : [];

  orders.push({
    id, customer: pick(CUSTOMERS), status, priority, picker,
    createdAt: ORDER_DATES[i] === "2026-07-23" ? pick(AGES) : clockFor(i, -30),
    createdDate: ORDER_DATES[i], orderMonth: ORDER_DATES[i].slice(0, 7),
    shipping, stages, edited, editedBy: edited ? stages[2].by : null,
    editedAt: edited ? stages[2].at : null, notes, refunds, attachments,
    ...timing, lines,
    itemCount: lines.length,
    unitCount: lines.reduce((n, l) => n + l.qty, 0),
    pickedUnits: lines.reduce((n, l) => n + l.pickedQty, 0),
    hasDiscrepancy: lines.some((l) => l.shortPick),
  });
}

const orderStats = {
  today: orders.filter((o) => o.createdDate === "2026-07-23").length,
  new: orders.filter((o) => o.status === "new").length,
  picking: orders.filter((o) => o.status === "picking").length,
  review: orders.filter((o) => o.status === "review").length,
  completed: orders.filter((o) => o.status === "completed" && o.createdDate === "2026-07-23").length,
  activePickers: new Set(orders.filter((o) => o.picker &&
    (o.status === "picking" || o.status === "review")).map((o) => o.picker)).size,
  unitsPickedToday: orders.filter((o) => o.createdDate === "2026-07-23").reduce((n, o) => n + o.pickedUnits, 0),
  rush: orders.filter((o) => o.priority === "rush").length,
};

const dataset = {
  meta: {
    brand: "Altusa WMS",
    fictionalCompany: "Cabana Party Wholesale (demo)",
    generated: "seeded/deterministic",
    note: "100% fictional data. All SKUs prefixed DEMO-. No real inventory, bins, or people.",
  },
  floor: { aisles: AISLES, sections: SECTIONS, levels: LEVELS, zones: ZONES },
  stats,
  orderStats,
  items,
  staff: STAFF,
  orders,
};

const outPath = path.join(__dirname, "..", "data", "demo-warehouse.json");
fs.writeFileSync(outPath, JSON.stringify(dataset, null, 2));

console.log("Wrote", outPath);
console.log("Stats:", JSON.stringify(stats, null, 2));
console.log("Sample items:");
for (const it of items.slice(0, 5)) {
  console.log(`  ${it.sku}  ${it.name}  stock=${it.stock}  bins=[${it.bins.join(", ") || "UNBINNED"}]`);
}
console.log("Orders:", orders.length, "| board:", JSON.stringify(orderStats));
console.log("Sample orders (walk-optimized lines):");
for (const o of orders.slice(0, 3)) {
  console.log(`  ${o.id}  ${o.customer}  [${o.status}${o.priority === "rush" ? "/RUSH" : ""}]  ${o.itemCount} items → ${o.lines.map((l) => l.bin).join(" ▸ ")}`);
}
