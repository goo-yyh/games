import type { Metadata } from "next";
import Link from "next/link";
import { locale as getLocale } from "next/root-params";
import { games } from "@/content/games";
import { RandomGameButton } from "@/components/RandomGameButton";
import { isLocale, type Locale } from "@/i18n/config";
import { localizedPath } from "@/i18n/paths";

export const metadata: Metadata = { robots: { index: false, follow: false, noarchive: true } };

export default async function NotFound() {
  const value = await getLocale();
  const locale: Locale = value && isLocale(value) ? value : "en";
  const en = locale === "en";
  return (
    <main id="main-content" className="not-found page-shell">
      <span className="error-code" aria-hidden="true">404</span>
      <p className="eyebrow"><span />{en ? "LOST A LIFE" : "迷路了"}</p>
      <h1>{en ? "Game over — this page is missing." : "游戏结束——这个页面不存在"}</h1>
      <p>{en ? "The link may be outdated, or the game may have moved. Return to the full collection and start a new round." : "链接可能已经过期，或页面地址发生了变化。返回完整游戏合集，开始一局新的挑战。"}</p>
      <div className="hero-actions"><Link className="button button-primary" href={localizedPath(locale, "#games")}>{en ? "Browse all games" : "浏览全部游戏"}</Link><RandomGameButton locale={locale} slugs={games.map((game) => game.slug)} label={en ? "Play a random game" : "随机玩一款"} /></div>
    </main>
  );
}
