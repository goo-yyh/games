import { writeFile } from "node:fs/promises";
import path from "node:path";

const target = path.join(process.cwd(), "public/ads.txt");
const publisher = process.env.ADSENSE_PUBLISHER_ID?.trim();

if (publisher && /^pub-\d+$/.test(publisher)) {
  await writeFile(target, `google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`, "utf8");
  console.log(`Generated ads.txt for ${publisher}.`);
} else {
  await writeFile(target, "# No authorized advertising seller is configured.\n", "utf8");
  console.log("AdSense publisher not configured; ads.txt contains no authorization record.");
}
