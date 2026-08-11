import { createRandom, type RandomSource } from "../random";

export type Cell = { row: number; col: number };
export type Rect = { top: number; left: number; bottom: number; right: number };
export type NumberGrid = (number | null)[][];

export function rectFromPoints(a: Cell, b: Cell): Rect {
  return {
    top: Math.min(a.row, b.row),
    left: Math.min(a.col, b.col),
    bottom: Math.max(a.row, b.row),
    right: Math.max(a.col, b.col),
  };
}

export function cellsInRect(rect: Rect) {
  const cells: Cell[] = [];
  for (let row = rect.top; row <= rect.bottom; row += 1) {
    for (let col = rect.left; col <= rect.right; col += 1) cells.push({ row, col });
  }
  return cells;
}

export function sumRect(board: NumberGrid, rect: Rect) {
  let sum = 0;
  let count = 0;
  for (const { row, col } of cellsInRect(rect)) {
    const value = board[row]?.[col];
    if (value !== null && value !== undefined) {
      sum += value;
      count += 1;
    }
  }
  return { sum, count };
}

export function clearRect(board: NumberGrid, rect: Rect) {
  const next = board.map((row) => [...row]);
  for (const { row, col } of cellsInRect(rect)) next[row][col] = null;
  return next;
}

export function findLegalRects(board: NumberGrid, target = 12) {
  const matches: Rect[] = [];
  for (let top = 0; top < board.length; top += 1) {
    for (let left = 0; left < board[0].length; left += 1) {
      for (let bottom = top; bottom < board.length; bottom += 1) {
        for (let right = left; right < board[0].length; right += 1) {
          const rect = { top, left, bottom, right };
          const result = sumRect(board, rect);
          if (result.count > 0 && result.sum === target) matches.push(rect);
        }
      }
    }
  }
  return matches;
}

export function generateSumBoard(random: RandomSource = createRandom()): NumberGrid {
  const board: NumberGrid = Array.from({ length: 8 }, () =>
    Array.from({ length: 12 }, () => random.int(1, 9)),
  );
  const planted = [[0, 0], [0, 3], [1, 6], [2, 1], [3, 8], [5, 0], [6, 5], [7, 9]];
  for (const [row, col] of planted) {
    const first = random.int(3, 9);
    board[row][col] = first;
    board[row][col + 1] = 12 - first;
  }
  return board;
}

export type CrossEvaluation = {
  horizontal: readonly [Cell, Cell] | null;
  vertical: readonly [Cell, Cell] | null;
  removed: Cell[];
};

export function nearestTile(
  board: NumberGrid,
  origin: Cell,
  direction: { row: number; col: number },
) {
  for (
    let row = origin.row + direction.row, col = origin.col + direction.col;
    row >= 0 && row < board.length && col >= 0 && col < board[0].length;
    row += direction.row, col += direction.col
  ) {
    if (board[row][col] !== null) return { row, col };
  }
  return null;
}

export function evaluateCross(board: NumberGrid, origin: Cell): CrossEvaluation {
  if (board[origin.row]?.[origin.col] !== null) {
    return { horizontal: null, vertical: null, removed: [] };
  }
  const left = nearestTile(board, origin, { row: 0, col: -1 });
  const right = nearestTile(board, origin, { row: 0, col: 1 });
  const up = nearestTile(board, origin, { row: -1, col: 0 });
  const down = nearestTile(board, origin, { row: 1, col: 0 });
  const horizontal = left && right && board[left.row][left.col] === board[right.row][right.col]
    ? [left, right] as const
    : null;
  const vertical = up && down && board[up.row][up.col] === board[down.row][down.col]
    ? [up, down] as const
    : null;
  const unique = new Map<string, Cell>();
  for (const cell of [...(horizontal ?? []), ...(vertical ?? [])]) {
    unique.set(`${cell.row}-${cell.col}`, cell);
  }
  return { horizontal, vertical, removed: [...unique.values()] };
}

export function applyCrossClear(board: NumberGrid, evaluation: CrossEvaluation) {
  const next = board.map((row) => [...row]);
  for (const { row, col } of evaluation.removed) next[row][col] = null;
  return next;
}

export function findAllValidEmptyCells(board: NumberGrid) {
  const cells: Cell[] = [];
  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[0].length; col += 1) {
      if (board[row][col] === null && evaluateCross(board, { row, col }).removed.length > 0) {
        cells.push({ row, col });
      }
    }
  }
  return cells;
}

