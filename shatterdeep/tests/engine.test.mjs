import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Game} from '../engine.js';
import {SAVE_KEY,stats,item,buildingCost,freshSave,safeSave,appearanceOf,ITEMS,rng} from '../data.js';
import {characterPose,weaponTransform} from '../rig.js';
import {createWorld,FORT_POS} from '../world.js';
const storage=()=>{const data=new Map();return{getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),removeItem:k=>data.delete(k)}};
function game(){const g=new Game(storage());g.paused=false;g.state.created=true;return g;}
function frames(g,seconds){for(let i=0;i<seconds*60;i++)g.update(1/60);}
test('new player survives the opening encounter using real auto-attacks',()=>{const g=game();g.p.x=1000;g.p.y=2460;frames(g,25);assert.ok(g.run.cleared.includes('road'));assert.equal(g.state.kills,2);assert.ok(g.state.hp>0);assert.ok(g.drops.some(d=>d.def==='iron')||g.state.inventory.some(i=>i.def==='iron'));});
test('a pending encounter and position survive a save and reload',()=>{const g=game();g.p.x=1000;g.p.y=2470;frames(g,.1);g.enemies[0].hp=19;g.save();const next=new Game(g.storage);assert.equal(next.enemies.length,2);assert.equal(next.enemies[0].hp,19);assert.equal(next.p.x,g.p.x);assert.deepEqual(next.run.cleared,g.run.cleared);});
test('opening chest grants resources and visible equippable weapons only once',()=>{const g=game();const chest=g.world.nodes.find(n=>n.id==='chest');g.p.x=chest.x;g.p.y=chest.y+50;g.interact(chest);assert.equal(g.state.bag.gold,17);const bow=g.state.inventory.find(i=>i.def==='bow');assert.ok(bow);g.equip(bow.uid);assert.equal(stats(g.state).weapon,'bow');assert.equal(stats(g.state).range,480);assert.equal(g.available(chest),false);});
test('fortress upgrades spend resources once, change the world, and survive reload',()=>{const g=game();g.state.bag={gold:100,wood:100,stone:100,ember:5,food:0};g.enterFortress();const before=g.state.bank.gold,cost=buildingCost(g.state,'smith');assert.equal(g.build('smith'),true);assert.equal(g.state.bank.gold,before-cost.gold);assert.ok(g.world.props.some(p=>p.id==='smith'));assert.equal(g.state.fort.smith,1);g.leaveFortress();const reload=new Game(g.storage);assert.equal(reload.state.fort.smith,1);});
test('death retains equipped gear and depth, loses only carried resources, and respawns',()=>{const g=game();g.state.bank.gold=100;g.state.bag.gold=40;const eq={...g.state.equipment};g.state.hp=1;g.hurt(1000);assert.equal(g.state.bag.gold,36);assert.equal(g.state.bank.gold,100);assert.deepEqual(g.state.equipment,eq);assert.equal(g.state.depth,1);assert.equal(g.state.hp,stats(g.state).maxHp);assert.equal(g.p.y,2990);});
test('dodge gives brief invulnerability and cooldowns prevent repeated healing',()=>{const g=game();g.state.hp=30;g.ability('heal');const hp=g.state.hp;assert.equal(g.ability('heal'),false);assert.equal(g.state.hp,hp);g.ability('dodge');g.hurt(40);assert.equal(g.state.hp,hp);frames(g,1);assert.equal(g.p.invuln,0);});
test('boss telegraphs attacks, changes phase, summons, and opens the next depth',()=>{const g=game();g.run.cleared.push('scar');g.p.x=1000;g.p.y=600;frames(g,.1);let boss=g.enemies.find(e=>e.type==='boss');assert.ok(boss);boss.cooldown=0;frames(g,.02);assert.ok(boss.windup>0);assert.equal(boss.attack,'charge');boss.hp=boss.max*.3;frames(g,.02);assert.equal(boss.phase,2);assert.ok(g.enemies.some(e=>e.type==='stalker'));for(const e of g.enemies.slice())g.damageEnemy(e,10000);assert.ok(g.run.cleared.includes('grove'));assert.equal(g.state.bosses,1);g.descend();assert.equal(g.state.depth,2);assert.equal(g.run.cleared.length,0);assert.equal(g.state.bestDepth,2);assert.equal(g.state.bosses,1);});
test('maps are deterministic, change at depth, and later depths introduce stalkers',()=>{assert.deepEqual(createWorld(2),createWorld(2));assert.notDeepEqual(createWorld(1).props,createWorld(2).props);const g=game();g.state.depth=3;g.state.run=null;g.loadRun();g.p.x=1000;g.p.y=2470;frames(g,.1);assert.ok(g.enemies.some(e=>e.type==='stalker'));});
test('offline production caps at eight hours and cannot be claimed twice',()=>{const mem=storage(),s=freshSave();s.created=true;s.survivors=['smith'];s.fort={workshop:1,farm:1,quarters:1};s.lastSaved=Date.now()-24*3600000;mem.setItem(SAVE_KEY,JSON.stringify(s));const g=new Game(mem);assert.equal(g.state.bank.wood,40);assert.equal(g.state.bank.stone,24);assert.equal(g.state.bank.food,32);const second=new Game(mem);assert.equal(second.state.bank.wood,40);assert.equal(second.offline,null);});
test('legacy saves preserve player progress and owned equipment',()=>{const mem=storage();mem.setItem('shatterdeep-v03',JSON.stringify({created:true,name:'Veteran',depth:4,level:9,gold:120,stone:8,ember:3,inv:['rust','cinder','plate'],eq:{weapon:'cinder',chest:'plate'},fort:{smith:2}}));const g=new Game(mem);assert.equal(g.state.depth,4);assert.equal(g.state.level,9);assert.equal(g.state.bank.gold,120);assert.equal(g.state.equipment.weapon,'legacy-cinder');assert.equal(g.state.fort.smith,2);});
test('invalid inventory entries are filtered and an absent weapon is repaired',()=>{const s=safeSave({name:'Test',inventory:[{def:'not-real',uid:'x'}],equipment:{weapon:'x'},level:-3,depth:Infinity});assert.equal(s.level,1);assert.equal(s.depth,1);assert.equal(s.inventory[0].def,'rust');assert.ok(s.equipment.weapon);});

