"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import type { PlayableGameProps } from "../types";
import { CanvasLayer } from "../CanvasLayer";
import { createRandom } from "../random";
import { TRAP_ROOMS, trapPlatformAt } from "../rules/trap-levels";
import {
  calculateStackLanding,
  canUseBufferedJump,
  clampRisingSpeed,
  createSlopeChunk,
  createTunnelRing,
  generateDriftRoad,
  generateHelixTower,
  hazardLaunchIsReadable,
  isDownwardHoopScore,
  isOppositeDirection,
  nextReachableHoopHeight,
  penaltyGesture,
  penaltyMatchDecision,
  pickSnakeFood,
  pointKey,
  resolveHelixCrossing,
  resolvePenaltyChoice,
  segmentCircleIntersects,
  snakeTickDelay,
  slopeChunkCollision,
  slopeLaneForWorldX,
  sweptWaveCollision,
  tunnelRingIsSafe,
  touchesHoopRim,
  updateSlopeMotion,
  type Point,
  type SlopeChunk,
  type StackLayer,
  type TunnelRing,
} from "../rules/arcade-rules";

const copy = (props: PlayableGameProps, en: string, zh: string) => props.locale === "en" ? en : zh;

export default function ArcadeGames(props: PlayableGameProps) {
  switch (props.slug) {
    case "neon-snake": return <NeonSnake {...props} />;
    case "sky-stack": return <SkyStack {...props} />;
    case "zigzag-drift": return <ZigzagDrift {...props} />;
    case "tap-hoops": return <TapHoops {...props} />;
    case "penalty-hero": return <PenaltyHero {...props} />;
    case "slope-dash": return <SlopeDash {...props} />;
    case "helix-drop": return <HelixDrop {...props} />;
    case "tunnel-flux": return <TunnelFlux {...props} />;
    case "wave-rider": return <WaveRider {...props} />;
    case "fruit-slice-rush": return <FruitSliceRush {...props} />;
    case "trap-runner": return <TrapRunner {...props} />;
    default: return <p>{copy(props, "Game unavailable", "游戏暂不可用")}</p>;
  }
}

function useTicker(callback: () => void, delay: number | null, paused: boolean) {
  const callbackRef = useRef(callback);
  useEffect(() => { callbackRef.current = callback; }, [callback]);
  useEffect(() => {
    if (paused || delay === null) return;
    const id = window.setInterval(() => callbackRef.current(), delay);
    return () => window.clearInterval(id);
  }, [delay, paused]);
}

function usePressKeys(keys: Record<string, () => void>, paused: boolean) {
  const keysRef = useRef(keys);
  useEffect(() => { keysRef.current = keys; }, [keys]);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (paused || !keysRef.current[event.key]) return;
      event.preventDefault();
      keysRef.current[event.key]();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paused]);
}

function useHorizontalDrag(onStep: (steps: number) => void, paused: boolean, threshold = 14) {
  const lastX = useRef<number | null>(null);
  return {
    onPointerDown(event: ReactPointerEvent<HTMLElement>) {
      if (paused) return;
      lastX.current = event.clientX;
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove(event: ReactPointerEvent<HTMLElement>) {
      if (paused || lastX.current === null) return;
      const delta = event.clientX - lastX.current;
      const steps = Math.trunc(delta / threshold);
      if (!steps) return;
      onStep(steps);
      lastX.current += steps * threshold;
    },
    onPointerUp(event: ReactPointerEvent<HTMLElement>) {
      lastX.current = null;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    },
    onPointerCancel() {
      lastX.current = null;
    },
  };
}

function newFood(snake: Point[]) {
  return pickSnakeFood(snake) ?? { x: -1, y: -1 };
}

function NeonSnake(props: PlayableGameProps) {
  const initial = () => [{ x: 12, y: 12 }, { x: 11, y: 12 }, { x: 10, y: 12 }];
  const [snake, setSnake] = useState<Point[]>(initial);
  const [food, setFood] = useState<Point>(() => newFood(initial()));
  const direction = useRef<Point>({ x: 1, y: 0 });
  const queued = useRef<Point>({ x: 1, y: 0 });
  const [foods, setFoods] = useState(0);

  useEffect(() => {
    const body = initial();
    setSnake(body); setFood(newFood(body)); setFoods(0); direction.current = { x: 1, y: 0 }; queued.current = { x: 1, y: 0 }; props.onScore(0);
  }, [props.resetKey]);

  const turn = useCallback((x: number, y: number) => {
    if (isOppositeDirection(direction.current, { x, y })) return;
    queued.current = { x, y };
  }, []);
  usePressKeys(useMemo(() => ({ ArrowUp: () => turn(0,-1), w: () => turn(0,-1), W: () => turn(0,-1), ArrowDown: () => turn(0,1), s: () => turn(0,1), S: () => turn(0,1), ArrowLeft: () => turn(-1,0), a: () => turn(-1,0), A: () => turn(-1,0), ArrowRight: () => turn(1,0), d: () => turn(1,0), D: () => turn(1,0) }), [turn]), props.paused);

  useTicker(() => {
    direction.current = queued.current;
    setSnake((current) => {
      const head = { x: current[0].x + direction.current.x, y: current[0].y + direction.current.y };
      const hitWall = head.x < 0 || head.y < 0 || head.x >= 24 || head.y >= 24;
      const ate = head.x === food.x && head.y === food.y;
      const collisionBody = ate ? current : current.slice(0, -1);
      if (hitWall || collisionBody.some((part) => part.x === head.x && part.y === head.y)) {
        queueMicrotask(() => props.onEnd(copy(props, `Snake length ${current.length}`, `小蛇长度 ${current.length}`)));
        return current;
      }
      const next = [head, ...current];
      if (!ate) next.pop();
      else {
        const eaten = foods + 1; setFoods(eaten); setFood(newFood(next)); const score = eaten * 10 + Math.floor(eaten / 5) * 10; props.onScore(score); props.sound("score"); props.onStatus(copy(props, `Food collected — length ${next.length}`, `吃到能量点，长度 ${next.length}`));
      }
      return next;
    });
  }, snakeTickDelay(foods), props.paused);

  const occupied = new Set(snake.map(pointKey));
  const swipe = useRef<Point | null>(null);
  function pointerUp(event: ReactPointerEvent) {
    if (!swipe.current) return;
    const dx = event.clientX - swipe.current.x, dy = event.clientY - swipe.current.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) > 14) {
      if (Math.abs(dx) > Math.abs(dy)) turn(Math.sign(dx), 0);
      else turn(0, Math.sign(dy));
    }
    swipe.current = null;
  }
  return <div className="arcade-game snake-game"><div className="arcade-hud"><span>{copy(props,"Length","长度")} {snake.length}</span><span>{copy(props,"Speed","速度")} {Math.floor(foods/5)+1}</span></div><div className="snake-board" role="grid" tabIndex={0} onPointerDown={(event) => { swipe.current = { x:event.clientX,y:event.clientY }; event.currentTarget.setPointerCapture(event.pointerId); }} onPointerUp={pointerUp}><CanvasLayer draw={(context,width,height)=>{const size=Math.min(width,height)/24;snake.forEach((part,index)=>{context.fillStyle=index===0?"#8ed8ff":"#27d3a2";context.fillRect(part.x*size+1,part.y*size+1,size-2,size-2);});context.fillStyle="#ff627d";context.beginPath();context.arc((food.x+.5)*size,(food.y+.5)*size,size*.34,0,Math.PI*2);context.fill();}} label={copy(props,"Canvas view of the 24 by 24 snake grid","24 乘 24 贪吃蛇网格的画布视图")} />{Array.from({length:576},(_,index)=>{const p={x:index%24,y:Math.floor(index/24)};const isHead=snake[0].x===p.x&&snake[0].y===p.y;return <i key={index} className={isHead?"snake-head":occupied.has(pointKey(p))?"snake-body":food.x===p.x&&food.y===p.y?"snake-food":""}/>;})}</div><DPad props={props} onDirection={turn}/></div>;
}

