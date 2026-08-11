import { describe, expect, it } from "vitest";
import { createRandom } from "../../src/games/random";
import {
  applyCrossClear,
  armsEqual,
  buildOperandSet,
  calculateFinalScore,
  calculateRoundScore,
  clearAndCollapse,
  clearRect,
  connectedComponent,
  countSymbolsInRect,
  createBalancedRefill,
  evaluateCross,
  evaluatePair,
  expectedAnswer,
  findAllValidEmptyCells,
  findAnyValidPath,
  findLegalRects,
  findProductiveMoves,
  findRightAngleVertex,
  findScoringSidefallMoves,
  findValidConstellations,
  findValidPairs,
  generateColorCrossBoard,
  generateCornerStars,
  generateEchoBoard,
  generateOrbitBoard,
  generateSidefallBoard,
  generateSumBoard,
  generateTargetRound,
  generateTriadBoard,
  isBalancedTriad,
  isPerpendicular,
  isSegmentClear,
  legalDestinations,
  moveTopBlock,
  nextIncompleteCell,
  rectFromPoints,
  resolveLines,
  resolveSidefallMove,
  scanAxis,
  sumRect,
  validateCell,
  validateEchoPath,
  wouldCross,
  type Star,
} from "../../src/games/logic/garden-rules";

describe("Sum Orchard rules", () => {
  it("normalizes, sums and clears exactly one rectangle", () => {
    const board = [[1, 2, 3], [4, null, 5], [6, 7, 8]];
    const rect = rectFromPoints({ row: 2, col: 1 }, { row: 0, col: 0 });
    expect(rect).toEqual({ top: 0, left: 0, bottom: 2, right: 1 });
    expect(sumRect(board, rect)).toEqual({ sum: 20, count: 5 });
    expect(clearRect(board, rect)).toEqual([[null, null, 3], [null, null, 5], [null, null, 8]]);
    expect(board[0][0]).toBe(1);
  });

  it("generates bounded boards with planted legal target rectangles", () => {
    for (let seed = 0; seed < 50; seed += 1) {
      const board = generateSumBoard(createRandom(seed));
      expect(board).toHaveLength(8);
      expect(board.every((row) => row.length === 12)).toBe(true);
      expect(findLegalRects(board, 12).length).toBeGreaterThanOrEqual(8);
    }
  });
});

describe("Color Cross rules", () => {
  it("finds nearest pairs independently on both axes and clears each tile once", () => {
    const board = Array.from({ length: 5 }, () => Array<number | null>(5).fill(null));
    board[2][0] = board[2][4] = 1;
    board[0][2] = board[4][2] = 2;
    const result = evaluateCross(board, { row: 2, col: 2 });
    expect(result.horizontal).not.toBeNull();
    expect(result.vertical).not.toBeNull();
    expect(result.removed).toHaveLength(4);
    expect(applyCrossClear(board, result).flat().every((value) => value === null)).toBe(true);
  });

  it("stops at blockers and guarantees at least six starting moves", () => {
    const blocked = Array.from({ length: 5 }, () => Array<number | null>(5).fill(null));
    blocked[2][0] = 1;
    blocked[2][1] = 3;
    blocked[2][4] = 1;
    expect(evaluateCross(blocked, { row: 2, col: 2 }).horizontal).toBeNull();
    for (let seed = 0; seed < 30; seed += 1) {
      expect(findAllValidEmptyCells(generateColorCrossBoard(createRandom(seed))).length).toBeGreaterThanOrEqual(6);
    }
  });
});

describe("Orbit Lines rules", () => {
  it("ray-casts through empty cells and stops before occupied blockers", () => {
    const board = Array.from({ length: 5 }, () => Array<number | null>(5).fill(null));
    board[2][2] = 1;
    board[2][4] = 2;
    const destinations = legalDestinations(board, { row: 2, col: 2 });
    expect(destinations).toContainEqual({ row: 2, col: 3 });
    expect(destinations).not.toContainEqual({ row: 2, col: 4 });
    expect(destinations).toContainEqual({ row: 0, col: 0 });
  });

  it("clears gap-separated matches, stops at another symbol and de-duplicates crossings", () => {
    const board = Array.from({ length: 7 }, () => Array<number | null>(7).fill(null));
    board[3][0] = board[3][3] = board[3][6] = 1;
    board[0][3] = board[6][3] = 1;
    expect(scanAxis(board, { row: 3, col: 3 }, { row: 0, col: 1 })).toHaveLength(3);
    expect(resolveLines(board, { row: 3, col: 3 })).toMatchObject({ axes: 2 });
    expect(resolveLines(board, { row: 3, col: 3 }).removed).toHaveLength(5);
    board[3][4] = 2;
    expect(scanAxis(board, { row: 3, col: 3 }, { row: 0, col: 1 })).toHaveLength(2);
  });

  it("generates 26–30 orbs and at least four productive moves", () => {
    for (let seed = 0; seed < 20; seed += 1) {
      const board = generateOrbitBoard(createRandom(seed));
      const occupied = board.flat().filter((value) => value !== null).length;
      expect(occupied).toBeGreaterThanOrEqual(26);
      expect(occupied).toBeLessThanOrEqual(30);
      expect(findProductiveMoves(board).length).toBeGreaterThanOrEqual(4);
    }
  });
});

