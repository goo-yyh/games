import { describe, expect, it } from "vitest";
import { createRandom } from "../../src/games/random";
import {
  angleInWrappedInterval,
  calculateStackLanding,
  canAttachAnchor,
  canUseBufferedJump,
  circularDistance,
  clampRisingSpeed,
  createSlopeChunk,
  createTunnelRing,
  driftRoadIsContinuous,
  generateDriftRoad,
  generateHelixTower,
  hazardLaunchIsReadable,
  isDownwardHoopScore,
  nextReachableHoopHeight,
  penaltyGesture,
  isOppositeDirection,
  penaltyMatchDecision,
  pickSnakeFood,
  resolveHelixCrossing,
  resolvePenaltyChoice,
  segmentCircleIntersects,
  segmentsIntersect,
  snakeTickDelay,
  slopeChunkCollision,
  slopeChunksHaveSafeTransitions,
  slopeLaneForWorldX,
  sweptWaveCollision,
  trackSegmentsAreContinuous,
  tunnelReactionWindow,
  tunnelRingIsSafe,
  touchesHoopRim,
  updateSlopeMotion,
  vehicleShouldReset,
} from "../../src/games/rules/arcade-rules";

describe("Neon Snake rules", () => {
  it("never places food on the snake", () => {
    const snake = Array.from({ length: 100 }, (_, index) => ({ x: index % 24, y: Math.floor(index / 24) }));
    const occupied = new Set(snake.map(({ x, y }) => `${x}-${y}`));
    for (let seed = 1; seed <= 100; seed += 1) {
      const food = pickSnakeFood(snake, createRandom(seed));
      expect(food).not.toBeNull();
      expect(occupied.has(`${food!.x}-${food!.y}`)).toBe(false);
    }
  });

  it("recognizes opposite directions", () => {
    expect(isOppositeDirection({ x: 1, y: 0 }, { x: -1, y: 0 })).toBe(true);
    expect(isOppositeDirection({ x: 1, y: 0 }, { x: 0, y: -1 })).toBe(false);
  });

  it("increases speed at milestones without exceeding the cap", () => {
    expect(snakeTickDelay(0)).toBe(155);
    expect(snakeTickDelay(5)).toBe(143);
    expect(snakeTickDelay(500)).toBe(68);
  });
});

describe("Sky Stack rules", () => {
  it("calculates overlap from either direction", () => {
    expect(calculateStackLanding({ x: 20, width: 40 }, { x: 10, width: 30 })?.overlap).toBe(20);
    expect(calculateStackLanding({ x: 20, width: 40 }, { x: 50, width: 30 })?.overlap).toBe(10);
  });

  it("rejects zero overlap and caps perfect restoration", () => {
    expect(calculateStackLanding({ x: 20, width: 20 }, { x: 40, width: 20 })).toBeNull();
    expect(calculateStackLanding({ x: 20, width: 60 }, { x: 20.5, width: 60 })?.layer.width).toBe(60);
  });
});

describe("Zigzag Drift generation", () => {
  it("is deterministic, connected, and keeps collectibles on its centerline", () => {
    const first = generateDriftRoad(44, 180);
    const second = generateDriftRoad(44, 180);
    expect(first.centers).toEqual(second.centers);
    expect(driftRoadIsContinuous(first.centers)).toBe(true);
    const centers = new Set(first.centers.map(({ x, y }) => `${x}-${y}`));
    expect([...first.collectibles].every((key) => centers.has(key))).toBe(true);
  });

  it("can extend from an arbitrary world-space cursor", () => {
    const extension = generateDriftRoad(99, 80, { x: 8, y: -72 });
    expect(extension.centers[0]).toEqual({ x: 8, y: -72 });
    expect(extension.centers.at(-1)?.y).toBe(-151);
    expect(driftRoadIsContinuous(extension.centers)).toBe(true);
  });
});

