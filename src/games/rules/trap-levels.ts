export type TrapPlatform = { id: string; x: number; y: number; width: number; motion?: { axis: "x" | "y"; range: number; period: number } };
export type TrapHazard = { id: string; x: number; y: number; width: number; trigger?: string };
export type TrapTrigger = { id: string; x: number; width: number; action: { kind: "raise-hazard" | "drop-platform"; target: string } };
export type TrapRoomDefinition = {
  spawn: { x: number; y: number };
  exit: number;
  platforms: readonly TrapPlatform[];
  hazards: readonly TrapHazard[];
  triggers: readonly TrapTrigger[];
  smokePath: readonly ("left" | "right" | "jump")[];
};

const blueprints = [
  [26,65,58,49,32,70], [22,63,55,46,38,72], [30,66,62,51,27,69],
  [18,61,48,45,42,73], [28,67,64,47,35,70], [24,62,54,43,45,74],
  [32,68,60,50,29,71], [20,64,50,44,40,72], [27,60,63,46,34,75],
  [23,66,52,48,43,70], [31,63,59,42,30,73], [19,68,47,47,46,71],
  [29,61,61,44,36,74], [21,65,53,41,44,72], [33,67,65,45,28,75],
] as const;

export const TRAP_ROOMS: readonly TrapRoomDefinition[] = blueprints.map(([x1,y1,x2,y2,hazardX,movingY], index) => ({
  spawn: { x: 6, y: 76 },
  exit: 91,
  platforms: [
    { id: "floor", x: 0, y: 84, width: 100 },
    { id: "ledge-a", x: x1, y: y1, width: 18 },
    { id: "ledge-b", x: x2, y: y2, width: 20 },
    { id: "moving", x: 70, y: movingY, width: 13, motion: { axis: index % 2 ? "y" : "x", range: 5 + index % 4, period: 1500 + index * 45 } },
  ],
  hazards: [
    { id: "spikes-a", x: hazardX, y: 80, width: 7 },
    { id: "spikes-b", x: 67 - index % 6, y: 80, width: 7, trigger: "warning" },
  ],
  triggers: [
    { id: "warning", x: 54 - index % 5, width: 4, action: { kind: "raise-hazard", target: "spikes-b" } },
    ...(index % 3 === 2 ? [{ id: "drop", x: 38, width: 4, action: { kind: "drop-platform" as const, target: "ledge-a" } }] : []),
  ],
  smokePath: ["right", "jump", "right", "jump", "right", "jump", "right"],
}));

export function validateTrapRoom(room: TrapRoomDefinition) {
  const ids = new Set([...room.platforms, ...room.hazards].map((item) => item.id));
  return room.spawn.x < room.exit && room.platforms.some((platform) => platform.id === "floor") && room.triggers.every((trigger) => ids.has(trigger.action.target)) && room.smokePath.includes("jump");
}

export function trapPlatformAt(platform: TrapPlatform, elapsedMs: number, dropped = false) {
  if (dropped) return { ...platform, y: platform.y + 40 };
  if (!platform.motion) return platform;
  const offset = Math.sin(elapsedMs / platform.motion.period * Math.PI * 2) * platform.motion.range;
  return platform.motion.axis === "x" ? { ...platform, x: platform.x + offset } : { ...platform, y: platform.y + offset };
}