test('unequipping every slot persists without deleting items or restoring a weapon',()=>{const g=game(),count=g.state.inventory.length;for(const slot of ['weapon','chest','boots'])assert.equal(g.unequip(slot),true);const next=new Game(g.storage);assert.equal(next.state.inventory.length,count);assert.equal(next.state.equipment.weapon,null);assert.equal(stats(next.state).weapon,'unarmed');assert.equal(stats(next.state).armor,0);});
test('each construction relocates an overlapping player and allows immediate movement',()=>{for(const [key,[x,y]]of Object.entries(FORT_POS)){const g=game();g.state.bank={gold:10000,stone:10000,wood:10000,ember:100,food:0};g.enterFortress();g.p.x=x;g.p.y=y;assert.ok(g.build(key));assert.equal(g.isBlocked(g.p.x,g.p.y),false,key);const before={...g.p};g.move(0,1,.1,stats(g.state));assert.ok(g.p.x!==before.x||g.p.y!==before.y,key);}});
test('existing trapped saves can escape solid geometry',()=>{const g=game();g.enterFortress();const p=g.world.props.find(p=>p.solid);g.p.x=p.x;g.p.y=p.y;g.move(1,0,.016,stats(g.state));assert.equal(g.isBlocked(g.p.x,g.p.y),false);});
test('one interaction gathers a resource and duplicate taps cannot grant it again',()=>{const g=game(),n=g.world.nodes.find(n=>n.type==='wood');g.p.x=n.x;g.p.y=n.y;g.interact(n);assert.ok(g.state.bag.wood>=6);const amount=g.state.bag.wood;g.interact(n);assert.equal(g.state.bag.wood,amount);assert.equal(g.available(n),false);});

test('pre-creator saves keep gear, progress, skin, hair color and broad build',()=>{
 const s=freshSave();for(const key of ['gender','face','hairStyle','hairColor','facialHair','bodyStyle'])delete s[key];
 Object.assign(s,{name:'Veteran',body:1,hair:3,skin:4,level:9,depth:17,bestDepth:17,fort:{smith:3}});
 const next=safeSave(s);
 assert.deepEqual(appearanceOf(next),{gender:'male',face:0,hairStyle:'short',hairColor:3,facialHair:'none',bodyStyle:'muscular',skin:4});
 assert.deepEqual(next.inventory,s.inventory);assert.deepEqual(next.equipment,s.equipment);
 assert.equal(next.depth,17);assert.equal(next.fort.smith,3);assert.deepEqual(stats(next),stats(s));
});
test('all appearance choices persist without changing equipment or stats',()=>{
 const g=game(),before=stats(g.state),eq={...g.state.equipment};
 for(const gender of ['male','female'])for(const bodyStyle of ['thin','average','muscular']){
  Object.assign(g.state,{gender,bodyStyle,face:3,hairStyle:'braids',hairColor:4,skin:3,facialHair:gender==='male'?'full':'none'});g.save();
  const next=new Game(g.storage);assert.deepEqual(appearanceOf(next.state),appearanceOf(g.state));
  assert.deepEqual(next.state.equipment,eq);assert.deepEqual(stats(next.state),before);
 }
 assert.deepEqual(appearanceOf({gender:'bad',face:99,hairStyle:'bad',hairColor:-1,bodyStyle:'bad',skin:99}),appearanceOf({}));
 assert.equal(safeSave({...g.state,gender:'female',facialHair:'full'}).facialHair,'none');
});
test('weapon handles stay in the palm during walking and attacks for every body shape',()=>{
 for(const gender of ['male','female'])for(const bodyStyle of ['thin','average','muscular'])for(const id of ['rust','iron','void','cinder','sun','bow','moonbow','staff','riftstaff']){
  const s={...freshSave(),gender,bodyStyle,inventory:[item(id,1,'w')],equipment:{weapon:'w'}};
  for(const t of [0,.07,.12,.21])for(const moving of [false,true]){
   const pose=characterPose(s,{moving,swing:.24-t},t),tr=weaponTransform(pose);
   assert.equal(tr.x,pose.hands[1].x);assert.equal(tr.y,pose.hands[1].y);
   assert.ok(Number.isFinite(tr.angle));
   if(t===0&&tr.tip){const dx=tr.tip[0]-tr.grip[0],dy=tr.tip[1]-tr.grip[1];assert.ok(dx*Math.sin(tr.angle)+dy*Math.cos(tr.angle)<0,'resting blade points up');}
   if(pose.kind==='bow')assert.equal(tr.mirror,id==='bow','new bow sprites already face outward');
  }
 }
});

