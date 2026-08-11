export type PhysicsPoint = { x: number; y: number };
export type PhysicsRect = PhysicsPoint & { width: number; height: number };

export type HookCourse = {
  spawn: PhysicsPoint;
  finish: PhysicsPoint;
  anchors: readonly PhysicsPoint[];
  hazards: readonly PhysicsRect[];
  collectibles: readonly PhysicsPoint[];
  smokePath: readonly number[];
};

const hookHeights = [
  [52, 39, 48, 34, 45], [48, 35, 44, 31, 41], [55, 43, 33, 46, 37],
  [46, 30, 42, 28, 39], [57, 46, 35, 43, 31], [51, 37, 27, 40, 34],
  [44, 32, 47, 29, 42], [58, 45, 38, 25, 36], [49, 28, 41, 34, 24],
  [54, 40, 29, 44, 32], [47, 33, 22, 38, 27], [56, 42, 31, 24, 39],
  [45, 26, 37, 21, 34], [53, 36, 24, 41, 29], [48, 30, 19, 35, 23],
] as const;

export const HOOK_COURSES: readonly HookCourse[] = hookHeights.map((heights, level) => ({
  spawn: { x: 8, y: 68 },
  finish: { x: 97, y: 58 - level % 4 },
  anchors: heights.map((y, index) => ({ x: 18 + index * 17, y })),
  hazards: [
    { x: 39 + level % 3, y: 82 - level % 4, width: 8, height: 4 },
    { x: 68 + level % 4, y: 84 - level % 5, width: 9, height: 4 },
  ],
  collectibles: [
    { x: 29, y: Math.min(66, (heights[0] + heights[1]) / 2 + 8) },
    { x: 63, y: Math.min(66, (heights[2] + heights[3]) / 2 + 8) },
  ],
  smokePath: [0, 1, 2, 3, 4],
}));

export type TrackFeature = "ground" | "ramp" | "bridge" | "seesaw" | "roller" | "moving";
export type RuggedTrack = {
  heights: readonly number[];
  features: readonly TrackFeature[];
  checkpointIndex: number;
  smokeThrottle: readonly number[];
};

export const RUGGED_TRACKS: readonly RuggedTrack[] = [
  { heights:[72,72,70,67,67,70,72,71,70,70],features:["ground","ramp","ground","ground","ramp","ground","ground","ground","ground"],checkpointIndex:4,smokeThrottle:[1,1,1,0,1] },
  { heights:[74,72,68,62,66,71,73,70,68,69],features:["ramp","ramp","ramp","bridge","ground","ground","ramp","ground","ground"],checkpointIndex:4,smokeThrottle:[1,1,0,1,1] },
  { heights:[70,68,66,68,72,72,67,63,68,70],features:["ground","seesaw","ground","ground","bridge","ramp","ramp","ground","ground"],checkpointIndex:5,smokeThrottle:[1,0,1,1,1] },
  { heights:[75,72,66,61,65,71,74,69,64,68],features:["ramp","ramp","roller","ground","ground","seesaw","ramp","ground","ground"],checkpointIndex:4,smokeThrottle:[1,1,0,1,1] },
  { heights:[70,67,63,66,70,73,68,62,65,69],features:["ground","bridge","ground","ramp","ground","roller","ramp","ground","ground"],checkpointIndex:5,smokeThrottle:[1,0,1,1,1] },
  { heights:[76,72,65,59,64,70,75,72,66,68],features:["ramp","ramp","moving","ground","ramp","ground","bridge","ramp","ground"],checkpointIndex:4,smokeThrottle:[1,1,0,1,1] },
  { heights:[72,68,64,69,74,70,64,60,66,71],features:["ground","seesaw","ramp","ground","roller","ramp","ground","bridge","ground"],checkpointIndex:5,smokeThrottle:[1,0,1,1,1] },
  { heights:[74,69,62,58,63,69,73,67,61,66],features:["ramp","moving","ramp","ground","bridge","ground","ramp","seesaw","ground"],checkpointIndex:4,smokeThrottle:[1,1,0,1,1] },
  { heights:[71,66,60,65,72,75,69,63,68,72],features:["ground","roller","ramp","ground","seesaw","ramp","bridge","ground","ground"],checkpointIndex:5,smokeThrottle:[1,0,1,1,1] },
  { heights:[76,70,63,57,62,68,74,69,62,67],features:["ramp","ramp","moving","bridge","ground","roller","ramp","ground","ground"],checkpointIndex:4,smokeThrottle:[1,1,0,1,1] },
  { heights:[73,67,61,66,72,76,70,64,59,65],features:["ground","seesaw","ramp","ground","moving","ramp","bridge","roller","ground"],checkpointIndex:5,smokeThrottle:[1,0,1,1,1] },
  { heights:[77,71,64,58,63,70,76,72,65,60],features:["ramp","moving","bridge","roller","ground","seesaw","ramp","moving","ground"],checkpointIndex:5,smokeThrottle:[1,1,0,1,1] },
] as const;

export function validateHookCourse(course: HookCourse) {
  if (course.anchors.length < 5 || course.smokePath.length !== course.anchors.length) return false;
  const ordered = [course.spawn, ...course.smokePath.map((index) => course.anchors[index]), course.finish];
  return ordered.every((point, index) => index === 0 || point.x > ordered[index - 1].x && Math.hypot(point.x - ordered[index - 1].x, point.y - ordered[index - 1].y) <= 36);
}

export function validateRuggedTrack(track: RuggedTrack) {
  return track.heights.length === 10 && track.features.length === 9 && track.checkpointIndex > 0 && track.checkpointIndex < track.heights.length - 1 && track.heights.every((height, index) => index === 0 || Math.abs(height - track.heights[index - 1]) <= 7);
}
