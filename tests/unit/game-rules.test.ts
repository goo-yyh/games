import { describe, expect, it } from "vitest";
import { canPlaceBloom, move2048, placeBloom, slideLine } from "../../src/games/logic/ClassicGames";
import { rectFromPoints, sumRect } from "../../src/games/logic/garden-rules";
import { createRandom } from "../../src/games/random";

describe("Block Bloom rules", () => {
  const piece = { cells: [[0, 0], [0, 1]] as [number, number][], color: 2, used: false };
  it("rejects overlap and bounds", () => {
    const board = Array<number | null>(100).fill(null); board[0] = 1;
    expect(canPlaceBloom(board, piece, 0, 0)).toBe(false);
    expect(canPlaceBloom(board, piece, 0, 9)).toBe(false);
    expect(canPlaceBloom(board, piece, 1, 1)).toBe(true);
  });
  it("clears a completed row once", () => {
    const board = Array<number | null>(100).fill(null);
    for (let column = 0; column < 8; column++) board[column] = 1;
    const result = placeBloom(board, piece, 0, 8);
    expect(result.lines).toBe(1);
    expect(result.board.slice(0, 10).every((cell) => cell === null)).toBe(true);
  });
});

describe("2048 rules", () => {
  it("merges each created tile only once", () => expect(slideLine([2, 2, 4, 0])).toEqual({ line: [4, 4, 0, 0], score: 4 }));
  it("does not mark an unchanged board as moved", () => {
    const board = [[2,4,8,16],[4,8,16,32],[8,16,32,64],[16,32,64,128]];
    expect(move2048(board, "left").changed).toBe(false);
  });
});

describe("Garden Logic primitives", () => {
  it("normalizes rectangular selections and totals live cells", () => {
    const rect = rectFromPoints({ row: 2, col: 3 }, { row: 0, col: 1 });
    expect(rect).toEqual({ top: 0, left: 1, bottom: 2, right: 3 });
    expect(sumRect([[null,2,3,1],[4,1,1,0],[9,2,1,3]], rect)).toEqual({ sum: 14, count: 9 });
  });
  it("provides reproducible seeded randomness", () => {
    const first = createRandom(42), second = createRandom(42);
    expect(Array.from({ length: 8 }, () => first.int(0, 99))).toEqual(Array.from({ length: 8 }, () => second.int(0, 99)));
  });
});
