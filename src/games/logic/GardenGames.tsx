"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { gameText } from "@/i18n/game-ui";
import type { PlayableGameProps } from "../types";
import { createRandom } from "../random";
import {
  buildOperandSet,
  calculateFinalScore,
  calculateRoundScore,
  clearAndCollapse,
  clearRect,
  countSymbolsInRect,
  createBalancedRefill,
  evaluateCross,
  evaluatePair,
  findAllValidEmptyCells,
  findAnyValidPath,
  findLegalRects,
  findProductiveMoves,
  findRightAngleVertex,
  findValidConstellations,
  generateColorCrossBoard,
  generateCornerStars,
  generateEchoBoard,
  generateOrbitBoard,
  generateSidefallBoard,
  generateSumBoard,
  generateTargetRound,
  generateTriadBoard,
  isBalancedTriad,
  legalDestinations,
  nextIncompleteCell,
  rectFromPoints,
  resolveLines,
  resolveSidefallMove,
  sumRect,
  validateCell,
  validateEchoPath,
  type BasketRound,
  type Cell,
  type MathMode,
  type NumberGrid,
  type Rect,
  type Star,
} from "./garden-rules";

const local = (props: PlayableGameProps, en: string, zh: string) =>
  props.locale === "en" ? en : zh;
const symbols = ["●", "◆", "▲", "✚"];

export { rectFromPoints, sumRect } from "./garden-rules";

export function GardenGame(props: PlayableGameProps) {
  switch (props.slug) {
    case "sum-orchard": return <SumOrchard {...props} />;
    case "color-cross": return <ColorCross {...props} />;
    case "orbit-lines": return <OrbitLines {...props} />;
    case "corner-stars": return <CornerStars {...props} />;
    case "sidefall-blocks": return <SidefallBlocks {...props} />;
    case "triad-capture": return <TriadCapture {...props} />;
    case "echo-path": return <EchoPath {...props} />;
    case "target-basket": return <TargetBasket {...props} />;
    case "math-grid-sprint": return <MathGridSprint {...props} />;
    default: return null;
  }
}

