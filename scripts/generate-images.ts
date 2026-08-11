import { mkdir, access } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import games from "../src/content/games.generated.json" with { type: "json" };
import { gamePresentation } from "../src/content/game-presentation";

const root = process.cwd();
const sourceSize = { width: 1536, height: 1024 };

function escapeXml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[character]!);
}

function coverSvg(slug: string, index: number, icon: string, accent: string, accent2: string) {
  const variant = index % 4;
  const geometry = variant === 0
    ? `<g transform="translate(270 210) rotate(-9)">${Array.from({ length: 8 }, (_, row) => Array.from({ length: 10 }, (_, column) => `<rect x="${column * 76}" y="${row * 70}" width="62" height="56" rx="12" fill="${(row + column + index) % 5 === 0 ? accent : "#182544"}" opacity="${.45 + ((row + column) % 3) * .18}"/>`).join("")).join("")}</g>`
    : variant === 1
      ? `<g fill="none" stroke-width="24" opacity=".75">${Array.from({ length: 6 }, (_, ring) => `<ellipse cx="768" cy="520" rx="${150 + ring * 82}" ry="${70 + ring * 48}" stroke="${ring % 2 ? accent2 : accent}" transform="rotate(${ring * 17 - 28} 768 520)"/>`).join("")}</g>`
      : variant === 2
        ? `<path d="M 80 780 C 270 300, 430 860, 630 410 S 1030 230, 1450 610" fill="none" stroke="${accent}" stroke-width="92" stroke-linecap="round"/><path d="M 80 780 C 270 300, 430 860, 630 410 S 1030 230, 1450 610" fill="none" stroke="${accent2}" stroke-width="9" stroke-dasharray="22 28" opacity=".9"/>`
        : `<g transform="translate(768 510)">${Array.from({ length: 14 }, (_, item) => `<rect x="${120 + (item % 4) * 52}" y="-18" width="100" height="36" rx="18" fill="${item % 3 === 0 ? accent2 : accent}" opacity="${.35 + (item % 4) * .16}" transform="rotate(${item * 25.7})"/>`).join("")}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${sourceSize.width}" height="${sourceSize.height}" viewBox="0 0 ${sourceSize.width} ${sourceSize.height}">
    <defs>
      <radialGradient id="halo"><stop stop-color="${accent}" stop-opacity=".48"/><stop offset="1" stop-color="#0b1020" stop-opacity="0"/></radialGradient>
      <linearGradient id="bg" x2="1" y2="1"><stop stop-color="#070b16"/><stop offset=".55" stop-color="#111a31"/><stop offset="1" stop-color="#080d19"/></linearGradient>
      <filter id="glow"><feGaussianBlur stdDeviation="16" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      <pattern id="grid" width="54" height="54" patternUnits="userSpaceOnUse"><path d="M54 0H0V54" fill="none" stroke="#8ed8ff" stroke-opacity=".08"/></pattern>
    </defs>
    <rect width="1536" height="1024" fill="url(#bg)"/><rect width="1536" height="1024" fill="url(#grid)"/>
    <ellipse cx="768" cy="500" rx="670" ry="510" fill="url(#halo)"/>
    ${geometry}
    <g opacity=".75">${Array.from({ length: 18 }, (_, item) => `<circle cx="${90 + ((item * 263 + index * 37) % 1370)}" cy="${80 + ((item * 149 + index * 71) % 830)}" r="${6 + (item % 4) * 4}" fill="${item % 2 ? accent : accent2}"/>`).join("")}</g>
    <g filter="url(#glow)"><rect x="566" y="314" width="404" height="404" rx="116" fill="#101a30" stroke="${accent2}" stroke-width="7"/><rect x="598" y="346" width="340" height="340" rx="92" fill="${accent}" fill-opacity=".22" stroke="#fff" stroke-opacity=".14" stroke-width="2"/><text x="768" y="545" text-anchor="middle" dominant-baseline="middle" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="${icon.length > 2 ? 116 : 190}" font-weight="900" letter-spacing="-12">${escapeXml(icon)}</text></g>
    <path d="M0 900C320 790 450 980 780 850s480-110 756 20v154H0z" fill="#050810" fill-opacity=".68"/>
  </svg>`;
}

async function generateGameImages() {
  for (const [index, game] of games.entries()) {
    const presentation = gamePresentation[game.slug];
    const directory = path.join(root, "public/images/games", game.slug);
    await mkdir(directory, { recursive: true });
    const source = path.join(directory, "source.png");
    await sharp(Buffer.from(coverSvg(game.slug, index, presentation.icon, presentation.accent, presentation.accent2))).png({ compressionLevel: 9 }).toFile(source);
    await sharp(source).resize(1200, 675, { fit: "cover", position: "centre" }).webp({ quality: 82 }).toFile(path.join(directory, "cover.webp"));
    await sharp(source).resize(1200, 630, { fit: "cover", position: "centre" }).webp({ quality: 82 }).toFile(path.join(directory, "og.webp"));
  }
}

async function generateSharedImages() {
  const homeSource = path.join(root, "public/images/og/home-source.png");
  await access(homeSource);
  await sharp(homeSource).resize(1200, 630, { fit: "cover", position: "centre" }).webp({ quality: 84 }).toFile(path.join(root, "public/images/og/home.webp"));

  const collectionDirectory = path.join(root, "public/images/collections/garden-logic");
  await mkdir(collectionDirectory, { recursive: true });
  const collectionSource = path.join(collectionDirectory, "source.png");
  await sharp(Buffer.from(coverSvg("garden-logic", 30, "✦", "#27d3a2", "#f7c948"))).png({ compressionLevel: 9 }).toFile(collectionSource);
  await sharp(collectionSource).resize(1200, 675, { fit: "cover" }).webp({ quality: 82 }).toFile(path.join(collectionDirectory, "cover.webp"));
  await sharp(collectionSource).resize(1200, 630, { fit: "cover" }).webp({ quality: 82 }).toFile(path.join(collectionDirectory, "og.webp"));

  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512"><rect width="512" height="512" rx="120" fill="#10182b"/><rect x="80" y="80" width="142" height="352" rx="46" fill="#7c5cff"/><rect x="246" y="80" width="186" height="166" rx="46" fill="#27d3a2"/><rect x="246" y="270" width="186" height="162" rx="46" fill="#f7c948"/></svg>`;
  await sharp(Buffer.from(iconSvg)).png().resize(512, 512).toFile(path.join(root, "public/icon.png"));
  await sharp(Buffer.from(iconSvg)).png().resize(180, 180).toFile(path.join(root, "public/apple-icon.png"));
}

await generateGameImages();
await generateSharedImages();
console.log(`Generated ${games.length * 3 + 7} image assets.`);