function DPad({ props, onDirection }: { props: PlayableGameProps; onDirection: (x:number,y:number) => void }) {
  return <div className="arcade-dpad" aria-label={copy(props,"Direction controls","方向控制")}><button onClick={()=>onDirection(0,-1)} aria-label={copy(props,"Up","上")}>↑</button><button onClick={()=>onDirection(-1,0)} aria-label={copy(props,"Left","左")}>←</button><button onClick={()=>onDirection(0,1)} aria-label={copy(props,"Down","下")}>↓</button><button onClick={()=>onDirection(1,0)} aria-label={copy(props,"Right","右")}>→</button></div>;
}

function SkyStack(props: PlayableGameProps) {
  const [layers,setLayers]=useState<StackLayer[]>([{x:20,width:60}]);
  const [moving,setMoving]=useState<StackLayer>({x:0,width:60});
  const [velocity,setVelocity]=useState(1.15);
  const [streak,setStreak]=useState(0);
  useEffect(()=>{setLayers([{x:20,width:60}]);setMoving({x:0,width:60});setVelocity(1.15);setStreak(0);props.onScore(0);},[props.resetKey]);
  useTicker(()=>setMoving(current=>{let x=current.x+velocity;let speed=velocity;if(x<0||x+current.width>100){speed=-velocity;x=Math.max(0,Math.min(100-current.width,x));setVelocity(speed);}return{...current,x};}),16,props.paused);
  const drop=useCallback(()=>{if(props.paused)return;const landing=calculateStackLanding(layers.at(-1)!,moving);if(!landing){props.onEnd(copy(props,`Tower reached ${layers.length-1} layers`,`高塔达到 ${layers.length-1} 层`));return;}const{layer,perfect}=landing;const count=layers.length,total=count+(perfect?streak+1:0);setLayers(items=>[...items,layer]);setMoving({x:velocity>0?0:100-layer.width,width:layer.width});setVelocity(speed=>Math.sign(speed)*(Math.min(2.75,Math.abs(speed)+.08)));setStreak(perfect?value=>value+1:0);props.onScore(total);props.sound(perfect?"score":"move");props.onStatus(perfect?copy(props,"Perfect placement!","完美叠放！"):copy(props,`Layer ${count} placed`,`已放置第 ${count} 层`));},[layers,moving,props,streak,velocity]);
  usePressKeys(useMemo(()=>({" ":drop,Enter:drop}),[drop]),props.paused);
  return <button type="button" className="arcade-game stack-game" onClick={drop} aria-label={copy(props,"Drop moving platform","放下移动平台")}><div className="arcade-hud"><span>{copy(props,"Height","高度")} {layers.length-1}</span><span>{copy(props,"Perfect streak","完美连续")} {streak}</span></div><div className="stack-stage"><CanvasLayer draw={(context,width,height)=>{const visible=layers.slice(-11);visible.forEach((layer,index)=>{const x=layer.x/100*width,blockWidth=layer.width/100*width,bottom=height-index*.07*height;const shade=context.createLinearGradient(x,0,x+blockWidth,0);shade.addColorStop(0,"#7c5cff");shade.addColorStop(1,"#27d3a2");context.fillStyle=shade;context.fillRect(x,bottom-.06*height,blockWidth,.055*height);});context.fillStyle="#f7c948";context.fillRect(moving.x/100*width,height*(1-Math.min(.88,visible.length*.07+.06)),moving.width/100*width,.055*height);}} label={copy(props,"Canvas view of the stacked tower","堆叠高塔的画布视图")} />{layers.slice(-11).map((layer,index)=><i key={index} style={{left:`${layer.x}%`,width:`${layer.width}%`,bottom:`${index*7}%`}}/>)}<i className="moving" style={{left:`${moving.x}%`,width:`${moving.width}%`,bottom:`${Math.min(88,layers.slice(-11).length*7+6)}%`}}/></div><span className="arcade-instruction">{copy(props,"Tap, click, Space or Enter to drop","点击、轻触、空格或回车放下平台")}</span></button>;
}

type DriftState = {
  x: number;
  y: number;
  dx: -1 | 1;
  distance: number;
  stars: number;
  road: Set<string>;
  collectibles: Set<string>;
  tail: Point;
  segment: number;
  readyAt: number;
};

function driftStart(): DriftState {
  const generated = generateDriftRoad();
  const start = generated.centers[1];
  const next = generated.centers[2];
  return {
    x: start.x,
    y: start.y,
    dx: next.x < start.x ? -1 : 1,
    distance: 0,
    stars: 0,
    road: generated.road,
    collectibles: generated.collectibles,
    tail: generated.centers.at(-1)!,
    segment: 1,
    readyAt: Date.now() + 1_800,
  };
}

