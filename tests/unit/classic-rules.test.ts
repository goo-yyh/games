import { describe, expect, it } from "vitest";
import { createRandom } from "../../src/games/random";
import {
  BOLT_LEVELS,
  COLOR_POUR_LEVELS,
  UNBLOCK_LEVELS,
  applyPour,
  boltIsAvailable,
  bubbleColorCluster,
  bubbleHexNeighbors,
  projectBubbleBankShot,
  canAddToFoundation,
  canMove2048,
  canPlaceBloomPiece,
  canStackOnTableau,
  ceilingConnectedBubbles,
  compress2048Line,
  findCompletedBloomLines,
  hasAnyBloomMove,
  insertBoltIntoSlots,
  merge2048Line,
  move2048Matrix,
  moveUnblockPiece,
  placeBloomPiece,
  pourAmount,
  pourPuzzleComplete,
  slide2048Line,
  solvePourLevel,
  solveBoltLevel,
  solveUnblockLevel,
  spawn2048Tile,
  unblockComplete,
  validatePourLevel,
  type BloomPiece,
} from "../../src/games/rules/classic-rules";

describe("Block Bloom pure engine", () => {
  const domino: BloomPiece = { cells: [[0, 0], [0, 1]], color: 2, used: false };

  it("rejects overlap and all four out-of-bounds directions", () => {
    const board = Array<number | null>(100).fill(null);
    board[0] = 1;
    expect(canPlaceBloomPiece(board, domino, 0, 0)).toBe(false);
    expect(canPlaceBloomPiece(board, domino, 0, 9)).toBe(false);
    expect(canPlaceBloomPiece(board, domino, -1, 2)).toBe(false);
    expect(canPlaceBloomPiece(board, domino, 3, -1)).toBe(false);
  });

  it("clears simultaneous rows and columns exactly once", () => {
    const board = Array<number | null>(100).fill(null);
    for (let column = 0; column < 9; column += 1) board[4 * 10 + column] = 1;
    for (let row = 0; row < 10; row += 1) if (row !== 4) board[row * 10 + 9] = 1;
    const single: BloomPiece = { cells: [[0, 0]], color: 3, used: false };
    const result = placeBloomPiece(board, single, 4, 9)!;
    expect(result.lines).toBe(2);
    expect(result.rows).toEqual([4]);
    expect(result.columns).toEqual([9]);
    expect(findCompletedBloomLines(result.board)).toEqual({ rows: [], columns: [] });
  });

  it("ends only when every remaining tray piece has no move", () => {
    const board = Array<number | null>(100).fill(1);
    board[99] = null;
    const single: BloomPiece = { cells: [[0, 0]], color: 0, used: false };
    const usedSingle = { ...single, used: true };
    expect(hasAnyBloomMove(board, [single])).toBe(true);
    expect(hasAnyBloomMove(board, [usedSingle])).toBe(false);
    expect(hasAnyBloomMove(board, [{ ...single, cells: [[0, 0], [0, 1]] }])).toBe(false);
  });
});

