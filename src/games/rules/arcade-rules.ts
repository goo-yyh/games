import { createRandom, type RandomSource } from "../random";

export type Point = { x: number; y: number };

export function pointKey({ x, y }: Point) {
  return `${x}-${y}`;
}

export function isOppositeDirection(current: Point, next: Point) {
  return current.x + next.x === 0 && current.y + next.y === 0;
}

export function pickSnakeFood(
  snake: readonly Point[],
  random: RandomSource = createRandom(),
  size = 24,
) {
  const occupied = new Set(snake.map(pointKey));
  const free: Point[] = [];
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (!occupied.has(`${x}-${y}`)) free.push({ x, y });
    }
  }
  return free.length ? random.pick(free) : null;
}

export function snakeTickDelay(
  foods: number,
  { initial = 155, every = 5, step = 12, minimum = 68 } = {},
) {
  return Math.max(minimum, initial - Math.floor(Math.max(0, foods) / every) * step);
}

export type StackLayer = { x: number; width: number };

export function calculateStackLanding(
  below: StackLayer,
  moving: StackLayer,
  { startingWidth = 60, perfectTolerance = 1.25, perfectRestore = 1.5 } = {},
) {
  const left = Math.max(below.x, moving.x);
  const right = Math.min(below.x + below.width, moving.x + moving.width);
  const overlap = right - left;
  if (overlap <= 0) return null;
  const perfect = Math.abs(below.x - moving.x) < perfectTolerance;
  const width = Math.min(startingWidth, overlap + (perfect ? perfectRestore : 0));
  return {
    layer: { x: perfect ? below.x : left, width },
    overlap,
    perfect,
  };
}

export type DriftRoad = {
  road: Set<string>;
  centers: Point[];
  collectibles: Set<string>;
};

export function generateDriftRoad(seed = 4105, length = 72, start: Point = { x: 6, y: 11 }): DriftRoad {
  const random = createRandom(seed);
  const road = new Set<string>();
  const centers: Point[] = [];
  const collectibles = new Set<string>();
  let x = Math.max(1, Math.min(9, start.x));
  let direction: -1 | 1 = random.next() < 0.5 ? -1 : 1;
  let runRemaining = random.int(3, 6);

  for (let index = 0; index < length; index += 1) {
    const y = start.y - index;
    road.add(`${x}-${y}`);
    road.add(`${x + 1}-${y}`);
    centers.push({ x, y });
    if (index > 5 && index % 9 === 0) collectibles.add(`${x}-${y}`);
    runRemaining -= 1;
    if (runRemaining === 0) {
      direction = direction === 1 ? -1 : 1;
      runRemaining = random.int(3, 6);
    }
    x = Math.max(1, Math.min(9, x + direction));
    if (x === 1 || x === 9) direction = x === 1 ? 1 : -1;
  }

  return { road, centers, collectibles };
}

export function driftRoadIsContinuous(centers: readonly Point[]) {
  return centers.every((point, index) => {
    if (index === 0) return true;
    const prior = centers[index - 1];
    return Math.abs(point.x - prior.x) <= 1 && point.y === prior.y - 1;
  });
}

export function isDownwardHoopScore({
  previousBall,
  ball,
  hoopCenter,
  innerHalfWidth,
}: {
  previousBall: Point;
  ball: Point;
  hoopCenter: Point;
  innerHalfWidth: number;
}) {
  return (
    previousBall.y < hoopCenter.y &&
    ball.y >= hoopCenter.y &&
    ball.y > previousBall.y &&
    ball.x >= hoopCenter.x - innerHalfWidth &&
    ball.x <= hoopCenter.x + innerHalfWidth
  );
}

export function nextReachableHoopHeight(
  previousHeight: number,
  random: RandomSource = createRandom(),
  { minimum = 25, maximum = 72, maxDelta = 22 } = {},
) {
  const lower = Math.max(minimum, Math.ceil(previousHeight - maxDelta));
  const upper = Math.min(maximum, Math.floor(previousHeight + maxDelta));
  return random.int(lower, upper);
}

