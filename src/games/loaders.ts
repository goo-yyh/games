import type { ComponentType } from "react";
import type { PlayableGameProps } from "./types";

export type GameModule = { default: ComponentType<PlayableGameProps> };
export type GameLoader = () => Promise<GameModule>;

const classic = () => import("./logic/ClassicGames").then((module) => ({ default: module.ClassicGame }));
const garden = () => import("./logic/GardenGames").then((module) => ({ default: module.GardenGame }));
const arcade = () => import("./arcade/ArcadeGames");
const physics = () => import("./physics/PhysicsGames");

// Keep every slug explicit: user-controlled route text is never interpolated
// into an import path, and adding a thirtieth game must update this map.
export const gameLoaders = {
  "block-bloom": classic,
  "number-merge-2048": classic,
  "neon-snake": arcade,
  "sky-stack": arcade,
  "zigzag-drift": arcade,
  "tap-hoops": arcade,
  "color-pour": classic,
  "penalty-hero": arcade,
  "slope-dash": arcade,
  "helix-drop": arcade,
  "tunnel-flux": arcade,
  "bubble-pop-shooter": classic,
  "bolt-away": classic,
  "unblock-path": classic,
  "wave-rider": arcade,
  "fruit-slice-rush": arcade,
  "hook-swing": physics,
  "trap-runner": arcade,
  "rugged-wheels": physics,
  "classic-solitaire": classic,
  "sum-orchard": garden,
  "color-cross": garden,
  "orbit-lines": garden,
  "corner-stars": garden,
  "sidefall-blocks": garden,
  "triad-capture": garden,
  "echo-path": garden,
  "target-basket": garden,
  "math-grid-sprint": garden,
} satisfies Record<string, GameLoader>;