function ZigzagDrift(props: PlayableGameProps) {
  const [state, setState] = useState<DriftState>(driftStart);
  useEffect(() => {
    setState(driftStart());
    props.onScore(0);
  }, [props.resetKey]);
  const turn = useCallback(() => setState((current) => ({ ...current, dx: current.dx === 1 ? -1 : 1 })), []);
  usePressKeys(useMemo(() => ({ " ": turn, Enter: turn }), [turn]), props.paused);
  useTicker(() => setState((current) => {
    if (Date.now() < current.readyAt) return current;
    const next = { x: current.x + current.dx, y: current.y - 1 };
    if (!current.road.has(pointKey(next))) {
      queueMicrotask(() => props.onEnd(copy(props, `Distance ${current.distance}`, `前进距离 ${current.distance}`)));
      return current;
    }

    let road = current.road;
    let collectibles = new Set(current.collectibles);
    let tail = current.tail;
    let segment = current.segment;
    if (next.y - tail.y < 24) {
      const extension = generateDriftRoad(4105 + segment * 997, 72, { x: tail.x, y: tail.y - 1 });
      road = new Set([...road, ...extension.road]);
      collectibles = new Set([...collectibles, ...extension.collectibles]);
      tail = extension.centers.at(-1)!;
      segment += 1;
    }

    // Recycle cells that have scrolled well behind the visible 12-row board.
    road = new Set([...road].filter((key) => Number(key.slice(key.indexOf("-") + 1)) <= next.y + 18));
    collectibles = new Set([...collectibles].filter((key) => Number(key.slice(key.indexOf("-") + 1)) <= next.y + 18));
    let stars = current.stars;
    if (collectibles.delete(pointKey(next))) {
      stars += 1;
      props.sound("score");
    }
    const distance = current.distance + 1;
    props.onScore(distance + stars * 25);
    return { ...current, ...next, distance, stars, road, collectibles, tail, segment };
  }), 250, props.paused);
  const drawRoad = useCallback((context: CanvasRenderingContext2D, width: number, height: number) => {
    const cellWidth = width / 12;
    const cellHeight = height / 12;
    for (let row = 0; row < 12; row += 1) {
      for (let column = 0; column < 12; column += 1) {
        const worldY = state.y - 10 + row;
        const key = `${column}-${worldY}`;
        if (!state.road.has(key)) continue;
        context.fillStyle = "#35415a";
        context.beginPath();
        context.roundRect(column * cellWidth + 1, row * cellHeight + 1, cellWidth - 2, cellHeight - 2, 3);
        context.fill();
        if (state.collectibles.has(key)) {
          context.fillStyle = "#f7c948";
          context.beginPath();
          context.arc((column + .5) * cellWidth, (row + .5) * cellHeight, Math.min(cellWidth, cellHeight) * .22, 0, Math.PI * 2);
          context.fill();
        }
      }
    }
    context.fillStyle = "#ff627d";
    context.fillRect((state.x + .22) * cellWidth, (10 + .22) * cellHeight, cellWidth * .56, cellHeight * .56);
  }, [state]);
  const cells = Array.from({ length: 144 }, (_, index) => {
    const x = index % 12;
    const y = Math.floor(index / 12);
    const worldY = state.y - 10 + y;
    const key = `${x}-${worldY}`;
    return <i key={index} className={state.x === x && state.y === worldY ? "drift-car" : state.collectibles.has(key) ? "drift-star" : state.road.has(key) ? "drift-road" : ""} />;
  });
  return <button className="arcade-game drift-game" onClick={turn} aria-label={copy(props,"Switch diagonal direction","切换斜线方向")}><div className="arcade-hud"><span>{copy(props,"Distance","距离")} {state.distance}</span><span>★ {state.stars}</span></div><div className="drift-board"><CanvasLayer draw={drawRoad} label={copy(props,"Canvas view of the generated zigzag road","生成之字道路的画布视图")} />{cells}</div><span className="arcade-instruction">{copy(props,"Tap or press Space to switch direction","点击或按空格切换方向")}</span></button>;
}

function TapHoops(props: PlayableGameProps) {
  const [y, setY] = useState(50);
  const [velocity, setVelocity] = useState(0);
  const [hoopX, setHoopX] = useState(72);
  const [hoopY, setHoopY] = useState(50);
  const [points, setPoints] = useState(0);
  const [baskets, setBaskets] = useState(0);
  const [streak, setStreak] = useState(0);
  const [scored, setScored] = useState(false);
  const [rimTouched, setRimTouched] = useState(false);
  const previous = useRef({ x: 18, y: 50 });

  useEffect(() => {
    setY(50);
    setVelocity(0);
    setHoopX(72);
    setHoopY(50);
    setPoints(0);
    setBaskets(0);
    setStreak(0);
    setScored(false);
    setRimTouched(false);
    previous.current = { x: 18, y: 50 };
    props.onScore(0);
  }, [props.resetKey]);

  const flap = useCallback(() => {
    if (props.paused) return;
    setVelocity((current) => Math.max(-0.48, current - 0.3));
    props.sound("move");
  }, [props]);
  usePressKeys(useMemo(() => ({ " ": flap, Enter: flap }), [flap]), props.paused);

  useTicker(() => {
    setVelocity((current) => Math.min(0.48, current + 0.018));
    setY((current) => {
      const next = current + velocity;
      const ball = { x: 18, y: next };
      const hoopCenter = { x: hoopX, y: hoopY };
      if (!scored && touchesHoopRim(ball, hoopCenter)) setRimTouched(true);
      if (!scored && isDownwardHoopScore({ previousBall: previous.current, ball, hoopCenter, innerHalfWidth: 6 })) {
        const clean = !rimTouched;
        const nextStreak = clean ? streak + 1 : 0;
        const nextPoints = points + (clean && streak > 0 ? 2 : 1);
        setPoints(nextPoints);
        setBaskets((currentBaskets) => currentBaskets + 1);
        setStreak(nextStreak);
        props.onScore(nextPoints);
        props.sound("score");
        setScored(true);
        props.onStatus(clean
          ? copy(props, nextStreak > 1 ? "Clean swish — ×2 streak" : "Clean swish", nextStreak > 1 ? "空心命中，连续奖励 ×2" : "空心命中")
          : copy(props, "Basket after rim contact", "擦筐命中"));
      }
      if (next > 93 || next < 3) {
        queueMicrotask(() => props.onEnd(copy(props, `Scored ${baskets} basket${baskets === 1 ? "" : "s"}`, `投进 ${baskets} 球`)));
      }
      previous.current = ball;
      return next;
    });
    setHoopX((current) => {
      const next = current - 0.34;
      if (next >= -8) return next;
      setHoopY((height) => nextReachableHoopHeight(height));
      setScored(false);
      setRimTouched(false);
      return 102;
    });
  }, 16, props.paused);

  return <button className="arcade-game hoops-game" onClick={flap} aria-label={copy(props, "Flap ball upward", "让篮球向上弹")}>
    <div className="arcade-hud">
      <span>{copy(props, "Baskets", "进球")} {baskets}</span>
      <span>{copy(props, "Streak", "连续命中")} ×{streak > 1 ? 2 : 1}</span>
      <span>{copy(props, "Tap to rise", "点击上升")}</span>
    </div>
    <div className="hoops-stage">
      <CanvasLayer draw={(context, width, height) => {
        context.fillStyle = "#e97935";
        context.beginPath();
        context.arc(width * 0.18, height * y / 100, 18, 0, Math.PI * 2);
        context.fill();
        context.strokeStyle = "#ff627d";
        context.lineWidth = 6;
        context.beginPath();
        context.ellipse(width * hoopX / 100, height * hoopY / 100, 28, 9, 0, 0, Math.PI * 2);
        context.stroke();
        context.fillStyle = "#27334d";
        context.fillRect(0, height * 0.93, width, height * 0.07);
      }} label={copy(props, "Canvas view of the ball and moving hoop", "篮球与移动篮筐的画布视图")} />
      <i className="basketball" style={{ top: `${y}%` }} />
      <i className="hoop" style={{ left: `${hoopX}%`, top: `${hoopY}%` }} />
      <span className="floor" />
    </div>
  </button>;
}