describe("Corner Stars geometry", () => {
  const base: [Star, Star, Star] = [
    { row: 2, col: 2, symbol: 0, active: true },
    { row: 2, col: 4, symbol: 0, active: true },
    { row: 4, col: 2, symbol: 0, active: true },
  ];

  it("finds the corner regardless of selection order with integer geometry", () => {
    expect(armsEqual(base[1], base[0], base[2])).toBe(true);
    expect(isPerpendicular(base[1], base[0], base[2])).toBe(true);
    for (const triple of [base, [base[1], base[2], base[0]], [base[2], base[0], base[1]]] as [Star, Star, Star][]) {
      expect(findRightAngleVertex(triple, base)).toMatchObject({ row: 2, col: 2 });
    }
    const diagonal: [Star, Star, Star] = [
      { row: 4, col: 4, symbol: 1, active: true },
      { row: 2, col: 2, symbol: 1, active: true },
      { row: 2, col: 6, symbol: 1, active: true },
    ];
    expect(findRightAngleVertex(diagonal, diagonal)).toMatchObject({ row: 4, col: 4 });
  });

  it("rejects a star on an open arm but ignores stars beyond endpoints", () => {
    const blocker = { row: 2, col: 3, symbol: 3, active: true };
    expect(isSegmentClear([...base, blocker], base[0], base[1])).toBe(false);
    expect(findRightAngleVertex(base, [...base, blocker])).toBeNull();
    const beyond = { row: 2, col: 5, symbol: 3, active: true };
    expect(isSegmentClear([...base, beyond], base[0], base[1])).toBe(true);
  });

  it("generates 42–50 stars with at least eight valid constellations", () => {
    for (let seed = 0; seed < 15; seed += 1) {
      const stars = generateCornerStars(createRandom(seed));
      expect(stars.length).toBeGreaterThanOrEqual(42);
      expect(stars.length).toBeLessThanOrEqual(50);
      expect(findValidConstellations(stars).length).toBeGreaterThanOrEqual(8);
    }
  });
});

describe("Sidefall Blocks rules", () => {
  it("moves only a stack top, rejects full destinations and cancels the source column", () => {
    const columns = [[1, 2], [0], Array(10).fill(3)];
    expect(moveTopBlock(columns, 0, 0)).toMatchObject({ ok: false, reason: "cancelled" });
    expect(moveTopBlock(columns, 0, 2)).toMatchObject({ ok: false, reason: "destination-full" });
    const moved = moveTopBlock(columns, 0, 1);
    expect(moved).toMatchObject({ ok: true, value: 2 });
    expect(columns).toEqual([[1, 2], [0], Array(10).fill(3)]);
  });

  it("uses orthogonal connectivity and resolves deterministic chains", () => {
    const columns = [[2, 1], [1, 1], [3]];
    const result = resolveSidefallMove(columns, 0, 1);
    expect(result.ok).toBe(true);
    expect(result.points).toBeGreaterThan(0);
    expect(result.chains).toBeGreaterThanOrEqual(1);
    expect(connectedComponent([[0], [0], [0]], 1, 0).size).toBe(3);
    expect(connectedComponent([[0], [1], [0]], 0, 0).size).toBe(1);
  });

  it("generates bounded boards with at least five scoring moves", () => {
    for (let seed = 0; seed < 20; seed += 1) {
      const board = generateSidefallBoard(createRandom(seed));
      expect(board).toHaveLength(8);
      expect(board.every((column) => column.length <= 10)).toBe(true);
      expect(findScoringSidefallMoves(board).length).toBeGreaterThanOrEqual(5);
    }
  });
});

describe("Triad Capture rules", () => {
  it("accepts one through four equal non-zero triads and rejects unequal or zero counts", () => {
    for (let count = 1; count <= 4; count += 1) expect(isBalancedTriad([count, count, count])).toBe(true);
    expect(isBalancedTriad([0, 0, 0])).toBe(false);
    expect(isBalancedTriad([2, 2, 1])).toBe(false);
    expect(isBalancedTriad([5, 5, 5])).toBe(false);
  });

  it("counts, clears, collapses and refills a stable 9×9 board", () => {
    const board = generateTriadBoard(createRandom(8));
    const rect = { top: 0, left: 0, bottom: 0, right: 2 };
    expect(countSymbolsInRect(board, rect)).toEqual([1, 1, 1]);
    const next = clearAndCollapse(board, rect, createBalancedRefill(createRandom(9)));
    expect(next).toHaveLength(9);
    expect(next.every((row) => row.length === 9 && row.every((value) => value !== null))).toBe(true);
  });

  it("keeps the refill stream balanced across thousands of symbols", () => {
    const next = createBalancedRefill(createRandom(42));
    const counts = [0, 0, 0];
    for (let index = 0; index < 10_001; index += 1) counts[next()] += 1;
    expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
  });
});