export function touchesHoopRim(
  ball: Point,
  hoopCenter: Point,
  { innerHalfWidth = 6, contactRadius = 3.5 } = {},
) {
  const leftDistance = Math.hypot(ball.x - (hoopCenter.x - innerHalfWidth), ball.y - hoopCenter.y);
  const rightDistance = Math.hypot(ball.x - (hoopCenter.x + innerHalfWidth), ball.y - hoopCenter.y);
  return Math.min(leftDistance, rightDistance) <= contactRadius;
}

export type PenaltyRole = "shoot" | "save";

export function resolvePenaltyChoice(role: PenaltyRole, playerZone: number, committedAiZone: number) {
  if (![playerZone, committedAiZone].every((zone) => Number.isInteger(zone) && zone >= 0 && zone < 5)) {
    throw new RangeError("Penalty zones must be integers from 0 through 4.");
  }
  return role === "shoot" ? playerZone !== committedAiZone : playerZone === committedAiZone;
}

export function penaltyGesture(dx: number, dy: number) {
  const length = Math.hypot(dx, dy);
  const power = Math.max(0, Math.min(1, length / 170));
  const height = Math.max(0, Math.min(1, -dy / 170));
  const inFrame = dy <= -18 && dy >= -190 && Math.abs(dx) <= 170;
  const zone = height >= 0.58
    ? dx < -38 ? 0 : dx > 38 ? 2 : 1
    : dx < 0 ? 3 : 4;
  return { zone, power, height, inFrame };
}

export function penaltyMatchDecision(turnsPlayed: number, player: number, opponent: number) {
  if (turnsPlayed < 10) return "continue" as const;
  if (turnsPlayed === 10) return player === opponent ? "sudden-death" as const : "complete" as const;
  if (turnsPlayed % 2 === 1) return "continue" as const;
  return player === opponent ? "sudden-death" as const : "complete" as const;
}

export function clampRisingSpeed(
  distance: number,
  { initial = 430, tierDistance = 160, step = 25, minimum = 210 } = {},
) {
  return Math.max(minimum, initial - Math.floor(Math.max(0, distance) / tierDistance) * step);
}

export type SlopeFeature = "flat" | "barrier" | "gap" | "ramp";
export type SlopeChunk = {
  id: number;
  feature: SlopeFeature;
  safeLane: number;
  unsafeLanes: number[];
  coinLane: number | null;
};

const slopeSafeLaneCycle = [1, 1, 0, 0, 1, 1, 2, 2] as const;
const slopeFeatureCycle: SlopeFeature[] = ["flat", "flat", "barrier", "ramp", "flat", "gap", "flat", "ramp"];

export function createSlopeChunk(id: number): SlopeChunk {
  const normalizedId = Math.max(0, Math.floor(id));
  const safeLane = slopeSafeLaneCycle[normalizedId % slopeSafeLaneCycle.length];
  const feature = slopeFeatureCycle[normalizedId % slopeFeatureCycle.length];
  const unsafeLanes = feature === "barrier" || feature === "gap"
    ? [0, 1, 2].filter((lane) => lane !== safeLane)
    : [];
  const coinLane = normalizedId % 3 === 1 || feature === "ramp" ? safeLane : null;
  return { id: normalizedId, feature, safeLane, unsafeLanes, coinLane };
}

export function slopeChunksHaveSafeTransitions(chunks: readonly SlopeChunk[]) {
  return chunks.every((chunk, index) => {
    if (chunk.safeLane < 0 || chunk.safeLane > 2 || chunk.unsafeLanes.includes(chunk.safeLane)) return false;
    if (index === 0) return true;
    return Math.abs(chunk.safeLane - chunks[index - 1].safeLane) <= 1;
  });
}

export function slopeLaneForWorldX(worldX: number) {
  if (worldX < -1 / 3) return 0;
  if (worldX > 1 / 3) return 2;
  return 1;
}