const goalZones=["↖","↑","↗","↙","↘"];
function PenaltyHero(props:PlayableGameProps){const[turn,setTurn]=useState(0);const[player,setPlayer]=useState(0);const[ai,setAi]=useState(0);const[last,setLast]=useState<{choice:number;aiChoice:number;success:boolean;role:"shoot"|"save";power:number;height:number}|null>(null);const[aim,setAim]=useState<{dx:number;dy:number}|null>(null);const gestureStart=useRef<Point|null>(null);const role: "shoot"|"save"=turn%2===0?"shoot":"save";const committedAi=useMemo(()=>createRandom(901+turn*43+player*7+ai).int(0,4),[ai,player,turn]);useEffect(()=>{setTurn(0);setPlayer(0);setAi(0);setLast(null);setAim(null);props.onScore(0);},[props.resetKey]);function choose(choice:number,inFrame=true,power=.65,height=.5){if(props.paused)return;const aiChoice=committedAi;const success=inFrame&&resolvePenaltyChoice(role,choice,aiChoice);const nextPlayer=player+(role==="shoot"&&success?1:0);const nextAi=ai+(role==="save"&&!success?1:0);setPlayer(nextPlayer);setAi(nextAi);setLast({choice,aiChoice,success,role,power,height});props.onScore(nextPlayer*100+(role==="save"&&success?50:0));props.sound(success?"score":"move");const nextTurn=turn+1;if(penaltyMatchDecision(nextTurn,nextPlayer,nextAi)==="complete"){props.onComplete(copy(props,`${nextPlayer>nextAi?"Victory":"Defeat"} — ${nextPlayer}:${nextAi}`,`${nextPlayer>nextAi?"获胜":"落败"} — ${nextPlayer}:${nextAi}`));return;}setTurn(nextTurn);props.onStatus(role==="shoot"?(success?copy(props,"Goal!","进球！"):inFrame?copy(props,"Saved by the keeper","被守门员扑出"):copy(props,"Shot missed the frame","射门偏出球门")):(success?copy(props,"Save!","扑救成功！"):copy(props,"The shot went in","对方进球")));}function finishGesture(event:ReactPointerEvent<HTMLButtonElement>){const start=gestureStart.current;gestureStart.current=null;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);if(!start||role!=="shoot")return;const shot=penaltyGesture(event.clientX-start.x,event.clientY-start.y);setAim(null);choose(shot.zone,shot.inFrame,shot.power,shot.height);}
  return <div className="arcade-game penalty-game"><div className="arcade-hud"><span>{copy(props,"You","你")} {player}</span><strong>{turn<10?`${Math.floor(turn/2)+1}/5`:copy(props,"Sudden death","点球决胜")}</strong><span>AI {ai}</span></div><div className="penalty-goal">{goalZones.map((icon,index)=><button key={index} onClick={()=>choose(index)} aria-label={`${role==="shoot"?copy(props,"Shoot","射门"):copy(props,"Dive","扑救")} ${index+1}`} className={last?.choice===index?"chosen":""}>{icon}</button>)}{aim&&<i className="penalty-aim" aria-hidden="true" style={{height:`${Math.min(170,Math.hypot(aim.dx,aim.dy))}px`,transform:`translateX(-50%) rotate(${Math.atan2(aim.dy,aim.dx)*180/Math.PI+90}deg)`}}/>}<button type="button" className="penalty-ball" disabled={role!=="shoot"} aria-label={copy(props,"Drag to aim shot","拖动瞄准射门")} onPointerDown={event=>{gestureStart.current={x:event.clientX,y:event.clientY};setAim({dx:0,dy:-1});event.currentTarget.setPointerCapture(event.pointerId);}} onPointerMove={event=>{if(gestureStart.current)setAim({dx:event.clientX-gestureStart.current.x,dy:event.clientY-gestureStart.current.y});}} onPointerUp={finishGesture} onPointerCancel={()=>{gestureStart.current=null;setAim(null);}}/><i className={`penalty-keeper zone-${last?.aiChoice??committedAi}`}>◆</i></div><p>{role==="shoot"?copy(props,"Drag the ball or choose a zone to shoot","拖动足球或选择区域射门"):copy(props,"Choose a zone to save","选择扑救区域")}{last&&` · ${copy(props,"Power","力量")} ${Math.round(last.power*100)}%`}</p></div>}

function SlopeDash(props: PlayableGameProps) {
  const [motion, setMotion] = useState({ position: 0, velocity: 0 });
  const [distance, setDistance] = useState(0);
  const [coins, setCoins] = useState(0);
  const [chunks, setChunks] = useState<SlopeChunk[]>(() => Array.from({ length: 9 }, (_, id) => createSlopeChunk(id)));
  const lane = slopeLaneForWorldX(motion.position);

  useEffect(() => {
    setMotion({ position: 0, velocity: 0 });
    setDistance(0);
    setCoins(0);
    setChunks(Array.from({ length: 9 }, (_, id) => createSlopeChunk(id)));
    props.onScore(0);
  }, [props.resetKey]);

  const steer = useCallback((delta: number) => {
    setMotion((current) => updateSlopeMotion(current.position, current.velocity, Math.sign(delta)));
  }, []);
  const nudgeLane = useCallback((delta: number) => {
    setMotion((current) => {
      const nextLane = Math.max(0, Math.min(2, slopeLaneForWorldX(current.position) + Math.sign(delta)));
      return { position: [-0.66, 0, 0.66][nextLane], velocity: 0 };
    });
  }, []);
  const drag = useHorizontalDrag(steer, props.paused, 14);
  usePressKeys(useMemo(() => ({
    ArrowLeft: () => steer(-1), a: () => steer(-1), A: () => steer(-1),
    ArrowRight: () => steer(1), d: () => steer(1), D: () => steer(1),
  }), [steer]), props.paused);

  useTicker(() => {
    setMotion((current) => updateSlopeMotion(current.position, current.velocity, 0));
    setChunks((current) => {
      const contact = current[0];
      const collision = slopeChunkCollision(contact, motion.position);
      if (collision) {
        queueMicrotask(() => props.onEnd(collision === "gap"
          ? copy(props, `Fell through a gap at ${distance} metres`, `在 ${distance} 米处掉入缺口`)
          : copy(props, `Barrier hit at ${distance} metres`, `在 ${distance} 米处撞上障碍`)));
        return current;
      }
      let nextCoins = coins;
      if (contact.coinLane === lane) {
        nextCoins += 1;
        setCoins(nextCoins);
        props.sound("score");
      }
      const nextDistance = distance + 8;
      setDistance(nextDistance);
      props.onScore(nextDistance + nextCoins * 20);
      return [...current.slice(1), createSlopeChunk(current.at(-1)!.id + 1)];
    });
  }, clampRisingSpeed(distance), props.paused);

  return <div className="arcade-game slope-game">
    <div className="arcade-hud">
      <span>{copy(props, "Distance", "距离")} {distance}m</span>
      <span>◆ {coins}</span>
      <span>{copy(props, "Speed", "速度")} {Math.floor(distance / 160) + 1}</span>
    </div>
    <div className="slope-track" {...drag}>
      <CanvasLayer draw={(context, width, height) => {
        chunks.forEach((chunk, index) => {
          const near = 1 - index / (chunks.length + 1);
          const rowWidth = width * (0.22 + near * 0.72);
          const rowHeight = Math.max(8, height * (0.025 + near * 0.055));
          const left = (width - rowWidth) / 2;
          const top = height * (0.13 + near * 0.73);
          const laneWidth = rowWidth / 3;
          context.fillStyle = chunk.feature === "ramp" ? "rgba(124,92,255,.72)" : `rgba(82,98,132,${0.3 + near * 0.48})`;
          context.fillRect(left, top, rowWidth, rowHeight);
          [0, 1, 2].forEach((value) => {
            const laneLeft = left + value * laneWidth;
            if (chunk.unsafeLanes.includes(value)) {
              context.fillStyle = chunk.feature === "gap" ? "#07101e" : "#ff627d";
              context.fillRect(laneLeft + laneWidth * 0.1, top, laneWidth * 0.8, rowHeight);
            } else if (chunk.coinLane === value) {
              context.fillStyle = "#f7c948";
              context.beginPath();
              context.arc(laneLeft + laneWidth / 2, top + rowHeight / 2, Math.max(2, rowHeight * 0.23), 0, Math.PI * 2);
              context.fill();
            }
          });
        });
        context.fillStyle = "#27d3a2";
        context.beginPath();
        context.arc(width * (0.5 + motion.position * 0.3), height * 0.88, 13, 0, Math.PI * 2);
        context.fill();
      }} label={copy(props, "Canvas perspective view of the generated slope track", "生成斜坡赛道的画布透视图")} />
      {chunks.map((chunk, index) => <div key={chunk.id} className={`slope-row ${chunk.feature}`} style={{ transform: `perspective(420px) rotateX(58deg) translateZ(${index * 3}px)`, opacity: 0.32 + index * 0.055 }}>
        {[0, 1, 2].map((value) => <i key={value} className={chunk.unsafeLanes.includes(value) ? chunk.feature : chunk.coinLane === value ? "coin" : chunk.feature === "ramp" ? "ramp" : ""} />)}
      </div>)}
      <b className={`slope-ball lane-${lane}`} data-world-x={motion.position.toFixed(3)} style={{ left: `${50 + motion.position * 30}%` }}>●</b>
    </div>
    <div className="wide-controls">
      <button onPointerDown={() => nudgeLane(-1)}>← {copy(props, "Left", "左")}</button>
      <button onPointerDown={() => nudgeLane(1)}>{copy(props, "Right", "右")} →</button>
    </div>
  </div>;
}