describe("Number Merge 2048 pure engine", () => {
  it("separates compression and one-merge-per-tile resolution", () => {
    expect(compress2048Line([0, 2, 0, 2])).toEqual([2, 2]);
    expect(merge2048Line([2, 2, 4, 4])).toEqual({ line: [4, 8], score: 12 });
    expect(slide2048Line([2, 2, 4, 0])).toEqual({ line: [4, 4, 0, 0], score: 4 });
    expect(slide2048Line([2, 2, 2, 2])).toEqual({ line: [4, 4, 0, 0], score: 8 });
  });

  it("moves in all directions and detects no-move boards", () => {
    const board = [[2, 0, 2, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    expect(move2048Matrix(board, "left").board[0]).toEqual([4, 0, 0, 0]);
    expect(move2048Matrix(board, "right").board[0]).toEqual([0, 0, 0, 4]);
    expect(move2048Matrix(board, "up").board[0]).toEqual([2, 0, 2, 0]);
    const locked = [[2,4,8,16],[4,8,16,32],[8,16,32,64],[16,32,64,128]];
    expect(canMove2048(locked)).toBe(false);
  });

  it("spawns deterministically only into an empty cell", () => {
    const board = [[2,4,8,16],[4,8,16,32],[8,16,32,64],[16,32,64,0]];
    const spawned = spawn2048Tile(board, createRandom(7));
    expect([2, 4]).toContain(spawned[3][3]);
    expect(spawned.flat().filter(Boolean)).toHaveLength(16);
  });
});

describe("Color Pour bundled levels", () => {
  it("contains 30 distinct, balanced levels spanning four through eight colors", () => {
    expect(COLOR_POUR_LEVELS).toHaveLength(30);
    expect(new Set(COLOR_POUR_LEVELS.map((level) => JSON.stringify(level.tubes))).size).toBe(30);
    expect(new Set(COLOR_POUR_LEVELS.map((level) => level.tubes.length - 2))).toEqual(new Set([4, 5, 6, 7, 8]));
    for (const level of COLOR_POUR_LEVELS) expect(validatePourLevel(level.tubes)).toBe(true);
  });

  it("moves the full contiguous top group up to capacity", () => {
    expect(pourAmount([0, 1, 1], [1])).toBe(2);
    expect(pourAmount([0, 1, 1], [1, 1, 1])).toBe(1);
    expect(pourAmount([0, 1], [2])).toBe(0);
    expect(pourAmount([0, 1], [2, 2, 2, 2])).toBe(0);
  });

  it("executes every bundled solution to completion", () => {
    for (const level of COLOR_POUR_LEVELS) {
      let tubes = level.tubes.map((tube) => [...tube]);
      for (const move of level.solution) {
        const next = applyPour(tubes, move);
        expect(next, `level ${level.id}: ${move.source}->${move.destination}`).not.toBeNull();
        tubes = next!;
      }
      expect(pourPuzzleComplete(tubes), `level ${level.id}`).toBe(true);
    }
  });

  it("finds solver paths for representative bundled levels", () => {
    for (const index of [0, 7, 14, 21, 29]) {
      const path = solvePourLevel(COLOR_POUR_LEVELS[index].tubes);
      expect(path, `level ${index + 1}`).not.toBeNull();
    }
  });
});

describe("Bubble Pop Shooter hex resolution", () => {
  it("projects direct and single-wall bank shots into a valid column", () => {
    expect(projectBubbleBankShot({ x: 4, y: 8 }, { x: 4, y: 4 })).toEqual({ points: [{ x: 4, y: 8 }, { x: 4, y: 0 }], column: 4 });
    const bank = projectBubbleBankShot({ x: 4, y: 8 }, { x: .2, y: 6 });
    expect(bank.points).toHaveLength(3);
    expect(bank.column).toBeGreaterThanOrEqual(0);
    expect(bank.column).toBeLessThan(8);
  });

  it("uses six offset-grid neighbors", () => {
    expect(bubbleHexNeighbors(2, 2, 6, 6)).toHaveLength(6);
    expect(bubbleHexNeighbors(0, 0, 6, 6).length).toBeGreaterThanOrEqual(2);
  });

  it("flood-fills only the matching hex cluster", () => {
    const grid = [
      [1, 1, null, null],
      [null, 1, 2, null],
      [null, null, 2, null],
    ];
    expect(bubbleColorCluster(grid, 0, 0)).toHaveLength(3);
    expect(bubbleColorCluster(grid, 1, 2)).toHaveLength(2);
  });

  it("separates ceiling-connected bubbles from unsupported clusters", () => {
    const grid = [
      [1, null, null],
      [1, null, null],
      [null, null, 2],
    ];
    const connected = ceilingConnectedBubbles(grid);
    expect(connected.has("1-0")).toBe(true);
    expect(connected.has("2-2")).toBe(false);
  });
});

describe("Bolt Away slot and dependency rules", () => {
  it("rejects covered bolts until every dependency is removed", () => {
    const bolt = { id: "lower", color: 1, coveredBy: ["upper-a", "upper-b"] };
    expect(boltIsAvailable(bolt, new Set())).toBe(false);
    expect(boltIsAvailable(bolt, new Set(["upper-a"]))).toBe(false);
    expect(boltIsAvailable(bolt, new Set(["upper-a", "upper-b"]))).toBe(true);
  });

  it("clears exactly the first three matching tray bolts deterministically", () => {
    expect(insertBoltIntoSlots([1, 2, 1, 3], 1)).toEqual({ slots: [2, 3], cleared: true, failed: false });
    expect(insertBoltIntoSlots([0, 1, 3, 0, 1, 3], 3)).toEqual({ slots: [0, 1, 0, 1], cleared: true, failed: false });
  });

  it("ships 20 schema-valid levels accepted by the offline solver", () => {
    expect(BOLT_LEVELS).toHaveLength(20);
    expect(new Set(BOLT_LEVELS.map((level) => JSON.stringify(level))).size).toBe(20);
    for (const level of BOLT_LEVELS) {
      const solution = solveBoltLevel(level);
      expect(solution, `level ${level.id}`).not.toBeNull();
      expect(solution).toHaveLength(level.plates.reduce((total, plate) => total + plate.bolts.length, 0));
    }
  });
});

describe("Unblock Path static levels and BFS", () => {
  it("contains 30 distinct solvable levels", () => {
    expect(UNBLOCK_LEVELS).toHaveLength(30);
    expect(new Set(UNBLOCK_LEVELS.map((level) => JSON.stringify(level))).size).toBe(30);
    for (const [index, level] of UNBLOCK_LEVELS.entries()) {
      expect(solveUnblockLevel(level), `level ${index + 1}`).not.toBeNull();
    }
  });

  it("enforces axis, collision, boundaries, and target-only exit", () => {
    const level = UNBLOCK_LEVELS[0];
    expect(moveUnblockPiece(level, "gate", -2)).toBeNull();
    const targetIntoGate = moveUnblockPiece(level, "target", 1);
    expect(targetIntoGate).toBeNull();
    const solved = solveUnblockLevel(level)!;
    let current = level.map((piece) => ({ ...piece }));
    for (const move of solved) current = moveUnblockPiece(current, move.id, move.delta)!;
    expect(unblockComplete(current)).toBe(true);
  });
});

describe("Classic Solitaire placement rules", () => {
  it("enforces alternating-color descending tableau and king-only empty piles", () => {
    expect(canStackOnTableau({ suit: "♥", rank: 7 }, { suit: "♠", rank: 8 })).toBe(true);
    expect(canStackOnTableau({ suit: "♦", rank: 7 }, { suit: "♥", rank: 8 })).toBe(false);
    expect(canStackOnTableau({ suit: "♠", rank: 13 }, null)).toBe(true);
    expect(canStackOnTableau({ suit: "♠", rank: 12 }, null)).toBe(false);
  });

  it("builds foundations upward by suit from ace", () => {
    expect(canAddToFoundation({ suit: "♠", rank: 1 }, [])).toBe(true);
    expect(canAddToFoundation({ suit: "♠", rank: 2 }, [{ suit: "♠", rank: 1 }])).toBe(true);
    expect(canAddToFoundation({ suit: "♥", rank: 2 }, [{ suit: "♠", rank: 1 }])).toBe(false);
  });
});
