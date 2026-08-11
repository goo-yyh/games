"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Matter from "matter-js";
import type { PlayableGameProps } from "../types";
import { createRandom } from "../random";

const label = (props: PlayableGameProps, en: string, zh: string) => props.locale === "en" ? en : zh;

export default function PhysicsGames(props: PlayableGameProps) {
  return props.slug === "hook-swing" ? <HookSwingMatter {...props} /> : <RuggedWheelsMatter {...props} />;
}

type Anchor = { x: number; y: number };
function hookLevel(level: number) {
  const random = createRandom(6200 + level * 101);
  return {
    anchors: Array.from({ length: 5 }, (_, index): Anchor => ({ x: 18 + index * 17, y: 18 + random.int(0, 48) })),
    hazards: Array.from({ length: 2 }, (_, index) => ({ x: 42 + index * 29, y: 82 - (level * 7 + index * 11) % 22 })),
  };
}

function HookSwingMatter(props: PlayableGameProps) {
  const [level, setLevel] = useState(1);
  const [position, setPosition] = useState({ x: 8, y: 68 });
  const [attached, setAttached] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [sparks, setSparks] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const engineRef = useRef<Matter.Engine | null>(null);
  const bodyRef = useRef<Matter.Body | null>(null);
  const ropeRef = useRef<Matter.Constraint | null>(null);
  const finishedRef = useRef(false);
  const course = useMemo(() => hookLevel(level), [level]);

  useEffect(() => { setLevel(1); setSparks(0); props.onScore(0); }, [props.resetKey]);
  useEffect(() => {
    const engine = Matter.Engine.create({ gravity: { x: 0, y: .78, scale: .001 } });
    const explorer = Matter.Bodies.circle(8, 68, 2.5, { frictionAir: .006, restitution: .2, label: "explorer" });
    Matter.Body.setVelocity(explorer, { x: 2.1, y: -.25 });
    const floor = Matter.Bodies.rectangle(50, 108, 120, 8, { isStatic: true, label: "void" });
    const hazards = course.hazards.map((hazard) => Matter.Bodies.rectangle(hazard.x, hazard.y, 8, 4, { isStatic: true, isSensor: true, label: "hazard" }));
    Matter.Composite.add(engine.world, [explorer, floor, ...hazards]);
    engineRef.current = engine; bodyRef.current = explorer; ropeRef.current = null; finishedRef.current = false;
    setPosition({ x: 8, y: 68 }); setAttached(null); setElapsed(0);
    return () => { Matter.Composite.clear(engine.world, false, true); Matter.Engine.clear(engine); engineRef.current = null; bodyRef.current = null; ropeRef.current = null; };
  }, [attempt, course, props.resetKey]);

  const attachOrRelease = useCallback(() => {
    const engine = engineRef.current, explorer = bodyRef.current;
    if (!engine || !explorer || props.paused) return;
    if (ropeRef.current) {
      Matter.Composite.remove(engine.world, ropeRef.current);
      ropeRef.current = null; setAttached(null); props.sound("move"); return;
    }
    let nearest = -1, nearestDistance = 34;
    course.anchors.forEach((anchor, index) => {
      const distance = Matter.Vector.magnitude(Matter.Vector.sub(anchor, explorer.position));
      if (anchor.x >= explorer.position.x - 5 && distance < nearestDistance) { nearest = index; nearestDistance = distance; }
    });
    if (nearest < 0) { props.onStatus(label(props, "No clear anchor in range", "范围内没有可连接锚点")); return; }
    const anchor = course.anchors[nearest];
    const rope = Matter.Constraint.create({ pointA: anchor, bodyB: explorer, length: nearestDistance, stiffness: .96, damping: .015, label: "rope" });
    Matter.Composite.add(engine.world, rope); ropeRef.current = rope; setAttached(nearest); props.sound("move");
  }, [course, props]);

  useEffect(() => {
    const keyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") { event.preventDefault(); attachOrRelease(); }
      if (event.key.toLowerCase() === "r") setAttempt((value) => value + 1);
    };
    window.addEventListener("keydown", keyDown);
    return () => window.removeEventListener("keydown", keyDown);
  }, [attachOrRelease]);

  useEffect(() => {
    let frame = 0, last = performance.now(), accumulated = 0;
    const run = (now: number) => {
      frame = requestAnimationFrame(run);
      if (props.paused || !engineRef.current || !bodyRef.current) { last = now; return; }
      const delta = Math.min(34, now - last); last = now; accumulated += delta;
      Matter.Engine.update(engineRef.current, delta);
      const body = bodyRef.current;
      setPosition({ x: body.position.x, y: body.position.y });
      if (accumulated >= 1000) { setElapsed((value) => value + 1); accumulated -= 1000; }
      const hitHazard = course.hazards.some((hazard) => Math.hypot(body.position.x - hazard.x, body.position.y - hazard.y) < 5.5);
      if ((body.position.y > 102 || hitHazard) && !finishedRef.current) {
        finishedRef.current = true; setAttempt((value) => value + 1); props.sound("fail"); props.onStatus(label(props, "Course reset", "本关已重新开始"));
      }
      if (body.position.x > 97 && !finishedRef.current) {
        finishedRef.current = true;
        if (level >= 15) props.onComplete(label(props, `All 15 levels complete with ${sparks} sparks`, `完成全部 15 关，收集 ${sparks} 个火花`));
        else { setLevel((value) => value + 1); props.onScore(level); props.sound("win"); }
      }
    };
    frame = requestAnimationFrame(run);
    return () => cancelAnimationFrame(frame);
  }, [course, level, props, sparks]);

  return <div className="arcade-game hook-game"><div className="arcade-hud"><span>{label(props,"Level","关卡")} {level}/15</span><span>{label(props,"Time","用时")} {elapsed}s</span><span>✦ {sparks}</span></div><button className="hook-stage" onPointerDown={attachOrRelease} onPointerUp={() => ropeRef.current && attachOrRelease()} aria-label={label(props,"Attach to or release nearest anchor","连接或松开最近锚点")}>{course.anchors.map((anchor,index)=><i key={index} className={attached===index?"active":""} style={{left:`${anchor.x}%`,top:`${anchor.y}%`}}>✦</i>)}{course.hazards.map((hazard,index)=><em key={index} className="physics-hazard" style={{left:`${hazard.x}%`,top:`${hazard.y}%`}}>▲</em>)}{attached!==null&&<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><line x1={position.x} y1={position.y} x2={course.anchors[attached].x} y2={course.anchors[attached].y}/></svg>}<b style={{left:`${position.x}%`,top:`${position.y}%`}}>●</b><span className="finish">⚑</span></button><p>{label(props,"Hold to attach · release to fly","按住连接锚点 · 松开飞行")}</p></div>;
}

