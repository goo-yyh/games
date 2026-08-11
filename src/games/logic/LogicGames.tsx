"use client";

import type { PlayableGameProps } from "../types";
import { ClassicGame } from "./ClassicGames";
import { GardenGame } from "./GardenGames";

const gardenSlugs = new Set([
  "sum-orchard",
  "color-cross",
  "orbit-lines",
  "corner-stars",
  "sidefall-blocks",
  "triad-capture",
  "echo-path",
  "target-basket",
  "math-grid-sprint",
]);

export default function LogicGames(props: PlayableGameProps) {
  return gardenSlugs.has(props.slug) ? <GardenGame {...props} /> : <ClassicGame {...props} />;
}
