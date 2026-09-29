import {rng,realmFor} from './data.js';
export const WORLD={w:2000,h:3200};
export const ROOMS=[
 {id:'outpost',name:'Ruined Outpost',x:1000,y:2910,r:235,kind:'camp'},
 {id:'road',name:'Old King’s Road',x:1000,y:2470,r:235,kind:'wolves'},
 {id:'crossing',name:'Gloam Crossing',x:1040,y:2080,r:210,kind:'wolves'},
 {id:'shrine',name:'Forgotten Shrine',x:490,y:1950,r:215,kind:'shrine'},
 {id:'bandits',name:'Ashen Encampment',x:1550,y:1990,r:225,kind:'bandits'},
 {id:'scar',name:'Rift Scar',x:960,y:1570,r:255,kind:'rift'},
 {id:'cemetery',name:'Forgotten Cemetery',x:1010,y:1110,r:250,kind:'undead'},
 {id:'grove',name:'Hollow Grove',x:1000,y:535,r:290,kind:'boss'}
];
export const FORT_POS={smith:[780,1330],quarters:[1170,1290],farm:[1310,1580],workshop:[650,1560],barracks:[810,1140],forge:[1240,1140],tower:[1000,1000],pens:[630,1350]};
export function segmentDistance(x,y,a,b){const dx=b[0]-a[0],dy=b[1]-a[1],t=Math.max(0,Math.min(1,((x-a[0])*dx+(y-a[1])*dy)/(dx*dx+dy*dy)));return Math.hypot(x-a[0]-t*dx,y-a[1]-t*dy);}
export function createWorld(depth){const r=rng(depth*71891+831),shift=depth===1?0:Math.floor(r()*100)-50;const rooms=ROOMS.map(a=>({...a,x:a.x+(a.id==='outpost'||a.id==='grove'?0:shift)}));
 const paths=[rooms.filter(a=>!['shrine','bandits'].includes(a.id)).map(a=>[a.x,a.y]),[[rooms[2].x,rooms[2].y],[rooms[3].x,rooms[3].y]],[[rooms[2].x,rooms[2].y],[rooms[4].x,rooms[4].y]]];
 const props=[],nodes=[],lights=[];let seq=0;
 const prop=(sprite,x,y,size=160,solid=0,light=null)=>{props.push({id:`p${seq++}`,sprite,x,y,size,solid,flip:r()<.5});if(light)lights.push({x,y,color:light,r:size*.85});};
 const node=(id,type,x,y,sprite,label,extra={})=>nodes.push({id,type,x,y,sprite,label,...extra});
 for(let i=0;i<510;i++){const x=70+r()*1860,y=100+r()*2980;let near=rooms.some(a=>Math.hypot(a.x-x,a.y-y)<a.r+30),road=paths.some(p=>p.some((a,j)=>j>0&&segmentDistance(x,y,p[j-1],a)<100));if(near||road)continue;prop(r()<.12?3:r()<.24?2:r()<.4?1:0,x,y,145+r()*75,18);}
 for(const a of rooms){for(let i=0;i<14;i++){const t=i/14*Math.PI*2,dist=a.r+35+r()*60;const x=a.x+Math.cos(t)*dist,y=a.y+Math.sin(t)*dist;if(paths.some(p=>p.some((v,j)=>j>0&&segmentDistance(x,y,p[j-1],v)<100)))continue;prop(a.kind==='undead'||a.kind==='boss'?2:r()<.3?1:0,x,y,140+r()*55,16);}}
 // Small light sources and harvestable resources border the traveled road.
 for(let i=0;i<38;i++){const y=410+r()*2480,x=1000+(r()<.5?-1:1)*(100+r()*165);node(`gather${i}`,i%3?'wood':'stone',x,y,i%3?19:20,i%3?'Gather wood':'Mine stone');if(i%3===0){props.push({id:`m${i}`,actorSprite:15,x:x+30,y:y+20,size:54});lights.push({x:x+30,y:y+20,color:'#36dccc',r:95});}}
 let a=rooms[0];prop(4,a.x,a.y-105,260,0);prop(5,a.x-175,a.y-65,165,24);prop(5,a.x+165,a.y-35,155,24);prop(6,a.x+135,a.y+65,150,28);prop(22,a.x-100,a.y+80,72,10,'#ff883d');
 node('camp','camp',a.x-65,a.y+20,13,'Rest at the fire',{actor:true});lights.push({x:a.x-65,y:a.y+20,color:'#ff8a39',r:230});node('chest','chest',a.x+100,a.y-25,14,'Open the old chest',{actor:true});node('ledger','lore',a.x-140,a.y-45,21,'Read the watch ledger',{lore:0});
 a=rooms[3];prop(4,a.x,a.y-40,235);node('shrine','shrine',a.x,a.y+30,23,'Awaken the shrine');lights.push({x:a.x,y:a.y,color:'#39d9e8',r:220});node('fox','fox',a.x+70,a.y+45,17,'Befriend the spectral fox',{actor:true});
 a=rooms[4];prop(6,a.x-95,a.y-90,170,20);prop(6,a.x+95,a.y-30,165,20);node('prisoner','rescue',a.x+95,a.y+55,16,'Free the blacksmith',{actor:true,npc:'smith',requires:'bandits'});node('banditChest','chest',a.x-90,a.y+45,14,'Open the raiders’ cache',{actor:true,requires:'bandits'});props.push({id:'bf',actorSprite:13,x:a.x,y:a.y+10,size:80});lights.push({x:a.x,y:a.y+10,color:'#ed7829',r:150});
 a=rooms[5];for(let i=0;i<7;i++){let t=i/7*Math.PI*2;prop(18,a.x+Math.cos(t)*165,a.y+Math.sin(t)*125,90,0,'#9650f5');}node('scar','rift',a.x,a.y,10,'Seal the Rift Scar',{requires:'scar'});node('research','lore',a.x+145,a.y+80,21,'Read the torn research',{lore:2});
 a=rooms[6];for(let i=0;i<12;i++)prop(11,a.x-180+(i%4)*120,a.y-140+Math.floor(i/4)*110,80,11);prop(4,a.x,a.y-220,210);node('hunter','rescue',a.x-205,a.y+40,16,'Rescue the hunter',{actor:true,npc:'hunter',requires:'cemetery'});
 a=rooms[7];for(let i=0;i<10;i++){let t=i/10*Math.PI*2;prop(3,a.x+Math.cos(t)*260,a.y+Math.sin(t)*230,100,22);}node('groveLore','lore',a.x-215,a.y+100,23,'Listen to the roots',{lore:3});node('deep','deep',a.x,a.y-240,10,'Enter the Deep Rift',{requires:'grove'});lights.push({x:a.x,y:a.y-240,color:'#ad58ff',r:220});
 return{...WORLD,rooms,paths,props,nodes,lights,realm:realmFor(depth),seed:depth};
}
export function fortressWorld(s,clanLevel=0){const props=[],nodes=[],lights=[{x:1000,y:1490,color:'#f98a38',r:260}],w=2000,h=2400;let level=clanLevel||Object.values(s.fort).reduce((a,b)=>a+b,0);props.push({actorSprite:13,x:1000,y:1490,size:95,id:'fire'});nodes.push({id:'rest',type:'camp',x:1000,y:1490,label:'Rest by the fire'});for(let i=0;i<54;i++){let r=rng(i*819+77);props.push({id:`tree${i}`,sprite:i%3===0?1:0,x:i%2?460+r()*70:1480+r()*100,y:830+r()*950,size:170+r()*70,solid:20});}
 for(const [key,[x,y]]of Object.entries(FORT_POS)){let built=s.fort[key]||0;if(clanLevel)built=clanLevel>Object.keys(FORT_POS).indexOf(key)?1:0;if(built){props.push({id:key,sprite:{smith:7,quarters:8,farm:15,workshop:16,barracks:17,forge:10,tower:9,pens:6}[key],x,y,size:key==='tower'?280:210+Math.min(built,5)*7,solid:key==='farm'?0:48});if(['smith','forge','tower'].includes(key))lights.push({x,y:y-25,color:key==='smith'?'#ff7927':key==='forge'?'#a25aff':'#54d7e1',r:160});}nodes.push({id:key,type:'building',x,y:y+55,label:(built?'Visit ':'Build ')+key,building:key,built});}
 if(s.fort.walls||clanLevel>2){for(let i=0;i<7;i++)if(i!==3)props.push({id:`wall${i}`,sprite:14,x:610+i*130,y:1740,size:175,solid:30});props.push({id:'gate',sprite:13,x:1000,y:1740,size:240});for(const x of[580,1450])props.push({id:`tower${x}`,sprite:12,x,y:1710,size:240,solid:40});}
 if(!s.fort.quarters)props.push({id:'tent',sprite:6,x:1130,y:1340,size:175,solid:20});
 for(let i=0;i<s.survivors.length;i++){const id=s.survivors[i];nodes.push({id:`npc-${id}`,type:'npc',npc:id,x:770+i*150,y:1450+i%2*130,sprite:16,actor:true,label:'Speak to '+id});}
 nodes.push({id:'depart',type:'depart',x:1000,y:1690,sprite:10,size:90,label:'Return to the Gloam Wilds'});
 return{w,h,rooms:[{id:'fortress',name:clanLevel?'Clan Stronghold':level>=18?'The Citadel':level>=7?'Emberhold Settlement':'Emberhold Camp',x:1000,y:1450,r:700}],paths:[[[1000,1780],[1000,1040]],[[680,1460],[1360,1460]]],props,nodes,lights,realm:realmFor(1),seed:0};
}
