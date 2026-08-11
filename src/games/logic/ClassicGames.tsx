"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { PlayableGameProps } from "../types";
import { CanvasLayer } from "../CanvasLayer";
import { createRandom } from "../random";
import {
  BOLT_LEVELS,
  COLOR_POUR_LEVELS,
  UNBLOCK_LEVELS,
  bubbleHexNeighbors,
  boltIsAvailable,
  canMove2048 as matrixCanMove2048,
  canPlaceBloomPiece,
  hasAnyBloomMove,
  insertBoltIntoSlots,
  move2048Matrix,
  moveUnblockPiece,
  placeBloomPiece,
  projectBubbleBankShot,
  pourAmount as getPourAmount,
  pourPuzzleComplete,
  slide2048Line,
  spawn2048Tile,
  unblockComplete,
  type BloomPiece,
  type NumberMatrix,
  type UnblockPiece,
} from "../rules/classic-rules";

const enText = (locale: PlayableGameProps["locale"], en: string, zh: string) => locale === "en" ? en : zh;

export function ClassicGame(props: PlayableGameProps) {
  switch (props.slug) {
    case "block-bloom": return <BlockBloom {...props} />;
    case "number-merge-2048": return <NumberMerge {...props} />;
    case "color-pour": return <ColorPour {...props} />;
    case "bubble-pop-shooter": return <BubbleShooter {...props} />;
    case "bolt-away": return <BoltAway {...props} />;
    case "unblock-path": return <UnblockPath {...props} />;
    case "classic-solitaire": return <Solitaire {...props} />;
    default: return null;
  }
}

const bloomShapes: [number, number][][] = [
  [[0,0]], [[0,0],[0,1]], [[0,0],[1,0]], [[0,0],[0,1],[1,0]], [[0,0],[0,1],[0,2]],
  [[0,0],[1,0],[2,0]], [[0,0],[0,1],[1,0],[1,1]], [[0,0],[1,0],[2,0],[2,1]], [[0,0],[0,1],[0,2],[1,1]],
];

export function canPlaceBloom(board: (number | null)[], piece: BloomPiece, row: number, col: number) {
  return canPlaceBloomPiece(board, piece, row, col);
}

export function placeBloom(board: (number | null)[], piece: BloomPiece, row: number, col: number) {
  const result = placeBloomPiece(board, piece, row, col);
  if (!result) throw new Error("Cannot place a Block Bloom piece at an invalid position.");
  return result;
}

function makeBloomTray() {
  const random = createRandom();
  return Array.from({ length: 3 }, (_, index): BloomPiece => ({ cells: random.pick(bloomShapes), color: (random.int(0, 4) + index) % 5, used: false }));
}

function BlockBloom(props: PlayableGameProps) {
  const [board, setBoard] = useState<(number | null)[]>(() => Array(100).fill(null));
  const [tray, setTray] = useState<BloomPiece[]>(makeBloomTray);
  const [selected, setSelected] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);

  useEffect(() => { setBoard(Array(100).fill(null)); setTray(makeBloomTray()); setSelected(0); setScore(0); setCombo(1); }, [props.resetKey]);

  function place(row: number, col: number) {
    if (props.paused || tray[selected]?.used || !canPlaceBloom(board, tray[selected], row, col)) {
      props.onStatus(enText(props.locale, "That piece does not fit there", "这块图形无法放在这里"));
      return;
    }
    const piece = tray[selected];
    const result = placeBloom(board, piece, row, col);
    const nextScore = score + piece.cells.length + Math.round(result.lines * 10 * (result.lines > 1 ? 1.5 : 1) * combo);
    const nextTray = tray.map((item, index) => index === selected ? { ...item, used: true } : item);
    setBoard(result.board); setScore(nextScore); props.onScore(nextScore); props.sound(result.lines ? "score" : "move");
    setCombo(result.lines ? Math.min(3, combo + .5) : 1);
    props.onStatus(result.lines ? enText(props.locale, `${result.lines} line${result.lines > 1 ? "s" : ""} cleared`, `消除了 ${result.lines} 条完整行列`) : enText(props.locale, "Piece placed", "图形已摆放"));
    if (nextTray.every((item) => item.used)) { const fresh = makeBloomTray(); setTray(fresh); setSelected(0); if (!fresh.some((item) => hasBloomMove(result.board, item))) props.onEnd(enText(props.locale, "No shape can fit", "没有图形可以继续摆放")); }
    else { setTray(nextTray); const nextIndex = nextTray.findIndex((item) => !item.used); setSelected(nextIndex); if (!nextTray.some((item) => !item.used && hasBloomMove(result.board, item))) props.onEnd(enText(props.locale, "No shape can fit", "没有图形可以继续摆放")); }
  }

  return <div className="logic-game bloom-game"><div className="logic-hud"><span>{enText(props.locale, "Combo", "连击")} ×{combo}</span><span>{enText(props.locale, "Select a shape, then a grid cell", "先选图形，再选棋盘位置")}</span></div><div className="bloom-board" role="grid" aria-label={enText(props.locale, "10 by 10 block board", "10 乘 10 方块棋盘")}>{board.map((cell, index) => <button key={index} type="button" role="gridcell" aria-label={`${Math.floor(index / 10) + 1}, ${(index % 10) + 1}`} className={cell === null ? "" : `bloom-${cell}`} onClick={() => place(Math.floor(index / 10), index % 10)} />)}</div><div className="bloom-tray">{tray.map((piece, index) => <button key={index} type="button" className={selected === index ? "selected" : ""} disabled={piece.used} onClick={() => setSelected(index)} aria-label={`${enText(props.locale, "Shape", "图形")} ${index + 1}`}><span className={`piece-preview bloom-${piece.color}`}>{piece.cells.map(([r,c]) => <i key={`${r}-${c}`} style={{ gridRow: r + 1, gridColumn: c + 1 }} />)}</span></button>)}</div></div>;
}

