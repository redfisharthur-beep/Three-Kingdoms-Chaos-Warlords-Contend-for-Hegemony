#!/usr/bin/env python3
"""Generate deterministic placeholder animation frames with safe padding.
Run: python scripts/generate_sprite_frames.py
Creates transparent RGBA frame PNGs and non-trimmed sprite sheets.
These are functional prototype sprites, not final illustrated character art.
"""
from pathlib import Path
import json, math
from PIL import Image, ImageDraw

ROOT=Path("public/assets/sprites")
HEROES={
 "lvbu":("#9b6f68","#d9c4a2","#504c4a"),
 "zhaoyun":("#78958b","#e0dfd0","#59645d"),
 "zhugeliang":("#8798ad","#d8d3c8","#59616f"),
 "guanyu":("#879c78","#dbc8a5","#654f48"),
 "huangzhong":("#b39a6b","#ddd0b1","#655e51"),
}
ANIMS={"idle":(8,8),"run":(8,12),"attack":(6,12),"ultimate":(10,14),"hit":(3,12),"death":(6,10)}
SIZE=256; GAP=24; PAD=24
def frame(hero, anim, i, n):
    primary, cloth, dark=HEROES[hero]
    im=Image.new("RGBA",(SIZE,SIZE),(0,0,0,0)); d=ImageDraw.Draw(im)
    phase=2*math.pi*i/n
    bob=round(math.sin(phase)*(3 if anim in ("idle","run") else 1))
    cx=SIZE//2; foot=226
    if anim=="death":
        lean=(i/(n-1))*54
        d.ellipse((cx-52,foot-32,cx+58,foot+4),fill=(*ImageColor.getrgb(primary),210))
        d.line((cx-15,foot-30,cx+int(lean),foot-46),fill=dark,width=17)
        return im
    # Ground shadow stays within the safe frame.
    d.ellipse((cx-39,foot-5,cx+39,foot+5),fill=(62,66,59,42))
    body_y=foot-82+bob
    if anim=="hit": body_y+=2
    # feet and boots
    stride=math.sin(phase*2)*9 if anim=="run" else 0
    d.rounded_rectangle((cx-27+stride,foot-27,cx-4+stride,foot-4),radius=6,fill=dark)
    d.rounded_rectangle((cx+4-stride,foot-27,cx+27-stride,foot-4),radius=6,fill=dark)
    # robe / armor silhouette
    d.polygon([(cx-22,body_y-15),(cx+22,body_y-15),(cx+34,foot-25),(cx-35,foot-25)],fill=primary)
    d.polygon([(cx-18,body_y-12),(cx+18,body_y-12),(cx+11,foot-27),(cx-9,foot-27)],fill=cloth)
    # shoulders and arms
    d.ellipse((cx-38,body_y-13,cx-14,body_y+13),fill=dark)
    d.ellipse((cx+14,body_y-13,cx+38,body_y+13),fill=dark)
    # neck and head
    d.rectangle((cx-7,body_y-34,cx+7,body_y-15),fill=(207,169,139,255))
    d.ellipse((cx-22,body_y-72,cx+22,body_y-31),fill=(224,190,160,255),outline=dark,width=3)
    # hair/helmet and distinctive crest
    d.pieslice((cx-24,body_y-78,cx+24,body_y-33),180,360,fill=dark)
    d.polygon([(cx-8,body_y-70),(cx,body_y-101),(cx+8,body_y-70)],fill=cloth)
    # eyes
    d.ellipse((cx-11,body_y-51,cx-6,body_y-47),fill=dark);d.ellipse((cx+6,body_y-51,cx+11,body_y-47),fill=dark)
    # weapon varies by hero; all strokes remain inside safe padding
    if hero in ("lvbu","zhaoyun","guanyu"):
        weapon_x=cx+42+(i%2)*2
        d.line((cx+22,body_y+5,weapon_x,body_y-88),fill=dark,width=7)
        if hero=="lvbu":
            d.polygon([(weapon_x-14,body_y-89),(weapon_x,body_y-123),(weapon_x+14,body_y-89)],fill=cloth,outline=dark)
        elif hero=="guanyu":
            d.ellipse((weapon_x-15,body_y-105,weapon_x+15,body_y-75),fill=cloth,outline=dark,width=3)
        else:
            d.polygon([(weapon_x-8,body_y-91),(weapon_x,body_y-122),(weapon_x+8,body_y-91)],fill=cloth,outline=dark)
    elif hero=="zhugeliang":
        d.line((cx+23,body_y+5,cx+47,body_y-58),fill=dark,width=4)
        for k in range(5): d.line((cx+40,body_y-58+k*6,cx+63,body_y-66+k*7),fill=cloth,width=3)
    else:
        d.arc((cx+15,body_y-64,cx+77,body_y+13),270,90,fill=dark,width=5)
        d.line((cx+43,body_y-25,cx+72,body_y+5),fill=cloth,width=3)
    # motion accents for animation families
    if anim in ("attack","ultimate"):
        a=0.55 if anim=="attack" else 0.85
        d.arc((cx-83,body_y-105,cx+91,body_y+67),190-i*5,325-i*5,fill=(223,199,155,int(255*a)),width=5 if anim=="ultimate" else 3)
    elif anim=="run":
        d.line((cx-44,body_y+10,cx-66,body_y+20),fill=(255,255,255,130),width=3)
    return im

from PIL import ImageColor
def main():
  manifest={}
  for hero in HEROES:
    manifest[hero]={}
    for anim,(count,fps) in ANIMS.items():
      out=ROOT/hero/anim;out.mkdir(parents=True,exist_ok=True)
      frames=[]
      for i in range(count):
        im=frame(hero,anim,i,count);path=out/f"{i:02d}.png";im.save(path);frames.append(im)
      rows=math.ceil(count/4);sheet=Image.new("RGBA",(4*SIZE+3*GAP,rows*SIZE+(rows-1)*GAP),(0,0,0,0))
      meta=[]
      for i,im in enumerate(frames):
        col=i%4;row=i//4;x=col*(SIZE+GAP);y=row*(SIZE+GAP)
        sheet.alpha_composite(im,(x,y))
        meta.append({"filename":f"{i:02d}.png","x":x,"y":y,"width":SIZE,"height":SIZE,"durationMs":round(1000/fps),"pivot":{"x":128,"y":226},"footAnchor":{"x":128,"y":226}})
      sheet_path=out/f"{hero}_{anim}.png";sheet.save(sheet_path)
      manifest[hero][anim]={"frames":meta,"sheet":sheet_path.as_posix(),"frameWidth":SIZE,"frameHeight":SIZE,"gutter":GAP,"fps":fps,"trimmed":False}
  (ROOT/"manifest.json").write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding="utf-8")
  print(f"Generated {sum(n for n,_ in ANIMS.values())*len(HEROES)} frames")
if __name__=="__main__": main()
