import { describe, expect, it } from "vitest";
import sitemap from "../../src/app/sitemap";
import { buildLocalizedMetadata, languageAlternates, serializeJsonLd } from "../../src/lib/seo";

describe("localized SEO", () => {
  it("builds self-canonical metadata with reciprocal alternates", () => {
    const metadata = buildLocalizedMetadata({ locale: "zh", logicalPath: "/games/block-bloom", title: "中文标题", description: "中文描述", imageAlt: "中文图片" });
    expect(metadata.alternates?.canonical).toMatch(/\/zh\/games\/block-bloom$/);
    expect(metadata.alternates?.languages).toEqual(languageAlternates("/games/block-bloom"));
    expect(metadata.robots).toMatchObject({ index: false, follow: false });
    expect(metadata.openGraph).toMatchObject({ locale: "zh_CN", title: "中文标题" });
  });
  it("emits exactly 82 unique sitemap URLs with three language alternates", () => {
    const entries = sitemap();
    expect(entries).toHaveLength(82);
    expect(new Set(entries.map((entry) => entry.url)).size).toBe(82);
    entries.forEach((entry) => expect(Object.keys(entry.alternates?.languages || {}).sort()).toEqual(["en", "x-default", "zh-CN"]));
  });
  it("escapes JSON-LD markup-breaking characters", () => expect(serializeJsonLd({ value: "</script>" })).not.toContain("<"));
});