function HelixDrop(props:PlayableGameProps){const[level,setLevel]=useState(1);const[index,setIndex]=useState(0);const[angle,setAngle]=useState(0);const[falling,setFalling]=useState(true);const[combo,setCombo]=useState(0);const tower=useMemo(()=>generateHelixTower(level),[level]);useEffect(()=>{setLevel(1);setIndex(0);setAngle(0);setFalling(true);setCombo(0);props.onScore(0);},[props.resetKey]);const rotate=useCallback((delta:number)=>setAngle(value=>(value+delta+12)%12),[]);const drag=useHorizontalDrag(rotate,props.paused,12);usePressKeys(useMemo(()=>({ArrowLeft:()=>rotate(-1),a:()=>rotate(-1),A:()=>rotate(-1),ArrowRight:()=>rotate(1),d:()=>rotate(1),D:()=>rotate(1)}),[rotate]),props.paused);useTicker(()=>{const ring=tower[index];if(!ring)return;const result=resolveHelixCrossing(angle,ring);if(falling){if(result==="gap"){const next=index+1;const nextCombo=combo+1;setIndex(next);setCombo(nextCombo);props.onScore((level-1)*10+next+Math.max(0,nextCombo-1)*2);props.sound("score");if(next>=tower.length){const nextLevel=level+1;setLevel(nextLevel);setIndex(0);setCombo(0);props.onStatus(copy(props,`Tower ${level} complete — tower ${nextLevel}`,`完成第 ${level} 座塔，进入第 ${nextLevel} 座`));}}else if(result==="danger"){props.onEnd(copy(props,`Danger arc on tower ${level}`,`落在第 ${level} 座塔的危险区域`));}else{setFalling(false);setCombo(0);}}else setFalling(true);},420,props.paused);return <div className="arcade-game helix-game"><div className="arcade-hud"><span>{copy(props,"Tower","塔")} {level}</span><span>{copy(props,"Depth","层数")} {index}/{tower.length}</span><span>{copy(props,"Drop combo","连续下落")} ×{combo}</span></div><div className="helix-stage" {...drag}><CanvasLayer draw={(context,width,height)=>{context.strokeStyle="#59647b";context.lineWidth=8;context.beginPath();context.moveTo(width/2,height*.08);context.lineTo(width/2,height*.92);context.stroke();tower.slice(index,index+7).forEach((ring,offset)=>{const y=height*(.3+offset*.08),radius=width*(.18+offset*.008),start=(ring.gap-angle)*Math.PI/6;context.lineWidth=12;context.strokeStyle="#6a54d5";context.beginPath();context.ellipse(width/2,y,radius,radius*.24,0,start+Math.PI/4,start+Math.PI*2-.25);context.stroke();context.strokeStyle="#ff627d";context.beginPath();context.ellipse(width/2,y,radius,radius*.24,0,(ring.danger-angle)*Math.PI/6,(ring.danger-angle+1.3)*Math.PI/6);context.stroke();});context.fillStyle="#f7c948";context.beginPath();context.arc(width/2,height*(falling?.28:.18),11,0,Math.PI*2);context.fill();}} label={copy(props,"Canvas view of the rotating helix tower","旋转螺旋塔的画布视图")} /><i className="helix-column"/><b className={falling?"falling":""}>●</b>{tower.slice(index,index+7).map((ring,offset)=><span key={`${level}-${index+offset}`} className="helix-ring" style={{top:`${30+offset*8}%`,transform:`rotate(${(ring.gap-angle)*30}deg)`,opacity:1-offset*.1}}><i className="gap"/><i className="danger" style={{transform:`rotate(${(ring.danger-ring.gap)*30}deg)`}}/></span>)}</div><div className="wide-controls"><button onPointerDown={()=>rotate(-1)}>↺ {copy(props,"Rotate","旋转")}</button><button onPointerDown={()=>rotate(1)}>{copy(props,"Rotate","旋转")} ↻</button></div></div>}