export function updateSlopeMotion(position: number, velocity: number, steering: number) {
  const nextVelocity = Math.max(-0.42, Math.min(0.42, (velocity + Math.max(-1, Math.min(1, steering)) * 0.28) * 0.82));
  const unclampedPosition = position + nextVelocity;
  const nextPosition = Math.max(-1, Math.min(1, unclampedPosition));
  return {
    position: nextPosition,
    velocity: nextPosition === unclampedPosition ? nextVelocity : nextVelocity * -0.2,
  };
}

export function slopeChunkCollision(chunk: SlopeChunk, worldX: number) {
  return chunk.unsafeLanes.includes(slopeLaneForWorldX(worldX)) ? chunk.feature : null;
}

export function circularDistance(a: number, b: number, period = 12) {
  const difference = Math.abs(((a - b) % period + period) % period);
  return Math.min(difference, period - difference);
}

export function angleInWrappedInterval(angle: number, start: number, end: number, period = 12) {
  const normalize = (value: number) => ((value % period) + period) % period;
  const normalizedAngle = normalize(angle);
  const normalizedStart = normalize(start);
  const normalizedEnd = normalize(end);
  return normalizedStart <= normalizedEnd
    ? normalizedAngle >= normalizedStart && normalizedAngle <= normalizedEnd
    : normalizedAngle >= normalizedStart || normalizedAngle <= normalizedEnd;
}

export type HelixRing = { gap: number; danger: number };

export function generateHelixTower(level: number, random = createRandom(2100 + level * 71)) {
  return Array.from({ length: 10 + Math.min(4, level) }, (): HelixRing => {
    const gap = random.int(0, 11);
    let danger = random.int(0, 11);
    if (circularDistance(gap, danger) <= 2) danger = (gap + 5 + random.int(0, 2)) % 12;
    return { gap, danger };
  });
}

export function resolveHelixCrossing(angle: number, ring: HelixRing) {
  if (circularDistance(angle, ring.gap) <= 1) return "gap" as const;
  if (circularDistance(angle, ring.danger) <= 1) return "danger" as const;
  return "safe" as const;
}

export type TunnelRing = { id: number; gap: number; width: number; rotation: number };

export function createTunnelRing(id: number): TunnelRing {
  const random = createRandom(3100 + id * 83);
  return {
    id,
    gap: random.int(0, 11),
    width: id > 18 ? 2 : 3,
    rotation: id % 4 === 0 ? (id % 2 ? 1 : -1) : 0,
  };
}

export function tunnelRingIsSafe(playerAngle: number, ring: TunnelRing) {
  return circularDistance(Math.round(playerAngle), ring.gap) <= Math.floor(ring.width / 2);
}

export function tunnelReactionWindow(
  ringDelay: number,
  gapWidth: number,
  { minimumDelay = 310, minimumGap = 2 } = {},
) {
  return ringDelay >= minimumDelay && gapWidth >= minimumGap;
}

export type Rect = { x: number; y: number; width: number; height: number };

function orientation(a: Point, b: Point, c: Point) {
  return (b.y - a.y) * (c.x - b.x) - (b.x - a.x) * (c.y - b.y);
}

function onSegment(a: Point, b: Point, point: Point) {
  return point.x >= Math.min(a.x, b.x) && point.x <= Math.max(a.x, b.x) &&
    point.y >= Math.min(a.y, b.y) && point.y <= Math.max(a.y, b.y);
}

export function segmentsIntersect(a: Point, b: Point, c: Point, d: Point) {
  const o1 = orientation(a, b, c);
  const o2 = orientation(a, b, d);
  const o3 = orientation(c, d, a);
  const o4 = orientation(c, d, b);
  if (o1 === 0 && onSegment(a, b, c)) return true;
  if (o2 === 0 && onSegment(a, b, d)) return true;
  if (o3 === 0 && onSegment(c, d, a)) return true;
  if (o4 === 0 && onSegment(c, d, b)) return true;
  return Math.sign(o1) !== Math.sign(o2) && Math.sign(o3) !== Math.sign(o4);
}

