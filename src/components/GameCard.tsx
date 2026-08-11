import Link from "next/link";
import Image from "next/image";
import type { GameCardData } from "@/content/games";
import { gamePresentation } from "@/content/game-presentation";
import type { Locale } from "@/i18n/config";
import { gamePath } from "@/i18n/paths";

export function GameCard({ game, locale, compact = false }: { game: GameCardData; locale: Locale; compact?: boolean }) {
  const copy = game.locales[locale];
  const playLabel = locale === "en" ? "Play now" : "立即游玩";
  const presentation = gamePresentation[game.slug];
  return (
    <article className={`game-card${compact ? " game-card-compact" : ""}`} data-categories={game.locales.en.categories.join(" ").toLowerCase()}>
      <Link href={gamePath(locale, game.slug)} aria-label={`${playLabel}: ${copy.name}`}>
        <div
          className="game-cover"
          style={{ "--card-accent": presentation.accent, "--card-accent-2": presentation.accent2 } as React.CSSProperties}
        >
          <Image
            src={`/images/games/${game.slug}/cover.webp`}
            alt={copy.imageAlt}
            width={1200}
            height={675}
            sizes={compact ? "210px" : "(max-width: 639px) 100vw, (max-width: 899px) 50vw, (max-width: 1100px) 33vw, 25vw"}
          />
          <span className="cover-grid" aria-hidden="true" />
          <span className="cover-orbit cover-orbit-one" aria-hidden="true" />
          <span className="cover-orbit cover-orbit-two" aria-hidden="true" />
          <strong aria-hidden="true">{presentation.icon}</strong>
          <small>{game.id}</small>
        </div>
        <div className="card-copy">
          <div className="card-tags">
            {copy.categories.slice(0, 2).map((category) => <span key={category}>{category}</span>)}
          </div>
          <h3>{copy.name}</h3>
          {!compact && <p>{copy.cardCopy}</p>}
          <div className="card-meta"><span>{presentation.control[locale]}</span><b>{playLabel} <span aria-hidden="true">↗</span></b></div>
        </div>
      </Link>
    </article>
  );
}