function hasBloomMove(board: (number | null)[], piece: BloomPiece) { return hasAnyBloomMove(board, [piece]); }

type Matrix = NumberMatrix;
export function slideLine(line: number[]) {
  return slide2048Line(line);
}
export function move2048(board: Matrix, direction: "left" | "right" | "up" | "down") {
  return move2048Matrix(board, direction);
}
function spawn2048(board: Matrix) { return spawn2048Tile(board); }
function initial2048() { return spawn2048(spawn2048(Array.from({ length: 4 }, () => Array(4).fill(0)))); }
function canMove2048(board: Matrix) { return matrixCanMove2048(board); }

function NumberMerge(props: PlayableGameProps) {
  const [board, setBoard] = useState<Matrix>(initial2048);
  const [score, setScore] = useState(0);
  const [won, setWon] = useState(false);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  const newGame = () => {
    setBoard(initial2048());
    setScore(0);
    setWon(false);
    swipeStart.current = null;
    props.onScore(0);
  };

  useEffect(() => {
    setBoard(initial2048());
    setScore(0);
    setWon(false);
    swipeStart.current = null;
  }, [props.resetKey]);

  function move(direction: "left" | "right" | "up" | "down") {
    if (props.paused || won) return;
    const result = move2048(board, direction);
    if (!result.changed) {
      props.onStatus(enText(props.locale, "No tile moved", "没有方块移动"));
      return;
    }
    const next = spawn2048(result.board);
    const total = score + result.score;
    setBoard(next);
    setScore(total);
    props.onScore(total);
    props.sound(result.score ? "score" : "move");
    if (next.some((row) => row.includes(2048))) {
      setWon(true);
      props.onStatus(enText(props.locale, "2048 reached — choose Continue or New game", "已合成 2048，请选择继续挑战或新游戏"));
    } else if (!canMove2048(next)) {
      props.onEnd(enText(props.locale, "No legal moves remain", "棋盘已没有合法移动"));
    } else {
      props.onStatus(enText(props.locale, `${direction} move`, `向${({left:"左",right:"右",up:"上",down:"下"} as const)[direction]}移动`));
    }
  }

  function keys(event: React.KeyboardEvent) {
    const map: Record<string, "left" | "right" | "up" | "down"> = {
      ArrowLeft: "left", a: "left", A: "left",
      ArrowRight: "right", d: "right", D: "right",
      ArrowUp: "up", w: "up", W: "up",
      ArrowDown: "down", s: "down", S: "down",
    };
    if (map[event.key]) {
      event.preventDefault();
      move(map[event.key]);
    }
  }

  function endSwipe(event: ReactPointerEvent<HTMLDivElement>) {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;
    const x = event.clientX - start.x;
    const y = event.clientY - start.y;
    if (Math.max(Math.abs(x), Math.abs(y)) < 18) return;
    move(Math.abs(x) > Math.abs(y) ? (x > 0 ? "right" : "left") : (y > 0 ? "down" : "up"));
  }

  return <div className="logic-game merge-game"><div className="merge-board" tabIndex={0} onKeyDown={keys} onPointerDown={(event)=>{swipeStart.current={x:event.clientX,y:event.clientY};event.currentTarget.setPointerCapture(event.pointerId);}} onPointerUp={endSwipe} onPointerCancel={()=>{swipeStart.current=null;}} role="grid" aria-label={enText(props.locale, "2048 board", "2048 棋盘")}>{board.flatMap((row,r) => row.map((value,c) => <div role="gridcell" key={`${r}-${c}`} className={value ? `tile tile-${Math.min(2048,value)}` : "tile"}>{value || ""}</div>))}</div><div className="direction-pad"><button onClick={() => move("up")} aria-label={enText(props.locale,"Move up","向上移动")}>↑</button><button onClick={() => move("left")} aria-label={enText(props.locale,"Move left","向左移动")}>←</button><button onClick={() => move("down")} aria-label={enText(props.locale,"Move down","向下移动")}>↓</button><button onClick={() => move("right")} aria-label={enText(props.locale,"Move right","向右移动")}>→</button></div>{won&&<div className="mini-dialog" role="dialog" aria-label={enText(props.locale,"2048 reached","已合成 2048")}><button type="button" onClick={()=>setWon(false)}>{enText(props.locale,"Continue","继续挑战")}</button><button type="button" onClick={newGame}>{enText(props.locale,"New game","新游戏")}</button></div>}</div>;
}

