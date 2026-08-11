import { createRandom, type RandomSource } from "../random";

export type BloomPiece = {
  cells: [number, number][];
  color: number;
  used: boolean;
};

export function canPlaceBloomPiece(
  board: readonly (number | null)[],
  piece: BloomPiece,
  row: number,
  column: number,
  size = 10,
) {
  return piece.cells.every(([rowOffset, columnOffset]) => {
    const targetRow = row + rowOffset;
    const targetColumn = column + columnOffset;
    return targetRow >= 0 && targetColumn >= 0 && targetRow < size && targetColumn < size &&
      board[targetRow * size + targetColumn] === null;
  });
}

export function findCompletedBloomLines(board: readonly (number | null)[], size = 10) {
  const rows = Array.from({ length: size }, (_, row) => row).filter((row) =>
    board.slice(row * size, row * size + size).every((cell) => cell !== null),
  );
  const columns = Array.from({ length: size }, (_, column) => column).filter((column) =>
    Array.from({ length: size }, (_, row) => board[row * size + column]).every((cell) => cell !== null),
  );
  return { rows, columns };
}

export function placeBloomPiece(
  board: readonly (number | null)[],
  piece: BloomPiece,
  row: number,
  column: number,
  size = 10,
) {
  if (!canPlaceBloomPiece(board, piece, row, column, size)) return null;
  const next = [...board];
  for (const [rowOffset, columnOffset] of piece.cells) {
    next[(row + rowOffset) * size + column + columnOffset] = piece.color;
  }
  const { rows, columns } = findCompletedBloomLines(next, size);
  for (const completedRow of rows) {
    for (let currentColumn = 0; currentColumn < size; currentColumn += 1) {
      next[completedRow * size + currentColumn] = null;
    }
  }
  for (const completedColumn of columns) {
    for (let currentRow = 0; currentRow < size; currentRow += 1) {
      next[currentRow * size + completedColumn] = null;
    }
  }
  return { board: next, rows, columns, lines: rows.length + columns.length };
}

export function hasAnyBloomMove(
  board: readonly (number | null)[],
  pieces: readonly BloomPiece[],
  size = 10,
) {
  return pieces.some((piece) => {
    if (piece.used) return false;
    for (let row = 0; row < size; row += 1) {
      for (let column = 0; column < size; column += 1) {
        if (canPlaceBloomPiece(board, piece, row, column, size)) return true;
      }
    }
    return false;
  });
}

export type NumberMatrix = number[][];

export function compress2048Line(line: readonly number[]) {
  return line.filter((value) => value !== 0);
}

export function merge2048Line(compacted: readonly number[]) {
  const merged: number[] = [];
  let score = 0;
  for (let index = 0; index < compacted.length; index += 1) {
    if (compacted[index] === compacted[index + 1]) {
      const value = compacted[index] * 2;
      merged.push(value);
      score += value;
      index += 1;
    } else {
      merged.push(compacted[index]);
    }
  }
  return { line: merged, score };
}

export function slide2048Line(line: readonly number[], size = 4) {
  const result = merge2048Line(compress2048Line(line));
  return { line: [...result.line, ...Array(Math.max(0, size - result.line.length)).fill(0)], score: result.score };
}

function transpose(matrix: NumberMatrix) {
  return matrix[0].map((_, column) => matrix.map((row) => row[column]));
}

export function move2048Matrix(board: NumberMatrix, direction: "left" | "right" | "up" | "down") {
  let work = board.map((row) => [...row]);
  if (direction === "up" || direction === "down") work = transpose(work);
  if (direction === "right" || direction === "down") work = work.map((row) => [...row].reverse());
  let score = 0;
  work = work.map((row) => {
    const result = slide2048Line(row, board.length);
    score += result.score;
    return result.line;
  });
  if (direction === "right" || direction === "down") work = work.map((row) => [...row].reverse());
  if (direction === "up" || direction === "down") work = transpose(work);
  return { board: work, score, changed: JSON.stringify(work) !== JSON.stringify(board) };
}

