export const VERSION = '0.5.0';
export const SAVE_KEY = 'shatterdeep-v05';
export const RARITIES = ['common','rare','epic','legendary','mythic'];
export const COLORS = {common:'#c1c7c9',rare:'#68c9ff',epic:'#b68aff',legendary:'#ffc965',mythic:'#ff87cf'};
export const PRESETS = [
 {id:'wanderer',name:'Wanderer',text:'A cloak, a blade, and a second chance.',sprite:0},
 {id:'knight',name:'Knight',text:'An oath outlives the kingdom.',sprite:1},
 {id:'hunter',name:'Hunter',text:'The wilds remember your footsteps.',sprite:2},
 {id:'acolyte',name:'Acolyte',text:'A small light against the dark.',sprite:3},
 {id:'blademaster',name:'Blademaster',text:'Steel is a language you understand.',sprite:4},
 {id:'riftborn',name:'Riftborn',text:'Something beyond the veil knows your name.',sprite:5}
];
export const SKINS=['#e9ba94','#c58e68','#a66e4c','#79503a','#4f332d'];
export const HAIRS=['#28212b','#64432d','#a45936','#d5b375','#d6d2d5'];
export const SLOTS=['weapon','chest','helmet','gloves','boots','cloak','shield'];
export const ITEMS={
 rust:{name:'Rustblade',slot:'weapon',kind:'sword',power:6,sprite:18,rarity:0,desc:'Old steel. A new beginning.'},
 iron:{name:'King’s Road Cleaver',slot:'weapon',kind:'sword',power:11,sprite:18,rarity:1,desc:'Recovered from the fallen royal guard.'},
 cinder:{name:'Cinderwake',slot:'weapon',kind:'greatsword',power:16,sprite:19,rarity:2,effect:'cinder',desc:'Defeated foes erupt, burning nearby enemies.'},
 sun:{name:'Sunbreaker',slot:'weapon',kind:'greatsword',power:23,sprite:19,rarity:3,effect:'cinder',desc:'Carry the last fire of the old kingdom.'},
 void:{name:'Voidfang',slot:'weapon',kind:'sword',power:28,sprite:18,rarity:4,effect:'blades',desc:'Every fourth strike calls spectral blades.'},
 bow:{name:'Blackwood Bow',slot:'weapon',kind:'bow',power:10,sprite:20,rarity:1,desc:'Automatically fires at distant enemies.'},
 moonbow:{name:'Moonthorn',slot:'weapon',kind:'bow',power:19,sprite:20,rarity:3,effect:'blades',desc:'Every fourth arrow calls spectral blades.'},
 staff:{name:'Watcher’s Staff',slot:'weapon',kind:'staff',power:12,sprite:21,rarity:1,desc:'Fires a bolt of cyan magic.'},
 riftstaff:{name:'Starless Branch',slot:'weapon',kind:'staff',power:22,sprite:21,rarity:3,effect:'rift',desc:'Deals 30% more damage near Rift corruption.'},
 coat:{name:'Wanderer’s Coat',slot:'chest',armor:3,rarity:0,look:0,desc:'Worn leather and a weathered cloak.'},
 plate:{name:'Ironwatch Plate',slot:'chest',armor:8,rarity:1,look:1,desc:'The old guard still has something to give.'},
 robes:{name:'Gloamweave Robes',slot:'chest',armor:6,rarity:1,look:3,effect:'focus',desc:'Rift Burst recovers 20% faster.'},
 emberplate:{name:'Emberguard',slot:'chest',armor:13,rarity:2,look:1,effect:'ward',desc:'Heavy hits grant a brief ward. 12s cooldown.'},
 sunplate:{name:'Dawnforged Plate',slot:'chest',armor:20,rarity:3,look:1,effect:'ward',desc:'A shining plate mantle. Heavy hits grant a ward.'},
 voidplate:{name:'Starless Carapace',slot:'chest',armor:28,rarity:4,look:5,effect:'rift',desc:'The Rift recognizes its own. +30% damage near corruption.'},
 hood:{name:'Ash Hood',slot:'helmet',armor:2,rarity:0,desc:'Keeps the rain and the world out.'},
 helm:{name:'Ironwatch Helm',slot:'helmet',armor:5,rarity:1,sprite:22,desc:'A battered visor. Still trustworthy.'},
 crown:{name:'Crown of the Hollow',slot:'helmet',armor:12,rarity:4,sprite:23,effect:'rift',desc:'Violet antlers. The forest has a new sovereign.'},
 grips:{name:'Trailworn Grips',slot:'gloves',armor:2,rarity:0,desc:'Leather gloves with iron stitching.'},
 gauntlets:{name:'Cinder Gauntlets',slot:'gloves',armor:5,rarity:2,effect:'might',desc:'Adds 10% attack damage.'},
 boots:{name:'Wayfarer Boots',slot:'boots',armor:2,rarity:0,desc:'One more mile.'},
 emberboots:{name:'Ashstrider Boots',slot:'boots',armor:5,rarity:2,effect:'trail',desc:'Dodging leaves a trail of damaging fire.'},
 mantle:{name:'Gloam Mantle',slot:'cloak',armor:2,rarity:1,effect:'haste',desc:'A long teal cloak. Move 10% faster.'},
 voidcloak:{name:'Veil of the Rift',slot:'cloak',armor:7,rarity:3,effect:'focus',desc:'Violet silk. Rift Burst recovers 20% faster.'},
 buckler:{name:'Outpost Buckler',slot:'shield',armor:4,rarity:0,desc:'A small iron shield.'},
 aegis:{name:'Watcher’s Aegis',slot:'shield',armor:10,rarity:3,effect:'ward',desc:'Cyan runes ward off heavy blows.'}
};
export const BUILDINGS={
 smith:{name:'Blacksmith',sprite:7,wood:18,stone:12,gold:15,desc:'Unlocks weapon and armor upgrades.',bonus:'Equipment upgrade limit +2 per level.'},
 quarters:{name:'Quarters',sprite:8,wood:22,stone:8,gold:12,desc:'Shelter for survivors. Increases worker capacity.',bonus:'Houses 3 survivors per level.'},
 walls:{name:'Stone walls',sprite:14,wood:15,stone:30,gold:20,desc:'Restore the outpost’s defenses.',bonus:'+8 maximum health per level.'},
 farm:{name:'Farms',sprite:15,wood:25,stone:5,gold:12,desc:'Produce food while you are away.',bonus:'+4 food per hour per level.'},
 workshop:{name:'Workshop',sprite:16,wood:30,stone:25,gold:30,desc:'Workers gather wood and stone.',bonus:'+5 wood and +3 stone per hour per level.'},
 barracks:{name:'Barracks',sprite:17,wood:40,stone:35,gold:45,desc:'Train your rescued companions.',bonus:'+15% companion damage per level.'},
 forge:{name:'Rift Forge',sprite:10,wood:35,stone:45,gold:60,ember:3,desc:'Craft a random Epic or better item.',bonus:'Unlocks Rift forging; better odds each level.'},
 tower:{name:'Mage tower',sprite:9,wood:50,stone:65,gold:80,ember:4,desc:'Research the magic of The Shattering.',bonus:'+12% ability damage per level.'},
 pens:{name:'Creature pens',sprite:6,wood:35,stone:15,gold:25,desc:'A haven for the creatures you rescue.',bonus:'Companions restore 2% health every 10 seconds.'}
};
export const NPCS={smith:{name:'Orin',role:'Blacksmith',text:'“I made swords for a king once. Now I’ll make them for someone who deserves one.”'},hunter:{name:'Ysra',role:'Hunter',text:'“Those antlers were not always violet. Something is feeding beneath the grove.”'},scholar:{name:'Sera',role:'Researcher',text:'“The stones were cut from the inside. The Shattering was a door being opened.”'}};
export const LORE=[
 {title:'The last watch',text:'The roads are quiet. No bells from the capital. Captain says to keep the fire lit. Someone will come. Someone always comes.\n\n— Outpost watch ledger, final entry'},
 {title:'The Watcher’s vow',text:'We did not build the shrines to keep the darkness out. We built them to keep something in. When the last flame fails, remember the vow.'},
 {title:'A door, not a wound',text:'The Rift edges are too clean. Their pattern is deliberate. Someone beneath the palace completed the circle. The world did not break. It was opened.'},
 {title:'The Hollow King',text:'A forest spirit guarded this grove for a thousand years. It drank from a spring beneath the roots. Now the spring runs violet. Whatever sleeps below is waking.'},
 {title:'Beyond the first veil',text:'There is another road on the other side. The same stones. The same trees. But the stars are wrong. How many times has this world been shattered?'}
];
export const REGIONS=[{name:'Gloam Wilds',min:1,max:100,hue:0},{name:'Blackwood',min:101,max:250,hue:22},{name:'Frozen Kingdom',min:251,max:500,hue:145},{name:'Hellscar',min:501,max:1000,hue:255},{name:'The Void',min:1001,max:Infinity,hue:65}];
export const realmFor=d=>REGIONS.find(r=>d<=r.max);
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function rng(seed){let a=seed>>>0;return()=>{a+=0x6D2B79F5;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
export function item(def,level=1,uid){const d=ITEMS[def]||ITEMS.rust;return {def,level:clamp(Math.floor(level),1,1e7),upgrade:0,uid:uid||globalThis.crypto.randomUUID(),...d};}
export function freshSave(){return {version:5,created:false,name:'Wanderer',preset:'wanderer',skin:1,hair:0,body:0,level:1,xp:0,depth:1,bestDepth:1,kills:0,bosses:0,hp:120,bag:{gold:0,wood:0,stone:0,ember:0,food:0},bank:{gold:0,wood:0,stone:0,ember:0,food:0},inventory:[item('rust',1,'start-weapon'),item('coat',1,'start-chest'),item('boots',1,'start-boots')],equipment:{weapon:'start-weapon',chest:'start-chest',boots:'start-boots'},fort:{},survivors:[],companions:[],companion:null,lore:[],perks:{might:0,vitality:0,focus:0,fortune:0},perkPoints:0,run:null,visited:[],lastSaved:Date.now(),settings:{sound:true,particles:true,shake:true},tutorial:false};}
export function equipment(s){return Object.fromEntries(SLOTS.map(slot=>[slot,s.inventory.find(i=>i.uid===s.equipment[slot])]));}
export function stats(s){let gear=equipment(s),damage=8+s.level*1.5,armor=0,effects=[];for(const i of Object.values(gear)){if(!i)continue;let f=1+(i.level-1)*.065+i.upgrade*.17;damage+=(i.power||0)*f;armor+=(i.armor||0)*f;if(i.effect)effects.push(i.effect);}damage*=1+(s.perks.might||0)*.06+(effects.includes('might')?.1:0);let weapon=gear.weapon?.kind||'sword';return {damage:Math.round(damage),armor:Math.round(armor),maxHp:120+(s.level-1)*10+(s.fort.walls||0)*8+(s.perks.vitality||0)*14,range:weapon==='bow'?260:weapon==='staff'?220:weapon==='greatsword'?96:76,attackRate:weapon==='bow'?.72:weapon==='staff'?.85:weapon==='greatsword'?.95:.62,speed:168*(effects.includes('haste')?1.1:1),ability:1+(s.fort.tower||0)*.12+(s.perks.focus||0)*.07,effects,weapon};}
export const xpNeeded=s=>Math.floor(65*Math.pow(s.level,1.25));
export function buildingCost(s,k){const b=BUILDINGS[k],m=Math.pow(1.65,s.fort[k]||0);return Object.fromEntries(['gold','wood','stone','ember'].filter(r=>b[r]).map(r=>[r,Math.ceil(b[r]*m)]));}
export function titleFor(s){return s.bestDepth>=1001?'Voidwalker':s.bestDepth>=100?'Depthbreaker':s.bosses>=1?'Warden of the Gloam':'The Unbroken';}
export function safeSave(raw){const base=freshSave();if(!raw||typeof raw!=='object'||Array.isArray(raw))return base;const s={...base,...raw};s.name=String(s.name||'Wanderer').slice(0,22);if(!PRESETS.some(p=>p.id===s.preset))s.preset='wanderer';for(const k of ['level','depth','bestDepth'])s[k]=clamp(Number.isFinite(+s[k])?Math.floor(+s[k]):1,1,1e7);s.inventory=Array.isArray(raw.inventory)?raw.inventory.filter(i=>i&&ITEMS[i.def]&&typeof i.uid==='string').slice(0,200).map(i=>({...item(i.def,i.level,i.uid),upgrade:clamp(+i.upgrade||0,0,30)})):base.inventory;for(const k of ['bag','bank','fort','perks','settings','equipment'])s[k]={...base[k],...(raw[k]&&typeof raw[k]==='object'?raw[k]:{})};for(const k of ['bag','bank'])for(const r of ['gold','wood','stone','ember','food'])s[k][r]=clamp(Math.floor(+s[k][r]||0),0,1e12);for(const k of ['survivors','companions','lore','visited'])s[k]=Array.isArray(s[k])?s[k].filter(v=>typeof v==='string'||typeof v==='number'):[];for(const slot of SLOTS){if(!s.inventory.some(i=>i.uid===s.equipment[slot]&&i.slot===slot))delete s.equipment[slot];}if(!s.equipment.weapon){const starter=item('rust');s.inventory.push(starter);s.equipment.weapon=starter.uid;}s.hp=clamp(+s.hp||stats(s).maxHp,1,stats(s).maxHp);s.lastSaved=Number.isFinite(+s.lastSaved)?+s.lastSaved:Date.now();s.version=5;return s;}