type PourState = { tubes: number[][]; moves: number; history: number[][][]; level: number; complete: boolean };
function pourLevel(level: number) { return COLOR_POUR_LEVELS[level % COLOR_POUR_LEVELS.length].tubes.map((tube) => [...tube]); }
function pourAmount(source: number[], target: number[]) { return getPourAmount(source, target); }
function pourComplete(tubes: number[][]) { return pourPuzzleComplete(tubes); }

function ColorPour(props: PlayableGameProps) {
  const init = (level = 0): PourState => ({ tubes: pourLevel(level), moves: 0, history: [], level, complete: false });
  const [state, setState] = useState<PourState>(() => init()); const [selected, setSelected] = useState<number | null>(null);
  useEffect(() => { setState(init()); setSelected(null); props.onScore(0); }, [props.resetKey]);
  useEffect(() => { const cancel = (event: KeyboardEvent) => { if (event.key === "Escape") setSelected(null); }; window.addEventListener("keydown", cancel); return () => window.removeEventListener("keydown", cancel); }, []);
  function choose(index: number) { if (props.paused || state.complete) return; if (selected === null) { if (state.tubes[index].length) setSelected(index); return; } if (selected === index) { setSelected(null); return; } const amount = pourAmount(state.tubes[selected], state.tubes[index]); if (!amount) { props.onStatus(enText(props.locale,"That pour is not allowed","这次倾倒不符合规则")); setSelected(null); return; } const tubes = state.tubes.map((tube) => [...tube]); const moved = tubes[selected].splice(tubes[selected].length - amount, amount); tubes[index].push(...moved); const complete = pourComplete(tubes); const moves = state.moves + 1; setState({ ...state, tubes, moves, complete, history: [...state.history, state.tubes] }); setSelected(null); props.onScore(moves); props.sound(complete ? "win" : "move"); props.onStatus(complete ? enText(props.locale,"Level complete","关卡完成") : enText(props.locale,"Color poured","颜色已倾倒")); }
  function undo() { const prior = state.history.at(-1); if (!prior) return; setState({ ...state, tubes: prior, moves: Math.max(0,state.moves-1), complete:false, history:state.history.slice(0,-1) }); setSelected(null); props.onScore(Math.max(0,state.moves-1)); }
  return <div className="logic-game pour-game"><div className="logic-hud"><span>{enText(props.locale,"Level","关卡")} {state.level+1}/30</span><span>{enText(props.locale,"Moves","步数")} {state.moves}</span></div><div className="tube-row">{state.tubes.map((tube,index) => <button key={index} className={selected===index?"selected":""} onClick={() => choose(index)} aria-label={`${enText(props.locale,"Tube","试管")} ${index+1}`}><span>{[...Array(4)].map((_,slot) => { const color=tube[slot]; return <i key={slot} className={color===undefined?"":`liquid-${color}`} />; })}</span></button>)}</div><div className="logic-actions"><button onClick={undo} disabled={!state.history.length}>{enText(props.locale,"Undo","撤销")}</button><button onClick={() => { setState(init(state.level)); setSelected(null); }}>{enText(props.locale,"Restart level","重玩关卡")}</button>{state.complete && <button onClick={() => { const level=(state.level+1)%30; setState(init(level)); }}>{enText(props.locale,"Next level","下一关")}</button>}</div></div>;
}

const bubbleColors = [0,1,2,3,4];
const bubbleSymbols = ["●", "◆", "▲", "■", "✦"];
type BubbleState = { grid: (number|null)[][]; next: number; shots: number; score: number; chain: number };
function bubbleInit(): BubbleState { const random=createRandom(); const grid=Array.from({length:8},(_,r)=>Array.from({length:8},()=>r<3?random.pick(bubbleColors):null)); return {grid,next:random.pick(bubbleColors),shots:0,score:0,chain:0}; }
function bubbleNeighbors(r:number,c:number){return bubbleHexNeighbors(r,c,8,8);}