describe("Echo Path rules", () => {
  const board = [
    [0, 1, 0, 3],
    [2, 1, 2, 3],
    [2, 1, 2, 3],
    [3, 3, 3, 3],
  ];

  it("requires matching endpoints and a uniform different interior", () => {
    expect(validateEchoPath(board, [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }])).toMatchObject({ valid: true, endpoint: 0, interior: 1 });
    expect(validateEchoPath(board, [{ row: 0, col: 0 }, { row: 1, col: 1 }, { row: 0, col: 2 }])).toMatchObject({ valid: false, reason: "not-adjacent" });
    expect(validateEchoPath(board, [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 0 }])).toMatchObject({ valid: false, reason: "revisit" });
    expect(validateEchoPath(board, [{ row: 0, col: 0 }, { row: 0, col: 1 }])).toMatchObject({ valid: false, reason: "too-short" });
  });

  it("rejects occupied paths and finds a generated solution quickly", () => {
    const path = [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }];
    const occupied = new Set(["0-1"]);
    expect(wouldCross(path, occupied)).toBe(true);
    expect(validateEchoPath(board, path, occupied)).toMatchObject({ valid: false, reason: "occupied" });
    for (let seed = 0; seed < 20; seed += 1) {
      const generated = generateEchoBoard(createRandom(seed));
      const solution = findAnyValidPath(generated);
      expect(solution).not.toBeNull();
      expect(validateEchoPath(generated, solution!)).toMatchObject({ valid: true });
    }
  });
});

describe("Target Basket rules", () => {
  it("generates bounded rounds with unique token identities and a legal pair", () => {
    for (let seed = 0; seed < 300; seed += 1) {
      const round = generateTargetRound(createRandom(seed));
      expect(round.target).toBeGreaterThanOrEqual(5);
      expect(round.target).toBeLessThanOrEqual(35);
      expect(round.tokens).toHaveLength(6);
      expect(new Set(round.tokens.map((token) => token.id)).size).toBe(6);
      expect(round.tokens.every((token) => token.value >= 1 && token.value <= 20)).toBe(true);
      const pairs = findValidPairs(round);
      expect(pairs.length).toBeGreaterThan(0);
      expect(evaluatePair(round, pairs[0].map((token) => token.id))).toBe(true);
      expect(evaluatePair(round, [pairs[0][0].id, pairs[0][0].id])).toBe(false);
    }
  });

  it("calculates time and capped streak bonuses", () => {
    expect(calculateRoundScore(10, 1)).toBe(175);
    expect(calculateRoundScore(10, 99)).toBe(250);
  });
});

describe("Math Grid Sprint rules", () => {
  it("builds valid operand ranges in all modes", () => {
    for (const mode of ["add", "subtract", "multiply"] as const) {
      for (let seed = 0; seed < 100; seed += 1) {
        const set = buildOperandSet(mode, createRandom(seed));
        expect(set.rows).toHaveLength(5);
        expect(set.cols).toHaveLength(5);
        if (mode === "add") {
          expect(set.rows.every((value) => value >= 1 && value <= 49)).toBe(true);
          expect(set.cols.every((value) => value >= 1 && value <= 50)).toBe(true);
        } else if (mode === "multiply") {
          expect([...set.rows, ...set.cols].every((value) => value >= 2 && value <= 9)).toBe(true);
        } else {
          expect(set.rows.every((value) => value >= 15 && value <= 49)).toBe(true);
          expect(set.cols.every((value) => value >= 1 && value <= 14)).toBe(true);
        }
      }
    }
  });

  it("computes, validates, navigates, and scores deterministically", () => {
    expect(expectedAnswer("add", 7, 8)).toBe(15);
    expect(expectedAnswer("subtract", 3, 10)).toBe(7);
    expect(expectedAnswer("multiply", 7, 8)).toBe(56);
    expect(validateCell("multiply", 7, 8, "56")).toBe(true);
    expect(validateCell("multiply", 7, 8, "")).toBe(false);
    expect(nextIncompleteCell(new Set(["0-1", "0-2"]), { row: 0, col: 0 })).toEqual({ row: 0, col: 3 });
    expect(calculateFinalScore(20, 2)).toBe(1214);
    expect(calculateFinalScore(9999, 999)).toBe(1);
  });
});