describe("Tap Hoops crossing", () => {
  const hoopCenter = { x: 20, y: 50 };

  it("scores only a downward crossing between the inner rims", () => {
    expect(isDownwardHoopScore({ previousBall: { x: 20, y: 48 }, ball: { x: 20, y: 51 }, hoopCenter, innerHalfWidth: 4 })).toBe(true);
    expect(isDownwardHoopScore({ previousBall: { x: 20, y: 52 }, ball: { x: 20, y: 49 }, hoopCenter, innerHalfWidth: 4 })).toBe(false);
    expect(isDownwardHoopScore({ previousBall: { x: 26, y: 48 }, ball: { x: 26, y: 51 }, hoopCenter, innerHalfWidth: 4 })).toBe(false);
  });

  it("keeps generated hoops inside the tested jump envelope", () => {
    let height = 50;
    for (let seed = 1; seed <= 100; seed += 1) {
      const next = nextReachableHoopHeight(height, createRandom(seed));
      expect(next).toBeGreaterThanOrEqual(25);
      expect(next).toBeLessThanOrEqual(72);
      expect(Math.abs(next - height)).toBeLessThanOrEqual(22);
      height = next;
    }
  });

  it("detects either rim without treating a clean center crossing as contact", () => {
    expect(touchesHoopRim({ x: 14, y: 50 }, hoopCenter)).toBe(true);
    expect(touchesHoopRim({ x: 26, y: 50 }, hoopCenter)).toBe(true);
    expect(touchesHoopRim({ x: 20, y: 50 }, hoopCenter)).toBe(false);
  });
});

describe("Penalty Hero decisions", () => {
  it("resolves against an already committed AI zone", () => {
    expect(resolvePenaltyChoice("shoot", 2, 2)).toBe(false);
    expect(resolvePenaltyChoice("shoot", 2, 3)).toBe(true);
    expect(resolvePenaltyChoice("save", 2, 2)).toBe(true);
  });

  it("derives capped power, height and an out-of-frame miss from the gesture", () => {
    expect(penaltyGesture(-80, -120)).toMatchObject({ zone: 0, inFrame: true });
    expect(penaltyGesture(0, -250)).toMatchObject({ zone: 1, power: 1, height: 1, inFrame: false });
    expect(penaltyGesture(220, -80).inFrame).toBe(false);
  });

  it("finishes regulation differences and whole sudden-death pairs only", () => {
    expect(penaltyMatchDecision(9, 4, 1)).toBe("continue");
    expect(penaltyMatchDecision(10, 4, 1)).toBe("complete");
    expect(penaltyMatchDecision(10, 3, 3)).toBe("sudden-death");
    expect(penaltyMatchDecision(11, 4, 3)).toBe("continue");
    expect(penaltyMatchDecision(12, 5, 4)).toBe("complete");
  });
});

describe("endless speed and angular rules", () => {
  it("clamps the Slope Dash tick rate", () => {
    expect(clampRisingSpeed(0)).toBe(430);
    expect(clampRisingSpeed(160)).toBe(405);
    expect(clampRisingSpeed(100_000)).toBe(210);
  });

  it("builds passable Slope Dash chunks with barriers, gaps, ramps, and safe transitions", () => {
    const chunks = Array.from({ length: 80 }, (_, id) => createSlopeChunk(id));
    expect(slopeChunksHaveSafeTransitions(chunks)).toBe(true);
    expect(new Set(chunks.map(({ feature }) => feature))).toEqual(new Set(["flat", "barrier", "gap", "ramp"]));
    for (const chunk of chunks) {
      expect(slopeChunkCollision(chunk, [-0.66, 0, 0.66][chunk.safeLane])).toBeNull();
    }
  });

  it("applies lateral velocity, damping, world-lane collision, and track bounds", () => {
    const steered = updateSlopeMotion(0, 0, -1);
    const damped = updateSlopeMotion(steered.position, steered.velocity, 0);
    expect(steered.position).toBeLessThan(0);
    expect(Math.abs(damped.velocity)).toBeLessThan(Math.abs(steered.velocity));
    expect(updateSlopeMotion(-1, -0.4, -1).position).toBe(-1);
    expect(slopeLaneForWorldX(-0.8)).toBe(0);
    expect(slopeLaneForWorldX(0)).toBe(1);
    expect(slopeLaneForWorldX(0.8)).toBe(2);
    expect(slopeChunkCollision(createSlopeChunk(2), 0)).toBe("barrier");
    expect(slopeChunkCollision(createSlopeChunk(5), -0.66)).toBe("gap");
  });

  it("handles circular distance and intervals through zero", () => {
    expect(circularDistance(11, 1)).toBe(2);
    expect(angleInWrappedInterval(0, 10, 2)).toBe(true);
    expect(angleInWrappedInterval(6, 10, 2)).toBe(false);
  });

  it("generates Helix towers with a feasible gap separated from danger", () => {
    for (let level = 1; level <= 50; level += 1) {
      const tower = generateHelixTower(level);
      expect(tower.length).toBeGreaterThanOrEqual(10);
      for (const ring of tower) {
        expect(resolveHelixCrossing(ring.gap, ring)).toBe("gap");
        expect(circularDistance(ring.gap, ring.danger)).toBeGreaterThan(2);
      }
    }
  });

  it("validates Tunnel openings and reaction windows", () => {
    for (let id = 0; id < 100; id += 1) {
      const ring = createTunnelRing(id);
      expect(tunnelRingIsSafe(ring.gap, ring)).toBe(true);
      expect(tunnelReactionWindow(310, ring.width)).toBe(true);
    }
    expect(tunnelReactionWindow(250, 3)).toBe(false);
  });
});

