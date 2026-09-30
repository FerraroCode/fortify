import {appearanceOf,WEAPON_ART} from './data.js?v=080';

export const WEAPON_GRIPS={
 sword:{sprite:18,grip:[123,55],tip:[103,238],scale:.53},
 greatsword:{sprite:19,grip:[153,53],tip:[80,237],scale:.61},
 bow:{sprite:20,grip:[91,132],scale:.48,mirror:true},
 staff:{sprite:21,grip:[103,153],tip:[153,39],scale:.60}
};
export const BODY_ANCHORS={
 male:{neck:{x:132,y:23},waist:{x:132,y:151},shoulders:[{x:94,y:48},{x:174,y:49}]},
 female:{neck:{x:385,y:29},waist:{x:382,y:151},shoulders:[{x:353,y:56},{x:423,y:56}]}
};
export function bodyShape(state){
 const a=appearanceOf(state),width={thin:.88,average:1,muscular:1.17}[a.bodyStyle],arm={thin:.9,average:1,muscular:1.12}[a.bodyStyle],female=a.gender==='female';
 return{...a,width,arm,torsoScale:width*(female?.98:1.1),torsoWidth:72*width*(female?.91:1),hips:32*width*(female?1.07:1),legWidth:1+(width-1)*.7,headWidth:female?35:37,headHeight:48};
}
// Apply the same transform used to draw the torso. Shoulder joints can no
// longer drift outward when the torso's proportions change.
export function mapBonePoint(point,a,b,targetA,targetB,width=1){
 const sl=Math.hypot(b.x-a.x,b.y-a.y),tl=Math.hypot(targetB.x-targetA.x,targetB.y-targetA.y);
 const ux=(b.x-a.x)/sl,uy=(b.y-a.y)/sl,vx=(targetB.x-targetA.x)/tl,vy=(targetB.y-targetA.y)/tl;
 const dx=point.x-a.x,dy=point.y-a.y,along=(dx*ux+dy*uy)*tl/sl,across=(-dx*uy+dy*ux)*tl/sl*width;
 return{x:targetA.x+along*vx-across*vy,y:targetA.y+along*vy+across*vx};
}
const rotate=(a,b,angle)=>{const x=b.x-a.x,y=b.y-a.y;return{x:a.x+x*Math.cos(angle)-y*Math.sin(angle),y:a.y+x*Math.sin(angle)+y*Math.cos(angle)};};
export function characterPose(state,p={},time=0){
 const shape=bodyShape(state),walk=p.moving?Math.sin(time*10):0,bob=Math.sin(time*2)*.45-Math.abs(walk)*1.25,center=90;
 const source=BODY_ANCHORS[shape.gender],neck={x:93,y:50+bob},waist={x:90,y:145+bob};
 const shoulders=source.shoulders.map(pt=>mapBonePoint(pt,source.neck,source.waist,neck,waist,shape.torsoScale));
 const hips=[{x:center-shape.hips/2,y:142+bob},{x:center+shape.hips/2,y:140+bob}];
 const feet=[{x:70-(shape.width-1)*12,y:216},{x:111+(shape.width-1)*12,y:212}];
 feet[0]=rotate(hips[0],feet[0],walk*.095);feet[1]=rotate(hips[1],feet[1],-walk*.095);
 feet[0].y-=Math.max(0,walk)*3;feet[1].y-=Math.max(0,-walk)*3;
 let hands=[{x:shoulders[0].x-5,y:133+bob},{x:shoulders[1].x+7,y:130+bob}];
 hands[0]=rotate(shoulders[0],hands[0],-walk*.10);hands[1]=rotate(shoulders[1],hands[1],walk*.10);
 const weapon=state.inventory?.find(i=>i.uid===state.equipment?.weapon),kind=weapon?.kind||'unarmed';
 const phase=p.swing>0?1-Math.min(1,p.swing/.24):0,attack=p.swing>0?Math.sin(phase*Math.PI):0;
 if(kind==='bow'){hands[1]={x:145+(shape.width-1)*18,y:108+bob};hands[0]={x:112-attack*13,y:110+bob};}
 else if(kind==='staff'){hands[1]={x:shoulders[1].x+12+attack*8,y:121+bob};}
 else if(attack){hands[1]={x:hands[1].x+attack*11,y:hands[1].y-attack*15};}
 return{shape,walk,bob,neck,waist,shoulders,hips,feet,hands,head:{x:93,y:31+bob,width:shape.headWidth,height:shape.headHeight},kind,weapon,attack,weaponAngle:kind==='staff'?-1.43+attack*.12:-1.23+attack*1.95};
}
export function weaponTransform(pose){
 const d=WEAPON_ART[pose.weapon?.weaponArt]||WEAPON_GRIPS[pose.kind];if(!d)return null;
 return{...d,x:pose.hands[1].x,y:pose.hands[1].y,angle:pose.kind==='bow'?0:pose.weaponAngle-Math.atan2(d.tip[1]-d.grip[1],d.tip[0]-d.grip[0]),mirror:!!d.mirror};
}
