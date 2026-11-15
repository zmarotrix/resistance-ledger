/* Content data for The Resistance Ledger. Numbers: VMaNGOS DB (spell_template highest build) unless noted; wiki values kept where they differ. */
window.RL = {};

/* Abilities: icon file, school, damage text, flags. b = binary, u = unresistable. */
RL.ABIL = {
  wrath:{n:"Wrath of Ragnaros", i:"spell_fire_soulburn", s:"fire", d:"1,000 fire + knockback, every 25–30 s", b:1, note:"Binary in VMaNGOS because of the knockback: resistance is a chance to ignore it entirely. That is why tanks keep fire resistance."},
  elemfire:{n:"Elemental Fire", i:"spell_fire_fireball02", s:"fire", d:"2,160–2,640 fire + 600/s for 8 s, on every melee hit", note:"Procs from an aura on each of Ragnaros's swings (2.8 s). The DoT ticks resist at 1/10 the normal chance in VMaNGOS."},
  magma:{n:"Magma Blast", i:"spell_fire_flameshock", s:"fire", d:"6,000 fire", note:"Only when nobody is in melee range."},
  lavaburst:{n:"Lava Burst", i:"spell_fire_volcano", s:"fire", d:"925–1,075 fire", note:"Eruptions around the room, in waves of three. Wiki: resistible since patch 1.5.0."},
  livingbomb:{n:"Living Bomb", i:"inv_enchant_essenceastralsmall", s:"fire", d:"3,200 fire + knockback after 8 s", b:1, note:"Binary (knockback). Run out of the raid."},
  armageddon:{n:"Armageddon", i:"spell_fire_selfdestruct", s:"fire", d:"7,600–8,400 fire", note:"Wiki rounds to 8,000."},
  ignitemana:{n:"Ignite Mana", i:"spell_fire_incinerate", s:"fire", d:"Burns 400 mana every 3 s", note:"A guide claims 250+ fire resistance resists it."},
  inferno:{n:"Inferno", i:"spell_fire_immolation", s:"fire", d:"500, 500, 1,000, 1,000, 2,000, 2,000, 3,000, 5,000", note:"Scripted damage ramp, one tick per second. Melee step out."},
  lavaspawn:{n:"Core Hound & Firewalker debuffs", i:"spell_fire_lavaspawn", s:"fire", d:"Lower your fire resistance", note:"Trash that makes fire damage hurt more. A guide calls this a big reason for fire resistance on progression."},
  onyflame:{n:"Flame Breath", i:"spell_fire_fire", s:"fire", d:"Frontal fire cone", note:"Damage values not checked for this page. Blizzard's Forever overview warns of her fire attacks."},
  roar:{n:"Bellowing Roar", i:"spell_shadow_deathscream", s:"shadow", d:"Raid-wide fear", b:1, note:"A binary fear."},
  firenova:{n:"Fire Nova", i:"spell_fire_sealoffire", s:"fire", d:"555–645 fire to everyone within 100 yd", note:"Constant raid damage for the whole 3-minute fight."},
  flamebreath:{n:"Flame Breath", i:"spell_fire_fire", s:"fire", d:"3,500–4,500 fire + 938–1,062 every 3 s", note:"Its DoT is one of four VMaNGOS lets resist normally (video evidence)."},
  incinerate:{n:"Incinerate", i:"spell_fire_flameshock", s:"fire", d:"3,675–4,725 fire", note:"The wiki says 3,675–4,275. VMaNGOS's database says 4,725, so the wiki is probably a typo."},
  frostburn:{n:"Frost Burn", i:"spell_frost_chillingblast", s:"frost", d:"1,750–2,250 frost + attack slow", note:"The wiki says about 1,400."},
  acid:{n:"Corrosive Acid", i:"spell_nature_acid_01", s:"nature", d:"875–1,125 nature every 3 s + armor down", b:1, note:"Binary in VMaNGOS because it changes armor."},
  timelapse:{n:"Time Lapse", i:"spell_arcane_portalorgrimmar", s:"arcane", d:"Stun + halves health", b:1, note:"Arcane resistance can stop the stun."},
  shadowflame:{n:"Shadow Flame", i:"spell_fire_incinerate", s:"shadow", d:"3,938–5,062 shadow, then 1,750–2,250 every second unless you wear the cloak", u:1, note:"Both parts are unresistable in VMaNGOS. The wiki lists 2,210. The Onyxia Scale Cloak stops the deadly DoT, not the first hit."},
  poisonbolt:{n:"Poison Bolt", i:"spell_nature_corrosivebreath", s:"nature", d:"1,500–2,500 nature to the 15 closest, every 2 s in berserk", note:"The script picks the closest targets. That is why the nature resistance soakers stand in front."},
  noxious:{n:"Noxious Poison", i:"spell_nature_corrosivebreath", s:"nature", d:"750 nature every 2 s + silence", b:1, note:"Binary (silence). The wiki lists 2,900 over 8 s."},
  acidspit:{n:"Acid Spit", i:"spell_nature_acid_01", s:"nature", d:"219–281 every 2 s, stacking on the tank", u:1, note:"Unresistable, so tanks shouldn't wear nature resistance."},
  volley:{n:"Poison Bolt Volley", i:"spell_nature_corrosivebreath", s:"nature", d:"1,313–1,687 nature + DoT", note:"The direct part can be resisted."},
  toxin:{n:"Toxin", i:"spell_nature_abolishmagic", s:"nature", d:"1,313–1,687 every 2 s + 40% slow", note:"A poison cloud on the ground. The wiki calls it unresistable."},
  freeze:{n:"Frost attacks needed", i:"spell_frost_frostshock", s:"frost", d:"Frost damage freezes him", note:"This is about your raid's frost damage, not your resistance."},
  frostaura:{n:"Frost Aura", i:"spell_frost_frostarmor02", s:"frost", d:"600 frost every 2 s to the whole raid, all fight", note:"Partially resistible, and it resists at the full rate (VMaNGOS whitelist). This is why frost resistance is mandatory."},
  chill:{n:"Chill (Blizzard)", i:"spell_frost_glacier", s:"frost", d:"3,063–3,937 every 2 s + 65% slow", note:"Wiki: unresistable. Move out."},
  frostbreath:{n:"Frost Breath", i:"spell_frost_frostnova", s:"frost", d:"75,000–125,000 frost", u:1, note:"Hide behind an ice block."},
  icebolt:{n:"Icebolt", i:"spell_frost_frostbolt02", s:"frost", d:"2,625–3,375 frost + stun", u:1, note:"Wiki: unresistable."},
  ktbolt:{n:"Frostbolt", i:"spell_frost_frostbolt02", s:"frost", d:"7,438–9,562 frost + slow", b:1, note:"The wiki says 9,000–11,000 and \"not resistable\". VMaNGOS makes it binary and resistible. Interrupt it either way."},
  ktvolley:{n:"Frostbolt Volley", i:"spell_frost_icestorm", s:"frost", d:"2,550–3,450 frost + slow", b:1, note:"The wiki says 2,750–3,500."},
  frostblast:{n:"Frost Blast", i:"spell_frost_frostshock", s:"frost", d:"104% of max health over 5 s, chains", u:1, note:"Unresistable. Spread out."},
  fissure:{n:"Shadow Fissure", i:"spell_shadow_creepingplague", s:"shadow", d:"62,500–137,500 shadow", note:"Move out."},
  doom:{n:"Inevitable Doom", i:"spell_shadow_nightofthedead", s:"shadow", d:"2,550 shadow after 10 s", u:1, note:"Unresistable, so shadow resistance is useless. Shadow protection potions absorb it."}
};

