import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";

const kib = 1024;
const root = process.cwd();
const nextDir = path.join(root, ".next");

function fail(message) {
  console.error(`Build budget failed: ${message}`);
  process.exitCode = 1;
}

function gzipSize(file) {
  return zlib.gzipSync(fs.readFileSync(file)).length;
}

function initialJavaScript(relativeHtml) {
  const htmlFile = path.join(nextDir, "server", "app", relativeHtml);
  if (!fs.existsSync(htmlFile)) {
    fail(`missing prerendered page ${relativeHtml}; run pnpm build first`);
    return 0;
  }
  const html = fs.readFileSync(htmlFile, "utf8");
  const sources = [...new Set(
    [...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)].map((match) => match[1]),
  )];
  return sources.reduce((total, source) => {
    const file = path.join(nextDir, source.replace(/^\/_next\//, ""));
    return total + gzipSize(file);
  }, 0);
}

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(target) : [target];
  });
}

if (!fs.existsSync(nextDir)) {
  fail(".next does not exist; run pnpm build first");
  process.exit();
}

const pageBudgets = [
  ["en.html", 180 * kib, "home initial JavaScript"],
  [path.join("en", "games", "block-bloom.html"), 200 * kib, "game page pre-Play JavaScript"],
];

for (const [page, budget, label] of pageBudgets) {
  const bytes = initialJavaScript(page);
  if (bytes > budget) fail(`${label} is ${bytes} bytes gzip; budget is ${budget}`);
  else console.log(`PASS ${label}: ${bytes}/${budget} bytes gzip`);
}

const chunksDir = path.join(nextDir, "static", "chunks");
const chunks = walk(chunksDir)
  .filter((file) => file.endsWith(".js"))
  .map((file) => ({ file, bytes: gzipSize(file) }))
  .sort((a, b) => b.bytes - a.bytes);
const largestChunk = chunks[0];
const asyncBudget = 70 * kib;
if (largestChunk.bytes > asyncBudget) {
  fail(`largest JavaScript chunk ${path.basename(largestChunk.file)} is ${largestChunk.bytes} bytes gzip; target is ${asyncBudget}`);
} else {
  console.log(`PASS largest JavaScript chunk: ${largestChunk.bytes}/${asyncBudget} bytes gzip`);
}

const cardBudget = 160 * kib;
const covers = walk(path.join(root, "public", "images", "games")).filter((file) => file.endsWith("cover.webp"));
const largestCover = covers.map((file) => ({ file, bytes: fs.statSync(file).size })).sort((a, b) => b.bytes - a.bytes)[0];
if (largestCover.bytes > cardBudget) {
  fail(`largest game cover ${path.relative(root, largestCover.file)} is ${largestCover.bytes} bytes; budget is ${cardBudget}`);
} else {
  console.log(`PASS largest game cover: ${largestCover.bytes}/${cardBudget} bytes`);
}

const ogFile = path.join(root, "public", "images", "og", "home.webp");
const ogBudget = 180 * kib;
const ogBytes = fs.statSync(ogFile).size;
if (ogBytes > ogBudget) fail(`collection OG image is ${ogBytes} bytes; budget is ${ogBudget}`);
else console.log(`PASS collection OG image: ${ogBytes}/${ogBudget} bytes`);

if (process.exitCode) process.exit(process.exitCode);
console.log(`Validated ${chunks.length} JavaScript chunks and ${covers.length} game covers.`);