test('bows and staffs hit distant enemies while swords stay close range',()=>{
 for(const [id,range] of [['bow',460],['staff',420],['iron',150]]){
  const g=game();g.world.rooms=[];g.world.props=[];g.state.inventory=[item(id,1,'w')];g.state.equipment={weapon:'w'};
  g.spawn('brute',g.p.x+range,g.p.y,'test');const e=g.enemies[0];e.speed=0;e.cooldown=99;e.hp=e.max=10000;
  frames(g,1.4);if(id==='iron'){assert.equal(e.hp,10000);assert.equal(g.attackCount,0);}else{assert.ok(e.hp<10000,id+' must hit before melee distance');assert.ok(g.attackCount>0);assert.equal(e.x,g.p.x+range);}
 }
});
test('new effects poison, chill, heal and arc without recursive procs',()=>{
 const g=game();g.world.rooms=[];g.world.props=[];g.state.inventory=['viperdagger','frosthelm','bloodstaff','stormhammer'].map((d,i)=>item(d,1,'effect'+i));g.state.equipment={weapon:'effect0',helmet:'effect1'};
 g.spawn('brute',g.p.x+160,g.p.y,'test');g.spawn('brute',g.p.x+220,g.p.y,'test');const [a,b]=g.enemies;for(const e of [a,b]){e.hp=e.max=10000;e.speed=0;e.cooldown=99;}
 g.damageEnemy(a,10);assert.ok(a.poison);assert.equal(a.slowed,2);const poisoned=a.hp;g.attackTimer=99;frames(g,.65);assert.ok(a.hp<poisoned);
 g.state.equipment.weapon='effect2';g.state.hp=40;g.damageEnemy(a,50,'ranged');assert.ok(g.state.hp>40);
 g.state.equipment.weapon='effect3';const hp=b.hp;for(let i=0;i<3;i++)g.damageEnemy(a,10);assert.ok(b.hp<hp);assert.ok(g.effects.some(f=>f.type==='arc'));
});
test('expanded loot avoids recent repeats and retains history across reloads',()=>{
 const g=game();assert.equal(Object.keys(ITEMS).length,61);const random=Math.random;Math.random=rng(880);
 try{const found=new Set();let repeats=0,last='';for(let i=0;i<120;i++){const id=g.rollLoot(i%6===0?2:0);assert.ok(ITEMS[id]);found.add(id);if(id===last)repeats++;last=id;}assert.ok(found.size>=35);assert.ok(repeats<8);g.save();assert.deepEqual(new Game(g.storage).state.recentLoot,g.state.recentLoot);assert.equal(g.state.recentLoot.length,10);}finally{Math.random=random;}
});
test('bulk salvage protects best, equipped and unique gear and persists exact proceeds',()=>{
 const g=game();g.state.inventory=[item('iron',1,'worn'),item('iron',5,'best'),item('iron',2,'spare'),item('iron',5,'tie'),item('frostplate',2,'unique')];g.state.equipment={weapon:'worn',chest:'unique'};
 assert.deepEqual(g.duplicateItems().map(i=>i.uid),['spare','tie']);assert.equal(g.state.inventory.length,5);
 assert.equal(g.salvageDuplicates(),2);assert.deepEqual(g.state.inventory.map(i=>i.uid),['worn','best','unique']);assert.equal(g.state.bank.gold,25);assert.equal(g.state.bank.stone,4);assert.equal(g.salvageDuplicates(),0);
 const next=new Game(g.storage);assert.equal(next.state.equipment.weapon,'worn');assert.equal(next.state.inventory.length,3);assert.equal(next.state.bank.gold,25);
});
