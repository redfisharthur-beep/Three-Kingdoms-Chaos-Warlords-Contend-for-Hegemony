import { useEffect, useRef, useState } from "react";
import Phaser from "phaser";
import { HEROES, type HeroId } from "../game/data/heroes";
import { CombatScene, type CombatEvents } from "../game/scenes/CombatScene";
import type { Skill } from "../game/data/skills";
type Hud={hp:number;maxHp:number;level:number;exp:number;expNext:number;time:number;bossHp?:number;bossMax?:number;ultimate:number};
export default function App(){
 const host=useRef<HTMLDivElement>(null), game=useRef<Phaser.Game|null>(null), movePointer=useRef<number|null>(null), moveOrigin=useRef<{x:number;y:number}|null>(null);
 const [hero,setHero]=useState<HeroId>("lvbu"),[screen,setScreen]=useState<"home"|"combat"|"level"|"result">("home"),[hud,setHud]=useState<Hud>({hp:100,maxHp:100,level:1,exp:0,expNext:20,time:0,ultimate:0}),[skills,setSkills]=useState<Skill[]>([]),[ready,setReady]=useState(false),[won,setWon]=useState(false),[summary,setSummary]=useState({kills:0,time:0}),[joystick,setJoystick]=useState<{x:number;y:number;dx:number;dy:number}|null>(null),[fullscreenHint,setFullscreenHint]=useState(false);
 const selected=HEROES.find(h=>h.id===hero)!;
 useEffect(()=>()=>{game.current?.destroy(true);game.current=null;},[]);
 async function enterFullscreen(){
   try{if(document.fullscreenEnabled&&!document.fullscreenElement)await document.documentElement.requestFullscreen({navigationUI:"hide"} as FullscreenOptions);}catch{setFullscreenHint(true);}
   try{if(screen.orientation&&"lock" in screen.orientation)await (screen.orientation as ScreenOrientation & {lock:(v:string)=>Promise<void>}).lock("landscape");}catch{/* browser/PWA may not permit orientation lock */}
 }
 function start(){void enterFullscreen();setScreen("combat");setTimeout(()=>bootGame(),0);}
 function bootGame(){if(!host.current)return;game.current?.destroy(true);const events:CombatEvents={onHud:setHud,onLevelUp:s=>{setSkills(s);setScreen("level");},onEnd:(w,k,t)=>{setWon(w);setSummary({kills:k,time:t});setScreen("result");},onUltimateReady:setReady};game.current=new Phaser.Game({type:Phaser.AUTO,parent:host.current,width:1200,height:800,backgroundColor:"#e9e7e1",scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},physics:{default:"arcade",arcade:{debug:false}},render:{antialias:true,roundPixels:true},input:{activePointers:3},scene:[CombatScene],callbacks:{postBoot:g=>{g.scene.start("combat",{heroId:hero,events});}}});}
 function pointerDown(e:React.PointerEvent<HTMLDivElement>){if(screen!=="combat"||!game.current)return;const rect=e.currentTarget.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top,mid=rect.width/2;if(x<mid&&movePointer.current===null){movePointer.current=e.pointerId;moveOrigin.current={x:rect.width*0.24,y:rect.height*0.5};e.currentTarget.setPointerCapture(e.pointerId);setJoystick({x:rect.width*0.24,y:rect.height*0.5,dx:0,dy:0});}}
 function pointerMove(e:React.PointerEvent<HTMLDivElement>){if(movePointer.current!==e.pointerId||!moveOrigin.current)return;const rect=e.currentTarget.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top,dx=x-moveOrigin.current.x,dy=y-moveOrigin.current.y,len=Math.hypot(dx,dy),max=58,n=len>max?max/len:1;setJoystick(j=>j?{...j,dx:dx*n,dy:dy*n}:j);(game.current?.scene.getScene("combat") as CombatScene|undefined)?.setMove(dx/max,dy/max);}
 function pointerUp(e:React.PointerEvent<HTMLDivElement>){if(movePointer.current===e.pointerId){movePointer.current=null;moveOrigin.current=null;setJoystick(null);(game.current?.scene.getScene("combat") as CombatScene|undefined)?.setMove(0,0);}}
 function chooseSkill(s:Skill){(game.current?.scene.getScene("combat") as CombatScene|undefined)?.applySkill(s);setScreen("combat");}
 function exit(){game.current?.destroy(true);game.current=null;setScreen("home");if(document.fullscreenElement)void document.exitFullscreen().catch(()=>{});}
 const minutes=Math.floor(hud.time/60).toString().padStart(2,"0"),seconds=(hud.time%60).toString().padStart(2,"0");
 return <main className="app-shell">
  {screen==="home"&&<section className="home">
   <div className="home-top"><span className="brand-mark">三國・亂世</span><span className="season-tag">群雄爭霸　／　第一章</span></div>
   <div className="home-copy"><p className="eyebrow">ROGUELITE · THREE KINGDOMS</p><h1>群雄爭霸</h1><p className="subline">每一場戰鬥，都是新的傳說。</p></div>
   <div className="hero-select"><div className="hero-art large-art" style={{"--hero":selected.accent} as React.CSSProperties}><div className="art-halo"/><div className="art-silhouette">{selected.name.slice(0,1)}</div><span className="art-seal">武</span></div><div className="hero-info"><span className="eyebrow">{selected.title}</span><h2>{selected.name}</h2><p>{selected.role}</p><div className="stat-pills"><span>生命 {selected.hp}</span><span>攻擊 {selected.damage}</span><span>射程 {selected.range}</span></div><div className="hero-dots">{HEROES.map(h=><button key={h.id} className={h.id===hero?"hero-dot active":"hero-dot"} style={{"--hero":h.accent} as React.CSSProperties} onClick={()=>setHero(h.id)} aria-label={h.name} title={h.name}/>)}</div><div className="ultimate-preview"><span className="ultimate-icon">✦</span><div><b>{selected.ultimate}</b><small>{selected.ultimateDescription}</small></div></div></div></div>
   <div className="home-bottom"><div className="mode-card selected"><span className="mode-icon">⚔</span><div><b>群雄試煉</b><small>單人隨機闖關・約 5–8 分鐘</small></div><span className="mode-arrow">›</span></div><button className="primary-button" onClick={start}>開始遊戲 <span>→</span></button><p className="tip">左側自由移動・右側施放武將絕招</p></div>
   {fullscreenHint&&<p className="fullscreen-note">瀏覽器不支援網頁全螢幕時，可使用「加入主畫面」以獨立遊戲視窗遊玩。</p>}
  </section>}
  {screen!=="home"&&<section className="battle-screen">
   <div className="battle-top"><div className="player-status"><span className="avatar-mini">{selected.name.slice(0,1)}</span><div><b>{selected.name}</b><small>LV.{hud.level}</small></div></div><div className="hp-block"><div className="bar-label"><span>生命</span><span>{Math.ceil(hud.hp)} / {hud.maxHp}</span></div><div className="bar"><i style={{width:`${Math.max(0,hud.hp/hud.maxHp*100)}%`}}/></div></div><div className="timer">{minutes}:{seconds}</div><button className="pause-btn" onClick={()=>{game.current?.scene.pause("combat");setWon(false);setScreen("result");setSummary({kills:0,time:hud.time});}}>Ⅱ</button></div>
   <div className="game-host" ref={host}/>
   <div className="battle-bottom"><div className="exp-row"><span>EXP</span><div className="exp-bar"><i style={{width:`${hud.exp/hud.expNext*100}%`}}/></div><span>{hud.level}</span></div><div className="touch-layer" onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} onContextMenu={e=>e.preventDefault()}>
    <div className="left-touch-hint">觸碰任意位置移動</div>
    {joystick&&<div className="dynamic-stick" style={{left:joystick.x,top:joystick.y}}><div className="stick-ring"/><div className="stick-knob" style={{transform:`translate(${joystick.dx}px,${joystick.dy}px)`}}/></div>}
    <button className={ready?"ultimate-button ready":"ultimate-button"} onPointerDown={e=>{e.stopPropagation();if(ready)(game.current?.scene.getScene("combat") as CombatScene).useUltimate();}} aria-label={selected.ultimate}><span>✦</span><b>{selected.ultimate}</b><small>{ready?"絕招就緒":`${Math.floor(hud.ultimate)}% 蓄力`}</small><i style={{"--charge":`${hud.ultimate}%`} as React.CSSProperties}/></button>
   </div></div>
   {screen==="level"&&<div className="overlay"><div className="choice-panel"><span className="eyebrow">LEVEL UP</span><h2>選擇一項強化</h2><p>戰場暫停・選擇後立即生效</p><div className="skill-grid">{skills.map(s=><button className={`skill-card ${s.rarity}`} key={s.id} onClick={()=>chooseSkill(s)}><span className="skill-icon">{s.icon}</span><b>{s.name}</b><small>{s.description}</small><span className="skill-pick">選擇</span></button>)}</div></div></div>}
   {screen==="result"&&<div className="overlay"><div className="result-panel"><span className="eyebrow">BATTLE RESULT</span><h2>{won?"試煉完成":"再接再厲"}</h2><p>本次戰鬥紀錄</p><div className="result-stats"><div><b>{summary.kills}</b><small>擊敗敵人</small></div><div><b>{Math.floor(summary.time/60)}:{(summary.time%60).toString().padStart(2,"0")}</b><small>生存時間</small></div><div><b>+{Math.floor(summary.kills*1.6)+20}</b><small>銅錢</small></div></div><button className="primary-button" onClick={exit}>返回大廳 →</button></div></div>}
  </section>}
 </main>;
}