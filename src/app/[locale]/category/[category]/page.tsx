import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/Ads";
import { Breadcrumb } from "@/components/Breadcrumb";
import { GameGrid } from "@/components/GameGrid";
import { JsonLd } from "@/components/JsonLd";
import { gamesInCategory, toGameCardData } from "@/content/games";
import { categoryContent, type CategorySlug, getSiteCopy } from "@/content/site";
import { absoluteUrl } from "@/config/site";
import { isLocale, type Locale } from "@/i18n/config";
import { categoryPath, localizedPath } from "@/i18n/paths";
import { buildLocalizedMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; category: string }> };
const categories = Object.keys(categoryContent) as CategorySlug[];

export function generateStaticParams() { return categories.map((category) => ({ category })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, category } = await params;
  if (!isLocale(locale) || !categories.includes(category as CategorySlug)) return {};
  const copy = categoryContent[category as CategorySlug][locale];
  return buildLocalizedMetadata({ locale, logicalPath: `/category/${category}`, title: copy.title, description: copy.description, imageAlt: `${copy.h1} — ArcadeMint` });
}

export default async function CategoryPage({ params }: Props) {
  const { locale: localeValue, category: categoryValue } = await params;
  if (!isLocale(localeValue) || !categories.includes(categoryValue as CategorySlug)) notFound();
  const locale = localeValue as Locale;
  const category = categoryValue as CategorySlug;
  const copy = categoryContent[category][locale];
  const ui = getSiteCopy(locale);
  const categoryGames = gamesInCategory(category);
  const url = absoluteUrl(categoryPath(locale, category));
  const breadcrumb = [
    { "@type": "ListItem", position: 1, name: ui.breadcrumb.home, item: absoluteUrl(localizedPath(locale)) },
    { "@type": "ListItem", position: 2, name: copy.label, item: url },
  ];
  const items = categoryGames.map((game, index) => ({ "@type": "ListItem", position: index + 1, name: game.locales[locale].name, url: absoluteUrl(localizedPath(locale, `/games/${game.slug}`)) }));

  return (
    <main id="main-content" className="inner-page page-shell">
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [
        { "@type": "CollectionPage", name: copy.h1, description: copy.description, url, inLanguage: locale === "en" ? "en" : "zh-CN", mainEntity: { "@type": "ItemList", itemListElement: items } },
        { "@type": "BreadcrumbList", itemListElement: breadcrumb },
      ] }} />
      <Breadcrumb items={[{ label: ui.breadcrumb.home, href: localizedPath(locale) }, { label: copy.label }]} />
      <header className="inner-hero">
        <p className="eyebrow"><span />{locale === "en" ? "BROWSE BY CATEGORY" : "按分类浏览"}</p>
        <h1>{copy.h1}</h1>
        <p>{copy.intro}</p>
        <div className="inner-stat"><strong>{categoryGames.length}</strong><span>{locale === "en" ? "original games" : "款原创游戏"}</span></div>
      </header>
      <section className="section category-catalog" aria-labelledby="category-games">
        <div className="section-heading"><div><p className="eyebrow">{copy.label}</p><h2 id="category-games">{locale === "en" ? `All ${copy.label} games` : `全部${copy.label}游戏`}</h2></div><span className="section-count">{String(categoryGames.length).padStart(2, "0")}</span></div>
        <GameGrid games={categoryGames.map(toGameCardData)} locale={locale} />
      </section>
      <AdSlot locale={locale} slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_CATEGORY_INLINE} />
    </main>
  );
}