export function canMove2048(board: NumberMatrix) {
  return (["left", "right", "up", "down"] as const).some((direction) => move2048Matrix(board, direction).changed);
}

export function spawn2048Tile(board: NumberMatrix, random: RandomSource = createRandom()) {
  const empty: [number, number][] = [];
  board.forEach((row, rowIndex) => row.forEach((value, columnIndex) => {
    if (!value) empty.push([rowIndex, columnIndex]);
  }));
  if (!empty.length) return board.map((row) => [...row]);
  const [row, column] = random.pick(empty);
  const next = board.map((values) => [...values]);
  next[row][column] = random.next() < 0.9 ? 2 : 4;
  return next;
}

export type PourMove = { source: number; destination: number };
export type PourLevel = { id: number; tubes: number[][]; solution: PourMove[] };

export function pourAmount(source: readonly number[], destination: readonly number[], capacity = 4) {
  if (!source.length || destination.length >= capacity) return 0;
  const color = source.at(-1)!;
  if (destination.length && destination.at(-1) !== color) return 0;
  let amount = 1;
  for (let index = source.length - 2; index >= 0 && source[index] === color; index -= 1) amount += 1;
  return Math.min(amount, capacity - destination.length);
}

export function applyPour(tubes: readonly (readonly number[])[], move: PourMove, capacity = 4) {
  if (move.source === move.destination || !tubes[move.source] || !tubes[move.destination]) return null;
  const amount = pourAmount(tubes[move.source], tubes[move.destination], capacity);
  if (!amount) return null;
  const next = tubes.map((tube) => [...tube]);
  const moved = next[move.source].splice(next[move.source].length - amount, amount);
  next[move.destination].push(...moved);
  return next;
}

export function pourPuzzleComplete(tubes: readonly (readonly number[])[], capacity = 4) {
  return tubes.every((tube) => tube.length === 0 || (tube.length === capacity && tube.every((color) => color === tube[0])));
}

export function validatePourLevel(tubes: readonly (readonly number[])[], capacity = 4) {
  if (tubes.some((tube) => tube.length > capacity)) return false;
  const counts = new Map<number, number>();
  for (const tube of tubes) for (const color of tube) counts.set(color, (counts.get(color) ?? 0) + 1);
  return [...counts.values()].every((count) => count === capacity) && tubes.filter((tube) => tube.length === 0).length <= 2;
}

function createPourLevel(index: number): PourLevel {
  const colorCount = 4 + (index % 5);
  const variant = Math.floor(index / 5);
  const shift = variant % colorCount;
  const direction = variant >= colorCount ? -1 : 1;
  const color = (value: number) => (value + shift) % colorCount;
  const tubes = Array.from({ length: colorCount }, (_, tube) => [
    color(tube),
    color(tube),
    color(tube),
    color((tube + direction + colorCount) % colorCount),
  ]);
  tubes.push([], []);
  const firstEmpty = colorCount;
  const secondEmpty = colorCount + 1;
  const solution: PourMove[] = direction === 1
    ? [
        { source: 0, destination: firstEmpty },
        { source: 1, destination: secondEmpty },
        { source: colorCount - 1, destination: 0 },
        ...Array.from({ length: Math.max(0, colorCount - 3) }, (_, offset) => ({
          source: colorCount - 2 - offset,
          destination: colorCount - 1 - offset,
        })),
        { source: secondEmpty, destination: 2 },
        { source: firstEmpty, destination: 1 },
      ]
    : [
        { source: 0, destination: firstEmpty },
        { source: colorCount - 1, destination: secondEmpty },
        { source: 1, destination: 0 },
        ...Array.from({ length: Math.max(0, colorCount - 3) }, (_, offset) => ({
          source: 2 + offset,
          destination: 1 + offset,
        })),
        { source: secondEmpty, destination: colorCount - 2 },
        { source: firstEmpty, destination: colorCount - 1 },
      ];
  return { id: index + 1, tubes, solution };
}

export const COLOR_POUR_LEVELS: readonly PourLevel[] = Array.from({ length: 30 }, (_, index) => createPourLevel(index));

