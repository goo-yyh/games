import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/Ads";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FaqList } from "@/components/FaqList";
import { GameCard } from "@/components/GameCard";
import { GameLauncher } from "@/components/GameLauncher";
import { JsonLd } from "@/components/JsonLd";
import { games, getGame, gamePresentation } from "@/content/games";
import { categoryContent, getSiteCopy, type CategorySlug } from "@/content/site";
import { absoluteUrl } from "@/config/site";
import { isLocale, type Locale } from "@/i18n/config";
import { categoryPath, gamePath, localizedPath } from "@/i18n/paths";
import { buildLocalizedMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string; slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() { return games.map((game) => ({ slug: game.slug })); }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const game = getGame(slug);
  if (!isLocale(locale) || !game) return {};
  const copy = game.locales[locale];
  return buildLocalizedMetadata({ locale, logicalPath: `/games/${slug}`, title: copy.seoTitle, description: copy.description, image: `/images/games/${slug}/og.webp`, imageAlt: copy.imageAlt });
}

export default async function GamePage({ params }: Props) {
  const { locale: localeValue, slug } = await params;
  if (!isLocale(localeValue)) notFound();
  const locale = localeValue as Locale;
  const game = getGame(slug);
  if (!game) notFound();
  const copy = game.locales[locale];
  const ui = getSiteCopy(locale);
  const primaryCategory = game.locales.en.categories[0].toLowerCase() as CategorySlug;
  const categoryLabel = categoryContent[primaryCategory][locale].label;
  const presentation = gamePresentation[slug];
  const related = copy.relatedSlugs.map(getGame).filter((item): item is NonNullable<typeof item> => Boolean(item)).slice(0, 4);
  const canonical = absoluteUrl(gamePath(locale, slug));
  const breadcrumb = [
    { "@type": "ListItem", position: 1, name: ui.breadcrumb.home, item: absoluteUrl(localizedPath(locale)) },
    { "@type": "ListItem", position: 2, name: categoryLabel, item: absoluteUrl(categoryPath(locale, primaryCategory)) },
    { "@type": "ListItem", position: 3, name: copy.name, item: canonical },
  ];

  return (
    <main id="main-content" className="game-page page-shell">
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [
        { "@type": "WebPage", "@id": `${canonical}#webpage`, name: copy.h1, description: copy.description, url: canonical, inLanguage: locale === "en" ? "en" : "zh-CN", mainEntity: { "@id": `${canonical}#game` } },
        { "@type": "VideoGame", "@id": `${canonical}#game`, name: copy.name, description: copy.description, url: canonical, mainEntityOfPage: { "@id": `${canonical}#webpage` }, image: absoluteUrl(`/images/games/${slug}/og.webp`), inLanguage: locale === "en" ? "en" : "zh-CN", genre: copy.categories, gamePlatform: "Web browser", playMode: "SinglePlayer", isAccessibleForFree: true },
        { "@type": "BreadcrumbList", itemListElement: breadcrumb },
      ] }} />
      <Breadcrumb items={[{ label: ui.breadcrumb.home, href: localizedPath(locale) }, { label: categoryLabel, href: categoryPath(locale, primaryCategory) }, { label: copy.name }]} />
      <header className="game-heading">
        <div><p className="eyebrow"><span />{game.id} / {copy.categories.join(" · ")}</p><h1>{copy.h1}</h1><p>{copy.cardCopy}</p></div>
        <span className="game-index">{String(game.number).padStart(2, "0")}<small>/29</small></span>
      </header>
      <div className="game-badges"><span>{copy.difficulty}</span><span>{ui.game.controls}: {presentation.control[locale]}</span><span>{ui.game.noSignup}</span></div>
      <GameLauncher slug={game.slug} name={copy.name} locale={locale} />
      <p className="progress-note">{ui.game.progress}</p>

      <article className="game-guide">
        <section className="guide-about"><p className="section-number">01 / {ui.game.about.toUpperCase()}</p><div><h2>{ui.game.about} {copy.name}</h2><p>{copy.about}</p></div></section>
        <section><p className="section-number">02 / {ui.game.howTo.toUpperCase()}</p><div><h2>{ui.game.howTo}</h2><ol>{copy.howTo.map((item) => <li key={item}>{item}</li>)}</ol></div></section>
        <section><p className="section-number">03 / {ui.game.tips.toUpperCase()}</p><div><h2>{ui.game.tips}</h2><ul>{copy.tips.map((item) => <li key={item}>{item}</li>)}</ul></div></section>
      </article>

      <AdSlot locale={locale} slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_GAME_CONTENT} />

      <section className="game-faq"><div className="section-heading"><div><p className="eyebrow">FAQ</p><h2>{ui.game.faq}</h2></div></div><FaqList items={copy.faq} /></section>
      <section className="related-games"><div className="section-heading"><div><p className="eyebrow">{locale === "en" ? "KEEP PLAYING" : "继续游玩"}</p><h2>{ui.game.related}</h2></div><Link href={localizedPath(locale, "#games")}>{ui.nav.allGames} ↗</Link></div><div className="featured-grid">{related.map((item) => <GameCard key={item.id} game={item} locale={locale} compact />)}</div></section>
      <AdSlot locale={locale} slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_GAME_BOTTOM} />
    </main>
  );
}
