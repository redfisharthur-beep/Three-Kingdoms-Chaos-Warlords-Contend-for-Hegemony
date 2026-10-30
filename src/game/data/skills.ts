export type Skill={id:string;name:string;description:string;icon:string;rarity:"common"|"rare"|"epic";apply:(s:RunStats)=>RunStats};
export type RunStats={damage:number;attackRate:number;moveSpeed:number;maxHp:number;range:number;crit:number;projectileCount:number};
export const BASE_STATS:RunStats={damage:1,attackRate:1,moveSpeed:1,maxHp:1,range:1,crit:0,projectileCount:1};
export const SKILLS:Skill[]=[
{id:"edge",name:"鋒刃淬鍊",description:"普通攻擊傷害 +18%",icon:"⚔",rarity:"common",apply:s=>({...s,damage:s.damage*1.18})},
{id:"tempo",name:"疾風連擊",description:"攻擊速度 +15%",icon:"✦",rarity:"common",apply:s=>({...s,attackRate:s.attackRate*1.15})},
{id:"stride",name:"流雲步",description:"移動速度 +12%",icon:"➤",rarity:"common",apply:s=>({...s,moveSpeed:s.moveSpeed*1.12})},
{id:"vital",name:"固本培元",description:"最大生命 +20%",icon:"♥",rarity:"common",apply:s=>({...s,maxHp:s.maxHp*1.2})},
{id:"reach",name:"氣貫長虹",description:"攻擊距離 +18%",icon:"⌁",rarity:"rare",apply:s=>({...s,range:s.range*1.18})},
{id:"crit",name:"破軍之勢",description:"暴擊率 +8%",icon:"✧",rarity:"rare",apply:s=>({...s,crit:s.crit+.08})},
{id:"multishot",name:"分光化影",description:"額外發射一道攻擊",icon:"❖",rarity:"epic",apply:s=>({...s,projectileCount:s.projectileCount+1})}];
export function rollSkills(count=3):Skill[]{const pool=[...SKILLS],out:Skill[]=[];while(out.length<count&&pool.length)out.push(pool.splice(Math.floor(Math.random()*pool.length),1)[0]);return out;}