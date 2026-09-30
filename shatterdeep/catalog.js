// Weapon artwork anchors are measured in the 256-pixel atlas cells.
// All new blades point up. Bow limbs curve away from the character.
export const WEAPON_ART=[
 [140,202,140,26,.53],[141,207,123,24,.56],[177,134,177,24,.53],
 [130,183,130,42,.70],[106,193,125,49,.60],[133,186,128,50,.70],
 [139,184,139,54,.57],[130,167,129,58,.68],[130,169,131,20,.83],
 [130,171,133,21,.86],[125,184,125,32,.37],[120,181,140,32,.41],
 [140,186,140,16,.55],[166,114,166,24,.52],[166,115,166,24,.55],
 [131,180,132,42,.73],[124,198,125,26,.71],[121,192,134,30,.61],
 [139,168,139,36,.72],[134,171,134,38,.77],[133,173,132,52,.69],
 [167,111,167,20,.59],[125,175,122,30,.84],[119,184,117,27,.55]
].map(([x,y,tx,ty,scale],sprite)=>({set:'weapons-v08',sprite,grip:[x,y],tip:[tx,ty],scale,mirror:false}));

export const WEAPON_TYPES={
 unarmed:{range:48,rate:.62},sword:{range:76,rate:.62},greatsword:{range:96,rate:.95},
 axe:{range:86,rate:.82},mace:{range:82,rate:.92},spear:{range:130,rate:.76},dagger:{range:60,rate:.40},
 bow:{range:480,rate:.72},staff:{range:440,rate:.85}
};
export const LEGACY_WEAPON_ART={rust:0,void:1,moonbow:2,riftstaff:3,sun:16};
const weapon=(name,kind,power,rarity,weaponArt,desc,effect)=>({name,slot:'weapon',kind,power,rarity,weaponArt,desc,...effect?{effect}:{}});
const armor=(name,slot,value,rarity,desc,effect)=>({name,slot,armor:value,rarity,desc,...effect?{effect}:{}});
export const EXTRA_ITEMS={
 woodsaxe:weapon('Woodcutter’s Edge','axe',8,0,4,'A broad iron head. Axes cleave a second nearby enemy.'),
 bloodaxe:weapon('Bloodreaver','axe',17,2,5,'Garnet iron drinks deeply. Direct hits restore a little health.','leech'),
 ironmace:weapon('Gravekeeper’s Mace','mace',9,0,6,'Heavy flanges stagger the target, briefly slowing it.'),
 stormhammer:weapon('Stormbreaker','mace',18,2,7,'Every third direct hit arcs lightning to another enemy.','chain'),
 kingspear:weapon('Oathkeeper Spear','spear',12,1,8,'A royal spear with much longer reach than a sword.'),
 bonepike:weapon('Hollowbone Pike','spear',17,2,9,'Ivory barbs draw life from every direct hit.','leech'),
 irondagger:weapon('Scavenger’s Knife','dagger',5,0,10,'Very short reach, very fast strikes.'),
 viperdagger:weapon('Viper’s Fang','dagger',9,1,11,'Direct hits poison the target for three seconds.','venom'),
 frostsword:weapon('Rimeblade','sword',12,1,12,'Direct hits chill the target for two seconds.','frost'),
 ashbow:weapon('Ashwood Recurve','bow',8,0,13,'Simple wood and copper. Fires from six sword lengths away.'),
 frostbow:weapon('Winterthorn','bow',17,2,14,'Frozen arrows slow approaching enemies.','frost'),
 briarstaff:weapon('Briarheart','staff',9,0,15,'Amber seeds deliver a lingering poison.','venom'),
 butcher:weapon('Ashen Butcher','axe',12,1,17,'Jagged steel cleaves nearby foes. Defeated enemies erupt in fire.','cinder'),
 bloodstaff:weapon('Crimson Reliquary','staff',17,2,18,'Blood crystals restore health with direct bolt hits.','leech'),
 starstaff:weapon('Dawnstar Scepter','staff',23,3,19,'Every third direct hit sends lightning into another foe.','chain'),
 runemace:weapon('Runeheart Maul','mace',24,3,20,'Ancient inscriptions reduce Rift Burst recovery.','focus'),
 ravenbow:weapon('Raven’s Flight','bow',21,3,21,'A feather-light draw. All basic attacks recover 15% faster.','quick'),
 thornpike:weapon('Bramble Pike','spear',8,0,22,'Long thorned reach poisons anything it strikes.','venom'),
 starsaber:weapon('Astral Crescent','sword',23,3,23,'Every fourth strike calls spectral blades.','blades'),
 rangercoat:armor('Mosswarden Jerkin','chest',4,0,'Layered green hide. Move 10% faster.','haste'),
 scalemail:armor('Ashen Scale Mail','chest',10,1,'Overlapping dark scales grant 20 additional health.','vigor'),
 frostplate:armor('Frostguard Plate','chest',16,2,'Glacial plates form a ward after a heavy hit.','ward'),
 duskrobes:armor('Duskweaver Robes','chest',14,2,'Silver moons shorten Rift Burst recovery.','focus'),
 rangerhood:armor('Briar Scout Cowl','helmet',3,0,'A patched leather cowl with a leaf-lined collar.'),
 hornhelm:armor('Ironhorn Helm','helmet',7,1,'A closed horned helm. Adds 20 maximum health.','vigor'),
 frosthelm:armor('Winterglass Helm','helmet',10,2,'Crystal seams add frost to direct attacks.','frost'),
 ravenhelm:armor('Gilded Raven Mask','helmet',14,3,'An ancient raven mask calls spectral blades every fourth strike.','blades'),
 steelgrips:armor('Ironwatch Gauntlets','gloves',4,1,'Articulated steel protects each finger. Attacks recover 15% faster.','quick'),
 briargrips:armor('Barkbound Grips','gloves',5,1,'Leaf-wrapped bracers add poison to direct hits.','venom'),
 frostboots:armor('Glacier Greaves','boots',7,2,'White steel greaves improve passive recovery outside combat.','renewal'),
 rogueboots:armor('Crimson Striders','boots',4,1,'Supple red leather. Move 10% faster.','haste'),
 rangercloak:armor('Mossveil Cloak','cloak',3,0,'A ragged green cloak. Improves recovery outside combat.','renewal'),
 ravencloak:armor('Ravenwing Mantle','cloak',8,2,'Black feathers and red silk shorten Rift Burst recovery.','focus'),
 oakshield:armor('Rootbound Shield','shield',6,1,'Old roots hold fast. Adds 20 maximum health.','vigor'),
 dragonshield:armor('Dragonwall','shield',12,2,'A crimson dragon guards its bearer with a ward.','ward')
};
export const EXTRA_GEAR_ART=Object.fromEntries(['rangercoat','scalemail','frostplate','duskrobes','rangerhood','hornhelm','frosthelm','ravenhelm','steelgrips','briargrips','frostboots','rogueboots','rangercloak','ravencloak','oakshield','dragonshield'].map((key,i)=>[key,24+i]));
