import { readFile, access } from "node:fs/promises";
import { join } from "node:path";

const root="public/assets/sprites";
const manifest=JSON.parse(await readFile(join(root,"manifest.json"),"utf8"));
if(manifest.frameWidth!==256||manifest.frameHeight!==256||manifest.safePadding!==24||manifest.trim!==false)throw new Error("Sprite manifest violates the 256px / 24px / no-trim contract.");
let frames=0,portraits=0,enemies=0;
for(const [hero,animations] of Object.entries(manifest.heroes)){
  await access(join(root,hero,"portrait.svg"));portraits++;
  for(const [animation,spec] of Object.entries(animations)){
    for(let i=0;i<spec.frames;i++){
      const file=join(root,hero,animation,`${String(i).padStart(2,"0")}.svg`);
      const svg=await readFile(file,"utf8");
      if(!svg.includes('width="256" height="256" viewBox="0 0 256 256"'))throw new Error(`Invalid frame dimensions: ${file}`);
      if(!svg.startsWith("<svg")||!svg.includes("</svg>"))throw new Error(`Malformed SVG frame: ${file}`);
      frames++;
    }
  }
}
for(const kind of manifest.enemies){const file=join(root,"enemies",kind+".svg");const svg=await readFile(file,"utf8");if(!svg.includes('width="256" height="256" viewBox="0 0 256 256"'))throw new Error(`Invalid enemy art: ${file}`);enemies++;}
if(frames!==205||portraits!==5||enemies!==3)throw new Error(`Unexpected asset count: frames=${frames}, portraits=${portraits}, enemies=${enemies}`);
console.log(`Sprite validation passed: ${frames} frames, ${portraits} portraits, ${enemies} enemy illustrations; 24px safe-padding contract retained.`);
