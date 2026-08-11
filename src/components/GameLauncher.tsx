"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useState } from "react";
import { Gamepad2, LoaderCircle, Play } from "lucide-react";
import { gamePresentation } from "@/content/game-presentation";
import type { Locale } from "@/i18n/config";

const GameRuntimeEn = dynamic(() => import("@/games/GameRuntime"), {
  loading: () => <div className="game-loading"><LoaderCircle aria-hidden="true" /><span>Loading…</span></div>,
  ssr: false,
});

const GameRuntimeZh = dynamic(() => import("@/games/GameRuntime"), {
  loading: () => <div className="game-loading"><LoaderCircle aria-hidden="true" /><span>正在加载游戏……</span></div>,
  ssr: false,
});

export function GameLauncher({ slug, name, locale }: { slug: string; name: string; locale: Locale }) {
  const [started, setStarted] = useState(false);
  const presentation = gamePresentation[slug];
  const Runtime = locale === "en" ? GameRuntimeEn : GameRuntimeZh;

  return (
    <section className="game-launcher" aria-label={name}>
      {!started ? (
        <div className="game-ready">
          <div className="ready-art" style={{ "--card-accent": presentation.accent, "--card-accent-2": presentation.accent2 } as React.CSSProperties}>
            <Image src={`/images/games/${slug}/cover.webp`} alt="" width={1200} height={675} priority />
            <span className="cover-grid" aria-hidden="true" /><span className="ready-icon" aria-hidden="true">{presentation.icon}</span>
            <div className="ready-copy"><Gamepad2 aria-hidden="true" /><strong>{name}</strong><small>{presentation.control[locale]}</small></div>
          </div>
          <button className="play-button" type="button" onClick={() => setStarted(true)}><Play fill="currentColor" aria-hidden="true" />{locale === "en" ? "Play game" : "开始游戏"}</button>
        </div>
      ) : (
        <Runtime slug={slug} locale={locale} name={name} />
      )}
    </section>
  );
}
