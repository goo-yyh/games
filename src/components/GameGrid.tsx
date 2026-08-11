"use client";

import { useMemo, useState } from "react";
import type { GameCardData } from "@/content/games";
import type { Locale } from "@/i18n/config";
import { GameCard } from "./GameCard";

const filters = ["all", "puzzle", "arcade", "skill", "brain"] as const;

export function GameGrid({ games, locale, searchable = false }: { games: GameCardData[]; locale: Locale; searchable?: boolean }) {
  const searchPlaceholder = locale === "en" ? "Search games" : "搜索游戏";
  const noResults = locale === "en" ? "No games match that search." : "没有找到符合条件的游戏。";
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof filters)[number]>("all");
  const filterLabels = locale === "en"
    ? ["All", "Puzzle", "Arcade", "Skill", "Brain"]
    : ["全部", "益智", "街机", "技巧", "脑力"];
  const visible = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale === "zh" ? "zh-CN" : "en");
    return games.filter((game) => {
      const gameCopy = game.locales[locale];
      const inFilter = filter === "all" || game.locales.en.categories.some((category) => category.toLowerCase() === filter);
      const haystack = [gameCopy.name, gameCopy.cardCopy, ...gameCopy.categories].join(" ").toLocaleLowerCase(locale === "zh" ? "zh-CN" : "en");
      return inFilter && (!needle || haystack.includes(needle));
    });
  }, [filter, games, locale, query]);

  return (
    <>
      {searchable && (
        <div className="catalog-tools">
          <label className="search-field">
            <span className="search-icon" aria-hidden="true">⌕</span>
            <span className="sr-only">{searchPlaceholder}</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={searchPlaceholder} type="search" />
          </label>
          <div className="filter-chips" role="group" aria-label={locale === "en" ? "Filter games" : "筛选游戏"}>
            {filters.map((value, index) => (
              <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>{filterLabels[index]}</button>
            ))}
          </div>
        </div>
      )}
      <div className="game-grid" aria-live="polite">
        {visible.map((game) => <GameCard key={game.id} game={game} locale={locale} />)}
      </div>
      {visible.length === 0 && <p className="empty-state">{noResults}</p>}
    </>
  );
}