function trackPoints(level: number) { return Array.from({ length: 10 }, (_, index) => ({ x: index * 11, y: 77 - ((index * level * 5) % 22) })); }

function RuggedWheelsMatter(props: PlayableGameProps) {
  const [level, setLevel] = useState(1);
  const [pose, setPose] = useState({ x: 6, y: 64, angle: 0 });
  const [elapsed, setElapsed] = useState(0);
  const [bolts, setBolts] = useState<Set<number>>(new Set());
  const [throttle, setThrottle] = useState(0);
  const [tilt, setTilt] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const engineRef = useRef<Matter.Engine | null>(null);
  const roverRef = useRef<{ chassis: Matter.Body; wheels: Matter.Body[] } | null>(null);
  const finishedRef = useRef(false);
  const points = useMemo(() => trackPoints(level), [level]);

  useEffect(() => { setLevel(1); props.onScore(0); }, [props.resetKey]);
  useEffect(() => {
    const engine = Matter.Engine.create({ gravity: { x: 0, y: .92, scale: .001 } });
    const chassis = Matter.Bodies.rectangle(6, 62, 8, 3.4, { density: .004, frictionAir: .015, chamfer: { radius: 1 } });
    const left = Matter.Bodies.circle(3.5, 65, 2.1, { friction: 1, density: .006 });
    const right = Matter.Bodies.circle(8.5, 65, 2.1, { friction: 1, density: .006 });
    const axles = [Matter.Constraint.create({ bodyA: chassis, pointA: { x: -2.5, y: 1.7 }, bodyB: left, stiffness: .92, damping: .1 }), Matter.Constraint.create({ bodyA: chassis, pointA: { x: 2.5, y: 1.7 }, bodyB: right, stiffness: .92, damping: .1 })];
    const terrain = points.slice(0,-1).map((point,index) => { const next=points[index+1],dx=next.x-point.x,dy=next.y-point.y,length=Math.hypot(dx,dy); return Matter.Bodies.rectangle((point.x+next.x)/2,(point.y+next.y)/2,length+1,3,{isStatic:true,friction:1,angle:Math.atan2(dy,dx),label:"terrain"}); });
    Matter.Composite.add(engine.world,[chassis,left,right,...axles,...terrain]);
    engineRef.current=engine;roverRef.current={chassis,wheels:[left,right]};finishedRef.current=false;
    setPose({x:6,y:62,angle:0});setElapsed(0);setBolts(new Set());setThrottle(0);setTilt(0);
    return()=>{Matter.Composite.clear(engine.world,false,true);Matter.Engine.clear(engine);engineRef.current=null;roverRef.current=null;};
  },[attempt,level,points,props.resetKey]);

  useEffect(()=>{const down=(event:KeyboardEvent)=>{if(["ArrowRight","w","W"].includes(event.key))setThrottle(1);if(["ArrowLeft","s","S"].includes(event.key))setThrottle(-1);if(["a","A"].includes(event.key))setTilt(-1);if(["d","D"].includes(event.key))setTilt(1);};const up=()=>{setThrottle(0);setTilt(0);};window.addEventListener("keydown",down);window.addEventListener("keyup",up);return()=>{window.removeEventListener("keydown",down);window.removeEventListener("keyup",up);};},[]);
  useEffect(()=>{let frame=0,last=performance.now(),accumulated=0;const run=(now:number)=>{frame=requestAnimationFrame(run);if(props.paused||!engineRef.current||!roverRef.current){last=now;return;}const delta=Math.min(34,now-last);last=now;accumulated+=delta;const{chassis,wheels}=roverRef.current;for(const wheel of wheels)Matter.Body.setAngularVelocity(wheel,wheel.angularVelocity+throttle*.012);if(tilt)Matter.Body.setAngularVelocity(chassis,chassis.angularVelocity+tilt*.004);Matter.Engine.update(engineRef.current,delta);setPose({x:chassis.position.x,y:chassis.position.y,angle:chassis.angle});if(accumulated>=1000){setElapsed(value=>value+1);accumulated-=1000;}const nextBolts=new Set(bolts);points.forEach((point,index)=>{if(Math.hypot(chassis.position.x-point.x,chassis.position.y-(point.y-7))<5&&!nextBolts.has(index)){nextBolts.add(index);props.sound("score");}});if(nextBolts.size!==bolts.size)setBolts(nextBolts);if((chassis.position.y>104||Math.abs(chassis.angle)>Math.PI*.85)&&!finishedRef.current){finishedRef.current=true;setAttempt(value=>value+1);props.sound("fail");props.onStatus(label(props,"Rover reset at the checkpoint","探测车已回到检查点"));}if(chassis.position.x>98&&!finishedRef.current){finishedRef.current=true;if(level>=12)props.onComplete(label(props,`All 12 tracks finished with ${nextBolts.size} bolts`,`完成全部 12 条赛道，收集 ${nextBolts.size} 个螺栓`));else{setLevel(value=>value+1);props.onScore(level);props.sound("win");}}};frame=requestAnimationFrame(run);return()=>cancelAnimationFrame(frame);},[bolts,level,points,props,throttle,tilt]);

  return <div className="arcade-game wheels-game"><div className="arcade-hud"><span>{label(props,"Track","赛道")} {level}/12</span><span>{label(props,"Time","用时")} {elapsed}s</span><span>⚙ {bolts.size}</span></div><div className="wheels-stage">{points.slice(0,-1).map((point,index)=>{const next=points[index+1],angle=Math.atan2(next.y-point.y,next.x-point.x);return <i key={index} className={`terrain terrain-${index%4}`} style={{left:`${point.x}%`,top:`${point.y}%`,width:`${Math.hypot(next.x-point.x,next.y-point.y)}%`,transform:`rotate(${angle}rad)`}}>{bolts.has(index)?"":"⚙"}</i>;})}<b className="rover" style={{left:`${pose.x}%`,top:`${pose.y}%`,transform:`rotate(${pose.angle}rad)`}}><i/><i/><span>▰</span></b><em className="finish-line">⚑</em></div><div className="four-controls"><button onPointerDown={()=>setTilt(-1)} onPointerUp={()=>setTilt(0)}>A ↺</button><button onPointerDown={()=>setThrottle(-1)} onPointerUp={()=>setThrottle(0)}>← {label(props,"Brake","刹车")}</button><button onPointerDown={()=>setThrottle(1)} onPointerUp={()=>setThrottle(0)}>{label(props,"Gas","加速")} →</button><button onPointerDown={()=>setTilt(1)} onPointerUp={()=>setTilt(0)}>D ↻</button></div></div>;
}