function BubbleShooter(props: PlayableGameProps) {
  const [state,setState]=useState<BubbleState>(bubbleInit);
  const [aim,setAim]=useState(3);
  const [aimPoint,setAimPoint]=useState({x:3.75,y:4});
  const aiming=useRef(false);
  useEffect(()=>{setState(bubbleInit());setAim(3);setAimPoint({x:3.75,y:4});props.onScore(0);},[props.resetKey]);
  const guide=projectBubbleBankShot({x:4,y:8},{x:aimPoint.x,y:Math.min(7.6,aimPoint.y)});
  function setAimColumn(value:number){const column=Math.max(0,Math.min(7,value));setAim(column);setAimPoint({x:(4+column+.5)/2,y:4});}
  function shoot(column=aim){if(props.paused)return;const grid=state.grid.map(row=>[...row]);let row=7;while(row>=0&&grid[row][column]===null)row--;const target=row+1;if(target>=8){props.onEnd(enText(props.locale,"The bubbles reached the danger line","泡泡越过了危险线"));return;}grid[target][column]=state.next;const stack:[[number,number]]=[[target,column]];const seen=new Set<string>();const group:[number,number][]=[];while(stack.length){const[r,c]=stack.pop()!;const key=`${r}-${c}`;if(seen.has(key)||grid[r][c]!==state.next)continue;seen.add(key);group.push([r,c]);for(const neighbor of bubbleNeighbors(r,c))stack.push(neighbor);}let matched=0,dropped=0;if(group.length>=3){for(const[r,c]of group){grid[r][c]=null;matched++;}const connected=new Set<string>();const queue:[number,number][]=[];for(let c=0;c<8;c++)if(grid[0][c]!==null)queue.push([0,c]);while(queue.length){const[r,c]=queue.shift()!;const key=`${r}-${c}`;if(connected.has(key)||grid[r][c]===null)continue;connected.add(key);for(const neighbor of bubbleNeighbors(r,c))queue.push(neighbor);}for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(grid[r][c]!==null&&!connected.has(`${r}-${c}`)){grid[r][c]=null;dropped++;}}const cleared=matched+dropped;const shots=cleared?0:state.shots+1;if(shots>=5){grid.pop();grid.unshift(Array.from({length:8},()=>createRandom().pick(bubbleColors)));}const chain=cleared?state.chain+1:0;const score=state.score+(matched*10+dropped*20)*Math.max(1,chain);setState({grid,next:createRandom().pick(bubbleColors),shots:shots>=5?0:shots,score,chain});props.onScore(score);props.sound(cleared?"score":"move");props.onStatus(cleared?enText(props.locale,`${matched} matched and ${dropped} dropped`,`${matched} 个匹配消除，${dropped} 个坠落`):shots>=5?enText(props.locale,"Ceiling advanced","顶部已下压"):enText(props.locale,"Bubble attached","泡泡已落位"));}
  function updateAim(event:ReactPointerEvent<HTMLDivElement>){const rect=event.currentTarget.getBoundingClientRect();const point={x:(event.clientX-rect.left)/rect.width*8,y:(event.clientY-rect.top)/rect.height*8};setAimPoint(point);setAim(projectBubbleBankShot({x:4,y:8},point).column);}
  function keys(event:React.KeyboardEvent){if(event.key==="ArrowLeft"){event.preventDefault();setAimColumn(aim-1);}else if(event.key==="ArrowRight"){event.preventDefault();setAimColumn(aim+1);}else if(event.code==="Space"){event.preventDefault();shoot();}}
  const colors=["#7c5cff","#27d3a2","#f7c948","#ff627d","#8ed8ff"];
  return <div className="logic-game bubble-game" tabIndex={0} onKeyDown={keys}><div className="logic-hud"><span>{enText(props.locale,"Next","下一个")}: <i className={`bubble bubble-${state.next}`}>{bubbleSymbols[state.next]}</i></span><span>{enText(props.locale,"Shots until drop","距离下压剩余射击")} {5-state.shots}</span><span>{enText(props.locale,"Chain","连锁")} ×{state.chain}</span></div><div className="bubble-board" role="grid" onPointerDown={event=>{aiming.current=true;event.currentTarget.setPointerCapture(event.pointerId);updateAim(event);}} onPointerMove={event=>{if(aiming.current)updateAim(event);}} onPointerUp={event=>{updateAim(event);aiming.current=false;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);shoot(projectBubbleBankShot({x:4,y:8},{x:(event.clientX-event.currentTarget.getBoundingClientRect().left)/event.currentTarget.getBoundingClientRect().width*8,y:(event.clientY-event.currentTarget.getBoundingClientRect().top)/event.currentTarget.getBoundingClientRect().height*8}).column);}} onPointerCancel={()=>{aiming.current=false;}}><CanvasLayer draw={(context,width,height)=>{const cellW=width/8,cellH=height/8;state.grid.forEach((row,r)=>row.forEach((color,c)=>{if(color===null)return;context.fillStyle=colors[color];context.beginPath();context.arc((c+.5+(r%2)*.16)*cellW,(r+.5)*cellH,Math.min(cellW,cellH)*.39,0,Math.PI*2);context.fill();context.fillStyle="#08101f";context.font=`900 ${Math.max(10,cellW*.28)}px sans-serif`;context.textAlign="center";context.textBaseline="middle";context.fillText(bubbleSymbols[color],(c+.5+(r%2)*.16)*cellW,(r+.5)*cellH);}));context.strokeStyle="#ff627d";context.setLineDash([7,6]);context.beginPath();context.moveTo(0,height*.88);context.lineTo(width,height*.88);context.stroke();context.setLineDash([5,5]);context.strokeStyle="#f8fafc";context.beginPath();guide.points.forEach((point,index)=>{const px=point.x/8*width,py=point.y/8*height;if(index===0)context.moveTo(px,py);else context.lineTo(px,py);});context.stroke();context.setLineDash([]);context.fillStyle=colors[state.next];context.beginPath();context.arc(width/2,height-12,10,0,Math.PI*2);context.fill();}} label={enText(props.locale,"Canvas hex board with one-bounce aim guide","带单次反弹瞄准线的六边形画布棋盘")} />{state.grid.flatMap((row,r)=>row.map((color,c)=><span role="gridcell" key={`${r}-${c}`} className={color===null?"bubble-empty":`bubble bubble-${color}`}>{color===null?"":bubbleSymbols[color]}</span>))}</div><div className="aim-controls"><button onClick={()=>setAimColumn(aim-1)} aria-label={enText(props.locale,"Aim left","向左瞄准")}>←</button><span>{enText(props.locale,"Column","列")} {aim+1}</span><button onClick={()=>setAimColumn(aim+1)} aria-label={enText(props.locale,"Aim right","向右瞄准")}>→</button><button className="shoot" onClick={()=>shoot()}>{enText(props.locale,"Shoot","发射")}</button></div></div>;
}

