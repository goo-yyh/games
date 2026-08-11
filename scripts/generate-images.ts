import { mkdir, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import games from "../src/content/games.generated.json" with { type: "json" };

const root = process.cwd();

async function requireImageGenSource(source: string) {
  try {
    await access(source);
  } catch {
    throw new Error(`Missing ImageGen source: ${path.relative(root, source)}. Generate the source artwork before running this script.`);
  }
}

async function generateGameImages() {
  for (const game of games) {
    const directory = path.join(root, "public/images/games", game.slug);
    await mkdir(directory, { recursive: true });
    const source = path.join(directory, "source.png");
    await requireImageGenSource(source);
    await sharp(source).resize(1200, 675, { fit: "cover", position: "centre" }).webp({ quality: 82 }).toFile(path.join(directory, "cover.webp"));
    await sharp(source).resize(1200, 630, { fit: "cover", position: "centre" }).webp({ quality: 82 }).toFile(path.join(directory, "og.webp"));
  }
}

async function generateSharedImages() {
  const homeSource = path.join(root, "public/images/og/home-source.png");
  await requireImageGenSource(homeSource);
  await sharp(homeSource).resize(1200, 630, { fit: "cover", position: "centre" }).webp({ quality: 84 }).toFile(path.join(root, "public/images/og/home.webp"));

  const collectionDirectory = path.join(root, "public/images/collections/garden-logic");
  await mkdir(collectionDirectory, { recursive: true });
  const collectionSource = path.join(collectionDirectory, "source.png");
  await requireImageGenSource(collectionSource);
  await sharp(collectionSource).resize(1200, 675, { fit: "cover" }).webp({ quality: 82 }).toFile(path.join(collectionDirectory, "cover.webp"));
  await sharp(collectionSource).resize(1200, 630, { fit: "cover" }).webp({ quality: 82 }).toFile(path.join(collectionDirectory, "og.webp"));

  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" rx="120" fill="#10182b"/><rect x="80" y="80" width="142" height="352" rx="46" fill="#7c5cff"/><rect x="246" y="80" width="186" height="166" rx="46" fill="#27d3a2"/><rect x="246" y="270" width="186" height="162" rx="46" fill="#f7c948"/></svg>`;
  await sharp(Buffer.from(iconSvg)).png().resize(512, 512).toFile(path.join(root, "public/icon.png"));
  await sharp(Buffer.from(iconSvg)).png().resize(180, 180).toFile(path.join(root, "public/apple-icon.png"));
}

await generateGameImages();
await generateSharedImages();
console.log(`Derived ${games.length * 2 + 5} optimized assets without modifying ImageGen sources.`);
