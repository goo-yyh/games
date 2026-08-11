"use client";

import { Component, lazy, Suspense, type ComponentType, type ErrorInfo, type ReactNode, useCallback, useEffect, useRef, useState } from "react";
import { Contrast, Expand, Minimize, Pause, Play, RotateCcw, Volume2, VolumeX } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { GamePhase, PlayableGameProps } from "./types";
import { gameLoaders } from "./loaders";

const lazyGames = Object.fromEntries(
  Object.entries(gameLoaders).map(([slug, loader]) => [slug, lazy(loader)]),
) as unknown as Record<keyof typeof gameLoaders, ComponentType<PlayableGameProps>>;

class GameErrorBoundary extends Component<{ children: ReactNode; locale: Locale; onRetry: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    if (process.env.NODE_ENV === "development") console.error("Game runtime error", error, info);
  }
  render() {
    if (!this.state.failed) return this.props.children;
    return <div className="game-error" role="alert"><strong>{this.props.locale === "en" ? "The game could not start." : "游戏暂时无法启动。"}</strong><p>{this.props.locale === "en" ? "Try again to create a clean session." : "请重试并创建一个全新的会话。"}</p><button type="button" onClick={() => { this.setState({ failed: false }); this.props.onRetry(); }}>{this.props.locale === "en" ? "Try again" : "重试"}</button></div>;
  }
}

export default function GameRuntime({ slug, locale, name }: { slug: string; locale: Locale; name: string }) {
  const en = locale === "en";
  const [phase, setPhase] = useState<GamePhase>("playing");
  const [score, setScore] = useState(0);
  const [status, setStatus] = useState(en ? "Game started" : "游戏已开始");
  const [resetKey, setResetKey] = useState(0);
  const [muted, setMuted] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const shellRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<AudioContext | null>(null);
  const PlayableGame = lazyGames[slug as keyof typeof lazyGames];

  const sound = useCallback((kind: "move" | "score" | "fail" | "win" = "move") => {
    if (muted) return;
    try {
      const AudioContextConstructor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextConstructor) return;
      const context = audioRef.current ?? new AudioContextConstructor();
      audioRef.current = context;
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      const frequencies = { move: 220, score: 440, fail: 120, win: 660 };
      oscillator.frequency.value = frequencies[kind];
      oscillator.type = kind === "fail" ? "sawtooth" : "sine";
      gain.gain.setValueAtTime(0.045, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.11);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.12);
    } catch { /* Audio is optional. */ }
  }, [muted]);

  const restart = useCallback(() => {
    setScore(0);
    setPhase("playing");
    setStatus(en ? "New run started" : "新一局已开始");
    setResetKey((value) => value + 1);
  }, [en]);

  const endGame = useCallback((message: string) => {
    setStatus(message);
    setPhase("game-over");
    sound("fail");
  }, [sound]);

  const completeGame = useCallback((message: string) => {
    setStatus(message);
    setPhase("complete");
    sound("win");
  }, [sound]);

  useEffect(() => {
    const pauseForVisibility = () => {
      if (document.hidden) {
        setPhase((current) => current === "playing" ? "paused" : current);
        setStatus(en ? "Paused while the page is hidden" : "页面隐藏，游戏已暂停");
      }
    };
    const pauseForBlur = () => {
      setPhase((current) => current === "playing" ? "paused" : current);
    };
    const onFullscreen = () => setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("visibilitychange", pauseForVisibility);
    document.addEventListener("fullscreenchange", onFullscreen);
    window.addEventListener("blur", pauseForBlur);
    return () => {
      document.removeEventListener("visibilitychange", pauseForVisibility);
      document.removeEventListener("fullscreenchange", onFullscreen);
      window.removeEventListener("blur", pauseForBlur);
      void audioRef.current?.close();
      audioRef.current = null;
    };
  }, [en]);

  const props: PlayableGameProps = {
    slug,
    locale,
    paused: phase !== "playing",
    resetKey,
    sound,
    onScore: setScore,
    onStatus: setStatus,
    onEnd: endGame,
    onComplete: completeGame,
  };

  async function toggleFullscreen() {
    if (!document.fullscreenEnabled || !shellRef.current) return;
    if (document.fullscreenElement) await document.exitFullscreen();
    else await shellRef.current.requestFullscreen();
  }

  return (
    <div ref={shellRef} className={`game-shell ${highContrast ? "is-high-contrast" : ""}`} data-phase={phase}>
      <div className="game-shell-bar">
        <div className="game-shell-title"><span aria-hidden="true" /><div><strong>{name}</strong><small>{phase === "playing" ? (en ? "Playing" : "进行中") : phase === "paused" ? (en ? "Paused" : "已暂停") : phase === "complete" ? (en ? "Complete" : "已完成") : (en ? "Game over" : "游戏结束")}</small></div></div>
        <div className="game-score"><small>{en ? "Score" : "分数"}</small><strong>{score}</strong></div>
        <div className="game-shell-controls">
          <button type="button" onClick={() => { setPhase((current) => current === "paused" ? "playing" : "paused"); setStatus(phase === "paused" ? (en ? "Resumed" : "继续游戏") : (en ? "Paused" : "游戏已暂停")); }} aria-pressed={phase === "paused"} aria-label={phase === "paused" ? (en ? "Resume" : "继续") : (en ? "Pause" : "暂停")}>{phase === "paused" ? <Play aria-hidden="true" /> : <Pause aria-hidden="true" />}</button>
          <button type="button" onClick={restart} aria-label={en ? "Restart" : "重新开始"}><RotateCcw aria-hidden="true" /></button>
          <button type="button" onClick={() => setMuted((value) => !value)} aria-pressed={muted} aria-label={muted ? (en ? "Unmute" : "开启声音") : (en ? "Mute" : "静音")}>{muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}</button>
          <button type="button" onClick={() => setHighContrast((value) => !value)} aria-pressed={highContrast} aria-label={en ? "High contrast" : "高对比度"}><Contrast aria-hidden="true" /></button>
          {typeof document !== "undefined" && document.fullscreenEnabled && <button type="button" onClick={toggleFullscreen} aria-label={fullscreen ? (en ? "Exit fullscreen" : "退出全屏") : (en ? "Fullscreen" : "全屏")}>{fullscreen ? <Minimize aria-hidden="true" /> : <Expand aria-hidden="true" />}</button>}
        </div>
      </div>
      <GameErrorBoundary locale={locale} onRetry={restart}>
        <div className="game-stage" aria-label={`${name} — ${en ? "interactive game area" : "互动游戏区域"}`}>
          <Suspense fallback={<div className="game-loading">{en ? "Loading game…" : "正在加载游戏……"}</div>}><PlayableGame {...props} /></Suspense>
          {phase === "paused" && <div className="phase-overlay" role="dialog" aria-modal="true"><strong>{en ? "Paused" : "已暂停"}</strong><button type="button" onClick={() => setPhase("playing")}>{en ? "Resume" : "继续游戏"}</button></div>}
          {(phase === "game-over" || phase === "complete") && <div className="phase-overlay" role="dialog" aria-modal="true" aria-labelledby="result-title"><strong id="result-title">{phase === "complete" ? (en ? "Round complete" : "本局完成") : (en ? "Game over" : "游戏结束")}</strong><p>{status}</p><button autoFocus type="button" onClick={restart}>{en ? "Play again" : "再玩一次"}</button></div>}
        </div>
      </GameErrorBoundary>
      <p className="game-live" role="status" aria-live="polite" aria-atomic="true">{status}</p>
    </div>
  );
}
