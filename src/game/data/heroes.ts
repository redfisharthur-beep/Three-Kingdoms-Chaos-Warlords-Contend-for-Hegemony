export type HeroId="lvbu"|"zhaoyun"|"zhugeliang"|"guanyu"|"huangzhong";
export type HeroDefinition={id:HeroId;name:string;title:string;role:string;hp:number;damage:number;attackRate:number;range:number;speed:number;ultimate:string;ultimateDescription:string;color:number;accent:string;attackStyle:"melee"|"dash"|"magic"|"wave"|"arrow"};
export const HEROES:HeroDefinition[]=[
{id:"lvbu",name:"呂布",title:"無雙戰神",role:"近戰・高爆發",hp:150,damage:27,attackRate:1,range:72,speed:176,ultimate:"無雙亂舞",ultimateDescription:"大範圍連續斬擊",color:0x9b6f68,accent:"#a97870",attackStyle:"melee"},
{id:"zhaoyun",name:"趙雲",title:"常勝將軍",role:"突進・敏捷",hp:112,damage:17,attackRate:1.45,range:150,speed:208,ultimate:"龍膽破陣",ultimateDescription:"高速突進並造成多段傷害",color:0x78958b,accent:"#83a69a",attackStyle:"dash"},
{id:"zhugeliang",name:"諸葛亮",title:"臥龍軍師",role:"遠程・範圍控制",hp:88,damage:19,attackRate:1.05,range:330,speed:176,ultimate:"天火燎原",ultimateDescription:"召喚隕火覆蓋大範圍戰場",color:0x8798ad,accent:"#91a7bf",attackStyle:"magic"},
{id:"guanyu",name:"關羽",title:"武聖",role:"中距離・破甲",hp:136,damage:25,attackRate:.88,range:190,speed:166,ultimate:"青龍偃月",ultimateDescription:"釋放青龍刀氣，穿透敵人",color:0x879c78,accent:"#91a77e",attackStyle:"wave"},
{id:"huangzhong",name:"黃忠",title:"百步穿楊",role:"超遠程・穿透",hp:94,damage:21,attackRate:1.18,range:390,speed:181,ultimate:"百步神射",ultimateDescription:"鎖定多個目標連續狙擊",color:0xb39a6b,accent:"#c1a775",attackStyle:"arrow"}];
export const HERO_BY_ID=Object.fromEntries(HEROES.map(h=>[h.id,h])) as Record<HeroId,HeroDefinition>;