export function isBoardComplete(board: NumberGrid) {
  return board.every((row) => row.every((value) => value === null));
}

export function generateColorCrossBoard(random: RandomSource = createRandom()): NumberGrid {
  const board: NumberGrid = Array.from({ length: 10 }, () => Array(10).fill(null));
  const centers = [1, 4, 7].flatMap((row) => [1, 4, 7].map((col) => ({ row, col })));
  centers.forEach((center, index) => {
    const horizontal = index % 4;
    const vertical = (index + 1) % 4;
    board[center.row][center.col - 1] = horizontal;
    board[center.row][center.col + 1] = horizontal;
    board[center.row - 1][center.col] = vertical;
    board[center.row + 1][center.col] = vertical;
  });
  const reserved = new Set(centers.map(({ row, col }) => `${row}-${col}`));
  let decoys = 0;
  while (decoys < 18) {
    const row = random.int(0, 9);
    const col = random.int(0, 9);
    if (board[row][col] !== null || reserved.has(`${row}-${col}`)) continue;
    board[row][col] = random.int(0, 3);
    decoys += 1;
  }
  return board;
}

const rayDirections = [-1, 0, 1]
  .flatMap((row) => [-1, 0, 1].map((col) => ({ row, col })))
  .filter(({ row, col }) => row !== 0 || col !== 0);

export function legalDestinations(board: NumberGrid, from: Cell) {
  if (board[from.row]?.[from.col] === null || board[from.row]?.[from.col] === undefined) return [];
  const destinations: Cell[] = [];
  for (const direction of rayDirections) {
    for (
      let row = from.row + direction.row, col = from.col + direction.col;
      row >= 0 && row < board.length && col >= 0 && col < board[0].length;
      row += direction.row, col += direction.col
    ) {
      if (board[row][col] !== null) break;
      destinations.push({ row, col });
    }
  }
  return destinations;
}

export function scanAxis(
  board: NumberGrid,
  origin: Cell,
  direction: { row: number; col: number },
) {
  const value = board[origin.row]?.[origin.col];
  if (value === null || value === undefined) return [];
  const matches = [origin];
  for (const sign of [-1, 1]) {
    for (
      let row = origin.row + direction.row * sign, col = origin.col + direction.col * sign;
      row >= 0 && row < board.length && col >= 0 && col < board[0].length;
      row += direction.row * sign, col += direction.col * sign
    ) {
      const candidate = board[row][col];
      if (candidate !== null && candidate !== value) break;
      if (candidate === value) matches.push({ row, col });
    }
  }
  return matches;
}

export function resolveLines(board: NumberGrid, origin: Cell) {
  const directions = [
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    { row: 1, col: 1 },
    { row: 1, col: -1 },
  ];
  const removal = new Map<string, Cell>();
  let axes = 0;
  for (const direction of directions) {
    const line = scanAxis(board, origin, direction);
    if (line.length < 3) continue;
    axes += 1;
    for (const cell of line) removal.set(`${cell.row}-${cell.col}`, cell);
  }
  return { removed: [...removal.values()], axes };
}

export type ProductiveMove = { from: Cell; to: Cell; removed: number };

export function findProductiveMoves(board: NumberGrid) {
  const moves: ProductiveMove[] = [];
  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[0].length; col += 1) {
      const from = { row, col };
      if (board[row][col] === null) continue;
      for (const to of legalDestinations(board, from)) {
        const next = board.map((items) => [...items]);
        next[to.row][to.col] = next[from.row][from.col];
        next[from.row][from.col] = null;
        const removed = resolveLines(next, to).removed.length;
        if (removed >= 3) moves.push({ from, to, removed });
      }
    }
  }
  return moves;
}

export function generateOrbitBoard(random: RandomSource = createRandom()): NumberGrid {
  const board: NumberGrid = Array.from({ length: 8 }, () => Array(8).fill(null));
  [0, 2, 4, 6].forEach((row, index) => {
    board[row][0] = index;
    board[row][7] = index;
    board[row + 1][3] = index;
  });
  let count = 12;
  while (count < 28) {
    const row = random.pick([1, 3, 5, 7]);
    const col = random.int(0, 7);
    if (board[row][col] !== null) continue;
    board[row][col] = random.int(0, 3);
    count += 1;
  }
  return board;
}

