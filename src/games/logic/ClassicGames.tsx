"use client";

import { useEffect, useState } from "react";
import type { PlayableGameProps } from "../types";
import { createRandom } from "../random";

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

type BloomPiece = { cells: [number, number][]; color: number; used: boolean };
const bloomShapes: [number, number][][] = [
  [[0,0]], [[0,0],[0,1]], [[0,0],[1,0]], [[0,0],[0,1],[1,0]], [[0,0],[0,1],[0,2]],
  [[0,0],[1,0],[2,0]], [[0,0],[0,1],[1,0],[1,1]], [[0,0],[1,0],[2,0],[2,1]], [[0,0],[0,1],[0,2],[1,1]],
];

export function canPlaceBloom(board: (number | null)[], piece: BloomPiece, row: number, col: number) {
  return piece.cells.every(([dr, dc]) => row + dr < 10 && col + dc < 10 && board[(row + dr) * 10 + col + dc] === null);
}

export function placeBloom(board: (number | null)[], piece: BloomPiece, row: number, col: number) {
  const next = [...board];
  for (const [dr, dc] of piece.cells) next[(row + dr) * 10 + col + dc] = piece.color;
  const rows = Array.from({ length: 10 }, (_, r) => r).filter((r) => next.slice(r * 10, r * 10 + 10).every((cell) => cell !== null));
  const cols = Array.from({ length: 10 }, (_, c) => c).filter((c) => Array.from({ length: 10 }, (_, r) => next[r * 10 + c]).every((cell) => cell !== null));
  for (const r of rows) for (let c = 0; c < 10; c++) next[r * 10 + c] = null;
  for (const c of cols) for (let r = 0; r < 10; r++) next[r * 10 + c] = null;
  return { board: next, lines: rows.length + cols.length };
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

function hasBloomMove(board: (number | null)[], piece: BloomPiece) { for (let row = 0; row < 10; row++) for (let col = 0; col < 10; col++) if (canPlaceBloom(board, piece, row, col)) return true; return false; }

type Matrix = number[][];
export function slideLine(line: number[]) {
  const compact = line.filter(Boolean); const out: number[] = []; let score = 0;
  for (let i = 0; i < compact.length; i++) { if (compact[i] === compact[i + 1]) { const value = compact[i] * 2; out.push(value); score += value; i++; } else out.push(compact[i]); }
  while (out.length < 4) out.push(0); return { line: out, score };
}
function transpose(board: Matrix) { return board[0].map((_, c) => board.map((row) => row[c])); }
export function move2048(board: Matrix, direction: "left" | "right" | "up" | "down") {
  let work = board.map((row) => [...row]);
  if (direction === "up" || direction === "down") work = transpose(work);
  if (direction === "right" || direction === "down") work = work.map((row) => [...row].reverse());
  let score = 0; work = work.map((row) => { const result = slideLine(row); score += result.score; return result.line; });
  if (direction === "right" || direction === "down") work = work.map((row) => [...row].reverse());
  if (direction === "up" || direction === "down") work = transpose(work);
  return { board: work, score, changed: JSON.stringify(work) !== JSON.stringify(board) };
}
function spawn2048(board: Matrix) { const empty: [number, number][] = []; board.forEach((row, r) => row.forEach((value, c) => { if (!value) empty.push([r,c]); })); if (!empty.length) return board; const random = createRandom(); const [r,c] = random.pick(empty); const next = board.map((row) => [...row]); next[r][c] = random.next() < .9 ? 2 : 4; return next; }
function initial2048() { return spawn2048(spawn2048(Array.from({ length: 4 }, () => Array(4).fill(0)))); }
function canMove2048(board: Matrix) { return (["left","right","up","down"] as const).some((direction) => move2048(board, direction).changed); }

function NumberMerge(props: PlayableGameProps) {
  const [board, setBoard] = useState<Matrix>(initial2048); const [score, setScore] = useState(0); const [won, setWon] = useState(false);
  useEffect(() => { setBoard(initial2048()); setScore(0); setWon(false); }, [props.resetKey]);
  function move(direction: "left" | "right" | "up" | "down") { if (props.paused) return; const result = move2048(board, direction); if (!result.changed) { props.onStatus(enText(props.locale, "No tile moved", "没有方块移动")); return; } const next = spawn2048(result.board); const total = score + result.score; setBoard(next); setScore(total); props.onScore(total); props.sound(result.score ? "score" : "move"); if (!won && next.some((row) => row.includes(2048))) { setWon(true); props.onStatus(enText(props.locale, "2048 reached — keep going!", "已合成 2048，可以继续挑战！")); } else if (!canMove2048(next)) props.onEnd(enText(props.locale, "No legal moves remain", "棋盘已没有合法移动")); else props.onStatus(enText(props.locale, `${direction} move`, `向${({left:"左",right:"右",up:"上",down:"下"} as const)[direction]}移动`)); }
  function keys(event: React.KeyboardEvent) { const map: Record<string, "left"|"right"|"up"|"down"> = { ArrowLeft:"left",a:"left",A:"left",ArrowRight:"right",d:"right",D:"right",ArrowUp:"up",w:"up",W:"up",ArrowDown:"down",s:"down",S:"down" }; if (map[event.key]) { event.preventDefault(); move(map[event.key]); } }
  return <div className="logic-game merge-game"><div className="merge-board" tabIndex={0} onKeyDown={keys} role="grid" aria-label={enText(props.locale, "2048 board", "2048 棋盘")}>{board.flatMap((row,r) => row.map((value,c) => <div role="gridcell" key={`${r}-${c}`} className={value ? `tile tile-${Math.min(2048,value)}` : "tile"}>{value || ""}</div>))}</div><div className="direction-pad"><button onClick={() => move("up")} aria-label={enText(props.locale,"Move up","向上移动")}>↑</button><button onClick={() => move("left")} aria-label={enText(props.locale,"Move left","向左移动")}>←</button><button onClick={() => move("down")} aria-label={enText(props.locale,"Move down","向下移动")}>↓</button><button onClick={() => move("right")} aria-label={enText(props.locale,"Move right","向右移动")}>→</button></div></div>;
}

type PourState = { tubes: number[][]; moves: number; history: number[][][]; level: number; complete: boolean };
const pourBase = [[0,1,2,3],[1,2,3,0],[2,3,0,1],[3,0,1,2],[],[]];
function pourLevel(level: number) { const shift = level % 4; return pourBase.map((tube, index) => tube.map((color) => (color + shift + index % 2) % 4)); }
function pourAmount(source: number[], target: number[]) { if (!source.length || target.length >= 4) return 0; const color = source[source.length - 1]; if (target.length && target[target.length - 1] !== color) return 0; let amount = 1; for (let i = source.length - 2; i >= 0 && source[i] === color; i--) amount++; return Math.min(amount, 4 - target.length); }
function pourComplete(tubes: number[][]) { return tubes.every((tube) => !tube.length || (tube.length === 4 && tube.every((color) => color === tube[0]))); }

function ColorPour(props: PlayableGameProps) {
  const init = (level = 0): PourState => ({ tubes: pourLevel(level), moves: 0, history: [], level, complete: false });
  const [state, setState] = useState<PourState>(() => init()); const [selected, setSelected] = useState<number | null>(null);
  useEffect(() => { setState(init()); setSelected(null); props.onScore(0); }, [props.resetKey]);
  function choose(index: number) { if (props.paused || state.complete) return; if (selected === null) { if (state.tubes[index].length) setSelected(index); return; } if (selected === index) { setSelected(null); return; } const amount = pourAmount(state.tubes[selected], state.tubes[index]); if (!amount) { props.onStatus(enText(props.locale,"That pour is not allowed","这次倾倒不符合规则")); setSelected(null); return; } const tubes = state.tubes.map((tube) => [...tube]); const moved = tubes[selected].splice(tubes[selected].length - amount, amount); tubes[index].push(...moved); const complete = pourComplete(tubes); const moves = state.moves + 1; setState({ ...state, tubes, moves, complete, history: [...state.history, state.tubes] }); setSelected(null); props.onScore(moves); props.sound(complete ? "win" : "move"); props.onStatus(complete ? enText(props.locale,"Level complete","关卡完成") : enText(props.locale,"Color poured","颜色已倾倒")); }
  function undo() { const prior = state.history.at(-1); if (!prior) return; setState({ ...state, tubes: prior, moves: Math.max(0,state.moves-1), complete:false, history:state.history.slice(0,-1) }); setSelected(null); props.onScore(Math.max(0,state.moves-1)); }
  return <div className="logic-game pour-game"><div className="logic-hud"><span>{enText(props.locale,"Level","关卡")} {state.level+1}/30</span><span>{enText(props.locale,"Moves","步数")} {state.moves}</span></div><div className="tube-row">{state.tubes.map((tube,index) => <button key={index} className={selected===index?"selected":""} onClick={() => choose(index)} aria-label={`${enText(props.locale,"Tube","试管")} ${index+1}`}><span>{[...Array(4)].map((_,slot) => { const color=tube[slot]; return <i key={slot} className={color===undefined?"":`liquid-${color}`} />; })}</span></button>)}</div><div className="logic-actions"><button onClick={undo} disabled={!state.history.length}>{enText(props.locale,"Undo","撤销")}</button><button onClick={() => { setState(init(state.level)); setSelected(null); }}>{enText(props.locale,"Restart level","重玩关卡")}</button>{state.complete && <button onClick={() => { const level=(state.level+1)%30; setState(init(level)); }}>{enText(props.locale,"Next level","下一关")}</button>}</div></div>;
}

const bubbleColors = [0,1,2,3,4];
type BubbleState = { grid: (number|null)[][]; next: number; shots: number; score: number };
function bubbleInit(): BubbleState { const random=createRandom(); const grid=Array.from({length:8},(_,r)=>Array.from({length:8},()=>r<3?random.pick(bubbleColors):null)); return {grid,next:random.pick(bubbleColors),shots:0,score:0}; }
function bubbleNeighbors(r:number,c:number){return [[r-1,c],[r+1,c],[r,c-1],[r,c+1]].filter(([rr,cc])=>rr>=0&&rr<8&&cc>=0&&cc<8) as [number,number][];}

function BubbleShooter(props: PlayableGameProps) {
  const [state,setState]=useState<BubbleState>(bubbleInit); const [aim,setAim]=useState(3);
  useEffect(()=>{setState(bubbleInit());setAim(3);props.onScore(0);},[props.resetKey]);
  function shoot(){if(props.paused)return; const grid=state.grid.map(row=>[...row]); let row=7; while(row>=0&&grid[row][aim]===null)row--; const target=row+1; if(target>=8){props.onEnd(enText(props.locale,"The bubbles reached the danger line","泡泡越过了危险线"));return;} grid[target][aim]=state.next; const stack:[[number,number]]=[[target,aim]]; const seen=new Set<string>(); const group:[number,number][]=[]; while(stack.length){const [r,c]=stack.pop()!;const key=`${r}-${c}`;if(seen.has(key)||grid[r][c]!==state.next)continue;seen.add(key);group.push([r,c]);for(const n of bubbleNeighbors(r,c))stack.push(n);} let cleared=0; if(group.length>=3){for(const [r,c] of group){grid[r][c]=null;cleared++;} const connected=new Set<string>(); const queue:[number,number][]=[]; for(let c=0;c<8;c++)if(grid[0][c]!==null)queue.push([0,c]); while(queue.length){const [r,c]=queue.shift()!;const key=`${r}-${c}`;if(connected.has(key)||grid[r][c]===null)continue;connected.add(key);for(const n of bubbleNeighbors(r,c))queue.push(n);} for(let r=0;r<8;r++)for(let c=0;c<8;c++)if(grid[r][c]!==null&&!connected.has(`${r}-${c}`)){grid[r][c]=null;cleared+=2;} } const shots=cleared?0:state.shots+1; if(shots>=5){grid.pop();grid.unshift(Array.from({length:8},()=>createRandom().pick(bubbleColors)));} const score=state.score+cleared*10; setState({grid,next:createRandom().pick(bubbleColors),shots:shots>=5?0:shots,score});props.onScore(score);props.sound(cleared?"score":"move");props.onStatus(cleared?enText(props.locale,`${cleared} bubbles cleared`,`${cleared} 个泡泡已消除`):enText(props.locale,"Bubble attached","泡泡已落位"));}
  return <div className="logic-game bubble-game"><div className="logic-hud"><span>{enText(props.locale,"Next","下一个")}: <i className={`bubble bubble-${state.next}`} /></span><span>{enText(props.locale,"Misses before new row","新增一行前的空发")} {state.shots}/5</span></div><div className="bubble-board" role="grid">{state.grid.flatMap((row,r)=>row.map((color,c)=><span role="gridcell" key={`${r}-${c}`} className={color===null?"bubble-empty":`bubble bubble-${color}`} />))}</div><div className="aim-controls"><button onClick={()=>setAim(Math.max(0,aim-1))}>←</button><span>{enText(props.locale,"Column","列")} {aim+1}</span><button onClick={()=>setAim(Math.min(7,aim+1))}>→</button><button className="shoot" onClick={shoot}>{enText(props.locale,"Shoot","发射")}</button></div></div>;
}

type Bolt = { id:string;color:number;removed:boolean };
type Plate = { id:string;bolts:Bolt[];released:boolean };
function boltLevel(level:number):Plate[]{return Array.from({length:4+(level%3)},(_,p)=>({id:`p${p}`,released:false,bolts:Array.from({length:3},(_,b)=>({id:`${p}-${b}`,color:(p+b+level)%4,removed:false}))}));}
function BoltAway(props:PlayableGameProps){const [level,setLevel]=useState(0);const [plates,setPlates]=useState(()=>boltLevel(0));const [slots,setSlots]=useState<number[]>([]);const [moves,setMoves]=useState(0);useEffect(()=>{setLevel(0);setPlates(boltLevel(0));setSlots([]);setMoves(0);props.onScore(0);},[props.resetKey]);function remove(plateIndex:number,boltIndex:number){if(props.paused)return;const bolt=plates[plateIndex].bolts[boltIndex];if(bolt.removed)return;let nextSlots=[...slots,bolt.color];const count=nextSlots.filter(c=>c===bolt.color).length;if(count>=3){let removed=0;nextSlots=nextSlots.filter(c=>{if(c===bolt.color&&removed<3){removed++;return false;}return true;});}const next=plates.map((plate,p)=>p===plateIndex?{...plate,bolts:plate.bolts.map((item,b)=>b===boltIndex?{...item,removed:true}:item)}:plate).map(plate=>({...plate,released:plate.bolts.every(item=>item.removed)}));const nextMoves=moves+1;setPlates(next);setSlots(nextSlots);setMoves(nextMoves);props.onScore(nextMoves);props.sound("move");if(nextSlots.length>=7){props.onEnd(enText(props.locale,"Every holding slot is full","所有暂存槽都已占满"));}else if(next.every(p=>p.released)){props.onStatus(enText(props.locale,"Workshop cleared","所有板件均已释放"));props.sound("win");}else props.onStatus(enText(props.locale,"Bolt moved to a holding slot","螺栓已移入暂存槽"));}function nextLevel(){const value=(level+1)%20;setLevel(value);setPlates(boltLevel(value));setSlots([]);setMoves(0);props.onScore(0);}return <div className="logic-game bolt-game"><div className="logic-hud"><span>{enText(props.locale,"Level","关卡")} {level+1}/20</span><span>{enText(props.locale,"Moves","步数")} {moves}</span></div><div className="bolt-slots" aria-label={enText(props.locale,"Holding slots","暂存槽")}>{Array.from({length:7},(_,i)=><i key={i} className={slots[i]===undefined?"":`bolt-${slots[i]}`}>{slots[i]===undefined?"": "✣"}</i>)}</div><div className="plate-stack">{plates.map((plate,p)=><div key={plate.id} className={plate.released?"plate released":"plate"}><span>{enText(props.locale,"Plate","板件")} {p+1}</span>{plate.bolts.map((bolt,b)=><button key={bolt.id} disabled={bolt.removed} className={`bolt-${bolt.color}`} onClick={()=>remove(p,b)} aria-label={`${enText(props.locale,"Remove bolt","拆下螺栓")} ${p+1}-${b+1}`}>✣</button>)}</div>)}</div>{plates.every(p=>p.released)&&<button className="logic-primary" onClick={nextLevel}>{enText(props.locale,"Next level","下一关")}</button>}</div>}

type Block={id:string;x:number;y:number;length:number;axis:"h"|"v";target?:boolean;color:number};
function unblockLevel(level:number):Block[]{return [{id:"target",x:0,y:2,length:2,axis:"h",target:true,color:0},{id:"a",x:3,y:0,length:3,axis:"v",color:1},{id:"b",x:0,y:4,length:3,axis:"h",color:2},{id:"c",x:5,y:3,length:2,axis:"v",color:3},{id:"d",x:(level%2)+1,y:0,length:2,axis:"v",color:4}];}
function occupied(blocks:Block[],exclude:string){const cells=new Set<string>();for(const block of blocks)if(block.id!==exclude)for(let i=0;i<block.length;i++)cells.add(`${block.y+(block.axis==="v"?i:0)}-${block.x+(block.axis==="h"?i:0)}`);return cells;}
function UnblockPath(props:PlayableGameProps){const [level,setLevel]=useState(0);const [blocks,setBlocks]=useState(()=>unblockLevel(0));const [selected,setSelected]=useState("target");const [moves,setMoves]=useState(0);useEffect(()=>{setLevel(0);setBlocks(unblockLevel(0));setSelected("target");setMoves(0);props.onScore(0);},[props.resetKey]);function move(delta:number){if(props.paused)return;const block=blocks.find(b=>b.id===selected)!;const next={...block,x:block.x+(block.axis==="h"?delta:0),y:block.y+(block.axis==="v"?delta:0)};if(block.target&&delta>0&&block.axis==="h"&&block.x+block.length===6){props.onStatus(enText(props.locale,"Path opened","通道已经打开"));props.sound("win");return;}if(next.x<0||next.y<0||next.x+(next.axis==="h"?next.length:1)>6||next.y+(next.axis==="v"?next.length:1)>6){props.onStatus(enText(props.locale,"The block cannot leave the board","方块不能离开棋盘"));return;}const cells=occupied(blocks,block.id);for(let i=0;i<next.length;i++){const key=`${next.y+(next.axis==="v"?i:0)}-${next.x+(next.axis==="h"?i:0)}`;if(cells.has(key)){props.onStatus(enText(props.locale,"Another block is in the way","移动方向被其他方块阻挡"));return;}}const nextMoves=moves+1;setBlocks(blocks.map(b=>b.id===selected?next:b));setMoves(nextMoves);props.onScore(nextMoves);props.sound("move");}function advance(){const value=(level+1)%30;setLevel(value);setBlocks(unblockLevel(value));setMoves(0);props.onScore(0);}const target=blocks.find(b=>b.target)!;const open=target.x+target.length===6;return <div className="logic-game unblock-game"><div className="logic-hud"><span>{enText(props.locale,"Level","关卡")} {level+1}/30</span><span>{enText(props.locale,"Moves","步数")} {moves}</span></div><div className="unblock-board" role="grid">{blocks.map(block=><button key={block.id} onClick={()=>setSelected(block.id)} className={`${block.target?"target":""} ${selected===block.id?"selected":""} block-${block.color}`} style={{gridColumn:`${block.x+1} / span ${block.axis==="h"?block.length:1}`,gridRow:`${block.y+1} / span ${block.axis==="v"?block.length:1}`}} aria-label={`${enText(props.locale,"Block","方块")} ${block.id}`} />)}<span className="exit" aria-hidden="true">→</span></div><div className="logic-actions"><button onClick={()=>move(-1)}>−</button><button onClick={()=>move(1)}>+</button><button onClick={()=>{setBlocks(unblockLevel(level));setMoves(0);}}>{enText(props.locale,"Restart level","重玩关卡")}</button>{open&&<button onClick={advance}>{enText(props.locale,"Next level","下一关")}</button>}</div></div>}

type Suit="♠"|"♥"|"♦"|"♣";type Card={id:string;suit:Suit;rank:number;faceUp:boolean};type SolitaireState={stock:Card[];waste:Card[];tableau:Card[][];foundations:Record<Suit,Card[]>;moves:number};
const suits:Suit[]=["♠","♥","♦","♣"];const ranks=["","A","2","3","4","5","6","7","8","9","10","J","Q","K"];
function solitaireDeal():SolitaireState{const random=createRandom();const deck=suits.flatMap(suit=>Array.from({length:13},(_,i):Card=>({id:`${suit}-${i+1}`,suit,rank:i+1,faceUp:false})));for(let i=deck.length-1;i>0;i--){const j=random.int(0,i);[deck[i],deck[j]]=[deck[j],deck[i]];}const tableau:Card[][]=[];for(let c=0;c<7;c++){const pile:Card[]=[];for(let r=0;r<=c;r++){const card=deck.pop()!;card.faceUp=r===c;pile.push(card);}tableau.push(pile);}return{stock:deck,waste:[],tableau,foundations:{"♠":[],"♥":[],"♦":[],"♣":[]},moves:0};}
function red(card:Card){return card.suit==="♥"||card.suit==="♦";}
type Selection={source:"waste"|"tableau";pile?:number;index?:number}|null;
function cloneSolitaire(state:SolitaireState):SolitaireState{return{stock:state.stock.map(c=>({...c})),waste:state.waste.map(c=>({...c})),tableau:state.tableau.map(p=>p.map(c=>({...c}))),foundations:Object.fromEntries(suits.map(s=>[s,state.foundations[s].map(c=>({...c}))])) as Record<Suit,Card[]>,moves:state.moves};}

function Solitaire(props:PlayableGameProps){const [state,setState]=useState<SolitaireState>(solitaireDeal);const [selected,setSelected]=useState<Selection>(null);const [history,setHistory]=useState<SolitaireState[]>([]);useEffect(()=>{setState(solitaireDeal());setSelected(null);setHistory([]);props.onScore(0);},[props.resetKey]);function commit(next:SolitaireState,message:string){setHistory(h=>[...h.slice(-19),cloneSolitaire(state)]);next.moves=state.moves+1;setState(next);setSelected(null);props.onScore(next.moves);props.onStatus(message);props.sound("move");if(suits.every(s=>next.foundations[s].length===13))props.onComplete(enText(props.locale,"All four foundations are complete","四组基础牌堆全部完成"));}function draw(){if(props.paused)return;const next=cloneSolitaire(state);if(next.stock.length){const card=next.stock.pop()!;card.faceUp=true;next.waste.push(card);}else{next.stock=next.waste.reverse().map(c=>({...c,faceUp:false}));next.waste=[];}commit(next,enText(props.locale,"Card drawn","已翻一张牌"));}function selectTableau(pile:number,index:number){const card=state.tableau[pile][index];if(!card.faceUp)return;setSelected({source:"tableau",pile,index});}function selectionCards(){if(!selected)return[];if(selected.source==="waste")return state.waste.length?[state.waste.at(-1)!]:[];return state.tableau[selected.pile!].slice(selected.index);}function placeTableau(destination:number){const cards=selectionCards();if(!cards.length)return;const target=state.tableau[destination].at(-1);const first=cards[0];if(target?!(target.faceUp&&target.rank===first.rank+1&&red(target)!==red(first)):first.rank!==13){props.onStatus(enText(props.locale,"That card sequence cannot move there","这组牌不能移动到这里"));return;}const next=cloneSolitaire(state);if(selected!.source==="waste")next.waste.pop();else{next.tableau[selected!.pile!].splice(selected!.index!);const top=next.tableau[selected!.pile!].at(-1);if(top)top.faceUp=true;}next.tableau[destination].push(...cards);commit(next,enText(props.locale,"Cards moved","纸牌已移动"));}function foundation(suit:Suit){const cards=selectionCards();if(cards.length!==1)return;const card=cards[0];const pile=state.foundations[suit];if(card.suit!==suit||card.rank!==pile.length+1){props.onStatus(enText(props.locale,"That card cannot move to the foundation","这张牌不能移到基础牌堆"));return;}const next=cloneSolitaire(state);if(selected!.source==="waste")next.waste.pop();else{next.tableau[selected!.pile!].splice(selected!.index!);const top=next.tableau[selected!.pile!].at(-1);if(top)top.faceUp=true;}next.foundations[suit].push(card);commit(next,enText(props.locale,"Card moved to foundation","纸牌已移到基础牌堆"));}function undo(){const prior=history.at(-1);if(!prior)return;setState(prior);setHistory(h=>h.slice(0,-1));setSelected(null);props.onScore(prior.moves);}return <div className="logic-game solitaire-game"><div className="solitaire-top"><button className="card-back" onClick={draw} aria-label={enText(props.locale,"Draw from stock","从牌库抽牌")}>{state.stock.length}</button><button className="playing-card" onClick={()=>state.waste.length&&setSelected({source:"waste"})}>{state.waste.length?<CardFace card={state.waste.at(-1)!}/>:""}</button><span className="solitaire-gap" />{suits.map(suit=><button key={suit} className="foundation" onClick={()=>foundation(suit)} aria-label={`${suit} ${enText(props.locale,"foundation","基础牌堆")}`}>{state.foundations[suit].length?<CardFace card={state.foundations[suit].at(-1)!}/>:suit}</button>)}</div><div className="tableau">{state.tableau.map((pile,p)=><div key={p} className="tableau-pile" onClick={()=>placeTableau(p)}>{pile.map((card,index)=><button key={card.id} type="button" onClick={(event)=>{event.stopPropagation();selectTableau(p,index);}} className={`${card.faceUp?"playing-card":"card-back"} ${selected?.source==="tableau"&&selected.pile===p&&selected.index===index?"selected":""}`} style={{top:index*26}} aria-label={card.faceUp?`${ranks[card.rank]}${card.suit}`:enText(props.locale,"Face-down card","背面朝上的牌")}>{card.faceUp?<CardFace card={card}/>:""}</button>)}</div>)}</div><div className="logic-actions"><button onClick={undo} disabled={!history.length}>{enText(props.locale,"Undo","撤销")}</button><span>{enText(props.locale,"Moves","步数")} {state.moves}</span></div></div>}
function CardFace({card}:{card:Card}){return <><span className={red(card)?"red":""}>{ranks[card.rank]}{card.suit}</span><b className={red(card)?"red":""}>{card.suit}</b></>}