function TunnelFlux(props:PlayableGameProps){const[angle,setAngle]=useState(0);const[rings,setRings]=useState<TunnelRing[]>(()=>Array.from({length:7},(_,i)=>createTunnelRing(i)));const[passed,setPassed]=useState(0);const[sensitivity,setSensitivity]=useState(1);useEffect(()=>{setAngle(0);setRings(Array.from({length:7},(_,i)=>createTunnelRing(i)));setPassed(0);setSensitivity(1);props.onScore(0);},[props.resetKey]);const rotate=useCallback((delta:number)=>setAngle(value=>(value+delta*sensitivity+12)%12),[sensitivity]);const drag=useHorizontalDrag(rotate,props.paused,14);usePressKeys(useMemo(()=>({ArrowLeft:()=>rotate(-1),a:()=>rotate(-1),A:()=>rotate(-1),ArrowRight:()=>rotate(1),d:()=>rotate(1),D:()=>rotate(1)}),[rotate]),props.paused);useTicker(()=>setRings(current=>{const contact=current[0];if(!tunnelRingIsSafe(angle,contact)){queueMicrotask(()=>props.onEnd(copy(props,`Collision after ${passed} rings`,`通过 ${passed} 个圆环后发生碰撞`)));return current;}const nextPassed=passed+1;setPassed(nextPassed);props.onScore(nextPassed*10);props.sound("score");return[...current.slice(1),createTunnelRing(current.at(-1)!.id+1)].map(ring=>({...ring,gap:(ring.gap+ring.rotation+12)%12}));}),Math.max(310,610-Math.floor(passed/8)*35),props.paused);return <div className="arcade-game tunnel-game"><div className="arcade-hud"><span>{copy(props,"Rings","圆环")} {passed}</span><span>{copy(props,"Tier","速度级别")} {Math.floor(passed/8)+1}</span></div><div className="tunnel-stage" {...drag}><CanvasLayer draw={(context,width,height)=>{const cx=width/2,cy=height/2;rings.slice().reverse().forEach((ring,reverseIndex)=>{const index=rings.length-1-reverseIndex;const radius=Math.min(width,height)*(.14+index*.052);const gapStart=(ring.gap-ring.width/2)*Math.PI/6;const gapEnd=(ring.gap+ring.width/2)*Math.PI/6;context.lineWidth=Math.max(5,12-index*.7);context.strokeStyle=`rgba(83,97,126,${.45+index*.07})`;context.beginPath();context.arc(cx,cy,radius,gapEnd,gapStart+Math.PI*2);context.stroke();});const radians=angle*Math.PI/6;context.fillStyle="#f7c948";context.beginPath();context.arc(cx+Math.sin(radians)*Math.min(width,height)*.38,cy-Math.cos(radians)*Math.min(width,height)*.38,8,0,Math.PI*2);context.fill();}} label={copy(props,"Canvas radial projection of the obstacle tunnel","障碍隧道的画布径向投影")} />{rings.map((ring,index)=><i key={ring.id} style={{inset:`${index*5+7}%`,transform:`rotate(${ring.gap*30}deg)`,opacity:.35+index*.1}}><b style={{width:`${ring.width*8}%`}}/></i>)}<span style={{transform:`rotate(${angle*30}deg)`}}>◆</span></div><label className="sensitivity">{copy(props,"Sensitivity","灵敏度")} <input type="range" min="0.5" max="2" step="0.5" value={sensitivity} onChange={event=>setSensitivity(Number(event.target.value))}/></label><div className="wide-controls"><button onPointerDown={()=>rotate(-1)}>←</button><button onPointerDown={()=>rotate(1)}>→</button></div></div>}