export type Star = Cell & { symbol: number; active: boolean };

function directionIsAllowed(vector: readonly [number, number]) {
  const [row, col] = vector;
  return row === 0 || col === 0 || Math.abs(row) === Math.abs(col);
}

export function armsEqual(a: Cell, corner: Cell, b: Cell) {
  const first = (a.row - corner.row) ** 2 + (a.col - corner.col) ** 2;
  const second = (b.row - corner.row) ** 2 + (b.col - corner.col) ** 2;
  return first > 0 && first === second;
}

export function isPerpendicular(a: Cell, corner: Cell, b: Cell) {
  const first = [a.row - corner.row, a.col - corner.col] as const;
  const second = [b.row - corner.row, b.col - corner.col] as const;
  return directionIsAllowed(first) && directionIsAllowed(second) &&
    first[0] * second[0] + first[1] * second[1] === 0;
}

export function isSegmentClear(stars: readonly Star[], start: Cell, end: Cell) {
  const rowDelta = end.row - start.row;
  const colDelta = end.col - start.col;
  if (!directionIsAllowed([rowDelta, colDelta])) return false;
  const steps = Math.max(Math.abs(rowDelta), Math.abs(colDelta));
  const rowStep = Math.sign(rowDelta);
  const colStep = Math.sign(colDelta);
  for (let step = 1; step < steps; step += 1) {
    const row = start.row + rowStep * step;
    const col = start.col + colStep * step;
    if (stars.some((star) => star.active && star.row === row && star.col === col)) return false;
  }
  return true;
}

export function findRightAngleVertex(stars: readonly [Star, Star, Star], field: readonly Star[] = stars) {
  if (!stars.every((star) => star.active && star.symbol === stars[0].symbol)) return null;
  for (let index = 0; index < 3; index += 1) {
    const corner = stars[index];
    const first = stars[(index + 1) % 3];
    const second = stars[(index + 2) % 3];
    if (
      armsEqual(first, corner, second) &&
      isPerpendicular(first, corner, second) &&
      isSegmentClear(field, corner, first) &&
      isSegmentClear(field, corner, second)
    ) return corner;
  }
  return null;
}

export function findValidConstellations(stars: readonly Star[]) {
  const active = stars.filter((star) => star.active);
  const matches: [Star, Star, Star][] = [];
  for (let first = 0; first < active.length - 2; first += 1) {
    for (let second = first + 1; second < active.length - 1; second += 1) {
      for (let third = second + 1; third < active.length; third += 1) {
        const triple = [active[first], active[second], active[third]] as [Star, Star, Star];
        if (findRightAngleVertex(triple, active)) matches.push(triple);
      }
    }
  }
  return matches;
}

export function generateCornerStars(random: RandomSource = createRandom()) {
  const map = new Map<string, Star>();
  const corners = [[0, 0], [0, 3], [0, 6], [3, 0], [3, 3], [3, 6], [6, 0], [6, 3]];
  corners.forEach(([row, col], symbol) => {
    const value = symbol % 4;
    for (const [starRow, starCol] of [[row, col], [row + 1, col], [row, col + 1]]) {
      map.set(`${starRow}-${starCol}`, { row: starRow, col: starCol, symbol: value, active: true });
    }
  });
  while (map.size < 46) {
    const row = random.int(0, 8);
    const col = random.int(0, 8);
    if (map.has(`${row}-${col}`)) continue;
    map.set(`${row}-${col}`, { row, col, symbol: random.int(0, 3), active: true });
  }
  return [...map.values()];
}

export type BlockColumns = number[][];

export function moveTopBlock(columns: BlockColumns, source: number, destination: number) {
  if (source === destination) return { ok: false as const, reason: "cancelled" as const, columns };
  if (!columns[source]?.length) return { ok: false as const, reason: "empty-source" as const, columns };
  if (!columns[destination] || columns[destination].length >= 10) {
    return { ok: false as const, reason: "destination-full" as const, columns };
  }
  const next = columns.map((column) => [...column]);
  const value = next[source].pop()!;
  next[destination].push(value);
  return { ok: true as const, columns: next, value, landingRow: next[destination].length - 1 };
}

