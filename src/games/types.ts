import type { Locale } from "@/i18n/config";

export type GamePhase = "playing" | "paused" | "game-over" | "complete";

export type PlayableGameProps = {
  slug: string;
  locale: Locale;
  paused: boolean;
  resetKey: number;
  sound: (kind?: "move" | "score" | "fail" | "win") => void;
  onScore: (score: number) => void;
  onStatus: (status: string) => void;
  onEnd: (status: string) => void;
  onComplete: (status: string) => void;
};
