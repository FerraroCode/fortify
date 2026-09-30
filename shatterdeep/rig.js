import {appearanceOf} from './data.js?v=070';

export const WEAPON_GRIPS={
 sword:{sprite:18,grip:[123,55],tip:[103,238],scale:.53},
 greatsword:{sprite:19,grip:[153,53],tip:[80,237],scale:.61},
 bow:{sprite:20,grip:[91,132],scale:.48},
 staff:{sprite:21,grip:[103,153],tip:[153,39],scale:.60}
};
export function bodyShape(state){const a=appearanceOf(state),width={thin:.88,average:1,muscular:1.17}[a.bodyStyle],arm={thin:.83,average:1,muscular:1.2}[a.bodyStyle],female=a.gender==='female';return{...a,width,arm,torsoWidth:72*width*(female?.91:1),shoulders:66*width*(female?.93:1),hips:32*width*(female?1.07:1),legWidth:1+(width-1)*.7,headWidth:female?35:37,headHeight:48};}
const rotate=(a,b,angle)=>{const x=b.x-a.x,y=b.y-a.y;return{x:a.x+x*Math.cos(angle)-y*Math.sin(angle),y:a.y+x*Math.sin(angle)+y*Math.cos(angle)};};
export function characterPose(state,p={},time=0){const shape=bodyShape(state),walk=p.moving?Math.sin(time*10):0,bob=Math.sin(time*2)*.45-Math.abs(walk)*1.25,center=90,shoulders=[{x:center-shape.shoulders/2,y:67+bob},{x:center+shape.shoulders/2,y:67+bob}],hips=[{x:center-shape.hips/2,y:142+bob},{x:center+shape.hips/2,y:140+bob}],feet=[{x:70-(shape.width-1)*12,y:216},{x:111+(shape.width-1)*12,y:212}];
 feet[0]=rotate(hips[0],feet[0],walk*.095);feet[1]=rotate(hips[1],feet[1],-walk*.095);feet[0].y-=Math.max(0,walk)*3;feet[1].y-=Math.max(0,-walk)*3;
 let hands=[{x:shoulders[0].x-8,y:133+bob},{x:shoulders[1].x+10,y:130+bob}];hands[0]=rotate(shoulders[0],hands[0],-walk*.13);hands[1]=rotate(shoulders[1],hands[1],walk*.13);
 const weapon=state.inventory?.find(i=>i.uid===state.equipment?.weapon),kind=weapon?.kind||'unarmed';const phase=p.swing>0?1-Math.min(1,p.swing/.24):0,attack=p.swing>0?Math.sin(phase*Math.PI):0;
 if(kind==='bow'){hands[1]={x:145+(shape.width-1)*18,y:108+bob};hands[0]={x:112-attack*13,y:110+bob};}
 else if(kind==='staff'){hands[1]={x:shoulders[1].x+15+attack*8,y:121+bob};}
 else if(attack){hands[1]={x:hands[1].x+attack*11,y:hands[1].y-attack*15};}
 return{shape,walk,bob,shoulders,hips,feet,hands,head:{x:93,y:31+bob,width:shape.headWidth,height:shape.headHeight},torso:{x:90-shape.torsoWidth/2,y:53+bob,w:shape.torsoWidth,h:94},kind,attack,weaponAngle:kind==='staff'?-1.43+attack*.12:-1.23+attack*1.95};}
export function weaponTransform(pose){const d=WEAPON_GRIPS[pose.kind];if(!d)return null;return{...d,x:pose.hands[1].x,y:pose.hands[1].y,angle:pose.kind==='bow'?0:pose.weaponAngle-Math.atan2(d.tip[1]-d.grip[1],d.tip[0]-d.grip[0]),mirror:pose.kind==='bow'};}