export function sweptWaveCollision(previous: Point, next: Point, bounds: { top: number; bottom: number }, obstacles: readonly Rect[]) {
  if (next.y <= bounds.top || next.y >= bounds.bottom) return true;
  return obstacles.some((obstacle) => {
    const corners = [
      { x: obstacle.x, y: obstacle.y },
      { x: obstacle.x + obstacle.width, y: obstacle.y },
      { x: obstacle.x + obstacle.width, y: obstacle.y + obstacle.height },
      { x: obstacle.x, y: obstacle.y + obstacle.height },
    ];
    if (
      next.x >= obstacle.x &&
      next.x <= obstacle.x + obstacle.width &&
      next.y >= obstacle.y &&
      next.y <= obstacle.y + obstacle.height
    ) return true;
    return corners.some((corner, index) => segmentsIntersect(previous, next, corner, corners[(index + 1) % 4]));
  });
}

export function segmentCircleIntersects(start: Point, end: Point, center: Point, radius: number) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return Math.hypot(center.x - start.x, center.y - start.y) <= radius;
  const t = Math.max(0, Math.min(1, ((center.x - start.x) * dx + (center.y - start.y) * dy) / lengthSquared));
  const nearest = { x: start.x + t * dx, y: start.y + t * dy };
  return Math.hypot(center.x - nearest.x, center.y - nearest.y) <= radius;
}

export function hazardLaunchIsReadable(hazard: Point, fruit: readonly Point[], minimumSeparation = 12) {
  return fruit.every((item) => Math.hypot(item.x - hazard.x, item.y - hazard.y) >= minimumSeparation);
}

export function lineIntersectsRect(start: Point, end: Point, rect: Rect) {
  if (
    start.x >= rect.x && start.x <= rect.x + rect.width &&
    start.y >= rect.y && start.y <= rect.y + rect.height
  ) return true;
  if (
    end.x >= rect.x && end.x <= rect.x + rect.width &&
    end.y >= rect.y && end.y <= rect.y + rect.height
  ) return true;
  const corners = [
    { x: rect.x, y: rect.y },
    { x: rect.x + rect.width, y: rect.y },
    { x: rect.x + rect.width, y: rect.y + rect.height },
    { x: rect.x, y: rect.y + rect.height },
  ];
  return corners.some((corner, index) => segmentsIntersect(start, end, corner, corners[(index + 1) % 4]));
}

export function canAttachAnchor(
  position: Point,
  anchor: Point,
  blockers: readonly Rect[],
  maximumDistance = 34,
) {
  return (
    Math.hypot(position.x - anchor.x, position.y - anchor.y) <= maximumDistance &&
    anchor.x >= position.x - 5 &&
    !blockers.some((blocker) => lineIntersectsRect(position, anchor, blocker))
  );
}

export function canUseBufferedJump({
  now,
  lastGrounded,
  lastJumpPressed,
  coyoteWindow = 120,
  bufferWindow = 140,
}: {
  now: number;
  lastGrounded: number;
  lastJumpPressed: number;
  coyoteWindow?: number;
  bufferWindow?: number;
}) {
  return now - lastGrounded <= coyoteWindow && now - lastJumpPressed <= bufferWindow;
}

export function vehicleShouldReset({
  bodyY,
  angle,
  impactSpeed,
  outOfBoundsY = 104,
  maximumAngle = Math.PI * 0.85,
  maximumImpact = 8,
}: {
  bodyY: number;
  angle: number;
  impactSpeed: number;
  outOfBoundsY?: number;
  maximumAngle?: number;
  maximumImpact?: number;
}) {
  return bodyY > outOfBoundsY || Math.abs(angle) > maximumAngle || impactSpeed > maximumImpact;
}

export function trackSegmentsAreContinuous(points: readonly Point[], maximumGap = 16) {
  return points.length >= 2 && points.slice(1).every((point, index) => {
    const prior = points[index];
    return point.x > prior.x && Math.hypot(point.x - prior.x, point.y - prior.y) <= maximumGap;
  });
}