/* Bosses. need: 2 must, 1 some, 0 skip. phase = [first kills, early farm, geared, overgeared]. */
RL.RAIDS = [
  {id:"mc", name:"Molten Core", img:"img/molten-core.jpg", meta:"40 players · fire · patch 1.1", school:"fire", alt:"Molten Core loading screen: lava lake and Ragnaros",
   bosses:[
    {id:"ragnaros", n:"Ragnaros", p:"spell_fire_lavaspawn", prog:2, farm:1, phase:[2,2,1,1], ab:["elemfire","wrath","magma","lavaburst"],
     quick:"Progression: the main tank needs 315. On farm, tanks keep it so the knockback fails. Everyone else skips it.",
     prog_t:"MT at least 300, 315 with buffs. Melee 200, everyone else 100, plus 1–3 fire protection potions. That's the original tactics.", farm_t:"Tanks only. Modern guides say most raiders don't need fire resistance.",
     src:[9,7,8], detail:"The fire comes with every one of Ragnaros's melee swings (Elemental Fire), so the tank takes it whether or not anything else happens. Wrath of Ragnaros is a knockback, which makes it binary in VMaNGOS: at 315 resistance it fails about three times in four, and the tank stays put. A mind-controlled Scarshield Spellbinder in Blackrock Spire gives +81–83 fire resistance for an hour." },
    {id:"geddon", n:"Baron Geddon", p:"spell_fire_immolation", prog:1, farm:0, phase:[1,0,0,0], ab:["inferno","livingbomb","armageddon","ignitemana"],
     quick:"Step out of Inferno and run out with Living Bomb. Resistance is optional at every stage.",
     prog_t:"A tank can stay in Inferno only with 315+ fire resistance. Everyone else leaves.", farm_t:"Skip it. Everyone leaves.", src:[10,7], detail:"Inferno's damage ramps 500 → 5,000 per second over 8 seconds, scripted in VMaNGOS. Walking out costs a few seconds of damage, so resistance isn't worth it." },
    {id:"mctrash", n:"Golemagg & the trash", p:"spell_fire_volcano", prog:1, farm:0, phase:[1,1,0,0], ab:["lavaspawn"],
     quick:"Early on, tanks wear some fire resistance for fire-resistance debuffs and Golemagg. A geared raid skips it.",
     prog_t:"Golemagg's main tank \"will need plenty of FR\". Core Hounds and Firewalkers lower your fire resistance.", farm_t:"Skip it. Most raiders keep their main stats.", src:[7], detail:"" }
  ]},
  {id:"ony", name:"Onyxia's Lair", img:"img/onyxia-dragon.jpg", meta:"40 players · fire · also in WoW Forever", school:"fire", alt:"1.12 raid loading screen showing a black dragon",
   bosses:[
    {id:"onyxia", n:"Onyxia", p:"inv_misc_head_dragon_01", prog:1, farm:0, phase:[1,0,0,0], ab:["onyflame","roar"],
     quick:"Tanks bring some fire resistance and potions on the first kills. After that, skip it.",
     prog_t:"Tanks bring some fire resistance. Everyone brings fire protection potions.", farm_t:"Skip it. The common view: no fire resistance needed beyond the Onyxia cloak and potions.", src:[8,29], detail:"Her Scale of Onyxia is crafted into the Onyxia Scale Cloak, which you need for Nefarian. In WoW Forever, Blizzard's raid overview says players \"should build their fire resistance before entering\"." }
  ]},
  {id:"bwl", name:"Blackwing Lair", img:"img/blackwing-lair.jpg", meta:"40 players · fire, shadow, mixed · patch 1.6", school:"shadow", alt:"Blackwing Lair loading screen: the great iron gate",
   bosses:[
    {id:"vael", n:"Vaelastrasz", p:"inv_misc_head_dragon_red", prog:2, farm:1, phase:[2,2,1,0], ab:["firenova","flamebreath"],
     quick:"Progression: a fire resistance check for the whole raid. On farm it becomes a race against the clock that only tanks gear for.",
     prog_t:"Tanks max out fire resistance. Pure DPS at least 180.", farm_t:"Tanks only. A geared raid kills him before Fire Nova adds up.", src:[11], detail:"Burning Adrenaline gives everyone unlimited mana and kills the target after a short time. The fight is a 3-minute race (\"won at 2:45, wiped at 3:15\"). Fire Nova hits everyone for 555–645 the whole time, so more damage means a shorter fight and less need for resistance. Juju Ember (+15), Blazing Emblem (+50 on use) and the Spellbinder buff (+81–83) all help." },
    {id:"chromaggus", n:"Chromaggus", p:"inv_misc_head_dragon_bronze", prog:1, farm:0, phase:[1,0,0,0], ab:["incinerate","frostburn","acid","timelapse"],
     quick:"Hide behind the pillars when he breathes. Resistance helps on early kills, depending on which two breaths he has that week.",
     prog_t:"No numbers given. Breaths hit everything in line of sight.", farm_t:"Skip it. Line of sight handles it.", src:[12], detail:"Each week he gets two of five breaths. Time Lapse is a binary stun that arcane resistance can stop. Incinerate is 3,675–4,725 fire in VMaNGOS; the wiki's 4,275 is probably a typo." },
    {id:"nefarian", n:"Nefarian", p:"inv_misc_head_dragon_black", prog:2, farm:2, phase:[2,2,2,2], ab:["shadowflame","roar"],
     quick:"The Onyxia Scale Cloak is required at every stage of gear. No amount of resistance replaces it.",
     prog_t:"Everyone wears the Onyxia Scale Cloak.", farm_t:"Everyone still wears it.", src:[13,14], detail:"Shadow Flame's first hit (3,938–5,062) lands no matter what, and it's unresistable in VMaNGOS. The cloak stops only the DoT that follows, 1,750–2,250 every second, which kills anyone without it. Ice Block and Divine Shield are the only ways around it. The cloak gives +16 fire resistance, not shadow." }
  ]},
  {id:"aq", name:"Temple of Ahn'Qiraj", img:"img/ahnqiraj.jpg", meta:"40 players · nature · patch 1.9", school:"nature", alt:"Temple of Ahn'Qiraj loading screen: a Qiraji prophet before C'Thun's tentacles",
   bosses:[
    {id:"huhuran", n:"Princess Huhuran", p:"spell_nature_nullifypoison", prog:2, farm:1, phase:[2,2,1,0], ab:["poisonbolt","noxious","acidspit"],
     quick:"Progression: 15 nature resistance soakers. On farm, a geared raid kills her before the berserk adds up and needs few or none.",
     prog_t:"The 15 closest players soak in high nature resistance. \"No one else needs nature resistance.\"", farm_t:"Often skipped: kill her fast through the berserk at 30%.", src:[15,20], detail:"Below about 30% she berserks and fires Poison Bolt (1,500–2,500 nature) at the 15 closest players every 2 seconds. The faster your raid gets her from 30% to 0, the fewer bolts land. That's why progression needs soakers and a geared raid doesn't. Acid Spit on the tank is unresistable, so tanks shouldn't trade armor for nature resistance." },
    {id:"viscidus", n:"Viscidus", p:"spell_nature_abolishmagic", prog:1, farm:0, phase:[1,1,0,0], ab:["volley","toxin","freeze"],
     quick:"Everyone drinks a nature protection potion on the first kills. On farm, skip it.",
     prog_t:"Everyone drinks a Greater Nature Protection Potion 2 minutes before the pull.", farm_t:"Usually skipped. Melee stay 100 yd away until he shatters.", src:[16], detail:"The challenge is frost damage to freeze him, not nature resistance. Only part of his poison can be resisted." }
  ]},
  {id:"naxx", name:"Naxxramas", img:"img/naxxramas.jpg", meta:"40 players · frost, shadow · patch 1.11", school:"frost", alt:"Naxxramas loading screen: the necropolis with Maexxna",
   bosses:[
    {id:"sapphiron", n:"Sapphiron", p:"inv_misc_head_dragon_blue", prog:2, farm:2, phase:[2,2,2,1], ab:["frostaura","chill","frostbreath","icebolt"],
     quick:"Frost resistance on the whole raid, both on progression and on farm. This is the textbook resistance fight.",
     prog_t:"The raid averages about 150 frost resistance unbuffed, plus Greater Frost Protection Potions and Juju Chill.", farm_t:"Still worn. Faster kills shorten the aura but never remove it.", src:[17], detail:"Frost Aura hits all 40 players for 600 frost every 2 seconds until he dies. VMaNGOS lets its ticks resist at the full rate. Bring paladins or shamans for frost resistance auras and totems. His other attacks (Chill, Frost Breath, Icebolt) are unresistable or avoided by moving." },
    {id:"kelthuzad", n:"Kel'Thuzad", p:"inv_misc_bone_humanskull_01", prog:0, farm:0, phase:[0,0,0,0], ab:["ktbolt","ktvolley","frostblast","fissure"],
     quick:"Don't wear frost resistance. You need the DPS and the mana.",
     prog_t:"\"Frost resist gear is not generally advisable.\"", farm_t:"Same.", src:[18], detail:"Sources disagree on his Frostbolt. The wiki says 9,000–11,000 and not resistable. VMaNGOS says 7,438–9,562, binary and resistible. Either way, interrupt it. Frost Blast is unresistable." },
    {id:"loatheb", n:"Loatheb", p:"spell_shadow_animatedead", prog:1, farm:1, phase:[1,1,1,0], ab:["doom"],
     quick:"Shadow resistance does nothing here. Shadow protection potions absorb the damage.",
     prog_t:"Greater Shadow Protection Potions.", farm_t:"Potions, fewer as healing improves.", src:[19], detail:"Inevitable Doom is unresistable. In vanilla the potions lasted an hour and could be drunk before the pull. Patch 2.1.0 cut them to 2 minutes." }
  ]}
];
RL.PHASES = ["First kills","Early farm","Geared","Over-geared"];

