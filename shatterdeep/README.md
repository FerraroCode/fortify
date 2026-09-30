# SHATTERDEEP 0.8

An installable Canvas action RPG served from `/shatterdeep/`. No build step or runtime dependencies are required for solo play. The parent Fortify app is separate.

## Run and test

From this directory: `npm run serve`, then open `http://localhost:4173/`. Run `npm test` for engine regression tests. Service workers require HTTPS or localhost.

## Play

Touch and drag anywhere on the world to place the floating analog joystick. Release to stop. Basic attacks automatically target nearby enemies. Tap the ability buttons to heal, use Rift Burst or your weapon special, and dodge. Tap an interaction prompt once to gather resources or interact. Search the outpost chest, follow the road, clear the Rift Scar, defeat the Hollow Stag, and enter the Deep Rift. Return to Emberhold to bank resources, construct buildings, and prepare equipment.

The implementation includes a male/female appearance editor, visible equipment, four weapon attack behaviors, loot effects, perks, survivor rescues, companions, nine fortress buildings, limited offline production, repeatable depths, encounter saves, export/import, legacy-save migration, and non-destructive death penalties. Later depths add enemy combinations and Realm palettes.

## Online systems

`online.js` uses a pinned local Supabase browser client and a public publishable key. This key is intentionally public; access control is enforced by the database. `online-schema.sql` records the deployed migration for isolated `sd_` tables, private helper functions, authenticated RPCs, and realtime policies. Do not put service-role credentials in browser files.

Players can sign in, explicitly upload/restore a cloud save, create or join a clan using an invite code, contribute banked stone, and visit a shared stronghold. Private realtime channels broadcast presence, positions, and emotes. Contributions atomically deduct stone from the player's cloud save. Progress originates from a local game, so this release is not cheat-resistant and should not be used for competitive or paid economies.

## Current scope

This is an early-access playable foundation, not the complete long-term design. Party exploration/combat, authoritative multiplayer progression, unique handcrafted maps and bosses for later Realms, advanced crafting recipes, and the full event catalogue are still future work. The first journey uses the Gloam modules at every depth with palette and enemy changes.

## PWA

The service worker caches game code, art, fonts, and the optional online client. Solo play works offline after installation finishes. Cloud and clan features require internet. On iPhone, open the live URL in Safari, Share → Add to Home Screen. Saves belong to the browser installation; export a backup before clearing browser data or changing devices.

## Art and dependencies

Original character, prop, and ground artwork generated for SHATTERDEEP. Cinzel and Inter are distributed under the SIL Open Font License. The bundled Supabase JavaScript client is version 2.57.4 (MIT). The game uses no external asset requests during solo play.

## 0.6 mobile update

- Articulated player stride, counter-swinging arms, idle breathing, and attack motion.
- Separate transparent chest, helmet, glove, boot, cloak, and shield art; material colors are independent of rarity.
- Category filters, equipment-slot browsing, stat comparisons, and persistent unequip (including unarmed combat).
- Floating multi-touch joystick, one-touch interactions, and no keyboard instructions in the game interface.
- Collision recovery after construction and when moving out of existing overlaps.
- Blended cobblestone road textures and detailed terrain maps with separate world/fortress views.
- Save format/key remains compatible with 0.5. JavaScript module URLs are versioned to avoid mixing cached releases.

New generated game assets: `assets/gear.webp` (24-cell equipment atlas) and `assets/road.webp` (repeatable cobblestone terrain). Built-in image generation was used; complete asset prompts are recorded in `assets/art-prompts-v06.json`.

## 0.7 character fitting update

- Replaced preset avatars with separate male/female bodies, four faces per gender, seven hairstyles, five hair colors, five skin tones, and optional male facial hair.
- Thin, average, and muscular proportions resize the torso, shoulder spacing, limbs, and attached equipment. Appearance does not affect combat stats.
- A shared articulated pose attaches gloves, boots, and weapons to moving hands and feet. Sword and greatsword art is rotated around its actual handle; bows use a forward-facing grip and a two-hand aiming pose.
- The editor previews plain clothes or equipped gear. Closing without saving leaves the character unchanged.
- Compact, non-interactive pickup notices sit at the lower left beside the ability controls, with at most two visible at once.
- Existing saves retain progress and equipment. Old broad builds and hair/skin colors migrate into the new creator. Save key and format remain compatible with 0.5/0.6.

`assets/character-parts.webp` contains generated modular body, face, hair, beard, and hand artwork; its prompt is in `assets/art-prompts-v07.json`. Source-part rectangles and anchors are in `render.js`; proportion and weapon-grip geometry is in `rig.js`. Animation uses a 2D articulated rig with mirrored facing, not directional frame-by-frame sprites.


## 0.8 fitting, range and loot update

- Shoulder anchors now come from the actual torso transform. Torso art overlaps the shoulder joints, including on muscular builds, instead of leaving a gap during animation.
- Hair uses revised scalp placement. Beards use per-face sideburn and mouth anchors; stubble and short beards are clipped to the face silhouette.
- Bows reach 480 world units and staffs 440, compared with 76 for swords. Encounters appear early enough to use that reach; projectiles and weapon specials reach distant targets too.
- 35 additional equipment definitions bring the catalogue to 61 items. The new atlas includes 24 distinct weapon designs (five replace shared legacy weapon art), plus 16 armor pieces. Axes cleave, maces stagger, spears reach farther, and daggers attack quickly.
- Frost, poison, life-steal, chain lightning, faster attacks, vitality and recovery effects support different builds. Loot rolls favor unowned designs and reduce recent repeats.
- Pack → Salvage spare copies previews items and proceeds before removing duplicates. Equipped items and the best-rated copy of every definition are always retained. Existing gear is never automatically replaced or salvaged.
- Save format/key stays compatible with previous releases. The new catalogue and atlases are included in the offline cache.

Original art generated with the built-in image tool is saved in `assets/weapons-v08.webp` and `assets/armor-v08.webp`. Prompts are recorded in `assets/art-prompts-v08.json`. Runtime source rectangles exclude adjacent sprites; connected-component masks isolate gloves and boots. The project still uses a 2D articulated character rig.

Validation: 22 engine tests cover ranged hit distances, statuses, varied loot, protected duplicate salvage, migration and existing gameplay. Mobile browser checks cover creation, cancellation, inventory icons, salvage review/confirmation, equipping, touch movement, gathering, all 366 item/body combinations, and offline reload. An installed 0.7 cache upgrades to 0.8 without losing the journey.