type Bolt = { id:string;color:number;coveredBy:string[];removed:boolean };
type Plate = { id:string;bolts:Bolt[];released:boolean };
function boltLevel(level:number):Plate[]{return BOLT_LEVELS[level%BOLT_LEVELS.length].plates.map(plate=>({id:plate.id,released:false,bolts:plate.bolts.map(bolt=>({...bolt,removed:false}))}));}
function BoltAway(props:PlayableGameProps){const [level,setLevel]=useState(0);const [plates,setPlates]=useState(()=>boltLevel(0));const [slots,setSlots]=useState<number[]>([]);const [moves,setMoves]=useState(0);useEffect(()=>{setLevel(0);setPlates(boltLevel(0));setSlots([]);setMoves(0);props.onScore(0);},[props.resetKey]);function remove(plateIndex:number,boltIndex:number){if(props.paused)return;const bolt=plates[plateIndex].bolts[boltIndex];const removedIds=new Set(plates.flatMap(plate=>plate.bolts.filter(item=>item.removed).map(item=>item.id)));if(!boltIsAvailable(bolt,removedIds)){props.onStatus(enText(props.locale,"That bolt is still covered","这个螺栓仍被板件遮挡"));return;}const slotResult=insertBoltIntoSlots(slots,bolt.color,7);if(slotResult.failed){props.onEnd(enText(props.locale,"Every holding slot is full","所有暂存槽都已占满"));return;}const next=plates.map((plate,p)=>p===plateIndex?{...plate,bolts:plate.bolts.map((item,b)=>b===boltIndex?{...item,removed:true}:item)}:plate).map(plate=>({...plate,released:plate.bolts.every(item=>item.removed)}));const nextMoves=moves+1;setPlates(next);setSlots(slotResult.slots);setMoves(nextMoves);props.onScore(nextMoves);props.sound(slotResult.cleared?"score":"move");if(next.every(p=>p.released)){props.onStatus(enText(props.locale,"Workshop cleared","所有板件均已释放"));props.sound("win");}else props.onStatus(slotResult.cleared?enText(props.locale,"Three matching bolts cleared","三个同色螺栓已消除"):enText(props.locale,"Bolt moved to a holding slot","螺栓已移入暂存槽"));}function nextLevel(){const value=(level+1)%BOLT_LEVELS.length;setLevel(value);setPlates(boltLevel(value));setSlots([]);setMoves(0);props.onScore(0);}const removedIds=new Set(plates.flatMap(plate=>plate.bolts.filter(item=>item.removed).map(item=>item.id)));return <div className="logic-game bolt-game"><div className="logic-hud"><span>{enText(props.locale,"Level","关卡")} {level+1}/20</span><span>{enText(props.locale,"Moves","步数")} {moves}</span></div><div className="bolt-slots" aria-label={enText(props.locale,"Holding slots","暂存槽")}>{Array.from({length:7},(_,i)=><i key={i} className={slots[i]===undefined?"":`bolt-${slots[i]}`}>{slots[i]===undefined?"": "✣"}</i>)}</div><div className="plate-stack">{plates.map((plate,p)=><div key={plate.id} className={plate.released?"plate released":"plate"}><svg viewBox="0 0 120 100" preserveAspectRatio="none" aria-hidden="true"><polygon points={p%2===0?"8,12 108,5 116,82 18,96":"5,20 98,7 116,68 96,94 10,84"}/>{plate.bolts.map((bolt,b)=><circle key={bolt.id} cx={22+b*38} cy={48+(b%2)*18} r="7"/>)}</svg><span>{enText(props.locale,"Plate","板件")} {p+1}</span>{plate.bolts.map((bolt,b)=><button key={bolt.id} disabled={!boltIsAvailable(bolt,removedIds)} className={`bolt-${bolt.color}`} onClick={()=>remove(p,b)} aria-label={`${enText(props.locale,"Remove bolt","拆下螺栓")} ${p+1}-${b+1}`}>✣</button>)}</div>)}</div>{plates.every(p=>p.released)&&<button className="logic-primary" onClick={nextLevel}>{enText(props.locale,"Next level","下一关")}</button>}</div>}

