import { describe, expect, it } from "vitest";
import { HOOK_COURSES, RUGGED_TRACKS, validateHookCourse, validateRuggedTrack } from "../../src/games/rules/physics-levels";
import { TRAP_ROOMS, trapPlatformAt, validateTrapRoom } from "../../src/games/rules/trap-levels";

describe("bundled physics levels", () => {
  it("ships 15 Hook Swing courses with a range-valid recorded anchor path", () => {
    expect(HOOK_COURSES).toHaveLength(15);
    expect(HOOK_COURSES.every(validateHookCourse)).toBe(true);
  });

  it("ships 12 continuous Rugged Wheels tracks with checkpoints and replay inputs", () => {
    expect(RUGGED_TRACKS).toHaveLength(12);
    expect(RUGGED_TRACKS.every(validateRuggedTrack)).toBe(true);
    expect(new Set(RUGGED_TRACKS.flatMap((track) => track.features))).toEqual(new Set(["ground", "ramp", "bridge", "seesaw", "roller", "moving"]));
  });

  it("ships 15 declarative Trap Runner rooms with validated triggers and smoke inputs", () => {
    expect(TRAP_ROOMS).toHaveLength(15);
    expect(TRAP_ROOMS.every(validateTrapRoom)).toBe(true);
  });

  it("resolves moving and dropped trap platforms without mutating room data", () => {
    const platform = TRAP_ROOMS[0].platforms.find((item) => item.id === "moving")!;
    expect(trapPlatformAt(platform, platform.motion!.period / 4).x).not.toBe(platform.x);
    expect(trapPlatformAt(platform, 0, true).y).toBe(platform.y + 40);
  });
});
