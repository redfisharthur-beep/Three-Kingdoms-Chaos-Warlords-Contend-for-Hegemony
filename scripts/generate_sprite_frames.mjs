import { mkdir, writeFile, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const root = "public/assets/sprites";
const heroes = {
  lvbu: { main:"#9c5e59", light:"#d8b38d", dark:"#443b3d", cloth:"#65505d", metal:"#c5a47a", weapon:"halberd", crest:"wing", beard:false },
  zhaoyun: { main:"#668c83", light:"#e1d2b7", dark:"#394d4b", cloth:"#e9e2d2", metal:"#b9c8b9", weapon:"spear", crest:"plume", beard:false },
  zhugeliang: { main:"#7489a1", light:"#e6ddc9", dark:"#46546b", cloth:"#aeb9c6", metal:"#c4b58d", weapon:"fan", crest:"cap", beard:true },
  guanyu: { main:"#71865e", light:"#d7bd91", dark:"#3e453b", cloth:"#873f3e", metal:"#c4a36d", weapon:"guandao", crest:"crown", beard:true },
  huangzhong: { main:"#b18a50", light:"#e0c8a1", dark:"#51493b", cloth:"#777b68", metal:"#c7b68d", weapon:"bow", crest:"helmet", beard:true }
};
const animations = { idle:[8,8], run:[8,12], attack:[6,12], ultimate:[10,14], hit:[3,12], death:[6,10] };
const esc = s => s;
function svgFrame(id, hero, anim, index, total) {
  const p=heroes[hero], phase=index/total*Math.PI*2;
  const bob=anim==="idle"?Math.sin(phase)*2:anim==="run"?Math.sin(phase*2)*5:0;
  const stride=anim==="run"?Math.sin(phase*2)*9:0;
  const lean=anim==="attack"?Math.sin(index/Math.max(1,total-1)*Math.PI)*12:anim==="ultimate"?Math.sin(phase)*9:0;
  const alpha=anim==="hit"&&index===1?0.8:1;
  const weapon = p.weapon==="halberd"
    ? '<path d="M194 178 L214 29" stroke="#51464a" stroke-width="7" stroke-linecap="round"/><path d="M197 64 Q180 39 192 24 Q208 38 214 12 Q228 39 215 66 Z" fill="#d4b47f" stroke="#574a48" stroke-width="4"/><path d="M194 58 L218 47" stroke="#f0dfbd" stroke-width="3"/>'
    : p.weapon==="spear"
    ? '<path d="M196 191 L211 30" stroke="#604e42" stroke-width="6" stroke-linecap="round"/><path d="M211 27 L225 58 L211 50 L198 58 Z" fill="#c7d0bd" stroke="#455c57" stroke-width="3"/><path d="M207 55 L216 55" stroke="#f0e4c9" stroke-width="3"/>'
    : p.weapon==="fan"
    ? '<path d="M188 155 L214 93" stroke="#62554b" stroke-width="5"/><path d="M212 98 Q184 78 177 46 Q218 51 234 77 Q231 95 212 98 Z" fill="#d9d0bd" stroke="#59677b" stroke-width="3"/><path d="M212 97 L188 53 M212 97 L207 49 M212 97 L226 56" stroke="#9a8c75" stroke-width="2"/>'
    : p.weapon==="guandao"
    ? '<path d="M190 190 L216 34" stroke="#514a42" stroke-width="7"/><path d="M215 31 Q185 31 179 56 Q194 69 215 54 Q231 40 235 24 Q222 26 215 31 Z" fill="#c8a66f" stroke="#514a42" stroke-width="4"/><path d="M183 58 Q200 66 214 53" stroke="#eee0c0" stroke-width="3" fill="none"/>'
    : '<path d="M193 176 L218 65" stroke="#594e42" stroke-width="5"/><path d="M212 76 Q232 47 224 25 Q231 42 229 70 Q224 88 208 91" fill="none" stroke="#b99c6c" stroke-width="5"/><path d="M210 82 Q226 59 229 43" stroke="#e4d1a8" stroke-width="2" fill="none"/>';
  const crest = p.crest==="wing"
    ? '<path d="M110 48 Q76 26 56 40 Q75 50 103 64 M143 48 Q180 26 200 40 Q179 51 150 64" fill="#a77b70" stroke="#4c4141" stroke-width="4"/>'
    : p.crest==="plume"
    ? '<path d="M125 49 Q109 27 131 25 Q146 34 139 49" fill="#d4d8c7" stroke="#425c57" stroke-width="3"/>'
    : p.crest==="cap"
    ? '<path d="M92 48 Q93 27 128 26 Q164 27 165 48 L151 56 L104 56 Z" fill="#46556a" stroke="#d1c6aa" stroke-width="4"/><path d="M90 46 Q128 34 166 46" stroke="#c8b58f" stroke-width="5"/>'
    : p.crest==="crown"
    ? '<path d="M91 48 L97 29 L117 40 L129 26 L143 40 L163 29 L168 50 Z" fill="#c9a76d" stroke="#4b463e" stroke-width="4"/>'
    : '<path d="M91 48 Q91 27 128 26 Q165 27 165 48 L154 55 L102 55 Z" fill="#a58c5e" stroke="#4d473d" stroke-width="4"/><path d="M93 36 L163 36" stroke="#e5d2a8" stroke-width="4"/>';
  const cloak = hero==="lvbu" ? "#554958" : hero==="guanyu" ? "#7e4542" : p.cloth;
  const motion = anim==="run"
    ? '<path d="M44 133 L22 125 M48 150 L17 151 M54 166 L30 177" stroke="#ffffff" stroke-opacity=".55" stroke-width="4" stroke-linecap="round"/>'
    : anim==="attack"||anim==="ultimate"
    ? '<path d="M42 80 Q28 123 39 179 Q64 206 81 201" fill="none" stroke="#e8d6ae" stroke-opacity=".8" stroke-width="5" stroke-linecap="round"/><path d="M35 101 Q28 130 36 159" fill="none" stroke="#fff8e8" stroke-opacity=".8" stroke-width="2"/>'
    : "";
  const dead = anim==="death" ? `<g transform="translate(0 ${Math.min(index*2,10)}) rotate(${Math.min(index*3,15)} 128 180)" opacity=".95">` : "<g>";
  const close = "</g>";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
  <defs>
   <linearGradient id="robe" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${p.light}"/><stop offset=".48" stop-color="${p.main}"/><stop offset="1" stop-color="${p.dark}"/></linearGradient>
   <linearGradient id="metal" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f3e2bd"/><stop offset=".5" stop-color="${p.metal}"/><stop offset="1" stop-color="#756b5c"/></linearGradient>
   <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f0d7bc"/><stop offset="1" stop-color="#b9856c"/></linearGradient>
   <filter id="shadow" x="-30%" y="-20%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <ellipse cx="128" cy="226" rx="47" ry="6" fill="#4d554d" opacity=".2" filter="url(#shadow)"/>
  ${motion}
  ${dead}
   <g transform="translate(0 ${bob.toFixed(1)}) rotate(${lean.toFixed(1)} 128 145)" opacity="${alpha}">
    <path d="M105 119 Q76 141 82 203 L104 217 L150 216 Q181 177 161 119 L149 103 L109 104 Z" fill="${cloak}" stroke="${p.dark}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M112 123 Q82 145 95 210 L125 220 L151 205 Q161 159 145 122 Z" fill="url(#robe)" stroke="${p.dark}" stroke-width="4"/>
    <path d="M112 131 L126 151 L143 130 L151 206 L128 218 L101 207 Z" fill="${p.light}" opacity=".8"/>
    <path d="M113 151 L128 164 L143 151 L136 207 L120 207 Z" fill="${p.main}" stroke="${p.dark}" stroke-width="2"/>
    <path d="M104 171 Q128 181 153 168 L155 184 Q128 198 101 184 Z" fill="url(#metal)" stroke="${p.dark}" stroke-width="3"/>
    <path d="M125 179 L131 179 L134 188 L128 194 L122 188 Z" fill="#6e5545"/>
    <path d="M106 136 L90 160 L99 190 L112 181 L117 153 Z" fill="${p.dark}" stroke="${p.metal}" stroke-width="3"/>
    <path d="M150 135 L170 155 L164 184 L149 178 L143 151 Z" fill="${p.main}" stroke="${p.dark}" stroke-width="4"/>
    <path d="M91 158 L82 183 L92 193 L103 184" fill="url(#skin)" stroke="${p.dark}" stroke-width="3"/>
    <path d="M163 155 L177 175 L166 188 L153 177" fill="url(#skin)" stroke="${p.dark}" stroke-width="3"/>
    <path d="M103 205 L123 208 L119 225 L96 229 L87 222 Z" fill="${p.dark}" stroke="#393a36" stroke-width="3" transform="translate(${stride.toFixed(1)} 0)"/>
    <path d="M132 207 L154 204 L166 220 L159 229 L132 226 Z" fill="${p.dark}" stroke="#393a36" stroke-width="3" transform="translate(${(-stride).toFixed(1)} 0)"/>
    <path d="M88 220 L119 222 L116 232 L82 232 Q77 227 88 220 M136 220 L164 219 L175 229 Q174 234 138 232 Z" fill="#4a403a" stroke="#292f2d" stroke-width="3"/>
    <path d="M103 114 Q92 92 104 73 L151 73 Q166 93 153 119 L145 137 L111 137 Z" fill="url(#metal)" stroke="${p.dark}" stroke-width="4"/>
    <path d="M109 119 L128 137 L148 119 L143 155 L128 166 L112 154 Z" fill="${p.main}" stroke="${p.dark}" stroke-width="3"/>
    <path d="M111 126 L128 143 L145 126" fill="none" stroke="${p.light}" stroke-width="5"/>
    <path d="M98 103 Q91 86 105 77 L119 83 L115 111 Z M157 103 Q166 85 151 77 L137 83 L141 111 Z" fill="url(#metal)" stroke="${p.dark}" stroke-width="4"/>
    <path d="M112 74 L112 60 L145 60 L145 77" fill="url(#skin)" stroke="${p.dark}" stroke-width="3"/>
    <ellipse cx="128" cy="63" rx="26" ry="31" fill="url(#skin)" stroke="${p.dark}" stroke-width="4"/>
    <path d="M102 57 Q99 24 128 23 Q158 23 155 59 L146 45 Q129 53 110 43 Z" fill="${p.dark}" stroke="#302f30" stroke-width="4"/>
    ${crest}
    <path d="M109 64 Q116 60 121 64 M135 64 Q141 60 147 64" stroke="#4b3934" stroke-width="3" fill="none" stroke-linecap="round"/>
    <ellipse cx="117" cy="70" rx="3" ry="2" fill="#342f2d"/><ellipse cx="139" cy="70" rx="3" ry="2" fill="#342f2d"/>
    <path d="M127 72 L124 82 L131 83" fill="none" stroke="#a16d5a" stroke-width="2" stroke-linecap="round"/>
    <path d="M118 91 Q128 97 139 90" stroke="#784b42" stroke-width="3" fill="none" stroke-linecap="round"/>
    ${p.beard?'<path d="M111 87 Q128 105 146 87 Q145 113 128 119 Q111 112 111 87 Z" fill="#3c3534" stroke="#2c2b2b" stroke-width="3"/><path d="M121 104 L128 116 L135 103" fill="#6c5144"/>':""}
    <path d="M106 93 Q128 105 150 92" fill="none" stroke="${p.metal}" stroke-width="3"/>
    <path d="M101 120 L88 132 L102 145 L114 130 M155 120 L169 132 L154 146 L143 130" fill="url(#metal)" stroke="${p.dark}" stroke-width="4"/>
    <path d="M109 145 L128 157 L147 144" fill="none" stroke="#f1dfb9" stroke-width="3" opacity=".85"/>
    ${weapon}
   </g>
   ${anim==="ultimate"?'<circle cx="128" cy="126" r="91" fill="none" stroke="#e8cb91" stroke-width="4" stroke-dasharray="18 12" opacity=".8"/><path d="M128 17 L136 38 L158 40 L141 54 L146 76 L128 64 L110 76 L115 54 L98 40 L120 38 Z" fill="#f0d8a4" opacity=".65"/>':""}
   ${anim==="hit"?'<path d="M179 67 L188 50 L195 69 L214 71 L198 82 L203 101 L187 89 L172 101 L177 82 L161 71 Z" fill="#f4dfbd" stroke="#a87965" stroke-width="2"/>':""}
  ${close}
  <path d="M24 232 H232" stroke="#ffffff" stroke-opacity=".15" stroke-width="1"/>
 </svg>`;
}
async function main(){
 for(const [hero] of Object.entries(heroes)){
  const heroDir=join(root,hero);await mkdir(heroDir,{recursive:true});
  for(const [anim,[count]] of Object.entries(animations)){
   const dir=join(heroDir,anim);await mkdir(dir,{recursive:true});
   for(let i=0;i<count;i++){
    const svg=svgFrame(hero,hero,anim,i,count);
    await writeFile(join(dir,`${String(i).padStart(2,"0")}.svg`),svg,"utf8");
   }
  }
  await copyFile(join(heroDir,"idle","00.svg"),join(heroDir,"portrait.svg"));
 }
 const manifest={schemaVersion:1,frameWidth:256,frameHeight:256,gutter:24,safePadding:24,trim:false,anchor:{x:128,y:226},heroes:Object.fromEntries(Object.entries(heroes).map(([hero])=>[hero,Object.fromEntries(Object.entries(animations).map(([anim,[frames,fps]])=>[anim,{frames,fps,pattern:`/assets/sprites/${hero}/${anim}/{frame}.svg`}]))]))};
 await writeFile(join(root,"manifest.json"),JSON.stringify(manifest,null,2)+"\n","utf8");
 console.log("Generated 205 individual SVG animation frames and 5 portraits.");
}
main().catch(error=>{console.error(error);process.exit(1);});