export function solvePourLevel(initial: readonly (readonly number[])[], maximumStates = 250_000) {
  const start = initial.map((tube) => [...tube]);
  const key = (tubes: readonly (readonly number[])[]) => tubes.map((tube) => tube.join(",")).join("|");
  const queue: { tubes: number[][]; path: PourMove[] }[] = [{ tubes: start, path: [] }];
  const visited = new Set([key(start)]);
  for (let cursor = 0; cursor < queue.length && visited.size <= maximumStates; cursor += 1) {
    const current = queue[cursor];
    if (pourPuzzleComplete(current.tubes)) return current.path;
    for (let source = 0; source < current.tubes.length; source += 1) {
      for (let destination = 0; destination < current.tubes.length; destination += 1) {
        const next = applyPour(current.tubes, { source, destination });
        if (!next) continue;
        const nextKey = key(next);
        if (visited.has(nextKey)) continue;
        visited.add(nextKey);
        queue.push({ tubes: next, path: [...current.path, { source, destination }] });
      }
    }
  }
  return null;
}

export type BubbleCell = number | null;

export function bubbleHexNeighbors(row: number, column: number, rows: number, columns: number) {
  const diagonals = row % 2 === 0 ? [-1, 0] : [0, 1];
  return [
    [row, column - 1],
    [row, column + 1],
    [row - 1, column + diagonals[0]],
    [row - 1, column + diagonals[1]],
    [row + 1, column + diagonals[0]],
    [row + 1, column + diagonals[1]],
  ].filter(([nextRow, nextColumn]) => nextRow >= 0 && nextRow < rows && nextColumn >= 0 && nextColumn < columns) as [number, number][];
}

export type BubbleAimPoint = { x: number; y: number };

export function projectBubbleBankShot(origin: BubbleAimPoint, target: BubbleAimPoint, left = 0, right = 8) {
  const dy = Math.min(-0.01, target.y - origin.y);
  const dx = target.x - origin.x;
  const xAtTop = origin.x + (0 - origin.y) * dx / dy;
  if (xAtTop >= left && xAtTop <= right) {
    return { points: [origin, { x: xAtTop, y: 0 }], column: Math.max(0, Math.min(7, Math.round(xAtTop - .5))) };
  }
  const wall = xAtTop < left ? left : right;
  const wallY = origin.y + (wall - origin.x) * dy / dx;
  const reflectedX = wall === left ? left + (left - xAtTop) : right - (xAtTop - right);
  const endX = Math.max(left, Math.min(right, reflectedX));
  return { points: [origin, { x: wall, y: wallY }, { x: endX, y: 0 }], column: Math.max(0, Math.min(7, Math.round(endX - .5))) };
}

export function bubbleColorCluster(grid: readonly (readonly BubbleCell[])[], row: number, column: number) {
  const color = grid[row]?.[column];
  if (color === null || color === undefined) return [];
  const queue: [number, number][] = [[row, column]];
  const seen = new Set<string>();
  const cluster: [number, number][] = [];
  while (queue.length) {
    const [currentRow, currentColumn] = queue.shift()!;
    const cellKey = `${currentRow}-${currentColumn}`;
    if (seen.has(cellKey) || grid[currentRow]?.[currentColumn] !== color) continue;
    seen.add(cellKey);
    cluster.push([currentRow, currentColumn]);
    queue.push(...bubbleHexNeighbors(currentRow, currentColumn, grid.length, grid[0].length));
  }
  return cluster;
}

export function ceilingConnectedBubbles(grid: readonly (readonly BubbleCell[])[]) {
  const queue: [number, number][] = [];
  for (let column = 0; column < grid[0].length; column += 1) if (grid[0][column] !== null) queue.push([0, column]);
  const connected = new Set<string>();
  while (queue.length) {
    const [row, column] = queue.shift()!;
    const cellKey = `${row}-${column}`;
    if (connected.has(cellKey) || grid[row][column] === null) continue;
    connected.add(cellKey);
    queue.push(...bubbleHexNeighbors(row, column, grid.length, grid[0].length));
  }
  return connected;
}