type Block = UnblockPiece & { color: number };
function unblockLevel(level: number): Block[] {
  return UNBLOCK_LEVELS[level % UNBLOCK_LEVELS.length].map((block, index) => ({
    ...block,
    color: index,
  }));
}
function UnblockPath(props: PlayableGameProps) {
  const [level, setLevel] = useState(0);
  const [blocks, setBlocks] = useState(() => unblockLevel(0));
  const [selected, setSelected] = useState("target");
  const [moves, setMoves] = useState(0);
  const [history, setHistory] = useState<Block[][]>([]);
  const drag = useRef<{ id: string; x: number; y: number } | null>(null);

  useEffect(() => {
    setLevel(0);
    setBlocks(unblockLevel(0));
    setSelected("target");
    setMoves(0);
    setHistory([]);
    props.onScore(0);
  }, [props.resetKey]);

  function move(delta: number, blockId = selected) {
    if (props.paused || unblockComplete(blocks)) return;
    const next = moveUnblockPiece(blocks, blockId, delta) as Block[] | null;
    if (!next) {
      props.onStatus(enText(props.locale, "That block cannot move there", "方块无法移动到那里"));
      return;
    }
    const nextMoves = moves + 1;
    setHistory((current) => [...current.slice(-49), blocks.map((block) => ({ ...block }))]);
    setBlocks(next);
    setMoves(nextMoves);
    props.onScore(nextMoves);
    if (unblockComplete(next)) {
      props.onStatus(enText(props.locale, "Path opened", "通道已经打开"));
      props.sound("win");
    } else {
      props.sound("move");
    }
  }

  function undo() {
    const prior = history.at(-1);
    if (!prior) return;
    setBlocks(prior);
    setHistory((current) => current.slice(0, -1));
    setMoves((current) => Math.max(0, current - 1));
    props.onScore(Math.max(0, moves - 1));
  }

  function restartLevel() {
    setBlocks(unblockLevel(level));
    setSelected("target");
    setMoves(0);
    setHistory([]);
    props.onScore(0);
  }

  function advance() {
    const value = (level + 1) % UNBLOCK_LEVELS.length;
    setLevel(value);
    setBlocks(unblockLevel(value));
    setSelected("target");
    setMoves(0);
    setHistory([]);
    props.onScore(0);
  }

  function handleKey(event: React.KeyboardEvent) {
    const selectedBlock = blocks.find((block) => block.id === selected);
    if (!selectedBlock) return;
    const negative = selectedBlock.axis === "h" ? "ArrowLeft" : "ArrowUp";
    const positive = selectedBlock.axis === "h" ? "ArrowRight" : "ArrowDown";
    if (event.key === negative || event.key === positive) {
      event.preventDefault();
      move(event.key === negative ? -1 : 1);
    }
  }

  function finishDrag(event: ReactPointerEvent<HTMLButtonElement>) {
    const start = drag.current;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!start) return;
    const block = blocks.find((item) => item.id === start.id);
    if (!block) return;
    const distance = block.axis === "h" ? event.clientX - start.x : event.clientY - start.y;
    if (Math.abs(distance) >= 12) move(Math.sign(distance), start.id);
  }

  const open = unblockComplete(blocks);
  return <div className="logic-game unblock-game"><div className="logic-hud"><span>{enText(props.locale,"Level","关卡")} {level+1}/30</span><span>{enText(props.locale,"Moves","步数")} {moves}</span></div><div className="unblock-board" role="grid" tabIndex={0} onKeyDown={handleKey}>{blocks.map(block=><button key={block.id} onClick={()=>setSelected(block.id)} onPointerDown={event=>{setSelected(block.id);drag.current={id:block.id,x:event.clientX,y:event.clientY};event.currentTarget.setPointerCapture(event.pointerId);}} onPointerUp={finishDrag} onPointerCancel={()=>{drag.current=null;}} className={`${block.target?"target":""} ${selected===block.id?"selected":""} block-${block.color}`} style={{gridColumn:`${block.x+1} / span ${block.axis==="h"?block.length:1}`,gridRow:`${block.y+1} / span ${block.axis==="v"?block.length:1}`}} aria-label={`${enText(props.locale,"Block","方块")} ${block.id}`} />)}<span className="exit" aria-hidden="true">→</span></div><div className="logic-actions"><button onClick={()=>move(-1)}>−</button><button onClick={()=>move(1)}>+</button><button onClick={undo} disabled={!history.length}>{enText(props.locale,"Undo","撤销")}</button><button onClick={restartLevel}>{enText(props.locale,"Restart level","重玩关卡")}</button>{open&&<button onClick={advance}>{enText(props.locale,"Next level","下一关")}</button>}</div></div>;
}

