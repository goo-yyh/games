import type { Locale } from "./config";

function defineGameUi<
  const English extends Record<string, string>,
  const Chinese extends { [Key in keyof English]: string },
>(
  en: English,
  zh: Chinese,
) {
  return { en, zh } as const;
}

// This is the authoritative minimum runtime vocabulary from Part 0 §0.7.1.
// Extra, game-specific feedback belongs here too; renderers must not invent a
// second translation source inside Canvas, SVG, DOM, or physics callbacks.
export const gameUi = {
  "block-bloom": defineGameUi(
    { pieces: "Pieces", linesCleared: "Lines cleared", noLegalMoves: "No legal moves" },
    { pieces: "可用方块", linesCleared: "已消除行列", noLegalMoves: "没有可放置位置" },
  ),
  "number-merge-2048": defineGameUi(
    { targetTile: "Target: 2048", noMovesLeft: "No moves left", keepPlaying: "Keep playing" },
    { targetTile: "目标：2048", noMovesLeft: "无法继续移动", keepPlaying: "继续挑战" },
  ),
  "neon-snake": defineGameUi(
    { length: "Length", speed: "Speed", crashed: "You crashed" },
    { length: "长度", speed: "速度", crashed: "撞到了" },
  ),
  "sky-stack": defineGameUi(
    { towerHeight: "Tower height", perfect: "Perfect", missedPlatform: "Missed the platform" },
    { towerHeight: "塔高", perfect: "完美落点", missedPlatform: "未落在平台上" },
  ),
  "zigzag-drift": defineGameUi(
    { distance: "Distance", turnNow: "Turn now", leftRoad: "You left the road" },
    { distance: "距离", turnNow: "现在转向", leftRoad: "已驶出道路" },
  ),
  "tap-hoops": defineGameUi(
    { streak: "Streak", nextHoop: "Next hoop", missedHoop: "Missed the hoop" },
    { streak: "连续命中", nextHoop: "下一个篮筐", missedHoop: "投篮未进" },
  ),
  "color-pour": defineGameUi(
    { pours: "Pours", emptyTube: "Empty tube", puzzleSolved: "Puzzle solved" },
    { pours: "倒水次数", emptyTube: "空试管", puzzleSolved: "排序完成" },
  ),
  "penalty-hero": defineGameUi(
    { shotProgress: "Shot {current} of 5", saveProgress: "Save {current} of 5", shoot: "Shoot", save: "Save", goal: "Goal", saved: "Saved", missed: "Missed" },
    { shotProgress: "第 {current}/5 次射门", saveProgress: "第 {current}/5 次扑救", shoot: "射门", save: "扑救", goal: "进球", saved: "扑出", missed: "射失" },
  ),
  "slope-dash": defineGameUi(
    { distance: "Distance", speed: "Speed", barrierHit: "Barrier hit" },
    { distance: "距离", speed: "速度", barrierHit: "撞上障碍" },
  ),
  "helix-drop": defineGameUi(
    { floor: "Floor", safeGap: "Safe gap", dangerZone: "Danger zone", dangerHit: "Hit a danger platform" },
    { floor: "层数", safeGap: "安全缺口", dangerZone: "危险区域", dangerHit: "碰到危险平台" },
  ),
  "tunnel-flux": defineGameUi(
    { distance: "Distance", speed: "Speed", opening: "Opening", barrierHit: "Barrier hit" },
    { distance: "距离", speed: "速度", opening: "缺口", barrierHit: "撞上挡板" },
  ),
  "bubble-pop-shooter": defineGameUi(
    { nextBubble: "Next bubble", shotsUntilDrop: "Shots until drop", clusterCleared: "Cluster cleared", ceilingAdvanced: "Ceiling advanced" },
    { nextBubble: "下一个泡泡", shotsUntilDrop: "距离下压剩余射击", clusterCleared: "泡泡组已消除", ceilingAdvanced: "顶部已下压" },
  ),
  "bolt-away": defineGameUi(
    { holdingSlots: "Holding slots", removeBolt: "Remove bolt", plateFreed: "Plate freed", slotsFull: "Holding slots are full" },
    { holdingSlots: "暂存槽", removeBolt: "拆下螺丝", plateFreed: "板件已释放", slotsFull: "暂存槽已满" },
  ),
  "unblock-path": defineGameUi(
    { targetBlock: "Target block", exit: "Exit", pathClear: "Path is clear", puzzleSolved: "Puzzle solved" },
    { targetBlock: "目标滑块", exit: "出口", pathClear: "通道已打开", puzzleSolved: "解谜完成" },
  ),
  "wave-rider": defineGameUi(
    { holdToRise: "Hold to rise", releaseToDive: "Release to dive", distance: "Distance", wallHit: "Wall hit" },
    { holdToRise: "按住上升", releaseToDive: "松开下降", distance: "距离", wallHit: "撞上墙面" },
  ),
  "fruit-slice-rush": defineGameUi(
    { combo: "Combo", misses: "Misses {current}/3", fruitSliced: "Fruit sliced", hazardHit: "Hazard hit" },
    { combo: "连击", misses: "漏掉 {current}/3", fruitSliced: "切中水果", hazardHit: "碰到危险球" },
  ),
  "hook-swing": defineGameUi(
    { attach: "Attach", release: "Release", checkpoint: "Checkpoint", fell: "You fell" },
    { attach: "连接钩点", release: "松开", checkpoint: "检查点", fell: "已坠落" },
  ),
  "trap-runner": defineGameUi(
    { room: "Room {current}", exitReached: "Exit reached", trapTriggered: "Trap triggered", checkpoint: "Checkpoint" },
    { room: "第 {current} 房间", exitReached: "已到达出口", trapTriggered: "触发陷阱", checkpoint: "检查点" },
  ),
  "rugged-wheels": defineGameUi(
    { throttle: "Throttle", brakeReverse: "Brake / reverse", balance: "Balance", flipped: "Vehicle flipped" },
    { throttle: "加速", brakeReverse: "刹车／倒车", balance: "平衡", flipped: "车辆翻覆" },
  ),
  "classic-solitaire": defineGameUi(
    { stock: "Stock", waste: "Waste", foundations: "Foundations", tableau: "Tableau", noMovesLeft: "No moves left", dealAgain: "Deal again" },
    { stock: "牌库", waste: "废牌堆", foundations: "基础牌堆", tableau: "桌面牌列", noMovesLeft: "无可用移动", dealAgain: "重新发牌" },
  ),
  "sum-orchard": defineGameUi(
    { targetTotal: "Target total", selectionSum: "Selection: {sum}", timeBonus: "+{seconds}s bonus", newBoard: "New solvable board" },
    { targetTotal: "目标总和", selectionSum: "当前选择：{sum}", timeBonus: "奖励 +{seconds} 秒", newBoard: "新的可解棋盘" },
  ),
  "color-cross": defineGameUi(
    { tilesLeft: "Tiles left", validCross: "Matching cross", miss: "No pair found", shuffleCost: "Shuffle costs {seconds}s" },
    { tilesLeft: "剩余棋子", validCross: "十字匹配", miss: "未找到配对", shuffleCost: "重排消耗 {seconds} 秒" },
  ),
  "orbit-lines": defineGameUi(
    { selectOrb: "Select an orb", productiveMove: "Line cleared", reorbit: "Reorbit", timePenalty: "-{seconds}s" },
    { selectOrb: "选择球体", productiveMove: "连线已消除", reorbit: "重新排布", timePenalty: "扣除 {seconds} 秒" },
  ),
  "corner-stars": defineGameUi(
    { starsSelected: "{count}/3 stars selected", validCorner: "Valid corner", blockedArm: "Arm is blocked", shuffleCost: "Shuffle costs {seconds}s" },
    { starsSelected: "已选 {count}/3 颗星", validCorner: "有效直角", blockedArm: "星臂被阻挡", shuffleCost: "重排消耗 {seconds} 秒" },
  ),
  "sidefall-blocks": defineGameUi(
    { chooseTopBlock: "Choose a top block", destinationFull: "Column is full", chain: "Chain ×{count}", noClear: "No group cleared" },
    { chooseTopBlock: "选择列顶方块", destinationFull: "目标列已满", chain: "连锁 ×{count}", noClear: "未形成消除组" },
  ),
  "triad-capture": defineGameUi(
    { liveCounts: "{a} / {b} / {c}", balanced: "Balanced selection", comboBroken: "Combo broken", refilling: "Refilling board" },
    { liveCounts: "{a}／{b}／{c}", balanced: "三类数量相等", comboBroken: "连击中断", refilling: "正在补充棋盘" },
  ),
  "echo-path": defineGameUi(
    { pathLength: "Path length", endpointSymbol: "Endpoint: {symbol}", interiorSymbol: "Interior: {symbol}", invalidPath: "Invalid path", pathLocked: "Path locked" },
    { pathLength: "路径长度", endpointSymbol: "端点：{symbol}", interiorSymbol: "中间：{symbol}", invalidPath: "路径无效", pathLocked: "路径已锁定" },
  ),
  "target-basket": defineGameUi(
    { roundProgress: "Round {current} of 12", target: "Target", chooseTwo: "Choose two numbers", correct: "Correct", incorrect: "Try another pair", timeUp: "Time is up" },
    { roundProgress: "第 {current}/12 轮", target: "目标数", chooseTwo: "选择两个数字", correct: "回答正确", incorrect: "换一组再试", timeUp: "时间到" },
  ),
  "math-grid-sprint": defineGameUi(
    { addition: "Addition", subtraction: "Subtraction", multiplication: "Multiplication", progress: "{correct}/25 correct", correct: "Correct", incorrect: "Check the calculation" },
    { addition: "加法", subtraction: "减法", multiplication: "乘法", progress: "已答对 {correct}/25", correct: "正确", incorrect: "请检查计算" },
  ),
} as const;

export type GameUiSlug = keyof typeof gameUi;
export type GameUiKey<Slug extends GameUiSlug> = keyof (typeof gameUi)[Slug]["en"] & string;

type PlaceholderNames<Value extends string> =
  Value extends `${string}{${infer Name}}${infer Rest}`
    ? Name | PlaceholderNames<Rest>
    : never;

type TemplateArguments<Value extends string> =
  [PlaceholderNames<Value>] extends [never]
    ? [values?: Record<string, never>]
    : [values: Record<PlaceholderNames<Value>, string | number>];

export function gameText<
  Slug extends GameUiSlug,
  Key extends GameUiKey<Slug>,
>(
  slug: Slug,
  locale: Locale,
  key: Key,
  ...[values = {}]: TemplateArguments<(typeof gameUi)[Slug]["en"][Key] & string>
) {
  const template = (gameUi[slug][locale] as Record<string, string>)[key];
  return template.replace(/\{([a-zA-Z][a-zA-Z0-9]*)\}/g, (placeholder, name: string) => {
    const value = (values as Record<string, string | number>)[name];
    if (value === undefined) throw new Error(`Missing runtime UI value ${name} for ${slug}.${key}`);
    return String(value);
  });
}