export type BoltDefinition = { id: string; color: number; coveredBy: string[] };
export type BoltPlateDefinition = { id: string; bolts: BoltDefinition[] };
export type BoltLevelDefinition = { id: number; slots: number; plates: BoltPlateDefinition[] };

export function boltIsAvailable(bolt: BoltDefinition, removed: ReadonlySet<string>) {
  return !removed.has(bolt.id) && bolt.coveredBy.every((dependency) => removed.has(dependency));
}

export function insertBoltIntoSlots(slots: readonly number[], color: number, capacity = 7) {
  if (slots.length >= capacity) return { slots: [...slots], cleared: false, failed: true };
  let next = [...slots, color];
  const matches = next.reduce<number[]>((indices, value, index) => value === color ? [...indices, index] : indices, []);
  const cleared = matches.length >= 3;
  if (cleared) {
    const removal = new Set(matches.slice(0, 3));
    next = next.filter((_, index) => !removal.has(index));
  }
  return { slots: next, cleared, failed: next.length >= capacity };
}

function createBoltLevel(index: number): BoltLevelDefinition {
  const plateCount = 4 + (index % 3);
  const plates: BoltPlateDefinition[] = [];
  for (let plateIndex = 0; plateIndex < plateCount; plateIndex += 1) {
    const priorBolts = plates.at(-1)?.bolts.map((bolt) => bolt.id) ?? [];
    plates.push({
      id: `plate-${index + 1}-${plateIndex + 1}`,
      bolts: Array.from({ length: 3 }, (_, boltIndex) => ({
        id: `bolt-${index + 1}-${plateIndex + 1}-${boltIndex + 1}`,
        color: (plateIndex + index) % 5,
        coveredBy: priorBolts,
      })),
    });
  }
  return { id: index + 1, slots: 7, plates };
}

export const BOLT_LEVELS: readonly BoltLevelDefinition[] = Array.from({ length: 20 }, (_, index) => createBoltLevel(index));

export function solveBoltLevel(level: BoltLevelDefinition, maximumStates = 100_000) {
  const bolts = level.plates.flatMap((plate) => plate.bolts);
  const byId = new Map(bolts.map((bolt) => [bolt.id, bolt]));
  const stack: { removed: Set<string>; slots: number[]; path: string[] }[] = [{
    removed: new Set(),
    slots: [],
    path: [],
  }];
  const visited = new Set<string>();

  while (stack.length && visited.size <= maximumStates) {
    const current = stack.pop()!;
    if (current.removed.size === bolts.length) return current.path;
    const stateKey = `${[...current.removed].sort().join(",")}|${current.slots.join(",")}`;
    if (visited.has(stateKey)) continue;
    visited.add(stateKey);

    for (const bolt of bolts) {
      if (!byId.has(bolt.id) || !boltIsAvailable(bolt, current.removed)) continue;
      const slotResult = insertBoltIntoSlots(current.slots, bolt.color, level.slots);
      if (slotResult.failed) continue;
      const removed = new Set(current.removed);
      removed.add(bolt.id);
      stack.push({ removed, slots: slotResult.slots, path: [...current.path, bolt.id] });
    }
  }
  return null;
}

export type UnblockPiece = {
  id: string;
  x: number;
  y: number;
  length: number;
  axis: "h" | "v";
  target?: boolean;
};

export function unblockOccupied(pieces: readonly UnblockPiece[], excludedId?: string) {
  const occupied = new Set<string>();
  for (const piece of pieces) {
    if (piece.id === excludedId) continue;
    for (let offset = 0; offset < piece.length; offset += 1) {
      occupied.add(`${piece.y + (piece.axis === "v" ? offset : 0)}-${piece.x + (piece.axis === "h" ? offset : 0)}`);
    }
  }
  return occupied;
}