type Suit="♠"|"♥"|"♦"|"♣";type Card={id:string;suit:Suit;rank:number;faceUp:boolean};type SolitaireState={stock:Card[];waste:Card[];tableau:Card[][];foundations:Record<Suit,Card[]>;moves:number};
const suits:Suit[]=["♠","♥","♦","♣"];const ranks=["","A","2","3","4","5","6","7","8","9","10","J","Q","K"];
function solitaireDeal():SolitaireState{const random=createRandom();const deck=suits.flatMap(suit=>Array.from({length:13},(_,i):Card=>({id:`${suit}-${i+1}`,suit,rank:i+1,faceUp:false})));for(let i=deck.length-1;i>0;i--){const j=random.int(0,i);[deck[i],deck[j]]=[deck[j],deck[i]];}const tableau:Card[][]=[];for(let c=0;c<7;c++){const pile:Card[]=[];for(let r=0;r<=c;r++){const card=deck.pop()!;card.faceUp=r===c;pile.push(card);}tableau.push(pile);}return{stock:deck,waste:[],tableau,foundations:{"♠":[],"♥":[],"♦":[],"♣":[]},moves:0};}
function red(card:Card){return card.suit==="♥"||card.suit==="♦";}
type Selection={source:"waste"|"tableau";pile?:number;index?:number}|null;
function cloneSolitaire(state:SolitaireState):SolitaireState{return{stock:state.stock.map(c=>({...c})),waste:state.waste.map(c=>({...c})),tableau:state.tableau.map(p=>p.map(c=>({...c}))),foundations:Object.fromEntries(suits.map(s=>[s,state.foundations[s].map(c=>({...c}))])) as Record<Suit,Card[]>,moves:state.moves};}

