import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

test("Firebase export contains the branded company site and blueprint builder", async () => {
  const html = await readFile(
    new URL("../out/index.html", import.meta.url),
    "utf8",
  );

  assert.match(html, /Altusa — Connected operations/);
  assert.match(html, /Build your operations blueprint/);
  assert.match(html, /Download blueprint/);
  assert.match(html, /Private by default/);
  assert.match(html, /https:\/\/altusa-ai-company\.web\.app\/og\.png/);
  assert.match(html, /rel="icon"[^>]+href="\/favicon\.png"/);
  assert.match(html, /rel="apple-touch-icon"[^>]+href="\/favicon\.png"/);
  const privateMarkers = [
    "chatgpt\\.site",
    "sites\\.openai\\.com",
    "codex-preview",
    "SkeletonPreview",
    ["So", "nice"].join(""),
  ];
  assert.doesNotMatch(html, new RegExp(privateMarkers.join("|"), "i"));

  await access(new URL("../out/og.png", import.meta.url));
  await access(new URL("../out/favicon.png", import.meta.url));
});