/* VMaNGOS evidence for the V badges. */
RL.VM = {
  miss:{t:"Miss table", v:"Hit chance = 96 − Δ when Δ < 3, otherwise 94 − (Δ−2) × 11 (× 7 vs players). Clamped to 1–99% after +hit.", r:"SpellCaster.cpp:803–878"},
  binary:{t:"Binary spells", v:"Any magic spell that slows, stuns, fears, roots, silences, pacifies, disarms, knocks back, interrupts or changes resistance or damage taken. Its hit chance × (1 − resist).", r:"SpellMgr.cpp:3342–3393 · SpellCaster.cpp:869–874"},
  partial:{t:"Partial resist table", v:"31-row table copied from a forum image, blended between rows. The 100% slice is folded into 75%.", r:"Unit.cpp:1874–1918, 2397–2457"},
  wrath:{t:"Wrath of Ragnaros is binary", v:"Spell 20566: 1,000 fire + knockback effect. The knockback makes it binary, so resistance can stop it entirely.", r:"spell_template 20566 · SpellMgr.cpp:3342"},
  cap:{t:"Effective cap ~69%", v:"\"Players CANNOT resist 100% of damage, it is always rounded down to 75%\": at the table's top row the average is 68.75%.", r:"Unit.cpp:2445–2453"},
  ar:{t:"Average resistance formula", v:"resist × 0.15 / caster level, capped at 0.75. Same as 0.75 × R / (5 × L).", r:"SpellCaster.cpp:917–922"},
  level:{t:"Hidden boss resistance", v:"int(8 × Δlevel × casterLevel / 63) added only when the target is a creature and the spell is not binary. 22 for 60 vs 63.", r:"SpellCaster.cpp:915"},
  pen:{t:"Penetration floor", v:"Penetration is added to base resistance and clamped at 0 (from patch 1.9), before the level bonus.", r:"SpellCaster.cpp:893–896"},
  dot:{t:"DoT ticks", v:"Each tick rolls, but at 1/10 of the resist chance, except four DoTs with video evidence (Flame Breath, Frost Aura and two others). The code calls this \"somewhat a guess\".", r:"Unit.cpp:2405–2423"},
  unres:{t:"Unresistable spells", v:"Flagged by hand in spell_mod: Shadow Flame, Inevitable Doom, Frost Blast, Acid Spit. Frost Breath and Icebolt skip the roll (no damage class).", r:"spell_mod · SpellCaster.cpp:779"},
  potion:{t:"Protection potions", v:"Greater Fire, Frost, Nature and Shadow Protection Potions absorb 1,950–3,250.", r:"spell_template 17543 / 17544 / 17546 / 17548"},
  elemfire:{t:"Elemental Fire", v:"Spell 20564: 2,160–2,640 fire + 600/s. Applied by aura 20563 on every melee hit. Ragnaros swings every 2.8 s.", r:"boss_ragnaros.cpp:43 · spell_template 20564 · creature_template 11502"},
  frostaura:{t:"Frost Aura", v:"Spell 28531: 600 frost per tick. The DBC says every 1 s, but a database fix makes it every 2 s.", r:"spell_template 28531 · spell_effect_mod"},
  cloak:{t:"Onyxia Scale Cloak", v:"If the target has aura 22683 (the cloak), the Shadow Flame DoT 22682 isn't applied. The first hit still lands.", r:"SpellEffects.cpp:3719–3743"}
};