function useCountdown(
  initial: number,
  paused: boolean,
  resetKey: number,
  cycle: number,
  onExpire: () => void,
) {
  const [time, setTime] = useState(initial);
  const expireRef = useRef(onExpire);
  useEffect(() => { expireRef.current = onExpire; }, [onExpire]);
  useEffect(() => { setTime(initial); }, [initial, resetKey, cycle]);
  useEffect(() => {
    if (paused || time <= 0) return;
    const id = window.setInterval(() => {
      setTime((value) => {
        if (value <= 1) {
          window.clearInterval(id);
          queueMicrotask(() => expireRef.current());
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [paused, time <= 0, resetKey, cycle]);
  return [time, setTime] as const;
}

function focusGridCell(event: ReactKeyboardEvent<HTMLElement>, row: number, col: number, rows: number, cols: number) {
  const movement: Record<string, [number, number]> = {
    ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1],
  };
  const delta = movement[event.key];
  if (!delta) return null;
  event.preventDefault();
  const next = {
    row: Math.max(0, Math.min(rows - 1, row + delta[0])),
    col: Math.max(0, Math.min(cols - 1, col + delta[1])),
  };
  event.currentTarget.closest("[data-grid]")
    ?.querySelector<HTMLElement>(`[data-cell="${next.row}-${next.col}"]`)
    ?.focus();
  return next;
}

function useRectangleSelection({
  rows,
  cols,
  paused,
  resetKey,
  onCommit,
}: {
  rows: number;
  cols: number;
  paused: boolean;
  resetKey: number;
  onCommit: (rect: Rect) => void;
}) {
  const [anchor, setAnchor] = useState<Cell | null>(null);
  const [extent, setExtent] = useState<Cell | null>(null);
  const drag = useRef<{ start: Cell; end: Cell; moved: boolean } | null>(null);
  const commitRef = useRef(onCommit);
  useEffect(() => { commitRef.current = onCommit; }, [onCommit]);
  useEffect(() => { setAnchor(null); setExtent(null); drag.current = null; }, [resetKey]);

  const cancel = useCallback(() => {
    setAnchor(null);
    setExtent(null);
    drag.current = null;
  }, []);

  const choose = useCallback((cell: Cell) => {
    if (paused) return;
    if (!anchor) {
      setAnchor(cell);
      setExtent(cell);
      return;
    }
    commitRef.current(rectFromPoints(anchor, cell));
    setAnchor(null);
    setExtent(null);
  }, [anchor, paused]);

  function beginPointer(event: ReactPointerEvent<HTMLElement>, cell: Cell) {
    if (paused) return;
    drag.current = { start: cell, end: cell, moved: false };
    setExtent(cell);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function movePointer(event: ReactPointerEvent<HTMLElement>) {
    if (!drag.current) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>("[data-cell]");
    if (!target) return;
    const [row, col] = (target.dataset.cell || "").split("-").map(Number);
    if (!Number.isInteger(row) || !Number.isInteger(col) || row < 0 || row >= rows || col < 0 || col >= cols) return;
    const next = { row, col };
    if (row !== drag.current.start.row || col !== drag.current.start.col) drag.current.moved = true;
    drag.current.end = next;
    setAnchor(drag.current.start);
    setExtent(next);
  }

  function endPointer(event: ReactPointerEvent<HTMLElement>) {
    const current = drag.current;
    if (!current) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    drag.current = null;
    if (current.moved) {
      commitRef.current(rectFromPoints(current.start, current.end));
      setAnchor(null);
      setExtent(null);
    } else {
      choose(current.start);
    }
  }

  function keyDown(event: ReactKeyboardEvent<HTMLElement>, cell: Cell) {
    if (event.key === "Escape") {
      event.preventDefault();
      cancel();
      return;
    }
    const destination = focusGridCell(event, cell.row, cell.col, rows, cols);
    if (destination && event.shiftKey) {
      setAnchor((value) => value ?? cell);
      setExtent(destination);
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (anchor && extent) {
        commitRef.current(rectFromPoints(anchor, extent));
        cancel();
      } else {
        choose(cell);
      }
    }
  }

  return {
    rect: anchor && extent ? rectFromPoints(anchor, extent) : null,
    cancel,
    cellProps(cell: Cell) {
      return {
        "data-cell": `${cell.row}-${cell.col}`,
        onPointerDown: (event: ReactPointerEvent<HTMLElement>) => beginPointer(event, cell),
        onPointerMove: movePointer,
        onPointerUp: endPointer,
        onPointerCancel: cancel,
        onKeyDown: (event: ReactKeyboardEvent<HTMLElement>) => keyDown(event, cell),
      };
    },
  };
}

function inRect(rect: Rect | null, row: number, col: number) {
  return Boolean(rect && row >= rect.top && row <= rect.bottom && col >= rect.left && col <= rect.right);
}

function SumOrchard(props: PlayableGameProps) {
  const [board, setBoard] = useState(generateSumBoard);
  const [score, setScore] = useState(0);
  const [time, setTime] = useCountdown(90, props.paused, props.resetKey, 0,
    () => props.onEnd(local(props, "Time is up", "时间到")));

  useEffect(() => {
    setBoard(generateSumBoard());
    setScore(0);
    props.onScore(0);
  }, [props.resetKey]);

  const commit = useCallback((rect: Rect) => {
    if (props.paused) return;
    const result = sumRect(board, rect);
    if (result.sum !== 12 || result.count === 0) {
      props.onStatus(gameText("sum-orchard", props.locale, "selectionSum", { sum: result.sum }));
      return;
    }
    const cleared = clearRect(board, rect);
    const total = score + result.count * 2 + (result.count === 1 ? 4 : 0);
    setScore(total);
    props.onScore(total);
    props.sound("score");
    if (!findLegalRects(cleared, 12).length) {
      setBoard(generateSumBoard());
      setTime((value) => value + 5);
      props.onStatus(`${gameText("sum-orchard", props.locale, "newBoard")} · ${gameText("sum-orchard", props.locale, "timeBonus", { seconds: 5 })}`);
    } else {
      setBoard(cleared);
      props.onStatus(local(props, `${result.count} fruit harvested`, `收获了 ${result.count} 个数字果实`));
    }
  }, [board, props, score, setTime]);

  const selection = useRectangleSelection({ rows: 8, cols: 12, paused: props.paused, resetKey: props.resetKey, onCommit: commit });

  return (
    <div className="logic-game garden-game">
      <GardenHud
        target={`${gameText("sum-orchard", props.locale, "targetTotal")}: 12`}
        time={time}
        extra={selection.rect
          ? gameText("sum-orchard", props.locale, "selectionSum", { sum: sumRect(board, selection.rect).sum })
          : local(props, "Drag a rectangle or use Enter and Shift + arrows", "拖出矩形，或使用回车与 Shift + 方向键")}
      />
      <div className="garden-grid sum-grid" role="grid" data-grid aria-label={local(props, "8 by 12 orchard grid", "8 乘 12 数字果园棋盘")}>
        {board.flatMap((row, rowIndex) => row.map((value, colIndex) => {
          const cell = { row: rowIndex, col: colIndex };
          return (
            <button
              role="gridcell"
              key={`${rowIndex}-${colIndex}`}
              className={`${value === null ? "empty" : "fruit-cell"} ${inRect(selection.rect, rowIndex, colIndex) ? "selected" : ""}`}
              aria-label={`${rowIndex + 1}, ${colIndex + 1}: ${value ?? local(props, "empty", "空")}`}
              {...selection.cellProps(cell)}
            >{value}</button>
          );
        }))}
      </div>
      {selection.rect && <button className="logic-secondary" onClick={selection.cancel}>{local(props, "Cancel selection", "取消框选")}</button>}
    </div>
  );
}

function shuffledOccupied(board: NumberGrid, productive: (candidate: NumberGrid) => boolean) {
  const random = createRandom();
  const positions: Cell[] = [];
  const values: number[] = [];
  board.forEach((row, rowIndex) => row.forEach((value, colIndex) => {
    if (value !== null) {
      positions.push({ row: rowIndex, col: colIndex });
      values.push(value);
    }
  }));
  for (let attempt = 0; attempt < 60; attempt += 1) {
    const shuffled = [...values];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swap = random.int(0, index);
      [shuffled[index], shuffled[swap]] = [shuffled[swap], shuffled[index]];
    }
    const candidate = board.map((row) => row.map(() => null as number | null));
    positions.forEach((position, index) => { candidate[position.row][position.col] = shuffled[index]; });
    if (productive(candidate)) return candidate;
  }
  return null;
}

function ColorCross(props: PlayableGameProps) {
  const [board, setBoard] = useState(generateColorCrossBoard);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [shuffleAvailable, setShuffleAvailable] = useState(false);
  const [time, setTime] = useCountdown(90, props.paused, props.resetKey, 0,
    () => props.onEnd(local(props, "Time is up", "时间到")));

  useEffect(() => {
    setBoard(generateColorCrossBoard());
    setScore(0);
    setStreak(0);
    setShuffleAvailable(false);
    props.onScore(0);
  }, [props.resetKey]);

  function choose(row: number, col: number) {
    if (props.paused || board[row][col] !== null) return;
    const evaluation = evaluateCross(board, { row, col });
    if (!evaluation.removed.length) {
      setTime((value) => Math.max(0, value - 4));
      setStreak(0);
      props.sound("fail");
      props.onStatus(gameText("color-cross", props.locale, "miss"));
      return;
    }
    const next = board.map((items) => [...items]);
    evaluation.removed.forEach((cell) => { next[cell.row][cell.col] = null; });
    const nextStreak = streak + 1;
    const dual = Boolean(evaluation.horizontal && evaluation.vertical);
    const points = Math.round((evaluation.removed.length * 3 + (dual ? 8 : 0)) * (nextStreak >= 4 ? 1.5 : 1));
    const total = score + points;
    setBoard(next);
    setScore(total);
    setStreak(nextStreak);
    props.onScore(total);
    props.sound("score");
    props.onStatus(gameText("color-cross", props.locale, "validCross"));
    const remaining = next.flat().filter((value) => value !== null).length;
    if (!remaining) props.onComplete(local(props, "Every symbol cleared", "已清除全部符号"));
    else if (!findAllValidEmptyCells(next).length) setShuffleAvailable(true);
  }

  function shuffleBoard() {
    const next = shuffledOccupied(board, (candidate) => findAllValidEmptyCells(candidate).length > 0)
      ?? generateColorCrossBoard();
    setBoard(next);
    setTime((value) => Math.max(0, value - 6));
    setShuffleAvailable(false);
    props.onStatus(gameText("color-cross", props.locale, "shuffleCost", { seconds: 6 }));
  }

  const tiles = board.flat().filter((value) => value !== null).length;
  return (
    <div className="logic-game garden-game">
      <GardenHud target={gameText("color-cross", props.locale, "validCross")} time={time} extra={`${gameText("color-cross", props.locale, "tilesLeft")}: ${tiles}`} />
      <div className="garden-grid cross-grid" role="grid" data-grid>
        {board.flatMap((row, rowIndex) => row.map((value, colIndex) => (
          <button
            key={`${rowIndex}-${colIndex}`}
            data-cell={`${rowIndex}-${colIndex}`}
            className={value === null ? "cross-empty" : `symbol-${value}`}
            onClick={() => choose(rowIndex, colIndex)}
            onKeyDown={(event) => focusGridCell(event, rowIndex, colIndex, 10, 10)}
            aria-label={`${rowIndex + 1}, ${colIndex + 1}: ${value === null ? local(props, "empty", "空位") : symbols[value]}`}
          >{value === null ? "" : symbols[value]}</button>
        )))}
      </div>
      {shuffleAvailable && <button className="logic-secondary" onClick={shuffleBoard}>{gameText("color-cross", props.locale, "shuffleCost", { seconds: 6 })}</button>}
    </div>
  );
}

function OrbitLines(props: PlayableGameProps) {
  const [board, setBoard] = useState(generateOrbitBoard);
  const [selected, setSelected] = useState<Cell | null>(null);
  const [score, setScore] = useState(0);
  const [reorbitUsed, setReorbitUsed] = useState(false);
  const [reorbitAvailable, setReorbitAvailable] = useState(false);
  const [time, setTime] = useCountdown(110, props.paused, props.resetKey, 0,
    () => props.onEnd(local(props, "Time is up", "时间到")));

  useEffect(() => {
    setBoard(generateOrbitBoard());
    setSelected(null);
    setScore(0);
    setReorbitUsed(false);
    setReorbitAvailable(false);
    props.onScore(0);
  }, [props.resetKey]);

  const destinations = useMemo(() => selected ? legalDestinations(board, selected) : [], [board, selected]);
  const destinationKeys = new Set(destinations.map((cell) => `${cell.row}-${cell.col}`));

  function choose(row: number, col: number) {
    if (props.paused) return;
    if (board[row][col] !== null) {
      setSelected({ row, col });
      props.onStatus(gameText("orbit-lines", props.locale, "selectOrb"));
      return;
    }
    if (!selected || !destinationKeys.has(`${row}-${col}`)) {
      props.onStatus(local(props, "That ray is blocked", "这条直线路径被阻挡"));
      return;
    }
    const next = board.map((items) => [...items]);
    next[row][col] = next[selected.row][selected.col];
    next[selected.row][selected.col] = null;
    const resolution = resolveLines(next, { row, col });
    resolution.removed.forEach((cell) => { next[cell.row][cell.col] = null; });
    const count = resolution.removed.length;
    const points = count ? (count === 3 ? 6 : count === 4 ? 10 : count === 5 ? 16 : count * 4) + (resolution.axes > 1 ? 10 : 0) : 0;
    const total = score + points;
    setBoard(next);
    setSelected(null);
    setScore(total);
    props.onScore(total);
    if (!count) {
      setTime((value) => Math.max(0, value - 3));
      props.sound("move");
      props.onStatus(gameText("orbit-lines", props.locale, "timePenalty", { seconds: 3 }));
    } else {
      props.sound("score");
      props.onStatus(gameText("orbit-lines", props.locale, "productiveMove"));
    }
    if (!findProductiveMoves(next).length && !reorbitUsed) setReorbitAvailable(true);
  }

  function reorbit() {
    const next = shuffledOccupied(board, (candidate) => findProductiveMoves(candidate).length > 0)
      ?? generateOrbitBoard();
    setBoard(next);
    setReorbitUsed(true);
    setReorbitAvailable(false);
    setTime((value) => Math.max(0, value - 8));
    props.onStatus(`${gameText("orbit-lines", props.locale, "reorbit")} · ${gameText("orbit-lines", props.locale, "timePenalty", { seconds: 8 })}`);
  }

  return (
    <div className="logic-game garden-game">
      <GardenHud target={gameText("orbit-lines", props.locale, "productiveMove")} time={time} extra={selected ? local(props, "Choose a highlighted destination", "选择高亮目标格") : gameText("orbit-lines", props.locale, "selectOrb")} />
      <div className="garden-grid orbit-grid" role="grid" data-grid>
        {board.flatMap((row, rowIndex) => row.map((value, colIndex) => (
          <button
            key={`${rowIndex}-${colIndex}`}
            data-cell={`${rowIndex}-${colIndex}`}
            onClick={() => choose(rowIndex, colIndex)}
            onKeyDown={(event) => focusGridCell(event, rowIndex, colIndex, 8, 8)}
            className={`${value === null ? "empty" : `symbol-${value}`} ${selected?.row === rowIndex && selected.col === colIndex ? "selected" : ""} ${destinationKeys.has(`${rowIndex}-${colIndex}`) ? "destination" : ""}`}
            aria-label={`${rowIndex + 1}, ${colIndex + 1}: ${value === null ? local(props, "empty", "空位") : symbols[value]}`}
          >{value === null ? "" : symbols[value]}</button>
        )))}
      </div>
      {reorbitAvailable && <button className="logic-secondary" disabled={reorbitUsed} onClick={reorbit}>{gameText("orbit-lines", props.locale, "reorbit")}</button>}
    </div>
  );
}

function CornerStars(props: PlayableGameProps) {
  const [stars, setStars] = useState(generateCornerStars);
  const [selected, setSelected] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [shuffleCount, setShuffleCount] = useState(0);
  const [time, setTime] = useCountdown(90, props.paused, props.resetKey, 0,
    () => props.onEnd(local(props, "Time is up", "时间到")));

  useEffect(() => {
    setStars(generateCornerStars());
    setSelected([]);
    setScore(0);
    setShuffleCount(0);
    props.onScore(0);
  }, [props.resetKey]);

  function choose(star: Star) {
    const key = `${star.row}-${star.col}`;
    const next = selected.includes(key) ? selected.filter((item) => item !== key) : [...selected, key].slice(-3);
    setSelected(next);
    if (next.length !== 3) return;
    const chosen = next.map((item) => stars.find((candidate) => `${candidate.row}-${candidate.col}` === item)!) as [Star, Star, Star];
    const corner = findRightAngleVertex(chosen, stars);
    if (!corner) {
      const blocked = Boolean(findRightAngleVertex(chosen, chosen));
      props.onStatus(blocked ? gameText("corner-stars", props.locale, "blockedArm") : local(props, "The stars do not form an equal right angle", "这些星点没有组成等臂直角"));
      return;
    }
    const endpoint = chosen.find((item) => item !== corner)!;
    const length = Math.round(Math.hypot(endpoint.row - corner.row, endpoint.col - corner.col));
    const diagonal = endpoint.row !== corner.row && endpoint.col !== corner.col;
    const points = 6 + length * 2 + (diagonal ? 5 : 0);
    const total = score + points;
    const nextStars = stars.map((candidate) => next.includes(`${candidate.row}-${candidate.col}`) ? { ...candidate, active: false } : candidate);
    setStars(nextStars);
    setSelected([]);
    setScore(total);
    props.onScore(total);
    props.sound("score");
    props.onStatus(gameText("corner-stars", props.locale, "validCorner"));
    if (!findValidConstellations(nextStars).length) props.onComplete(local(props, "No constellations remain", "已完成所有可用星座"));
  }

  function shuffleBoard() {
    const cost = shuffleCount < 2 ? 5 : 9;
    const remaining = stars.filter((star) => star.active).length;
    setStars(generateCornerStars().slice(0, remaining));
    setSelected([]);
    setShuffleCount((value) => value + 1);
    setTime((value) => Math.max(0, value - cost));
    props.onStatus(gameText("corner-stars", props.locale, "shuffleCost", { seconds: cost }));
  }

  return (
    <div className="logic-game garden-game">
      <GardenHud target={gameText("corner-stars", props.locale, "validCorner")} time={time} extra={gameText("corner-stars", props.locale, "starsSelected", { count: selected.length })} />
      <div className="star-field" role="grid" data-grid>
        {Array.from({ length: 81 }, (_, index) => {
          const row = Math.floor(index / 9);
          const col = index % 9;
          const star = stars.find((candidate) => candidate.row === row && candidate.col === col && candidate.active);
          return star ? (
            <button
              key={index}
              data-cell={`${row}-${col}`}
              onClick={() => choose(star)}
              onKeyDown={(event) => focusGridCell(event, row, col, 9, 9)}
              className={`star symbol-${star.symbol} ${selected.includes(`${row}-${col}`) ? "selected" : ""}`}
              aria-label={`${local(props, "Star", "星点")} ${row + 1}, ${col + 1}: ${symbols[star.symbol]}`}
            >{symbols[star.symbol]}</button>
          ) : <span key={index} data-cell={`${row}-${col}`} aria-hidden="true" />;
        })}
      </div>
      <button className="logic-secondary" onClick={shuffleBoard}>{gameText("corner-stars", props.locale, "shuffleCost", { seconds: shuffleCount < 2 ? 5 : 9 })}</button>
    </div>
  );
}

function SidefallBlocks(props: PlayableGameProps) {
  const [columns, setColumns] = useState(generateSidefallBoard);
  const [source, setSource] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [time, setTime] = useCountdown(110, props.paused, props.resetKey, 0,
    () => props.onEnd(local(props, "Time is up", "时间到")));

  useEffect(() => {
    setColumns(generateSidefallBoard());
    setSource(null);
    setScore(0);
    props.onScore(0);
  }, [props.resetKey]);

  function choose(column: number) {
    if (props.paused) return;
    if (source === null) {
      if (columns[column].length) setSource(column);
      return;
    }
    const result = resolveSidefallMove(columns, source, column);
    if (!result.ok) {
      if (result.reason === "destination-full") props.onStatus(gameText("sidefall-blocks", props.locale, "destinationFull"));
      setSource(null);
      return;
    }
    const total = score + result.points;
    setColumns(result.columns);
    setSource(null);
    setScore(total);
    props.onScore(total);
    if (!result.points) {
      setTime((value) => Math.max(0, value - 3));
      props.sound("move");
      props.onStatus(gameText("sidefall-blocks", props.locale, "noClear"));
    } else {
      props.sound("score");
      props.onStatus(gameText("sidefall-blocks", props.locale, "chain", { count: result.chains }));
    }
  }

  return (
    <div className="logic-game garden-game">
      <GardenHud target={gameText("sidefall-blocks", props.locale, "chooseTopBlock")} time={time} extra={source === null ? local(props, "Choose a stack", "选择一列") : local(props, "Choose a destination", "选择目标列")} />
      <div className="column-board" role="grid" data-grid>
        {columns.map((column, columnIndex) => (
          <button
            key={columnIndex}
            data-cell={`0-${columnIndex}`}
            onClick={() => choose(columnIndex)}
            onKeyDown={(event) => focusGridCell(event, 0, columnIndex, 1, 8)}
            className={source === columnIndex ? "selected" : ""}
            aria-label={`${local(props, "Column", "列")} ${columnIndex + 1}, ${column.length}/10`}
          >
            {Array.from({ length: 10 }, (_, slot) => {
              const value = column[9 - slot];
              return <i key={slot} className={value === undefined ? "" : `symbol-${value}`}>{value === undefined ? "" : symbols[value]}</i>;
            })}
          </button>
        ))}
      </div>
    </div>
  );
}

function TriadCapture(props: PlayableGameProps) {
  const refill = useRef(createBalancedRefill());
  const [board, setBoard] = useState(generateTriadBoard);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [time] = useCountdown(90, props.paused, props.resetKey, 0,
    () => props.onEnd(local(props, "Time is up", "时间到")));

  useEffect(() => {
    refill.current = createBalancedRefill();
    setBoard(generateTriadBoard());
    setScore(0);
    setCombo(1);
    props.onScore(0);
  }, [props.resetKey]);

  const commit = useCallback((rect: Rect) => {
    const counts = countSymbolsInRect(board, rect);
    if (!isBalancedTriad(counts)) {
      setCombo(1);
      props.onStatus(`${gameText("triad-capture", props.locale, "liveCounts", { a: counts[0], b: counts[1], c: counts[2] })} · ${gameText("triad-capture", props.locale, "comboBroken")}`);
      return;
    }
    const triads = counts[0];
    const base = [0, 6, 16, 30, 48][triads];
    const total = score + Math.round(base * combo);
    setBoard(clearAndCollapse(board, rect, refill.current));
    setScore(total);
    setCombo((value) => Math.min(2.5, value + 0.5));
    props.onScore(total);
    props.sound("score");
    props.onStatus(`${gameText("triad-capture", props.locale, "balanced")} · ${gameText("triad-capture", props.locale, "refilling")}`);
  }, [board, combo, props, score]);

  const selection = useRectangleSelection({ rows: 9, cols: 9, paused: props.paused, resetKey: props.resetKey, onCommit: commit });
  const liveCounts = selection.rect ? countSymbolsInRect(board, selection.rect) : [0, 0, 0];

  return (
    <div className="logic-game garden-game">
      <GardenHud target={gameText("triad-capture", props.locale, "balanced")} time={time} extra={gameText("triad-capture", props.locale, "liveCounts", { a: liveCounts[0], b: liveCounts[1], c: liveCounts[2] })} />
      <div className="garden-grid triad-grid" role="grid" data-grid>
        {board.flatMap((row, rowIndex) => row.map((value, colIndex) => (
          <button
            key={`${rowIndex}-${colIndex}`}
            role="gridcell"
            className={`symbol-${value} ${inRect(selection.rect, rowIndex, colIndex) ? "selected" : ""}`}
            aria-label={`${rowIndex + 1}, ${colIndex + 1}: ${symbols[value!]}`}
            {...selection.cellProps({ row: rowIndex, col: colIndex })}
          >{symbols[value!]}</button>
        )))}
      </div>
    </div>
  );
}

function EchoPath(props: PlayableGameProps) {
  const [board, setBoard] = useState(generateEchoBoard);
  const [path, setPath] = useState<Cell[]>([]);
  const [locked, setLocked] = useState<Set<string>>(new Set());
  const [score, setScore] = useState(0);
  const drawing = useRef(false);
  const [time] = useCountdown(120, props.paused, props.resetKey, 0,
    () => props.onEnd(local(props, "Time is up", "时间到")));

  useEffect(() => {
    setBoard(generateEchoBoard());
    setPath([]);
    setLocked(new Set());
    setScore(0);
    drawing.current = false;
    props.onScore(0);
  }, [props.resetKey]);

  function addCell(cell: Cell) {
    const key = `${cell.row}-${cell.col}`;
    if (locked.has(key)) return;
    if (!path.length) {
      setPath([cell]);
      return;
    }
    const last = path.at(-1)!;
    if (Math.abs(last.row - cell.row) + Math.abs(last.col - cell.col) !== 1 || path.some((item) => item.row === cell.row && item.col === cell.col)) {
      props.onStatus(gameText("echo-path", props.locale, "invalidPath"));
      return;
    }
    setPath([...path, cell]);
  }

  function confirm() {
    const result = validateEchoPath(board, path, locked);
    if (!result.valid) {
      props.onStatus(gameText("echo-path", props.locale, "invalidPath"));
      setPath([]);
      return;
    }
    const nextLocked = new Set(locked);
    path.forEach((cell) => nextLocked.add(`${cell.row}-${cell.col}`));
    const total = score + 4 + Math.max(0, path.length - 3) * 2;
    setLocked(nextLocked);
    setScore(total);
    props.onScore(total);
    props.sound("score");
    props.onStatus(`${gameText("echo-path", props.locale, "pathLocked")} · ${gameText("echo-path", props.locale, "endpointSymbol", { symbol: symbols[result.endpoint] })} · ${gameText("echo-path", props.locale, "interiorSymbol", { symbol: symbols[result.interior] })}`);
    setPath([]);
    if (!findAnyValidPath(board, nextLocked)) props.onComplete(local(props, "No valid path remains", "已没有可用路径"));
  }

  function cellKeyDown(event: ReactKeyboardEvent<HTMLButtonElement>, cell: Cell) {
    const moved = focusGridCell(event, cell.row, cell.col, 10, 10);
    if (moved) return;
    if (event.key === "Backspace") {
      event.preventDefault();
      setPath((current) => current.slice(0, -1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (path.length >= 3) confirm();
      else addCell(cell);
    }
  }

  return (
    <div className="logic-game garden-game">
      <GardenHud target={local(props, "Matching ends, one interior symbol", "端点相同，中间符号统一")} time={time} extra={`${gameText("echo-path", props.locale, "pathLength")}: ${path.length}`} />
      <div className="garden-grid echo-grid" role="grid" data-grid onPointerLeave={() => { drawing.current = false; }}>
        {board.flatMap((row, rowIndex) => row.map((value, colIndex) => {
          const key = `${rowIndex}-${colIndex}`;
          const active = path.some((cell) => cell.row === rowIndex && cell.col === colIndex);
          return (
            <button
              key={key}
              data-cell={key}
              disabled={locked.has(key)}
              className={`symbol-${value} ${active ? "selected" : ""} ${locked.has(key) ? "locked" : ""}`}
              aria-label={`${rowIndex + 1}, ${colIndex + 1}: ${symbols[value]}`}
              onPointerDown={(event) => { drawing.current = true; event.currentTarget.setPointerCapture(event.pointerId); addCell({ row: rowIndex, col: colIndex }); }}
              onPointerEnter={() => { if (drawing.current) addCell({ row: rowIndex, col: colIndex }); }}
              onPointerUp={() => { drawing.current = false; }}
              onKeyDown={(event) => cellKeyDown(event, { row: rowIndex, col: colIndex })}
            >{symbols[value]}</button>
          );
        }))}
      </div>
      <div className="logic-actions">
        <button onClick={() => setPath((current) => current.slice(0, -1))} disabled={!path.length}>{local(props, "Back", "退回一步")}</button>
        <button onClick={() => setPath([])}>{local(props, "Cancel", "取消")}</button>
        <button onClick={confirm} disabled={path.length < 3}>{local(props, "Confirm path", "确认路径")}</button>
      </div>
    </div>
  );
}

function TargetBasket(props: PlayableGameProps) {
  const [round, setRound] = useState(1);
  const [data, setData] = useState<BasketRound>(generateTargetRound);
  const [selected, setSelected] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [time, setTime] = useCountdown(12, props.paused, props.resetKey, round,
    () => props.onEnd(gameText("target-basket", props.locale, "timeUp")));

  useEffect(() => {
    setRound(1);
    setData(generateTargetRound());
    setSelected([]);
    setScore(0);
    setStreak(0);
    props.onScore(0);
  }, [props.resetKey]);

  const choose = useCallback((id: string) => {
    if (props.paused) return;
    if (selected.includes(id)) {
      setSelected(selected.filter((value) => value !== id));
      return;
    }
    const next = [...selected, id];
    setSelected(next);
    if (next.length < 2) return;
    if (!evaluatePair(data, next)) {
      setTime((value) => Math.max(0, value - 2));
      setSelected([]);
      setStreak(0);
      props.sound("fail");
      props.onStatus(gameText("target-basket", props.locale, "incorrect"));
      return;
    }
    const nextStreak = streak + 1;
    const total = score + calculateRoundScore(time, nextStreak);
    setScore(total);
    props.onScore(total);
    props.sound("score");
    props.onStatus(gameText("target-basket", props.locale, "correct"));
    if (round === 12) {
      props.onComplete(local(props, "Twelve baskets complete", "已完成十二个目标篮"));
      return;
    }
    setRound((value) => value + 1);
    setData(generateTargetRound());
    setSelected([]);
    setStreak(nextStreak);
  }, [data, props, round, score, selected, setTime, streak, time]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const index = Number(event.key) - 1;
      if (index >= 0 && index < data.tokens.length) {
        event.preventDefault();
        choose(data.tokens[index].id);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [choose, data.tokens]);

  return (
    <div className="logic-game garden-game basket-game">
      <GardenHud target={`${gameText("target-basket", props.locale, "target")}: ${data.target}`} time={time} extra={gameText("target-basket", props.locale, "roundProgress", { current: round })} />
      <div className="basket-target" aria-hidden="true">Σ <strong>{data.target}</strong></div>
      <div className="number-fruit">
        {data.tokens.map((token, index) => (
          <button key={token.id} className={selected.includes(token.id) ? "selected" : ""} onClick={() => choose(token.id)} aria-label={`${index + 1}: ${token.value}`}>{token.value}</button>
        ))}
      </div>
      <p>{gameText("target-basket", props.locale, "chooseTwo")}</p>
    </div>
  );
}

function MathGridSprint(props: PlayableGameProps) {
  const [mode, setMode] = useState<MathMode | null>(null);
  const [data, setData] = useState(() => buildOperandSet("add"));
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [locked, setLocked] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [activeKey, setActiveKey] = useState("0-0");

  useEffect(() => {
    setMode(null);
    setData(buildOperandSet("add"));
    setAnswers({});
    setLocked(new Set());
    setWrong(0);
    setElapsed(0);
    setActiveKey("0-0");
    props.onScore(0);
  }, [props.resetKey]);

  useEffect(() => {
    if (!mode || props.paused || locked.size === 25) return;
    const id = window.setInterval(() => setElapsed((value) => value + 1), 1000);
    return () => window.clearInterval(id);
  }, [locked.size, mode, props.paused]);

  useEffect(() => {
    props.onScore(mode ? calculateFinalScore(elapsed, wrong) : 0);
  }, [elapsed, mode, props, wrong]);

  function startMode(next: MathMode) {
    if (mode && (locked.size > 0 || Object.keys(answers).some((key) => answers[key])) &&
      !window.confirm(local(props, "Changing mode starts a new run. Continue?", "切换模式会开始新一局，是否继续？"))) return;
    setMode(next);
    setData(buildOperandSet(next));
    setAnswers({});
    setLocked(new Set());
    setWrong(0);
    setElapsed(0);
    setActiveKey("0-0");
  }

  function focusAnswer(cell: Cell) {
    const key = `${cell.row}-${cell.col}`;
    setActiveKey(key);
    document.querySelector<HTMLInputElement>(`.math-grid [data-cell="${key}"]`)?.focus();
  }

  function submit(key: string, row: number, col: number) {
    if (!mode || locked.has(key)) return;
    if (validateCell(mode, data.rows[row], data.cols[col], answers[key] ?? "")) {
      const next = new Set(locked);
      next.add(key);
      setLocked(next);
      props.sound("score");
      props.onStatus(gameText("math-grid-sprint", props.locale, "correct"));
      if (next.size === 25) props.onComplete(local(props, `Grid complete in ${elapsed} seconds`, `用时 ${elapsed} 秒完成方格`));
      else {
        const target = nextIncompleteCell(next, { row, col });
        if (target) queueMicrotask(() => focusAnswer(target));
      }
    } else {
      setWrong((value) => value + 1);
      props.sound("fail");
      props.onStatus(gameText("math-grid-sprint", props.locale, "incorrect"));
    }
  }

  function keypad(value: string) {
    if (!mode) return;
    if (value === "submit") {
      const [row, col] = activeKey.split("-").map(Number);
      submit(activeKey, row, col);
    } else if (value === "backspace") {
      setAnswers((current) => ({ ...current, [activeKey]: (current[activeKey] ?? "").slice(0, -1) }));
    } else {
      setAnswers((current) => ({ ...current, [activeKey]: `${current[activeKey] ?? ""}${value}`.slice(0, 3) }));
    }
  }

  const operation = mode === "add" ? "+" : mode === "subtract" ? "−" : "×";
  return (
    <div className="logic-game garden-game math-game">
      <div className="mode-tabs" role="group" aria-label={local(props, "Math mode", "运算模式")}>
        {(["add", "subtract", "multiply"] as MathMode[]).map((value) => (
          <button key={value} aria-pressed={mode === value} onClick={() => startMode(value)}>
            {gameText("math-grid-sprint", props.locale, value === "add" ? "addition" : value === "subtract" ? "subtraction" : "multiplication")}
          </button>
        ))}
      </div>
      {!mode ? (
        <div className="math-ready" role="status"><strong>{local(props, "Choose a mode to start the timer", "选择一种运算后开始计时")}</strong></div>
      ) : (
        <>
          <GardenHud target={gameText("math-grid-sprint", props.locale, "progress", { correct: locked.size })} time={elapsed} extra={`${local(props, "Score", "分数")}: ${calculateFinalScore(elapsed, wrong)}`} />
          <div className="math-grid" data-grid style={{ gridTemplateColumns: "52px repeat(5,1fr)" }}>
            <span aria-hidden="true">{operation}</span>
            {data.cols.map((value, index) => <b key={`c${index}`}>{value}</b>)}
            {data.rows.flatMap((rowValue, row) => [
              <b key={`r${row}`}>{rowValue}</b>,
              ...data.cols.map((colValue, col) => {
                const key = `${row}-${col}`;
                return (
                  <input
                    key={key}
                    data-cell={key}
                    inputMode="numeric"
                    aria-label={local(props, `Row ${row + 1}: ${rowValue} ${operation} column ${col + 1}: ${colValue}`, `第 ${row + 1} 行：${rowValue} ${operation} 第 ${col + 1} 列：${colValue}`)}
                    value={answers[key] ?? ""}
                    readOnly={locked.has(key)}
                    className={locked.has(key) ? "correct" : ""}
                    onFocus={() => setActiveKey(key)}
                    onChange={(event) => setAnswers((current) => ({ ...current, [key]: event.target.value.replace(/\D/g, "").slice(0, 3) }))}
                    onKeyDown={(event) => {
                      const destination = focusGridCell(event, row, col, 5, 5);
                      if (destination) setActiveKey(`${destination.row}-${destination.col}`);
                      else if (event.key === "Enter") {
                        event.preventDefault();
                        submit(key, row, col);
                      }
                    }}
                  />
                );
              }),
            ])}
          </div>
          <div className="numeric-keypad" aria-label={local(props, "Numeric keypad", "数字键盘")}>
            {Array.from({ length: 10 }, (_, value) => <button key={value} onClick={() => keypad(String(value))}>{value}</button>)}
            <button onClick={() => keypad("backspace")} aria-label={local(props, "Backspace", "退格")}>⌫</button>
            <button onClick={() => keypad("submit")}>{local(props, "Enter", "确认")}</button>
          </div>
        </>
      )}
    </div>
  );
}

function GardenHud({ target, time, extra }: { target: string; time: number; extra: string }) {
  return <div className="garden-hud"><strong>{target}</strong><span>{time}s</span><small>{extra}</small></div>;
}
