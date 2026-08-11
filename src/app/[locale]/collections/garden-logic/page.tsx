import type { Metadata } from "next";
import Link from "next/link";
import { ArrowDownRight, BrainCircuit, Grid3X3, Route, Sigma } from "lucide-react";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FaqList } from "@/components/FaqList";
import { GameGrid } from "@/components/GameGrid";
import { JsonLd } from "@/components/JsonLd";
import { games, gardenLogicSlugs, toGameCardData } from "@/content/games";
import { categoryContent, gardenContent, getSiteCopy } from "@/content/site";
import { absoluteUrl } from "@/config/site";
import { isLocale, type Locale } from "@/i18n/config";
import { categoryPath, localizedPath } from "@/i18n/paths";
import { buildLocalizedMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = gardenContent[locale];
  return buildLocalizedMetadata({ locale, logicalPath: "/collections/garden-logic", title: copy.title, description: copy.description, image: "/images/og/garden-logic.webp", imageAlt: locale === "en" ? "Garden Logic puzzle collection" : "花园逻辑谜题合集" });
}

export default async function GardenLogicPage({ params }: Props) {
  const { locale: value } = await params;
  const locale = value as Locale;
  const copy = gardenContent[locale];
  const ui = getSiteCopy(locale);
  const collectionGames = gardenLogicSlugs.map((slug) => games.find((game) => game.slug === slug)).filter((game): game is (typeof games)[number] => Boolean(game));
  const icons = [Sigma, Grid3X3, BrainCircuit, Route];
  const url = absoluteUrl(localizedPath(locale, "/collections/garden-logic"));
  const items = collectionGames.map((game, index) => ({ "@type": "ListItem", position: index + 1, name: game.locales[locale].name, url: absoluteUrl(localizedPath(locale, `/games/${game.slug}`)) }));
  const breadcrumb = [
    { "@type": "ListItem", position: 1, name: ui.breadcrumb.home, item: absoluteUrl(localizedPath(locale)) },
    { "@type": "ListItem", position: 2, name: locale === "en" ? "Garden Logic" : "花园逻辑", item: url },
  ];

  return (
    <main id="main-content" className="inner-page">
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [
        { "@type": "CollectionPage", name: copy.h1, description: copy.description, url, inLanguage: locale === "en" ? "en" : "zh-CN", mainEntity: { "@type": "ItemList", itemListElement: items } },
        { "@type": "BreadcrumbList", itemListElement: breadcrumb },
      ] }} />
      <div className="page-shell"><Breadcrumb items={[{ label: ui.breadcrumb.home, href: localizedPath(locale) }, { label: ui.breadcrumb.collection }, { label: locale === "en" ? "Garden Logic" : "花园逻辑" }]} /></div>
      <header className="collection-hero page-shell">
        <div><p className="eyebrow"><span />{locale === "en" ? "NINE ORIGINAL PUZZLES" : "九款原创谜题"}</p><h1>{copy.h1}</h1><p>{copy.intro}</p></div>
        <div className="garden-emblem" aria-hidden="true"><span>9</span><i /><i /><i /></div>
      </header>
      <section className="section page-shell"><GameGrid games={collectionGames.map(toGameCardData)} locale={locale} /></section>
      <section className="practice-band"><div className="page-shell"><div className="section-heading"><div><p className="eyebrow">{locale === "en" ? "COMPACT RULES, CLEAR THINKING" : "紧凑规则，清晰思考"}</p><h2>{copy.practiceTitle}</h2></div></div><div className="practice-grid">{copy.practice.map((item, index) => { const Icon = icons[index]; return <article key={item}><Icon aria-hidden="true" /><span>0{index + 1}</span><h3>{item}</h3></article>; })}</div></div></section>
      <section className="text-feature page-shell"><div><p className="eyebrow">{locale === "en" ? "HOW THESE GAMES WORK" : "这些游戏如何运作"}</p><h2>{locale === "en" ? "Learn the rule in one round" : "一局就能理解规则"}</h2></div><div>{copy.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></section>
      <section className="faq-section page-shell"><div className="faq-intro"><p className="eyebrow">FAQ</p><h2>{locale === "en" ? "Garden questions" : "合集常见问题"}</h2></div><FaqList items={copy.faq} /></section>
      <section className="collection-next page-shell"><p>{locale === "en" ? "Prefer faster reflex challenges?" : "更喜欢快节奏反应挑战？"}</p><Link href={categoryPath(locale, "arcade")}>{categoryContent.arcade[locale].h1}<ArrowDownRight aria-hidden="true" /></Link></section>
    </main>
  );
}
