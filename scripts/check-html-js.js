// Syntax-checks every inline <script> block in one or more HTML files.
const fs = require("fs");
const path = require("path");
const files = process.argv.length > 2
  ? process.argv.slice(2)
  : ["index-minimal.html", "index-tech.html", "index-warm.html", "features.html"].map((name) => path.join(__dirname, "..", "styles", name));
const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
let failed = false;
for (const file of files) {
  const html = fs.readFileSync(file, "utf8");
  let m, i = 0;
  const errs = [];
  re.lastIndex = 0;
  while ((m = re.exec(html))) {
    if (/type\s*=\s*["']application\/(ld\+)?json["']/i.test(m[1])) continue; // skip JSON islands
    i++;
    try { new Function(m[2]); } catch (e) { errs.push(`block#${i}: ${e.message}`); }
  }
  const base = path.basename(file);
  console.log(`${base}: ${i} JS block(s), ${errs.length} syntax error(s)`);
  errs.forEach((e) => console.log("  " + e));
  if (errs.length) failed = true;
}
if (failed) process.exit(1);