export function moveUnblockPiece(
  pieces: readonly UnblockPiece[],
  pieceId: string,
  delta: number,
  size = 6,
) {
  const piece = pieces.find((candidate) => candidate.id === pieceId);
  if (!piece || delta === 0) return null;
  const nextPiece = {
    ...piece,
    x: piece.x + (piece.axis === "h" ? delta : 0),
    y: piece.y + (piece.axis === "v" ? delta : 0),
  };
  const targetMayExit = piece.target && piece.axis === "h" && delta > 0;
  if (
    nextPiece.x < 0 || nextPiece.y < 0 ||
    nextPiece.y + (nextPiece.axis === "v" ? nextPiece.length : 1) > size ||
    nextPiece.x + (nextPiece.axis === "h" ? nextPiece.length : 1) > size + (targetMayExit ? 1 : 0)
  ) return null;
  const occupied = unblockOccupied(pieces, piece.id);
  for (let offset = 0; offset < nextPiece.length; offset += 1) {
    const row = nextPiece.y + (nextPiece.axis === "v" ? offset : 0);
    const column = nextPiece.x + (nextPiece.axis === "h" ? offset : 0);
    if (column < size && occupied.has(`${row}-${column}`)) return null;
  }
  return pieces.map((candidate) => candidate.id === piece.id ? nextPiece : { ...candidate });
}

export function unblockComplete(pieces: readonly UnblockPiece[], size = 6) {
  const target = pieces.find((piece) => piece.target);
  return Boolean(target && target.x + target.length > size);
}

export function solveUnblockLevel(initial: readonly UnblockPiece[], maximumStates = 100_000) {
  const serialize = (pieces: readonly UnblockPiece[]) => pieces.map(({ id, x, y }) => `${id}:${x},${y}`).join("|");
  const queue: { pieces: UnblockPiece[]; moves: { id: string; delta: number }[] }[] = [{ pieces: initial.map((piece) => ({ ...piece })), moves: [] }];
  const visited = new Set([serialize(initial)]);
  for (let cursor = 0; cursor < queue.length && visited.size <= maximumStates; cursor += 1) {
    const current = queue[cursor];
    if (unblockComplete(current.pieces)) return current.moves;
    for (const piece of current.pieces) {
      for (const delta of [-1, 1]) {
        const next = moveUnblockPiece(current.pieces, piece.id, delta);
        if (!next) continue;
        const key = serialize(next);
        if (visited.has(key)) continue;
        visited.add(key);
        queue.push({ pieces: next, moves: [...current.moves, { id: piece.id, delta }] });
      }
    }
  }
  return null;
}

const unblockVariants = Array.from({ length: 3 }, (_, targetX) =>
  Array.from({ length: 4 - targetX }, (_, gateOffset) => targetX + 2 + gateOffset).flatMap((gateX) =>
    [2, 3].flatMap((gateLength) =>
      Array.from({ length: gateLength }, (_, offset) => ({
        targetX,
        gateX,
        gateLength,
        gateY: 3 - gateLength + offset,
      })),
    ),
  ),
).flat().slice(0, 30);

export function createUnblockLevel(index: number): UnblockPiece[] {
  const variant = unblockVariants[index % unblockVariants.length];
  return [
    { id: "target", x: variant.targetX, y: 2, length: 2, axis: "h", target: true },
    { id: "gate", x: variant.gateX, y: variant.gateY, length: variant.gateLength, axis: "v" },
  ];
}

export const UNBLOCK_LEVELS: readonly UnblockPiece[][] = Array.from({ length: 30 }, (_, index) => createUnblockLevel(index));

export type SolitaireCard = { suit: "♠" | "♥" | "♦" | "♣"; rank: number };

export function solitaireCardIsRed(card: SolitaireCard) {
  return card.suit === "♥" || card.suit === "♦";
}

export function canStackOnTableau(card: SolitaireCard, destination: SolitaireCard | null) {
  return destination ? destination.rank === card.rank + 1 && solitaireCardIsRed(destination) !== solitaireCardIsRed(card) : card.rank === 13;
}

export function canAddToFoundation(card: SolitaireCard, foundation: readonly SolitaireCard[]) {
  return card.suit === (foundation[0]?.suit ?? card.suit) && card.rank === foundation.length + 1;
}