function Solitaire(props:PlayableGameProps){const [state,setState]=useState<SolitaireState>(solitaireDeal);const [selected,setSelected]=useState<Selection>(null);const [history,setHistory]=useState<SolitaireState[]>([]);useEffect(()=>{setState(solitaireDeal());setSelected(null);setHistory([]);props.onScore(0);},[props.resetKey]);function commit(next:SolitaireState,message:string){setHistory(h=>[...h.slice(-19),cloneSolitaire(state)]);next.moves=state.moves+1;setState(next);setSelected(null);props.onScore(next.moves);props.onStatus(message);props.sound("move");if(suits.every(s=>next.foundations[s].length===13))props.onComplete(enText(props.locale,"All four foundations are complete","四组基础牌堆全部完成"));}function draw(){if(props.paused)return;const next=cloneSolitaire(state);if(next.stock.length){const card=next.stock.pop()!;card.faceUp=true;next.waste.push(card);}else{next.stock=next.waste.reverse().map(c=>({...c,faceUp:false}));next.waste=[];}commit(next,enText(props.locale,"Card drawn","已翻一张牌"));}function selectTableau(pile:number,index:number){const card=state.tableau[pile][index];if(!card.faceUp)return;setSelected({source:"tableau",pile,index});}function selectionCards(){if(!selected)return[];if(selected.source==="waste")return state.waste.length?[state.waste.at(-1)!]:[];return state.tableau[selected.pile!].slice(selected.index);}function placeTableau(destination:number){const cards=selectionCards();if(!cards.length)return;const target=state.tableau[destination].at(-1);const first=cards[0];if(target?!(target.faceUp&&target.rank===first.rank+1&&red(target)!==red(first)):first.rank!==13){props.onStatus(enText(props.locale,"That card sequence cannot move there","这组牌不能移动到这里"));return;}const next=cloneSolitaire(state);if(selected!.source==="waste")next.waste.pop();else{next.tableau[selected!.pile!].splice(selected!.index!);const top=next.tableau[selected!.pile!].at(-1);if(top)top.faceUp=true;}next.tableau[destination].push(...cards);commit(next,enText(props.locale,"Cards moved","纸牌已移动"));}function foundation(suit:Suit){const cards=selectionCards();if(cards.length!==1)return;const card=cards[0];const pile=state.foundations[suit];if(card.suit!==suit||card.rank!==pile.length+1){props.onStatus(enText(props.locale,"That card cannot move to the foundation","这张牌不能移到基础牌堆"));return;}const next=cloneSolitaire(state);if(selected!.source==="waste")next.waste.pop();else{next.tableau[selected!.pile!].splice(selected!.index!);const top=next.tableau[selected!.pile!].at(-1);if(top)top.faceUp=true;}next.foundations[suit].push(card);commit(next,enText(props.locale,"Card moved to foundation","纸牌已移到基础牌堆"));}function undo(){const prior=history.at(-1);if(!prior)return;setState(prior);setHistory(h=>h.slice(0,-1));setSelected(null);props.onScore(prior.moves);}return <div className="logic-game solitaire-game"><div className="solitaire-top"><button className="card-back" onClick={draw} aria-label={enText(props.locale,"Draw from stock","从牌库抽牌")}>{state.stock.length}</button><button className="playing-card" draggable={Boolean(state.waste.length)} onDragStart={()=>state.waste.length&&setSelected({source:"waste"})} onClick={()=>state.waste.length&&setSelected({source:"waste"})} aria-label={enText(props.locale,"Waste pile","废牌堆")}>{state.waste.length?<CardFace card={state.waste.at(-1)!}/>:""}</button><span className="solitaire-gap" />{suits.map(suit=><button key={suit} className="foundation" onClick={()=>foundation(suit)} onDragOver={event=>event.preventDefault()} onDrop={()=>foundation(suit)} aria-label={`${suit} ${enText(props.locale,"foundation","基础牌堆")}`}>{state.foundations[suit].length?<CardFace card={state.foundations[suit].at(-1)!}/>:suit}</button>)}</div><div className="tableau">{state.tableau.map((pile,p)=><div key={p} className="tableau-pile" role="group" tabIndex={0} aria-label={`${enText(props.locale,"Tableau pile","桌面牌列")} ${p+1}`} onKeyDown={event=>{if(event.key==="Enter"||event.key===" "){event.preventDefault();placeTableau(p);}}} onDragOver={event=>event.preventDefault()} onDrop={()=>placeTableau(p)} onClick={()=>placeTableau(p)}>{pile.map((card,index)=><button key={card.id} type="button" draggable={card.faceUp} onDragStart={()=>selectTableau(p,index)} onClick={(event)=>{event.stopPropagation();selectTableau(p,index);}} className={`${card.faceUp?"playing-card":"card-back"} ${selected?.source==="tableau"&&selected.pile===p&&selected.index===index?"selected":""}`} style={{top:index*26}} aria-label={card.faceUp?`${ranks[card.rank]}${card.suit}`:enText(props.locale,"Face-down card","背面朝上的牌")}>{card.faceUp?<CardFace card={card}/>:""}</button>)}</div>)}</div><div className="logic-actions"><button onClick={undo} disabled={!history.length}>{enText(props.locale,"Undo","撤销")}</button><span>{enText(props.locale,"Moves","步数")} {state.moves}</span></div></div>}
function CardFace({card}:{card:Card}){return <><span className={red(card)?"red":""}>{ranks[card.rank]}{card.suit}</span><b className={red(card)?"red":""}>{card.suit}</b></>}