export function connectedComponent(columns: BlockColumns, column: number, row: number) {
  const value = columns[column]?.[row];
  if (value === undefined) return new Set<string>();
  const queue: [number, number][] = [[column, row]];
  const seen = new Set<string>();
  while (queue.length) {
    const [currentColumn, currentRow] = queue.pop()!;
    const key = `${currentColumn}-${currentRow}`;
    if (seen.has(key) || columns[currentColumn]?.[currentRow] !== value) continue;
    seen.add(key);
    for (const [nextColumn, nextRow] of [
      [currentColumn - 1, currentRow], [currentColumn + 1, currentRow],
      [currentColumn, currentRow - 1], [currentColumn, currentRow + 1],
    ]) queue.push([nextColumn, nextRow]);
  }
  return seen;
}

export function findAllClearableGroups(columns: BlockColumns) {
  const groups: Set<string>[] = [];
  const visited = new Set<string>();
  columns.forEach((column, columnIndex) => column.forEach((_, rowIndex) => {
    const key = `${columnIndex}-${rowIndex}`;
    if (visited.has(key)) return;
    const group = connectedComponent(columns, columnIndex, rowIndex);
    for (const item of group) visited.add(item);
    if (group.size >= 3) groups.push(group);
  }));
  return groups;
}

export function collapseBoard(columns: BlockColumns, removal: ReadonlySet<string>) {
  return columns.map((column, columnIndex) =>
    column.filter((_, rowIndex) => !removal.has(`${columnIndex}-${rowIndex}`)),
  );
}

function groupPoints(size: number) {
  if (size === 3) return 6;
  if (size === 4) return 10;
  if (size === 5) return 16;
  return size * 4;
}

export function resolveSidefallMove(columns: BlockColumns, source: number, destination: number) {
  const moved = moveTopBlock(columns, source, destination);
  if (!moved.ok) return { ...moved, points: 0, chains: 0 };
  let next = moved.columns;
  const first = connectedComponent(next, destination, moved.landingRow);
  if (first.size < 3) return { ...moved, columns: next, points: 0, chains: 0 };
  let points = groupPoints(first.size);
  let chains = 1;
  next = collapseBoard(next, first);
  while (true) {
    const groups = findAllClearableGroups(next);
    if (!groups.length) break;
    chains += 1;
    const removal = new Set(groups.flatMap((group) => [...group]));
    points += groups.reduce((total, group) => total + groupPoints(group.size) * chains, 0);
    next = collapseBoard(next, removal);
  }
  return { ...moved, columns: next, points, chains };
}

export function findScoringSidefallMoves(columns: BlockColumns) {
  const moves: { source: number; destination: number; points: number }[] = [];
  for (let source = 0; source < columns.length; source += 1) {
    for (let destination = 0; destination < columns.length; destination += 1) {
      const result = resolveSidefallMove(columns, source, destination);
      if (result.ok && result.points > 0) moves.push({ source, destination, points: result.points });
    }
  }
  return moves;
}

export function generateSidefallBoard(random: RandomSource = createRandom()): BlockColumns {
  const columns = Array.from({ length: 8 }, (_, index) => [index % 4, 0, 0]);
  columns.forEach((column, index) => {
    const extra = index % 3;
    for (let count = 0; count < extra; count += 1) column.unshift(random.int(1, 3));
  });
  return columns;
}

export function countSymbolsInRect(board: NumberGrid, rect: Rect) {
  const counts = [0, 0, 0];
  for (const { row, col } of cellsInRect(rect)) {
    const value = board[row]?.[col];
    if (value !== null && value !== undefined && value >= 0 && value <= 2) counts[value] += 1;
  }
  return counts as [number, number, number];
}

export function isBalancedTriad(counts: readonly number[]) {
  return counts.length === 3 && counts[0] > 0 && counts[0] <= 4 &&
    counts[0] === counts[1] && counts[1] === counts[2];
}

export function createBalancedRefill(random: RandomSource = createRandom()) {
  let bag: number[] = [];
  return () => {
    if (!bag.length) {
      bag = [0, 1, 2];
      for (let index = bag.length - 1; index > 0; index -= 1) {
        const swap = random.int(0, index);
        [bag[index], bag[swap]] = [bag[swap], bag[index]];
      }
    }
    return bag.pop()!;
  };
}