function WaveRider(props: PlayableGameProps) {
  const initialObstacles = () => [
    { x: 80, y: 28, gap: 35 },
    { x: 145, y: 50, gap: 31 },
    { x: 210, y: 35, gap: 28 },
  ];
  const [y, setY] = useState(50);
  const [distance, setDistance] = useState(0);
  const [shards, setShards] = useState(0);
  const [held, setHeld] = useState(false);
  const [obstacles, setObstacles] = useState(initialObstacles);

  useEffect(() => {
    setY(50);
    setDistance(0);
    setShards(0);
    setHeld(false);
    setObstacles(initialObstacles());
    props.onScore(0);
  }, [props.resetKey]);

  useEffect(() => {
    if (props.paused) setHeld(false);
    const down = (event: KeyboardEvent) => {
      if (props.paused || event.code !== "Space") return;
      event.preventDefault();
      setHeld(true);
    };
    const up = (event: KeyboardEvent) => {
      if (event.code === "Space") setHeld(false);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [props.paused]);

  useTicker(() => {
    const nextY = y + (held ? -1.35 : 1.35);
    const nextDistance = distance + 1;
    const nextObstacles = obstacles.map((item) => ({ ...item, x: item.x - 1.15 }));
    const walls = nextObstacles.flatMap((item) => [
      { x: item.x, y: 0, width: 3, height: item.y },
      { x: item.x, y: item.y + item.gap, width: 3, height: 100 - item.y - item.gap },
    ]);
    if (sweptWaveCollision({ x: 18, y }, { x: 18, y: nextY }, { top: 3, bottom: 94 }, walls)) {
      props.onEnd(copy(props, `Wave ended at ${distance} metres`, `波形在 ${distance} 米处结束`));
      return;
    }
    let nextShards = shards;
    if (nextDistance % 75 === 0) {
      nextShards += 1;
      setShards(nextShards);
      props.sound("score");
    }
    setY(nextY);
    setDistance(nextDistance);
    setObstacles(nextObstacles.map((item) => item.x < -5 ? {
      x: 115,
      y: 12 + ((nextDistance + item.y * 3) % 48),
      gap: Math.max(22, 35 - Math.floor(nextDistance / 220) * 2),
    } : item));
    props.onScore(nextDistance + nextShards * 10);
  }, 16, props.paused);

  return <div className="arcade-game wave-game" onPointerDown={event=>{if(props.paused)return;setHeld(true);event.currentTarget.setPointerCapture(event.pointerId);}} onPointerUp={()=>setHeld(false)} onPointerCancel={()=>setHeld(false)} onContextMenu={event=>event.preventDefault()}><div className="arcade-hud"><span>{copy(props,"Distance","距离")} {distance}m</span><span>◇ {shards}</span></div><div className="wave-stage"><CanvasLayer draw={(context,width,height)=>{context.strokeStyle="rgba(142,216,255,.62)";context.lineWidth=3;context.beginPath();context.moveTo(0,height*.5);context.lineTo(width*.18,height*y/100);context.lineTo(width,height*(y+(held?-15:15))/100);context.stroke();obstacles.forEach(item=>{context.fillStyle="#ff627d";context.fillRect(item.x/100*width,0,12,item.y/100*height);context.fillRect(item.x/100*width,(item.y+item.gap)/100*height,12,height);});context.fillStyle="#27d3a2";context.save();context.translate(width*.18,height*y/100);context.rotate(Math.PI/4);context.fillRect(-9,-9,18,18);context.restore();}} label={copy(props,"Canvas view of the wave corridor","波形通道的画布视图")} /><i className="wave-player" style={{top:`${y}%`}}/>{obstacles.map((item,index)=><span key={index} className="wave-wall" style={{left:`${item.x}%`,top:0,height:"100%"}}><b style={{top:`${item.y}%`,height:`${item.gap}%`}}/></span>)}<svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none"><polyline points={`0,50 18,${y} 100,${y+(held?-15:15)}`} /></svg></div><p>{copy(props,"Hold to rise · release to fall","按住上升 · 松开下降")}</p></div>;
}

type Fruit={id:number;x:number;y:number;vy:number;vx:number;kind:number;hazard:boolean;sliced:boolean};
function FruitSliceRush(props: PlayableGameProps) {
  const [fruit, setFruit] = useState<Fruit[]>([]);
  const [misses, setMisses] = useState(0);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [cursor, setCursor] = useState<Point>({ x: 50, y: 50 });
  const active = useRef(false);
  const priorPointer = useRef<Point | null>(null);
  const id = useRef(0);
  const tick = useRef(0);

  useEffect(() => {
    setFruit([]);
    setMisses(0);
    setScore(0);
    setCombo(0);
    setCursor({ x: 50, y: 50 });
    active.current = false;
    priorPointer.current = null;
    id.current = 0;
    tick.current = 0;
    props.onScore(0);
  }, [props.resetKey]);

  const sliceSegment = useCallback((start: Point, end: Point) => {
    setFruit((items) => {
      let cut = 0;
      let hitHazard = false;
      const next = items.map((item) => {
        if (item.sliced || !segmentCircleIntersects(start, end, item, 8)) return item;
        if (item.hazard) {
          hitHazard = true;
          return item;
        }
        cut += 1;
        return { ...item, sliced: true };
      });
      if (hitHazard) {
        queueMicrotask(() => props.onEnd(copy(props, "A hazard orb ended the rush", "切到危险球，挑战结束")));
      } else if (cut) {
        const nextCombo = combo + cut;
        const total = score + cut * 10 + Math.max(0, nextCombo - 1) * 5;
        setCombo(nextCombo);
        setScore(total);
        props.onScore(total);
        props.sound("score");
        props.onStatus(copy(props, `${cut} fruit sliced — combo ×${nextCombo}`, `切中 ${cut} 个水果，连击 ×${nextCombo}`));
      }
      return next;
    });
  }, [combo, props, score]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (props.paused) return;
      const movement: Record<string, Point> = {
        ArrowLeft: { x: -5, y: 0 },
        ArrowRight: { x: 5, y: 0 },
        ArrowUp: { x: 0, y: -5 },
        ArrowDown: { x: 0, y: 5 },
      };
      if (movement[event.key]) {
        event.preventDefault();
        setCursor((value) => ({
          x: Math.max(0, Math.min(100, value.x + movement[event.key].x)),
          y: Math.max(0, Math.min(100, value.y + movement[event.key].y)),
        }));
      }
      if (event.code === "Space") {
        event.preventDefault();
        sliceSegment(cursor, cursor);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [cursor, props.paused, sliceSegment]);

  useTicker(() => {
    tick.current += 1;
    setFruit((items) => {
      let next = items.map((item) => ({
        ...item,
        x: item.x + item.vx,
        y: item.y + item.vy,
        vy: item.vy + 0.045,
      }));
      const escaped = next.filter((item) => item.y > 108 && !item.hazard && !item.sliced).length;
      if (escaped) {
        const nextMisses = misses + escaped;
        setMisses(nextMisses);
        setCombo(0);
        props.sound("fail");
        if (nextMisses >= 3) {
          queueMicrotask(() => props.onEnd(copy(props, `Three fruit missed — score ${score}`, `漏掉三个水果，得分 ${score}`)));
        }
      }
      next = next.filter((item) => item.y < 112 && !item.sliced);
      if (tick.current % 34 === 0) {
        const random = createRandom(5100 + tick.current);
        const wave = tick.current > 240 && tick.current % 102 === 0 ? 3 : 1;
        for (let waveIndex = 0; waveIndex < wave; waveIndex += 1) {
          const x = random.int(18, 82);
          const launch = { x, y: 104 };
          const hazard = tick.current > 100 && random.next() < 0.12 &&
            hazardLaunchIsReadable(launch, next.filter((item) => !item.hazard), 14);
          next.push({
            id: id.current,
            x,
            y: 104,
            vy: -random.int(20, 29) / 10,
            vx: (50 - x) / 180 + (waveIndex - 1) * 0.08,
            kind: random.int(0, 4),
            hazard,
            sliced: false,
          });
          id.current += 1;
        }
      }
      return next.slice(-32);
    });
  }, 16, props.paused);

  const pointInStage = (event: ReactPointerEvent<HTMLDivElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width * 100,
      y: (event.clientY - rect.top) / rect.height * 100,
    };
  };

  const endGesture = () => {
    active.current = false;
    priorPointer.current = null;
    setCombo(0);
  };

  return <div className="arcade-game fruit-game"><div className="arcade-hud"><span>{copy(props,"Misses","漏切")} {misses}/3</span><span>{copy(props,"Combo","连击")} ×{combo}</span></div><div className="fruit-stage" tabIndex={0} onPointerDown={(event)=>{active.current=true;event.currentTarget.setPointerCapture(event.pointerId);const point=pointInStage(event);priorPointer.current=point;sliceSegment(point,point);}} onPointerMove={(event)=>{if(!active.current)return;const point=pointInStage(event);sliceSegment(priorPointer.current??point,point);priorPointer.current=point;}} onPointerUp={endGesture} onPointerCancel={endGesture}><CanvasLayer draw={(context,width,height)=>{const colors=["#ff627d","#f7c948","#27d3a2","#9a6cff","#ff9855"];fruit.forEach(item=>{context.fillStyle=item.hazard?"#151a25":colors[item.kind];context.strokeStyle=item.hazard?"#8a95a9":"rgba(255,255,255,.28)";context.lineWidth=item.hazard?5:2;context.beginPath();context.arc(item.x/100*width,item.y/100*height,item.hazard?18:21,0,Math.PI*2);context.fill();context.stroke();});context.strokeStyle="#fff";context.lineWidth=2;context.beginPath();context.moveTo(cursor.x/100*width-9,cursor.y/100*height);context.lineTo(cursor.x/100*width+9,cursor.y/100*height);context.moveTo(cursor.x/100*width,cursor.y/100*height-9);context.lineTo(cursor.x/100*width,cursor.y/100*height+9);context.stroke();}} label={copy(props,"Canvas view of fruit launch arcs and hazards","水果抛物线与危险球的画布视图")} />{fruit.map(item=><i key={item.id} className={item.hazard?"fruit-hazard":`fruit fruit-${item.kind}`} style={{left:`${item.x}%`,top:`${item.y}%`}} aria-label={item.hazard?copy(props,"Hazard","危险球"):copy(props,"Fruit","水果")}/>)}<b className="focus-cursor" style={{left:`${cursor.x}%`,top:`${cursor.y}%`}}>＋</b></div><p>{copy(props,"Hold and swipe · arrows + Space also work","按住并滑动 · 也可用方向键与空格")}</p></div>;
}

function TrapRunner(props: PlayableGameProps) {
  const [level, setLevel] = useState(1);
  const [x, setX] = useState(6);
  const [y, setY] = useState(76);
  const [vx, setVx] = useState(0);
  const [vy, setVy] = useState(0);
  const [deaths, setDeaths] = useState(0);
  const [held, setHeld] = useState<-1 | 0 | 1>(0);
  const [grounded, setGrounded] = useState(true);
  const [roomTime, setRoomTime] = useState(0);
  const [activeTriggers, setActiveTriggers] = useState<Set<string>>(new Set());
  const lastGrounded = useRef(0);
  const lastJumpPressed = useRef(Number.NEGATIVE_INFINITY);
  const room = TRAP_ROOMS[level - 1];

  useEffect(() => {
    setLevel(1);
    setX(6);
    setY(76);
    setVx(0);
    setVy(0);
    setDeaths(0);
    setHeld(0);
    setGrounded(true);
    setRoomTime(0);
    setActiveTriggers(new Set());
    lastGrounded.current = performance.now();
    lastJumpPressed.current = Number.NEGATIVE_INFINITY;
    props.onScore(0);
  }, [props.resetKey]);

  const jump = useCallback(() => {
    const now = performance.now();
    lastJumpPressed.current = now;
    if (grounded || canUseBufferedJump({ now, lastGrounded: lastGrounded.current, lastJumpPressed: now })) {
      setVy(-1.65);
      setGrounded(false);
      lastJumpPressed.current = Number.NEGATIVE_INFINITY;
      props.sound("move");
    }
  }, [grounded, props]);

  useEffect(() => {
    if (props.paused) setHeld(0);
    const down = (event: KeyboardEvent) => {
      if (props.paused) return;
      if (["ArrowLeft", "a", "A"].includes(event.key)) setHeld(-1);
      if (["ArrowRight", "d", "D"].includes(event.key)) setHeld(1);
      if (["ArrowUp", "w", "W", " "].includes(event.key)) jump();
    };
    const up = (event: KeyboardEvent) => {
      if (["ArrowLeft", "a", "A"].includes(event.key) && held === -1) setHeld(0);
      if (["ArrowRight", "d", "D"].includes(event.key) && held === 1) setHeld(0);
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, [held, jump, props.paused]);

  const die = useCallback(() => {
    setDeaths((value) => value + 1);
    setX(6);
    setY(76);
    setVx(0);
    setVy(0);
    setGrounded(true);
    setRoomTime(0);
    setActiveTriggers(new Set());
    lastGrounded.current = performance.now();
    lastJumpPressed.current = Number.NEGATIVE_INFINITY;
    props.sound("fail");
    props.onStatus(copy(props, "Trap triggered — room restarted", "触发陷阱，重新开始本房间"));
  }, [props]);

  useTicker(() => {
    const nextRoomTime = roomTime + 16;
    const nextVx = (vx + held * 0.1) * 0.82;
    let nextVy = vy + 0.095;
    const nextX = Math.max(0, Math.min(97, x + nextVx));
    let nextY = y + nextVy;
    let landed = false;
    const triggered = new Set(activeTriggers);
    room.triggers.forEach((trigger) => {
      if (nextX + 4 > trigger.x && nextX < trigger.x + trigger.width && !triggered.has(trigger.id)) {
        triggered.add(trigger.id);
        props.onStatus(copy(props, "A marked trap changed the room", "标记陷阱改变了房间"));
      }
    });
    if (triggered.size !== activeTriggers.size) setActiveTriggers(triggered);
    const droppedTargets = new Set(room.triggers.filter((trigger) => triggered.has(trigger.id) && trigger.action.kind === "drop-platform").map((trigger) => trigger.action.target));
    for (const definition of room.platforms) {
      const platform = trapPlatformAt(definition, nextRoomTime, droppedTargets.has(definition.id));
      if (vy >= 0 && y + 6 <= platform.y && nextY + 6 >= platform.y && nextX + 4 > platform.x && nextX < platform.x + platform.width) {
        nextY = platform.y - 6;
        landed = true;
      }
    }
    const now = performance.now();
    if (landed) {
      lastGrounded.current = now;
      if (canUseBufferedJump({ now, lastGrounded: now, lastJumpPressed: lastJumpPressed.current })) {
        landed = false;
        nextVy = -1.65;
        lastJumpPressed.current = Number.NEGATIVE_INFINITY;
        props.sound("move");
      }
    }
    if (room.hazards.some((hazard) => (!hazard.trigger || triggered.has(hazard.trigger)) && nextX + 4 > hazard.x && nextX < hazard.x + hazard.width && nextY + 6 > hazard.y) || nextY > 103) {
      die();
      return;
    }
    if (nextX >= room.exit) {
      if (level >= 15) {
        props.onComplete(copy(props, `All 15 rooms escaped with ${deaths} deaths`, `逃出全部 15 个房间，死亡 ${deaths} 次`));
        return;
      }
      setLevel((value) => value + 1);
      setX(6);
      setY(76);
      setVx(0);
      setVy(0);
      setGrounded(true);
      setRoomTime(0);
      setActiveTriggers(new Set());
      lastGrounded.current = now;
      lastJumpPressed.current = Number.NEGATIVE_INFINITY;
      props.onScore(level);
      props.sound("win");
      return;
    }
    setVx(nextVx);
    setVy(landed ? 0 : nextVy);
    setGrounded(landed);
    setRoomTime(nextRoomTime);
    setX(nextX);
    setY(nextY);
  }, 16, props.paused);

  const releaseDirection = () => setHeld(0);
  const droppedTargets = new Set(room.triggers.filter((trigger) => activeTriggers.has(trigger.id) && trigger.action.kind === "drop-platform").map((trigger) => trigger.action.target));
  const renderedPlatforms = room.platforms.map((platform) => trapPlatformAt(platform, roomTime, droppedTargets.has(platform.id)));
  const debug = process.env.NEXT_PUBLIC_GAME_DEBUG === "1";
  return <div className="arcade-game trap-game"><div className="arcade-hud"><span>{copy(props,"Room","房间")} {level}/15</span><span>{copy(props,"Deaths","死亡")} {deaths}</span><span>{copy(props,"Time","用时")} {Math.floor(roomTime/1000)}s</span></div><div className={`trap-stage${debug?" debug-hitboxes":""}`}><CanvasLayer draw={(context,width,height)=>{renderedPlatforms.forEach(platform=>{context.fillStyle=platform.motion?"#8ed8ff":"#596782";context.fillRect(platform.x/100*width,platform.y/100*height,platform.width/100*width,10);});room.triggers.forEach(trigger=>{context.fillStyle=activeTriggers.has(trigger.id)?"rgba(255,98,125,.5)":"rgba(247,201,72,.25)";context.fillRect(trigger.x/100*width,.78*height,trigger.width/100*width,.06*height);});room.hazards.forEach(hazard=>{if(hazard.trigger&&!activeTriggers.has(hazard.trigger))context.globalAlpha=.28;context.fillStyle="#ff627d";context.beginPath();context.moveTo(hazard.x/100*width,(hazard.y+4)/100*height);context.lineTo((hazard.x+hazard.width/2)/100*width,hazard.y/100*height);context.lineTo((hazard.x+hazard.width)/100*width,(hazard.y+4)/100*height);context.fill();context.globalAlpha=1;});context.fillStyle="#27d3a2";context.fillRect(x/100*width,y/100*height,16,16);context.fillStyle="#f7c948";context.fillRect(room.exit/100*width,.62*height,3,.22*height);}} label={copy(props,"Canvas tile view of the current trap room","当前陷阱房间的画布地图")} />{renderedPlatforms.map(p=><i key={p.id} className={`trap-platform${p.motion?" moving":""}${droppedTargets.has(p.id)?" dropped":""}`} style={{left:`${p.x}%`,top:`${p.y}%`,width:`${p.width}%`}}/>)}{room.triggers.map(trigger=><span key={trigger.id} className={activeTriggers.has(trigger.id)?"trap-trigger active":"trap-trigger"} style={{left:`${trigger.x}%`,width:`${trigger.width}%`}} aria-hidden="true"/>)}{room.hazards.map(h=><i key={h.id} className={`trap-hazard${h.trigger&&!activeTriggers.has(h.trigger)?" dormant":""}`} style={{left:`${h.x}%`,top:`${h.y}%`,width:`${h.width}%`}}>▲▲</i>)}<b className="trap-player" style={{left:`${x}%`,top:`${y}%`}}>◆</b><span className="trap-exit">EXIT</span></div><div className="three-controls"><button onPointerDown={()=>setHeld(-1)} onPointerUp={releaseDirection} onPointerCancel={releaseDirection}>←</button><button onPointerDown={jump}>{copy(props,"Jump","跳")}</button><button onPointerDown={()=>setHeld(1)} onPointerUp={releaseDirection} onPointerCancel={releaseDirection}>→</button></div></div>;
}
