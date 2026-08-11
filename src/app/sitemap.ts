import type { MetadataRoute } from "next";
import { games } from "@/content/games";
import { absoluteUrl } from "@/config/site";
import { localizedPath } from "@/i18n/paths";
import { languageAlternates } from "@/lib/seo";

const contentLastUpdated = new Date("2026-08-11T00:00:00.000Z");

export default function sitemap(): MetadataRoute.Sitemap {
  const logicalPages = [
    "/", "/category/puzzle", "/category/arcade", "/category/skill", "/category/brain",
    "/collections/garden-logic", "/about", "/contact", "/privacy", "/cookies", "/terms", "/accessibility",
    ...games.map((game) => `/games/${game.slug}`),
  ];
  return logicalPages.flatMap((logicalPath) => {
    const alternates = { languages: languageAlternates(logicalPath) };
    return (["en", "zh"] as const).map((locale) => ({
      url: absoluteUrl(localizedPath(locale, logicalPath)),
      lastModified: contentLastUpdated,
      changeFrequency: logicalPath === "/" ? "weekly" as const : "monthly" as const,
      priority: logicalPath === "/" ? 1 : logicalPath.startsWith("/games/") ? 0.8 : 0.7,
      alternates,
    }));
  });
}