export function clearAndCollapse(
  board: NumberGrid,
  rect: Rect,
  nextSymbol = createBalancedRefill(),
) {
  const cleared = clearRect(board, rect);
  const next: NumberGrid = Array.from({ length: board.length }, () => Array(board[0].length).fill(null));
  for (let col = 0; col < board[0].length; col += 1) {
    const survivors = cleared.map((row) => row[col]).filter((value): value is number => value !== null);
    let row = board.length - 1;
    for (let index = survivors.length - 1; index >= 0; index -= 1) next[row--][col] = survivors[index];
    while (row >= 0) next[row--][col] = nextSymbol();
  }
  return next;
}

export function generateTriadBoard(random: RandomSource = createRandom()): NumberGrid {
  const nextSymbol = createBalancedRefill(random);
  const board = Array.from({ length: 9 }, () => Array.from({ length: 9 }, nextSymbol));
  board[0][0] = 0;
  board[0][1] = 1;
  board[0][2] = 2;
  return board;
}

export function isAdjacent(first: Cell, second: Cell) {
  return Math.abs(first.row - second.row) + Math.abs(first.col - second.col) === 1;
}

export type EchoValidation =
  | { valid: true; endpoint: number; interior: number }
  | { valid: false; reason: "too-short" | "out-of-bounds" | "revisit" | "not-adjacent" | "occupied" | "endpoint" | "interior" };

export function validateEchoPath(
  board: number[][],
  path: readonly Cell[],
  occupied: ReadonlySet<string> = new Set(),
): EchoValidation {
  if (path.length < 3) return { valid: false, reason: "too-short" };
  const seen = new Set<string>();
  for (let index = 0; index < path.length; index += 1) {
    const cell = path[index];
    if (cell.row < 0 || cell.row >= board.length || cell.col < 0 || cell.col >= board[0].length) {
      return { valid: false, reason: "out-of-bounds" };
    }
    const key = `${cell.row}-${cell.col}`;
    if (seen.has(key)) return { valid: false, reason: "revisit" };
    if (occupied.has(key)) return { valid: false, reason: "occupied" };
    if (index > 0 && !isAdjacent(path[index - 1], cell)) return { valid: false, reason: "not-adjacent" };
    seen.add(key);
  }
  const endpoint = board[path[0].row][path[0].col];
  if (board[path.at(-1)!.row][path.at(-1)!.col] !== endpoint) return { valid: false, reason: "endpoint" };
  const interior = board[path[1].row][path[1].col];
  if (interior === endpoint || path.slice(1, -1).some((cell) => board[cell.row][cell.col] !== interior)) {
    return { valid: false, reason: "interior" };
  }
  return { valid: true, endpoint, interior };
}

export function wouldCross(path: readonly Cell[], occupied: ReadonlySet<string>) {
  return path.some(({ row, col }) => occupied.has(`${row}-${col}`));
}

function neighbors(board: number[][], cell: Cell) {
  return [
    { row: cell.row - 1, col: cell.col }, { row: cell.row + 1, col: cell.col },
    { row: cell.row, col: cell.col - 1 }, { row: cell.row, col: cell.col + 1 },
  ].filter(({ row, col }) => row >= 0 && row < board.length && col >= 0 && col < board[0].length);
}

export function findAnyValidPath(board: number[][], occupied: ReadonlySet<string> = new Set()) {
  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[0].length; col += 1) {
      const start = { row, col };
      if (occupied.has(`${row}-${col}`)) continue;
      const endpoint = board[row][col];
      for (const firstInterior of neighbors(board, start)) {
        if (occupied.has(`${firstInterior.row}-${firstInterior.col}`)) continue;
        const interior = board[firstInterior.row][firstInterior.col];
        if (interior === endpoint) continue;
        const queue: { cell: Cell; path: Cell[] }[] = [{ cell: firstInterior, path: [start, firstInterior] }];
        const visited = new Set([`${start.row}-${start.col}`, `${firstInterior.row}-${firstInterior.col}`]);
        while (queue.length) {
          const current = queue.shift()!;
          for (const candidate of neighbors(board, current.cell)) {
            const key = `${candidate.row}-${candidate.col}`;
            if (occupied.has(key) || visited.has(key)) continue;
            if (board[candidate.row][candidate.col] === endpoint) return [...current.path, candidate];
            if (board[candidate.row][candidate.col] !== interior) continue;
            visited.add(key);
            queue.push({ cell: candidate, path: [...current.path, candidate] });
          }
        }
      }
    }
  }
  return null;
}

