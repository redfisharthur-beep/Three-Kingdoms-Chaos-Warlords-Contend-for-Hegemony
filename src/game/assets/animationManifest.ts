export type AnimationName="idle"|"run"|"attack"|"ultimate"|"hit"|"death";
export type AnimationSpec={hero:string;animation:AnimationName;frames:number;fps:number;frameWidth:number;frameHeight:number;columns:number;gap:number;safePadding:number;footAnchor:{x:number;y:number};pivot:{x:number;y:number}};
const heroes=["lvbu","zhaoyun","zhugeliang","guanyu","huangzhong"];
const counts:Record<AnimationName,number>={idle:8,run:8,attack:6,ultimate:10,hit:3,death:6};
export const ANIMATION_MANIFEST:AnimationSpec[]=heroes.flatMap(hero=>Object.entries(counts).map(([animation,frames])=>({hero,animation:animation as AnimationName,frames,fps:animation==="idle"?8:animation==="run"?12:animation==="ultimate"?14:12,frameWidth:256,frameHeight:256,columns:4,gap:24,safePadding:24,footAnchor:{x:128,y:226},pivot:{x:128,y:226}})));
export const FRAME_SOURCE_RULES={format:"png",colorMode:"RGBA",transparent:true,frameWidth:256,frameHeight:256,gutter:24,trim:false,extrude:2,alignment:"bottom-center"} as const;
