#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const ignoredDirs = new Set([".git", ".firebase", "node_modules"]);
const ignoredNames = new Set(["package-lock.json"]);
const forbiddenContent = [
  ["so", "nice"].join(""),
  ["ver", "non"].join(""),
  ["zhong", "zm8e", "@", "gmail.com"].join(""),
  ["fiesta", "-carnival-analytics"].join(""),
  ["friendsgiving", "-potluck-51ae3"].join(""),
  ["shelf", "-tracker-kristina"].join(""),
];
const forbiddenNames = [
  ["item", " location.csv"].join(""),
  ["gmail", " - oms inventory csv.pdf"].join(""),
  ["test", " pickup.pdf"].join(""),
  ["warehouse", "_layout.md"].join(""),
];
const textExtensions = new Set([
  ".css", ".csv", ".html", ".js", ".json", ".md", ".mjs", ".txt", ".yml", ".yaml"
]);
const failures = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (ignoredDirs.has(entry.name) || entry.name.startsWith("._")) continue;
    const absolute = path.join(dir, entry.name);
    const relative = path.relative(root, absolute);
    if (entry.isDirectory()) {
      walk(absolute);
      continue;
    }
    if (ignoredNames.has(entry.name)) continue;
    const lowerName = relative.toLowerCase();
    for (const forbidden of forbiddenNames) {
      if (lowerName.includes(forbidden)) failures.push(`${relative}: prohibited filename`);
    }
    if (!textExtensions.has(path.extname(entry.name).toLowerCase()) && entry.name !== ".gitignore") continue;
    const text = fs.readFileSync(absolute, "utf8").toLowerCase();
    for (const forbidden of forbiddenContent) {
      if (text.includes(forbidden)) failures.push(`${relative}: prohibited private-source marker`);
    }
  }
}

walk(root);

if (failures.length) {
  console.error(`Public-safety check failed (${failures.length}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Public-safety check passed: no prohibited identifiers or filenames.");