export function neighborBonus(pathLength: number) {
  return Math.max(0, pathLength - 3) * 2;
}

export function generateEchoBoard(random: RandomSource = createRandom()) {
  const board = Array.from({ length: 10 }, () => Array.from({ length: 10 }, () => random.int(0, 3)));
  const planted = [
    [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }],
    [{ row: 3, col: 3 }, { row: 4, col: 3 }, { row: 5, col: 3 }],
    [{ row: 8, col: 7 }, { row: 8, col: 8 }, { row: 8, col: 9 }],
  ];
  planted.forEach((path, index) => {
    board[path[0].row][path[0].col] = index;
    board[path[1].row][path[1].col] = (index + 1) % 4;
    board[path[2].row][path[2].col] = index;
  });
  return board;
}

export type BasketToken = { id: string; value: number };
export type BasketRound = { target: number; tokens: BasketToken[] };

export function findValidPairs(round: BasketRound) {
  const pairs: [BasketToken, BasketToken][] = [];
  for (let first = 0; first < round.tokens.length - 1; first += 1) {
    for (let second = first + 1; second < round.tokens.length; second += 1) {
      if (round.tokens[first].value + round.tokens[second].value === round.target) {
        pairs.push([round.tokens[first], round.tokens[second]]);
      }
    }
  }
  return pairs;
}

export function generateTargetRound(random: RandomSource = createRandom()): BasketRound {
  const target = random.int(5, 35);
  const minimum = Math.max(1, target - 20);
  const maximum = Math.min(20, target - 1);
  const first = random.int(minimum, maximum);
  const values = [first, target - first];
  while (values.length < 6) values.push(random.int(1, 20));
  const tokens = values.map((value, index) => ({ id: `token-${index}-${random.int(0, 1_000_000)}`, value }));
  for (let index = tokens.length - 1; index > 0; index -= 1) {
    const swap = random.int(0, index);
    [tokens[index], tokens[swap]] = [tokens[swap], tokens[index]];
  }
  return { target, tokens };
}

export function evaluatePair(round: BasketRound, ids: readonly string[]) {
  if (ids.length !== 2 || ids[0] === ids[1]) return false;
  const selected = ids.map((id) => round.tokens.find((token) => token.id === id));
  return selected.every(Boolean) && selected[0]!.value + selected[1]!.value === round.target;
}

export function calculateRoundScore(timeRemaining: number, streak: number) {
  return 100 + Math.max(0, timeRemaining) * 5 + Math.min(100, Math.max(0, streak) * 25);
}

export type MathMode = "add" | "subtract" | "multiply";
export type OperandSet = { rows: number[]; cols: number[] };

export function buildOperandSet(mode: MathMode, random: RandomSource = createRandom()): OperandSet {
  if (mode === "multiply") {
    return {
      rows: Array.from({ length: 5 }, () => random.int(2, 9)),
      cols: Array.from({ length: 5 }, () => random.int(2, 9)),
    };
  }
  if (mode === "subtract") {
    return {
      rows: Array.from({ length: 5 }, () => random.int(15, 49)),
      cols: Array.from({ length: 5 }, () => random.int(1, 14)),
    };
  }
  return {
    rows: Array.from({ length: 5 }, () => random.int(1, 49)),
    cols: Array.from({ length: 5 }, () => random.int(1, 50)),
  };
}

export function expectedAnswer(mode: MathMode, row: number, col: number) {
  if (mode === "add") return row + col;
  if (mode === "multiply") return row * col;
  return Math.max(row, col) - Math.min(row, col);
}

export function validateCell(mode: MathMode, row: number, col: number, answer: string | number) {
  if (String(answer).trim() === "") return false;
  return Number(answer) === expectedAnswer(mode, row, col);
}

export function nextIncompleteCell(locked: ReadonlySet<string>, current: Cell) {
  const start = current.row * 5 + current.col;
  for (let offset = 1; offset <= 25; offset += 1) {
    const index = (start + offset) % 25;
    const key = `${Math.floor(index / 5)}-${index % 5}`;
    if (!locked.has(key)) return { row: Math.floor(index / 5), col: index % 5 };
  }
  return null;
}

export function calculateFinalScore(elapsedSeconds: number, wrongAttempts = 0) {
  return Math.max(1, 1250 - Math.max(0, elapsedSeconds) - Math.max(0, wrongAttempts) * 8);
}