RL.MYTHS = [
  {q:"\"Stack spell hit and you'll stop getting partial resists.\"", v:"f", a:"Hit only changes roll one, the miss chance. Partial resists come from the target's resistance in roll two. VMaNGOS applies +hit before the resistance roll and never touches the slice table with it.", s:[1,5], vm:"miss"},
  {q:"\"Bosses have 24 hidden resistance that only spell penetration removes.\"", v:"p", a:"The number depends on the source: 15 (wiki formula), 24 (wiki note, \"believed\") or 22 (VMaNGOS). And penetration <b>can't</b> remove it. Every source agrees on that.", s:[1], vm:"level"},
  {q:"\"315 resistance means 75% less damage.\"", v:"p", a:"That's true of the formula, and only against a level-63 caster (the cap is 5 × the caster's level). In VMaNGOS a hit never loses 100%, so the real average tops out at about 69%.", s:[1], vm:"cap"},
  {q:"\"Binary spells ignore resistance.\"", v:"f", a:"They ignore the <em>hidden level</em> resistance. Your gear resistance becomes a chance for the whole effect to fail. That's exactly why Ragnaros tanks wear fire resistance: so the knockback fails.", s:[2,1], vm:"binary"},
  {q:"\"Protection potions give you resistance.\"", v:"f", a:"They absorb 1,950–3,250 damage once. They add no resistance. Great in a burst, useless over a long fight.", s:[27], vm:"potion"},
  {q:"\"The Onyxia Scale Cloak protects you from Shadow Flame.\"", v:"p", a:"Only from the DoT that follows. The first hit (3,938–5,062 in VMaNGOS) still lands. The cloak also gives +16 <em>fire</em> resistance, not shadow.", s:[13,14], vm:"cloak"},
  {q:"\"Frost resistance makes Sapphiron safe.\"", v:"f", a:"Only Frost Aura is resistible. Chill, Frost Breath and Icebolt are unresistable. Frost resistance keeps the raid alive through the aura, and positioning handles the rest.", s:[17], vm:"frostaura"},
  {q:"\"Everyone needs fire resistance for Ragnaros.\"", v:"p", a:"On 2005 progression, yes: tanks 315, melee 200, everyone else 100. On modern farm, tanks only.", s:[9,7,8]},
  {q:"\"Once you out-gear a raid, resistance gear is useless.\"", v:"p", a:"True for fights with a time limit (Huhuran's berserk, Vaelastrasz) and for damage that hits only a few players. False for Sapphiron's raid-wide aura, which never stops, and for the Nefarian cloak.", s:[15,17,13]},
  {q:"\"Stack a paladin aura, a priest buff and a magic resistance potion for the same school.\"", v:"f", a:"Only one aura or raid buff counts per school. The Shadow Resistance Aura doesn't stack with Prayer of Shadow Protection, and Magic Resistance Potions don't stack with resistance auras or totems.", s:[1,22,11]},
  {q:"\"Resistance does nothing against physical or holy damage.\"", v:"t", a:"Correct. There are five resistances: fire, frost, nature, shadow and arcane. Armor handles physical damage, and players have no holy resistance stat.", s:[2]},
  {q:"\"Damage-over-time ticks get partially resisted just like direct hits.\"", v:"u", a:"Unsettled. VMaNGOS rolls each tick at a tenth of the normal chance, following a Blizzard developer's post, but calls the rule \"somewhat a guess\". Classic players argued about it in 2020.", s:[6], vm:"dot"},
  {q:"\"Blizzard confirmed Classic uses the exact 1.12 resistance formula.\"", v:"u", a:"We found no staff statement. The formulas come from community testing, and emulators like VMaNGOS rebuilt them from old forum tables and posts.", s:[5,4]}
];
