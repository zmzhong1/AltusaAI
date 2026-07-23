#!/usr/bin/env node
// Replaces the embedded `var DATA = {...};` JSON literal in each styles/*.html
// file with the current contents of data/demo-warehouse.json. Uses a proper
// brace/string-aware scanner (not regex) to find the exact JSON boundaries,
// since the object can contain arbitrary punctuation inside string values.
const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "..", "data", "demo-warehouse.json");
const newJson = fs.readFileSync(dataPath, "utf8").trim();
// sanity: must parse and re-serialize compactly, matching how it's embedded
const parsed = JSON.parse(newJson);
const compact = JSON.stringify(parsed);

function findJsonEnd(text, startBraceIdx) {
  let depth = 0, inString = false, escaped = false;
  for (let i = startBraceIdx; i < text.length; i++) {
    const c = text[i];
    if (inString) {
      if (escaped) { escaped = false; }
      else if (c === "\\") { escaped = true; }
      else if (c === '"') { inString = false; }
      continue;
    }
    if (c === '"') { inString = true; continue; }
    if (c === "{") depth++;
    else if (c === "}") { depth--; if (depth === 0) return i; }
  }
  throw new Error("Unbalanced JSON — no matching close brace found");
}

const files = ["index-minimal.html", "index-tech.html", "index-warm.html"];
const declRe = /(?:var|let|const)\s+(\w+)\s*=\s*(?=\{\s*"meta")/;
for (const f of files) {
  const filePath = path.join(__dirname, "..", "styles", f);
  const html = fs.readFileSync(filePath, "utf8");
  const m = html.match(declRe);
  if (!m) throw new Error(`${f}: no '<decl> <name> = {"meta"' declaration found`);
  const varName = m[1];
  const braceIdx = m.index + m[0].length; // lookahead means match ends right before '{'
  if (html[braceIdx] !== "{") throw new Error(`${f}: internal offset error (found '${html[braceIdx]}')`);
  const endIdx = findJsonEnd(html, braceIdx); // index of the matching closing brace
  const before = html.slice(0, braceIdx);
  const after = html.slice(endIdx + 1); // should start with ';'
  if (after[0] !== ";") throw new Error(`${f}: expected ';' immediately after JSON object, got '${after.slice(0, 20)}'`);
  const oldLen = endIdx + 1 - braceIdx;
  const updated = before + compact + after;
  fs.writeFileSync(filePath, updated);
  console.log(`${f}: replaced '${varName}' data blob (${oldLen} -> ${compact.length} chars)`);
}