describe("swept gesture and collision geometry", () => {
  it("finds line crossings and ignores separated collinear segments", () => {
    expect(segmentsIntersect({ x: 0, y: 0 }, { x: 10, y: 10 }, { x: 0, y: 10 }, { x: 10, y: 0 })).toBe(true);
    expect(segmentsIntersect({ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }, { x: 3, y: 0 })).toBe(false);
  });

  it("catches a fast Wave Rider crossing through an obstacle", () => {
    expect(sweptWaveCollision({ x: 0, y: 50 }, { x: 30, y: 50 }, { top: 0, bottom: 100 }, [{ x: 12, y: 40, width: 4, height: 20 }])).toBe(true);
    expect(sweptWaveCollision({ x: 0, y: 20 }, { x: 30, y: 20 }, { top: 0, bottom: 100 }, [{ x: 12, y: 40, width: 4, height: 20 }])).toBe(false);
  });

  it("detects fruit hit anywhere along a swipe segment", () => {
    expect(segmentCircleIntersects({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 3 }, 4)).toBe(true);
    expect(segmentCircleIntersects({ x: 0, y: 0 }, { x: 100, y: 0 }, { x: 50, y: 8 }, 4)).toBe(false);
  });

  it("keeps hazards visually separated from fruit at launch", () => {
    expect(hazardLaunchIsReadable({ x: 50, y: 100 }, [{ x: 10, y: 100 }, { x: 90, y: 100 }])).toBe(true);
    expect(hazardLaunchIsReadable({ x: 50, y: 100 }, [{ x: 55, y: 100 }])).toBe(false);
  });
});

describe("Hook, Trap, and Rugged Wheels rules", () => {
  it("rejects out-of-range and line-of-sight-blocked anchors", () => {
    const position = { x: 0, y: 0 };
    expect(canAttachAnchor(position, { x: 20, y: 0 }, [])).toBe(true);
    expect(canAttachAnchor(position, { x: 40, y: 0 }, [])).toBe(false);
    expect(canAttachAnchor(position, { x: 20, y: 0 }, [{ x: 8, y: -2, width: 4, height: 4 }])).toBe(false);
  });

  it("supports coyote time and jump buffering windows", () => {
    expect(canUseBufferedJump({ now: 1_000, lastGrounded: 900, lastJumpPressed: 920 })).toBe(true);
    expect(canUseBufferedJump({ now: 1_000, lastGrounded: 800, lastJumpPressed: 920 })).toBe(false);
    expect(canUseBufferedJump({ now: 1_000, lastGrounded: 900, lastJumpPressed: 800 })).toBe(false);
  });

  it("detects crash thresholds and continuous tracks", () => {
    expect(vehicleShouldReset({ bodyY: 105, angle: 0, impactSpeed: 0 })).toBe(true);
    expect(vehicleShouldReset({ bodyY: 50, angle: 0, impactSpeed: 9 })).toBe(true);
    expect(vehicleShouldReset({ bodyY: 50, angle: 0, impactSpeed: 1 })).toBe(false);
    expect(trackSegmentsAreContinuous([{ x: 0, y: 0 }, { x: 10, y: 3 }, { x: 20, y: 5 }])).toBe(true);
    expect(trackSegmentsAreContinuous([{ x: 0, y: 0 }, { x: 40, y: 0 }])).toBe(false);
  });
});
