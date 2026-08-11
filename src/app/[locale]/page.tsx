import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AdSlot } from "@/components/Ads";
import { FaqList } from "@/components/FaqList";
import { GameCard } from "@/components/GameCard";
import { GameGrid } from "@/components/GameGrid";
import { JsonLd } from "@/components/JsonLd";
import { UiIcon } from "@/components/UiIcon";
import { games, gardenLogicSlugs, getGame, toGameCardData } from "@/content/games";
import { categoryContent, getSiteCopy } from "@/content/site";
import { absoluteUrl, siteConfig } from "@/config/site";
import { isLocale, type Locale } from "@/i18n/config";
import { categoryPath, gamePath, localizedPath } from "@/i18n/paths";
import { buildLocalizedMetadata } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const copy = getSiteCopy(locale);
  return buildLocalizedMetadata({
    locale,
    logicalPath: "/",
    title: copy.home.title,
    description: copy.home.description,
    imageAlt: locale === "en" ? "ArcadeMint original browser game collection" : "ArcadeMint 原创浏览器小游戏合集",
  });
}

const featuredSlugs = ["block-bloom", "slope-dash", "bubble-pop-shooter", "classic-solitaire"];

export default async function HomePage({ params }: Props) {
  const { locale: value } = await params;
  if (!isLocale(value)) notFound();
  const locale = value as Locale;
  const copy = getSiteCopy(locale);
  const featured = featuredSlugs.map(getGame).filter(Boolean);
  const garden = gardenLogicSlugs.map(getGame).filter(Boolean);
  const categoryIcons = { puzzle: "layers", arcade: "gamepad", skill: "sparkles", brain: "flower" } as const;
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteConfig.url}/#website`,
        name: siteConfig.name,
        url: absoluteUrl(localizedPath(locale)),
        inLanguage: locale === "en" ? "en" : "zh-CN",
        description: copy.home.description,
        publisher: { "@id": `${siteConfig.url}/#organization` },
      },
      {
        "@type": "Organization",
        "@id": `${siteConfig.url}/#organization`,
        name: siteConfig.legalName,
        url: siteConfig.url,
      },
    ],
  };

  return (
    <main id="main-content">
      <JsonLd data={websiteJsonLd} />
      <section className="hero page-shell">
        <div className="hero-copy">
          <p className="eyebrow"><span />{copy.home.eyebrow}</p>
          <h1>{copy.home.h1}</h1>
          <p className="hero-body">{copy.home.hero}</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="#games">{copy.home.primaryCta}<UiIcon name="arrow" /></Link>
            <Link className="button button-secondary" href={gamePath(locale, "block-bloom")}>{copy.home.secondaryCta}</Link>
          </div>
          <ul className="trust-row">
            {copy.home.trust.map((item) => <li key={item}><i aria-hidden="true" />{item}</li>)}
          </ul>
        </div>
        <div className="hero-arcade" aria-hidden="true">
          <div className="hero-orbit orbit-a"><span>12</span></div>
          <div className="hero-orbit orbit-b"><span>✦</span></div>
          <div className="hero-machine">
            <span className="machine-top">ARCADE / 29</span>
            <div className="machine-screen">
              {/* This is the LCP candidate; native markup avoids shipping the image component runtime. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/og/home.webp" alt="" width={1200} height={630} fetchPriority="high" decoding="async" />
              <i className="pixel pixel-a" /><i className="pixel pixel-b" /><i className="pixel pixel-c" />
              <strong>PLAY</strong>
            </div>
            <div className="machine-controls"><i /><i /><i /></div>
          </div>
          <div className="hero-ticket">FREE PLAY <strong>29</strong></div>
        </div>
      </section>

      <section className="intro-strip">
        <div className="page-shell intro-grid">
          <p className="section-number">01 / {locale === "en" ? "THE COLLECTION" : "游戏合集"}</p>
          <div>{copy.home.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div>
        </div>
      </section>

      <section className="section page-shell">
        <div className="section-heading"><div><p className="eyebrow">{locale === "en" ? "START HERE" : "从这里开始"}</p><h2>{copy.home.featured}</h2></div><span className="section-count">04</span></div>
        <div className="featured-grid">{featured.map((game) => game && <GameCard key={game.id} game={game} locale={locale} />)}</div>
      </section>

      <AdSlot locale={locale} slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_INLINE} />

      <section className="garden-band">
        <div className="page-shell">
          <div className="garden-heading"><div><p className="eyebrow"><span />{locale === "en" ? "A NINE-GAME COLLECTION" : "九款原创谜题"}</p><h2>{copy.home.gardenTitle}</h2><p>{copy.home.gardenCopy}</p></div><Link className="button button-secondary" href={localizedPath(locale, "/collections/garden-logic")}>{copy.home.gardenCta}</Link></div>
          <div className="garden-row">{garden.map((game) => game && <GameCard compact key={game.id} game={game} locale={locale} />)}</div>
        </div>
      </section>

      <section id="games" className="section catalog-section page-shell">
        <div className="section-heading"><div><p className="eyebrow">{locale === "en" ? "PICK YOUR NEXT ROUND" : "选择下一局"}</p><h2>{copy.home.allGames}</h2></div><span className="section-count">29</span></div>
        <GameGrid games={games.map(toGameCardData)} locale={locale} searchable />
      </section>

      <section className="why-section page-shell">
        <div className="section-heading"><div><p className="eyebrow">{locale === "en" ? "WHY ARCADEMINT" : "为什么选择 ARCADEMINT"}</p><h2>{copy.home.whyTitle}</h2></div></div>
        <div className="why-grid">
          {copy.home.why.map(([title, body], index) => {
            const icon = ["sparkles", "monitor", "gamepad"] as const;
            return <article key={title}><span><UiIcon name={icon[index]} /></span><p>0{index + 1}</p><h3>{title}</h3><div className="rule" /><p>{body}</p></article>;
          })}
        </div>
      </section>

      <section className="category-links page-shell">
        {(Object.keys(categoryContent) as (keyof typeof categoryContent)[]).map((slug, index) => {
          const category = categoryContent[slug][locale];
          return <Link key={slug} href={categoryPath(locale, slug)}><span>0{index + 1}</span><UiIcon name={categoryIcons[slug]} /><strong>{category.label}</strong><small>{games.filter((game) => game.locales.en.categories.some((value) => value.toLowerCase() === slug)).length} {locale === "en" ? "games" : "款游戏"}</small><UiIcon name="arrow" /></Link>;
        })}
      </section>

      <AdSlot locale={locale} slot={process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME_INLINE} />

      <section className="faq-section page-shell">
        <div className="faq-intro"><p className="eyebrow">FAQ</p><h2>{copy.home.faqTitle}</h2><p>{locale === "en" ? "Everything you need to know before your first round." : "开始第一局之前，你可能想知道这些。"}</p></div>
        <FaqList items={copy.home.faq} />
      </section>
    </main>
  );
}
