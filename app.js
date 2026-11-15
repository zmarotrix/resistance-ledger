(function(){
"use strict";
const $ = s => document.querySelector(s), $$ = s => Array.from(document.querySelectorAll(s));
const NS = "http://www.w3.org/2000/svg";
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || "#888";
const fmt = (n, d=0) => Number(n).toLocaleString("en-US", {minimumFractionDigits:d, maximumFractionDigits:d});
function el(tag, attrs, parent, text){ const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (text != null) e.textContent = text; if (parent) parent.appendChild(e); return e; }
function clear(n){ while (n.firstChild) n.removeChild(n.firstChild); }
const store = { get(k){ try { return JSON.parse(localStorage.getItem("rl_" + k)); } catch(e){ return null; } }, set(k, v){ try { localStorage.setItem("rl_" + k, JSON.stringify(v)); } catch(e){} } };
const SC = {fire:"--fire", frost:"--frost", nature:"--nature", shadow:"--shadow", arcane:"--arcane"};
const ICON = n => (window.RL_ICONS && window.RL_ICONS[n]) || ("img/icons/" + n + ".png");
const cite = arr => (arr || []).map(n => `<sup class="c"><a href="#s${n}">${n}</a></sup>`).join("");

/* ================= mechanics ================= */
function missChance(diff, vsPlayer){ if (diff <= 0) return Math.max(1, 4 + diff); if (diff < 3) return 4 + diff; return 17 + (diff - 3) * (vsPlayer ? 7 : 11); }
function avgResist(R, L){ return Math.min(0.75, Math.max(0, R) * 0.15 / L); }
const VT = [[0,0,0,0,0],[0,0,2,6,3],[0,1,4,12,5],[0,1,5,18,8],[0,1,7,23,10],[0,2,9,28,13],[0,2,11,33,15],[0,2,13,37,18],[0,3,15,41,20],[1,3,17,46,23],[1,4,19,47,25],[1,5,21,48,28],[1,6,24,49,30],[1,8,28,47,33],[1,9,33,43,35],[1,11,37,39,38],[1,13,41,35,40],[1,16,45,30,43],[1,18,48,26,45],[2,20,48,24,48],[4,23,48,21,50],[5,25,47,19,53],[7,28,45,17,55],[9,31,43,16,58],[11,34,40,14,60],[13,37,37,12,62],[15,41,33,10,65],[18,44,29,8,68],[20,48,25,7,70],[23,51,20,5,73],[25,55,16,3,75]]; // {r100,r75,r50,r25,AR%} from Unit.cpp
function vmDist(AR){ // AR fraction 0..0.75 -> slices 0,.25,.5,.75
  const a = AR * 100; let i = 1; while (i < 30 && VT[i][4] < a) i++;
  const p = VT[i-1], n = VT[i]; const c = n[4] === p[4] ? 1 : Math.max(0, Math.min(1, (a - p[4]) / (n[4] - p[4])));
  const L = k => (p[k] + (n[k] - p[k]) * c) / 100;
  const r75 = L(0) + L(1), r50 = L(2), r25 = L(3); return {xs:[0,.25,.5,.75], p:[Math.max(0, 1 - r75 - r50 - r25), r25, r50, r75]};
}
function sliceDist(AR, model){
  if (model === "V") return vmDist(AR);
  if (model === "A"){ const xs = [0,.25,.5,.75,1], p = [0,0,0,0,0]; const k = Math.min(3, Math.floor(AR / .25 + 1e-9)), f = (AR - k * .25) / .25; p[k] += 1 - f; p[k+1] += f; return {xs, p}; }
  const xs = [], p = []; let s = 0; for (let i = 0; i <= 10; i++){ const x = i / 10, v = Math.max(0, .5 - 2.5 * Math.abs(x - AR)); xs.push(x); p.push(v); s += v; } return {xs, p:p.map(v => v / s)};
}
const mean = d => d.xs.reduce((s, x, i) => s + x * d.p[i], 0);
function roll(d){ let r = Math.random(), i = 0; while (i < d.p.length - 1 && r > d.p[i]){ r -= d.p[i]; i++; } return d.xs[i]; }
const vmMean = AR => mean(vmDist(AR));

/* ================= tooltips ================= */
const tip = $("#tip");
function showTip(html, x, y){ tip.innerHTML = html; tip.classList.add("show"); const r = tip.getBoundingClientRect(); let L = x + 16, T = y + 16; if (L + r.width > innerWidth - 8) L = x - r.width - 12; if (T + r.height > innerHeight - 8) T = y - r.height - 12; tip.style.left = Math.max(8, L) + "px"; tip.style.top = Math.max(8, T) + "px"; }
function hideTip(){ tip.classList.remove("show"); }
function bindTip(node, fn){
  node.addEventListener("pointerenter", e => showTip(fn(), e.clientX, e.clientY));
  node.addEventListener("pointermove", e => { if (tip.classList.contains("show")) showTip(tip.innerHTML, e.clientX, e.clientY); });
  node.addEventListener("pointerleave", hideTip);
  node.addEventListener("focus", () => { const r = node.getBoundingClientRect(); showTip(fn(), r.right, r.bottom); });
  node.addEventListener("blur", hideTip);
}
function abilTip(a){ const sch = a.s[0].toUpperCase() + a.s.slice(1); return `<b>${a.n}</b><span class="s">${sch}</span><br><span class="y">${a.d}</span><br>${a.u ? '<span class="r">Unresistable</span><br>' : a.b ? '<span class="g">Binary: resistance can stop it entirely</span><br>' : '<span class="g">Partially resistible</span><br>'}<span class="s">${a.note}</span>`; }
function abilIcon(id){ const a = RL.ABIL[id]; const s = document.createElement("span"); s.className = "ic" + (a.u ? " unres" : ""); s.tabIndex = 0; s.style.setProperty("--sc", css(SC[a.s] || "--muted")); s.setAttribute("aria-label", `${a.n}: ${a.d}${a.u ? ", unresistable" : ""}`); s.innerHTML = `<img src="${ICON(a.i)}" alt="" loading="lazy">`; bindTip(s, () => abilTip(a)); return s; }
function wireVM(root){ (root || document).querySelectorAll("span.vm[data-vm]").forEach(b => { const k = b.dataset.vm, e = RL.VM[k]; if (!e) return; const a = document.createElement("a"); a.className = "vm"; a.href = "vmangos.html#ev-" + k; a.textContent = "V"; a.setAttribute("aria-label", "Checked in VMaNGOS: " + e.t); bindTip(a, () => `<b>Checked in VMaNGOS: ${e.t}</b><span class="y">${e.v}</span><br><span class="s">${e.r}</span>`); b.replaceWith(a); }); }

/* ================= achievements & xp ================= */
const ACH = {
  kindle:{n:"Kindling", d:"Read the 10-second answer", i:"spell_fire_fire", p:5},
  tank:{n:"Molten Bulwark", d:"Survived Ragnaros", i:"spell_fire_lavaspawn", p:10},
  soak:{n:"Poison Sponge", d:"Survived Huhuran's berserk", i:"spell_nature_corrosivebreath", p:10},
  frozen:{n:"Cold Blooded", d:"Survived Sapphiron's aura", i:"inv_misc_head_dragon_blue", p:10},
  dead:{n:"Repair Bill", d:"Died to a boss. It happens.", i:"inv_misc_bone_humanskull_01", p:5},
  cap:{n:"Capped", d:"Hit 315 resistance", i:"spell_holy_sealofwrath", p:10},
  crunch:{n:"Number Cruncher", d:"Simulated 100,000 casts", i:"spell_arcane_starfire", p:10},
  scholar:{n:"Scholar", d:"Opened 3 deep dives", i:"spell_holy_magicalsentry", p:10},
  myth:{n:"Mythbuster", d:"Checked 5 myths", i:"spell_shadow_antishadow", p:10},
  heat:{n:"Heat Map Reader", d:"Jumped from the progression chart to a boss", i:"spell_fire_sealoffire", p:5},
  lore:{n:"Loremaster", d:"Explored every chapter", i:"inv_misc_orb_05", p:25}
};
const got = new Set(store.get("ach") || []);
function award(k){ if (got.has(k) || !ACH[k]) return; got.add(k); store.set("ach", [...got]); const a = ACH[k]; const t = document.createElement("div"); t.className = "toast"; t.innerHTML = `<img src="${ICON(a.i)}" alt=""><div><div class="t">Achievement earned</div><div class="n">${a.n}</div><div class="mono" style="font-size:.78rem;color:var(--muted)">${a.d}</div></div><span class="p">${a.p}</span>`; $("#toasts").appendChild(t); setTimeout(() => t.remove(), 4300); }
const chapters = $$("[data-ch]"); const seen = new Set();
function xp(){ $("#xpFill").style.width = (seen.size / chapters.length * 100) + "%"; $("#xpTxt").textContent = `${seen.size} / ${chapters.length}`; if (seen.size === chapters.length) award("lore"); }
const navLinks = $$("nav.top a[href^='#']");
const chIO = new IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting) return; seen.add(e.target.id); xp(); navLinks.forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + e.target.id)); if (e.target.id === "why") setTimeout(() => award("kindle"), 1500); }), {rootMargin:"-40% 0px -50% 0px"});
chapters.forEach(c => chIO.observe(c)); xp();
let deepOpened = 0; document.addEventListener("toggle", e => { if (e.target.matches && e.target.matches("details.deep") && e.target.open && ++deepOpened >= 3) award("scholar"); }, true);

/* range fill */
function fill(r){ const p = (r.value - r.min) / (r.max - r.min) * 100; r.style.setProperty("--fill", p + "%"); }
document.addEventListener("input", e => { if (e.target.type === "range"){ fill(e.target); if (+e.target.value >= 315 && /Res|Gear|ar/.test(e.target.id)) award("cap"); } });

/* ================= chart helper ================= */
function frame(svg, o){
  clear(svg); const vb = svg.viewBox.baseVal, W = vb.width, H = vb.height;
  const m = Object.assign({l:56, r:18, t:18, b:46}, o.m || {}); const iw = W - m.l - m.r, ih = H - m.t - m.b;
  const X = v => m.l + (v - o.x0) / (o.x1 - o.x0) * iw, Y = v => m.t + ih - (v - o.y0) / (o.y1 - o.y0) * ih;
  const g = el("g", {class:"grid"}, svg), a = el("g", {class:"axis"}, svg);
  (o.yt || []).forEach(t => { el("line", {x1:m.l, x2:W - m.r, y1:Y(t), y2:Y(t)}, g); el("text", {x:m.l - 8, y:Y(t) + 4, "text-anchor":"end"}, a, o.yf ? o.yf(t) : t); });
  (o.xt || []).forEach(t => el("text", {x:X(t), y:H - m.b + 18, "text-anchor":"middle"}, a, o.xf ? o.xf(t) : t));
  if (o.xl) el("text", {class:"title", x:m.l + iw / 2, y:H - 6, "text-anchor":"middle"}, a, o.xl);
  if (o.yl) el("text", {class:"title", x:14, y:m.t + ih / 2, "text-anchor":"middle", transform:`rotate(-90 14 ${m.t + ih / 2})`}, a, o.yl);
  return {X, Y, m, iw, ih, W, H};
}

/* ================= embers ================= */
(function(){
  const c = $("#embers"); if (!c) return; const ctx = c.getContext("2d"); let W, H, P = [], vis = true;
  function size(){ const d = Math.min(2, devicePixelRatio || 1), r = c.getBoundingClientRect(); W = r.width; H = r.height; c.width = W * d; c.height = H * d; ctx.setTransform(d,0,0,d,0,0); }
  size(); addEventListener("resize", size);
  const spawn = (y) => ({x:Math.random() * W, y:y ?? H + 10, r:.6 + Math.random() * 2.2, vy:.25 + Math.random() * .9, vx:(Math.random() - .5) * .4, ph:Math.random() * 6, life:1});
  for (let i = 0; i < 90; i++) P.push(spawn(Math.random() * H));
  new IntersectionObserver(e => vis = e[0].isIntersecting).observe(c);
  function draw(t){
    ctx.clearRect(0, 0, W, H);
    P.forEach(p => { if (!reduce){ p.y -= p.vy; p.x += p.vx + Math.sin(t / 900 + p.ph) * .3; } const a = Math.max(0, Math.min(1, p.y / H)) * .9; const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4); g.addColorStop(0, `rgba(255,${180 + (p.r * 20 | 0)},90,${a})`); g.addColorStop(1, "rgba(255,90,20,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, 7); ctx.fill(); if (p.y < -10) Object.assign(p, spawn()); });
  }
  if (reduce){ draw(0); return; }
  (function loop(t){ if (vis) draw(t); requestAnimationFrame(loop); })(0);
})();

/* ================= pipeline ================= */
(function(){
  const svg = $("#pipe"); if (!svg) return;
  const N = {cast:{x:180,y:10,w:200,h:50,t:"Spell cast",s:"caster level · school"}, hit:{x:180,y:110,w:200,h:56,t:"Roll 1: hit table",s:"miss 4% / 17% vs boss"}, miss:{x:410,y:110,w:140,h:56,t:"Miss",s:"logged as Resist"}, type:{x:180,y:220,w:200,h:50,t:"Effect or damage?",s:"slow · fear · knockback"}, bin:{x:10,y:330,w:220,h:60,t:"Roll 2: lands or not",s:"fail chance = resist %"}, dmg:{x:330,y:330,w:220,h:60,t:"Roll 2: partial slice",s:"0 · 25 · 50 · 75%"}, land:{x:10,y:450,w:105,h:50,t:"Lands",s:"full effect"}, res:{x:125,y:450,w:105,h:50,t:"Resisted",s:"no effect"}, part:{x:330,y:450,w:220,h:50,t:"Damage × (1 − slice)",s:"averages to resist %"}};
  const E = [["cast","hit",""],["hit","miss","miss"],["hit","type","hit"],["type","bin","effect"],["type","dmg","damage"],["bin","land",""],["bin","res",""],["dmg","part",""]];
  const defs = el("defs", {}, svg), mk = el("marker", {id:"arr", viewBox:"0 0 10 10", refX:"9", refY:"5", markerWidth:"7", markerHeight:"7", orient:"auto-start-reverse"}, defs); el("path", {d:"M0 0L10 5L0 10z", fill:"#7d7064"}, mk);
  const edges = {}, nodes = {};
  E.forEach(([a, b, l]) => { const A = N[a], B = N[b]; let d, lx, ly; if (B.y === A.y){ d = `M${A.x + A.w} ${A.y + A.h/2} H${B.x}`; lx = (A.x + A.w + B.x) / 2; ly = A.y + A.h/2 - 7; } else { const x1 = A.x + A.w/2, y1 = A.y + A.h, x2 = B.x + B.w/2, y2 = B.y, my = (y1 + y2) / 2; d = `M${x1} ${y1} V${my} H${x2} V${y2}`; lx = (x1 + x2) / 2 + (x2 < x1 ? -22 : x2 > x1 ? 22 : 16); ly = my - 6; } edges[a + ">" + b] = el("path", {class:"edge", d, "marker-end":"url(#arr)"}, svg); if (l) el("text", {class:"lbl", x:lx, y:ly, "text-anchor":"middle"}, svg, l); });
  for (const k in N){ const n = N[k], g = el("g", {class:"node"}, svg); el("rect", {x:n.x, y:n.y, width:n.w, height:n.h, rx:8}, g); el("text", {x:n.x + n.w/2, y:n.y + n.h/2 - 3, "text-anchor":"middle"}, g, n.t); el("text", {class:"sub", x:n.x + n.w/2, y:n.y + n.h/2 + 14, "text-anchor":"middle"}, g, n.s); nodes[k] = g; }
  const S = [{n:["cast"],e:[]},{n:["cast","hit","miss"],e:["cast>hit","hit>miss"]},{n:["hit","type"],e:["hit>type"]},{n:["type","bin","land","res"],e:["type>bin","bin>land","bin>res"]},{n:["type","dmg","part"],e:["type>dmg","dmg>part"]}];
  function show(i){ for (const k in nodes) nodes[k].classList.toggle("on", S[i].n.includes(k)); for (const k in edges) edges[k].classList.toggle("on", S[i].e.includes(k)); $$(".pstep").forEach(s => s.classList.toggle("on", +s.dataset.step === i)); }
  show(0); const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) show(+e.target.dataset.step); }), {rootMargin:"-45% 0px -45% 0px"}); $$(".pstep").forEach(s => io.observe(s));
})();

/* ================= arena ================= */
const ENC = {
  rag:{name:"Main tank", school:"fire", hp:9500, dur:60, heal:900, bg:"img/molten-core.jpg", src:"Elemental Fire 2,160–2,640 on every 2.8 s swing + 600/s DoT (ticks resist at 1/10); Wrath of Ragnaros 1,000 binary knockback every 25–30 s. Values: VMaNGOS.",
    dps(AR){ return 2400 / 2.8 * (1 - vmMean(AR)) + 600 * (1 - vmMean(AR * .1)) + 1000 / 27.5 * .99 * (1 - AR); }},
  huh:{name:"Nature soaker", school:"nature", hp:6500, dur:45, heal:600, bg:"img/ahnqiraj.jpg", src:"Berserk Poison Bolt 1,500–2,500 nature to the 15 closest every 2 s. Values: VMaNGOS script and DB.",
    dps(AR){ return 2000 / 2 * .99 * (1 - vmMean(AR)); }},
  sap:{name:"Raider", school:"frost", hp:6000, dur:90, heal:150, bg:"img/naxxramas.jpg", src:"Frost Aura 600 frost every 2 s to everyone, full-rate partial resists. Values: VMaNGOS DB.",
    dps(AR){ return 300 * .99 * (1 - vmMean(AR)); }}
};
let enc = "rag", fight = null;
function aAR(){ return avgResist(+$("#aRes").value, 63); }
function setEnc(k){
  enc = k; const e = ENC[k]; $$(".enc").forEach(b => b.setAttribute("aria-pressed", b.dataset.enc === k)); $("#stageBg").style.backgroundImage = `url('${e.bg}')`;
  $("#aSchool").textContent = e.school; $("#aSchool").className = e.school; $("#aRes").style.setProperty("--tc", css(SC[e.school])); $("#aHeal").value = e.heal; fill($("#aRes")); fill($("#aHeal"));
  $("#uName").textContent = e.name; $("#aSrc").textContent = e.src; resetUnit(); arenaRead();
}
function resetUnit(){ stopFight(); const e = ENC[enc]; setHP(e.hp, e.hp); $("#uClock").textContent = "0:00 / " + clock(e.dur); $("#verdict").className = "verdict"; }
function clock(s){ s = Math.max(0, Math.floor(s)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); }
function setHP(h, max){ const p = Math.max(0, h / max * 100), b = $("#hpBar"); b.style.width = p + "%"; b.className = p < 25 ? "crit" : p < 50 ? "low" : ""; $("#hpTxt").textContent = `${fmt(Math.max(0, Math.round(h)))} / ${fmt(max)}`; }
function fct(txt, cls){ const f = document.createElement("span"); f.className = "fct " + (cls || ""); f.textContent = txt; f.style.setProperty("--dx", ((Math.random() - .5) * 180) + "px"); f.style.color = cls ? "" : css(SC[ENC[enc].school]); $("#field").appendChild(f); setTimeout(() => f.remove(), 1400); }
function arenaRead(){
  const e = ENC[enc], AR = aAR(), heal = +$("#aHeal").value, dps = e.dps(AR), net = dps - heal;
  $("#aResO").textContent = $("#aRes").value; $("#aHealO").textContent = heal;
  const ttd = net > 0 ? e.hp / net : Infinity;
  $("#aRead").innerHTML = [
    ["Average resist", (vmMean(AR) * 100).toFixed(1) + "%", "VMaNGOS table, vs level 63"],
    ["Damage per second", fmt(dps), "after resistance"],
    ["Your healing", fmt(heal), net > 0 ? `short by ${fmt(net)}/s` : `${fmt(-net)}/s to spare`],
    ["Expected result", ttd > e.dur ? "Survive" : "Dead at " + clock(ttd), `over a ${clock(e.dur)} fight`]
  ].map(([k, v, d], i) => `<div class="big"><span class="k">${k}</span><span class="v" style="${i === 3 ? `color:var(${ttd > e.dur ? "--good" : "--bad"})` : ""}">${v}</span><span class="d">${d}</span></div>`).join("");
  const svg = $("#aChart"); const f = frame(svg, {x0:0, x1:315, y0:0, y1:e.dur, yt:[0, e.dur/3, 2*e.dur/3, e.dur].map(Math.round), yf:clock, xt:[0,100,200,315], xl:`${e.school[0].toUpperCase() + e.school.slice(1)} resistance`, yl:"Time alive"});
  let d = "", area = `M${f.X(0)} ${f.Y(0)}`;
  for (let r = 0; r <= 315; r += 5){ const n = e.dps(avgResist(r, 63)) - heal; const t = n > 0 ? Math.min(e.dur, e.hp / n) : e.dur; d += (r ? "L" : "M") + f.X(r) + " " + f.Y(t); area += `L${f.X(r)} ${f.Y(t)}`; }
  area += `L${f.X(315)} ${f.Y(0)}Z`;
  const gid = "ag" + enc; const defs = el("defs", {}, svg); const lg = el("linearGradient", {id:gid, x1:0, x2:0, y1:0, y2:1}, defs); el("stop", {offset:0, "stop-color":css(SC[e.school]), "stop-opacity":.45}, lg); el("stop", {offset:1, "stop-color":css(SC[e.school]), "stop-opacity":0}, lg);
  el("path", {d:area, fill:`url(#${gid})`}, svg); el("path", {d, fill:"none", stroke:css(SC[e.school]), "stroke-width":3}, svg);
  el("line", {x1:f.m.l, x2:f.W - f.m.r, y1:f.Y(e.dur), y2:f.Y(e.dur), stroke:css("--good"), "stroke-dasharray":"5 4"}, svg); el("text", {class:"lab", x:f.m.l + 6, y:f.Y(e.dur) + 14, fill:css("--good")}, svg, "survives the whole fight");
  const R = +$("#aRes").value; const tn = net > 0 ? Math.min(e.dur, e.hp / net) : e.dur; el("circle", {cx:f.X(R), cy:f.Y(tn), r:7, fill:css("--bg"), stroke:css("--gold"), "stroke-width":3}, svg);
}
function stopFight(){ if (fight){ clearInterval(fight.iv); fight = null; } }
function pull(){
  stopFight(); resetUnit(); const e = ENC[enc], AR = aAR(), heal = +$("#aHeal").value; let hp = e.hp, t = 0, next = {}, dotUntil = -1, landed = 0, resisted = 0;
  const S = 3, step = 0.1; // real seconds per tick * speed
  next.swing = 0.5; next.wrath = 25 + Math.random() * 5; next.bolt = 1; next.aura = 1; next.dot = 1; next.heal = 1;
  const dist = vmDist(AR), dotDist = vmDist(AR * .1);
  function dmg(base, d, big){ if (Math.random() < .01){ fct("Miss", "full"); return 0; } const x = roll(d), v = Math.round(base * (1 - x)); if (x > 0){ fct(`${fmt(v)} (${fmt(Math.round(base * x))} resisted)`, "res"); resisted++; } else fct(fmt(v), big ? "big" : ""); return v; }
  fight = {iv:setInterval(() => {
    for (let k = 0; k < S; k++){
      t += step; hp = Math.min(e.hp, hp + heal * step);
      if (enc === "rag"){
        if (t >= next.swing){ next.swing += 2.8; hp -= dmg(2160 + Math.random() * 480, dist, true); dotUntil = t + 8; }
        if (t >= next.dot){ next.dot += 1; if (t < dotUntil){ const x = roll(dotDist); hp -= 600 * (1 - x); } }
        if (t >= next.wrath){ next.wrath += 25 + Math.random() * 5; if (Math.random() < .99 * (1 - AR)){ hp -= 1000; landed++; fct("KNOCKED BACK 1,000", "big"); $("#unit").classList.remove("hitflash"); void $("#unit").offsetWidth; $("#unit").classList.add("hitflash"); } else fct("Wrath resisted!", "res"); }
      } else if (enc === "huh"){ if (t >= next.bolt){ next.bolt += 2; hp -= dmg(1500 + Math.random() * 1000, dist, true); } }
      else { if (t >= next.aura){ next.aura += 2; hp -= dmg(600, dist); } }
      if (t >= next.heal){ next.heal += 1; if (heal) fct("+" + fmt(heal), "heal"); }
      if (hp <= 0 || t >= e.dur) break;
    }
    setHP(hp, e.hp); $("#uClock").textContent = clock(t) + " / " + clock(e.dur);
    if (hp <= 0 || t >= e.dur){
      stopFight(); const alive = hp > 0; const v = $("#verdict"); v.className = "verdict show " + (alive ? "alive" : "dead");
      $("#vTitle").textContent = alive ? "You survived" : "You died"; $("#vText").textContent = alive ? `${clock(e.dur)} with ${fmt(Math.round(hp))} HP left${enc === "rag" ? ` · ${landed} knockback${landed === 1 ? "" : "s"} landed` : ""}` : `at ${clock(t)} · try more resistance or more healing`;
      award(alive ? ({rag:"tank", huh:"soak", sap:"frozen"})[enc] : "dead");
    }
  }, 100)};
}
$$(".enc").forEach(b => b.addEventListener("click", () => setEnc(b.dataset.enc)));
["#aRes","#aHeal"].forEach(id => $(id).addEventListener("input", () => { if (!fight) resetUnit(); arenaRead(); }));
$("#aPull").addEventListener("click", pull);
$("#aCap").addEventListener("click", () => { $("#aRes").value = 315; fill($("#aRes")); award("cap"); arenaRead(); pull(); });
$("#verdict").addEventListener("click", resetUnit);

/* ================= mechanics charts ================= */
function drawHit(){
  const hit = +$("#hitSlider").value; $("#hitOut").textContent = "+" + hit + "%"; const svg = $("#hitChart"), ds = [0,1,2,3,4,5];
  const f = frame(svg, {x0:-.5, x1:5.5, y0:0, y1:44, yt:[0,10,20,30,40], yf:t => t + "%", xt:ds, xf:t => t ? "+" + t : "0", xl:"Target level minus caster level", yl:"Chance to miss"}); const bw = f.iw / 6 * .56;
  ds.forEach(d => { const m = missChance(d), r = Math.max(1, m - hit), c = d === 3 ? css("--bad") : css("--muted"); el("rect", {x:f.X(d) - bw/2, y:f.Y(m), width:bw, height:f.Y(0) - f.Y(m), fill:c, opacity:.25, rx:3}, svg); el("rect", {x:f.X(d) - bw/2, y:f.Y(r), width:bw, height:f.Y(0) - f.Y(r), fill:c, opacity:.85, rx:3}, svg); el("text", {class:"lab", x:f.X(d), y:f.Y(m) - 6, "text-anchor":"middle", fill:css("--ink")}, svg, m + "%" + (hit ? " → " + r + "%" : "")); });
  el("line", {x1:f.m.l, x2:f.W - f.m.r, y1:f.Y(1), y2:f.Y(1), stroke:css("--gold"), "stroke-dasharray":"4 4"}, svg); el("text", {class:"lab", x:f.W - f.m.r, y:f.Y(1) - 6, "text-anchor":"end", fill:css("--gold")}, svg, "1% always misses");
  el("text", {class:"lab", x:f.X(3), y:f.Y(44) + 10, "text-anchor":"middle", fill:css("--bad")}, svg, "raid boss");
}
$("#hitSlider").addEventListener("input", drawHit);
function drawAR(){
  const R = +$("#arSlider").value; $("#arOut").textContent = R; const svg = $("#arChart");
  const f = frame(svg, {x0:0, x1:400, y0:0, y1:.8, yt:[0,.25,.5,.75], yf:t => Math.round(t*100) + "%", xt:[0,100,200,300,400], xl:"Resistance", yl:"Average resist"});
  [[60,"--frost","300 → 75% vs a level-60 player"],[63,"--fire","315 → 75% vs a raid boss"]].forEach(([L, c, lab], i) => { let d = ""; for (let r = 0; r <= 400; r += 5) d += (r ? "L" : "M") + f.X(r) + " " + f.Y(avgResist(r, L)); el("path", {d, fill:"none", stroke:css(c), "stroke-width":2.6}, svg); el("circle", {cx:f.X(L * 5), cy:f.Y(.75), r:4.5, fill:css(c)}, svg); el("text", {class:"lab", x:f.X(L*5) + (i ? 8 : -8), y:f.Y(.75) + (i ? 18 : -10), "text-anchor":i ? "start" : "end", fill:css(c)}, svg, lab); });
  let d = ""; for (let r = 0; r <= 400; r += 5) d += (r ? "L" : "M") + f.X(r) + " " + f.Y(vmMean(avgResist(r, 63))); el("path", {d, fill:"none", stroke:css("--gold"), "stroke-width":2, "stroke-dasharray":"6 4"}, svg);
  el("text", {class:"lab", x:f.X(400), y:f.Y(.6875) + 16, "text-anchor":"end", fill:css("--gold")}, svg, "VMaNGOS actual: 68.75% max");
  const a = avgResist(R, 63), v = vmMean(a); el("line", {x1:f.X(R), x2:f.X(R), y1:f.Y(0), y2:f.Y(.8), stroke:css("--gold"), "stroke-dasharray":"2 4"}, svg); el("circle", {cx:f.X(R), cy:f.Y(a), r:6, fill:css("--bg"), stroke:css("--fire"), "stroke-width":2.5}, svg);
  el("text", {class:"lab", x:f.X(R) + (R > 250 ? -10 : 10), y:f.Y(a) + 26, "text-anchor":R > 250 ? "end" : "start", fill:css("--ink")}, svg, `${R}: ${(a*100).toFixed(1)}% formula · ${(v*100).toFixed(1)}% VMaNGOS`);
  drawBin();
}
$("#arSlider").addEventListener("input", drawAR);
let pm = "V";
function drawPart(){
  const AR = +$("#partSlider").value / 100; $("#partOut").textContent = Math.round(AR*100) + "%"; const d = sliceDist(AR, pm), svg = $("#partChart");
  const f = frame(svg, {x0:-.08, x1:1.08, y0:0, y1:1, yt:[0,.25,.5,.75,1], yf:t => Math.round(t*100) + "%", xt:pm === "B" ? [0,.2,.4,.6,.8,1] : [0,.25,.5,.75,1], xf:t => Math.round(t*100) + "%", xl:"Share of the hit resisted", yl:"Chance"});
  const bw = (pm === "B" ? .07 : .16) * f.iw, cols = ["--good","--warn","--warn","--fire","--bad"];
  d.xs.forEach((x, i) => { const p = d.p[i]; el("rect", {x:f.X(x) - bw/2, y:f.Y(p), width:bw, height:f.Y(0) - f.Y(p), fill:css(cols[Math.min(4, Math.round(x * 4))]), opacity:.9, rx:3}, svg); if (p > .005) el("text", {class:"lab", x:f.X(x), y:f.Y(p) - 6, "text-anchor":"middle", fill:css("--ink")}, svg, Math.round(p * 100) + "%"); });
  const mn = mean(d); el("line", {x1:f.X(mn), x2:f.X(mn), y1:f.Y(0), y2:f.Y(1), stroke:css("--gold"), "stroke-width":2, "stroke-dasharray":"5 4"}, svg); el("text", {class:"lab", x:f.X(mn) + 7, y:f.Y(.95), fill:css("--gold")}, svg, `average lost: ${(mn*100).toFixed(1)}%`);
  $("#partCap").innerHTML = pm === "V" ? "VMaNGOS's table: blended between rows, with the 100% slice folded into 75%. Its maximum average is 68.75%. <a href=\"vmangos.html#ev-partial\">See the table</a>." : pm === "A" ? "The tightest spread that keeps the average exactly equal to the formula. A reference model, not a game source." : "The wiki's per-slice formula, P(x) = 50% − 250% × |x − AR|, in 10% steps. That's how later expansions are described, not 1.12." + cite([1]);
}
$("#partSlider").addEventListener("input", drawPart);
$$("[data-pm]").forEach(b => b.addEventListener("click", () => { pm = b.dataset.pm; $$("[data-pm]").forEach(x => x.setAttribute("aria-pressed", x === b)); drawPart(); }));
function drawBin(){
  const R = +$("#arSlider").value; $("#binR").textContent = R; const svg = $("#binChart"), AR = avgResist(R, 63), v = vmMean(AR), hitP = .99;
  const f = frame(svg, {x0:0, x1:2, y0:0, y1:100, yt:[0,25,50,75,100], xt:[], m:{l:48, b:40}, yl:"Out of 100 casts"});
  const cols = [{n:"Binary (fear, knockback)", s:[[hitP*(1-AR)*100,"--bad","land"],[hitP*AR*100,"--good","resisted"],[1,"--dim",""]]},{n:"Damage", s:[[hitP*(1-v)*100,"--warn","dmg taken"],[hitP*v*100,"--good","resisted"],[1,"--dim",""]]}];
  cols.forEach((c, i) => { const x = f.X(.5 + i), w = f.iw * .3; let acc = 0; c.s.forEach(([val, col, lab]) => { if (val <= 0) return; el("rect", {x:x - w/2, y:f.Y(acc + val), width:w, height:f.Y(acc) - f.Y(acc + val), fill:css(col), opacity:.88}, svg); if (val > 7) el("text", {class:"lab", x, y:(f.Y(acc) + f.Y(acc + val)) / 2 + 4, "text-anchor":"middle", fill:"#120c08"}, svg, Math.round(val) + "% " + lab); acc += val; }); el("text", {class:"lab", x, y:f.H - 18, "text-anchor":"middle", fill:css("--ink")}, svg, c.n); });
}

/* ================= phase heatmap ================= */
function drawPhase(){
  const svg = $("#phaseChart"); clear(svg); const rows = []; RL.RAIDS.forEach(r => r.bosses.forEach(b => rows.push({r, b})));
  const W = 760, top = 46, rh = 30, lw = 190, cw = (W - lw - 10) / 4; svg.setAttribute("viewBox", `0 0 ${W} ${top + rows.length * rh + 30}`);
  RL.PHASES.forEach((p, i) => el("text", {x:lw + cw * i + cw/2, y:24, "text-anchor":"middle", fill:css("--muted"), style:"font:600 12px var(--f-mono)"}, svg, p));
  el("path", {d:`M${lw + 6} 36 H${W - 16}`, stroke:css("--gold"), "stroke-width":1.5, "marker-end":"url(#parr)"}, svg); const defs = el("defs", {}, svg); const mk = el("marker", {id:"parr", viewBox:"0 0 10 10", refX:9, refY:5, markerWidth:7, markerHeight:7, orient:"auto"}, defs); el("path", {d:"M0 0L10 5L0 10z", fill:css("--gold")}, mk);
  const col = v => v === 2 ? css("--bad") : v === 1 ? css("--warn") : css("--good"), word = v => v === 2 ? "needed" : v === 1 ? "some" : "skip";
  rows.forEach(({r, b}, i) => {
    const y = top + i * rh, g = el("g", {style:"cursor:pointer", tabindex:0, role:"link", "aria-label":`${b.n}: jump to boss`}, svg);
    el("rect", {x:0, y, width:W, height:rh, fill:"transparent"}, g);
    el("text", {x:8, y:y + rh/2 + 4, fill:css(SC[r.school] || "--ink"), style:"font:600 10px var(--f-mono)"}, g, r.id.toUpperCase());
    el("text", {x:52, y:y + rh/2 + 5, fill:css("--ink"), style:"font:600 13px var(--f-sans)"}, g, b.n);
    b.phase.forEach((v, j) => { el("rect", {x:lw + cw * j + 3, y:y + 4, width:cw - 6, height:rh - 8, rx:5, fill:col(v), opacity:v === 0 ? .28 : v === 1 ? .55 : .85}, g); el("text", {x:lw + cw * j + cw/2, y:y + rh/2 + 4, "text-anchor":"middle", fill:v === 0 ? css("--ink") : "#140c08", style:"font:700 11px var(--f-mono)"}, g, word(v)); });
    const go = () => { const t = document.getElementById("boss-" + b.id); if (t){ t.scrollIntoView({behavior:reduce ? "auto" : "smooth", block:"center"}); t.animate([{background:"rgba(246,198,91,.25)"},{background:"transparent"}], {duration:1800}); award("heat"); } };
    g.addEventListener("click", go); g.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
  });
  el("text", {x:lw, y:top + rows.length * rh + 22, fill:css("--dim"), style:"font:400 11px var(--f-mono)"}, svg, "Our read from the cited tactics and guides. Your raid's gear and skill move the columns.");
}

/* ================= raids ================= */
function renderRaids(){
  const host = $("#raidList"); const P = v => v === 2 ? '<span class="pill req">needed</span>' : v === 1 ? '<span class="pill some">some</span>' : '<span class="pill none">skip</span>';
  RL.RAIDS.forEach(r => {
    const s = document.createElement("section"); s.className = "raid bleed"; s.id = "raid-" + r.id;
    s.innerHTML = `<div class="banner"><img src="${r.img}" alt="${r.alt}" loading="lazy"><div class="in"><p class="eyebrow" style="color:var(${SC[r.school]})">Raid</p><h2>${r.name}</h2><p class="meta">${r.meta}</p></div></div><div class="wide" style="padding-inline:var(--gutter) var(--gutter-r)"></div>`;
    const w = s.querySelector(".wide");
    r.bosses.forEach(b => {
      const row = document.createElement("article"); row.className = "boss rv"; row.id = "boss-" + b.id;
      row.innerHTML = `<div class="ic" style="width:64px;height:64px;--sc:var(${SC[r.school]})"><img src="${ICON(b.p)}" alt=""></div>
        <div><h3>${b.n}</h3><div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-top:.45rem"><span class="mono" style="font-size:.75rem;color:var(--muted);align-self:center">PROGRESSION</span>${P(b.prog)}<span class="mono" style="font-size:.75rem;color:var(--muted);align-self:center;margin-left:.4rem">FARM</span>${P(b.farm)}</div>
        <p class="quick">${b.quick}</p>
        <details class="deep"><summary><span class="lvl">Full detail</span>Numbers, sources, disagreements</summary><div class="body prose">
          <div class="two" style="gap:1rem"><div><p class="eyebrow" style="color:var(--bad);margin-bottom:.3rem">Progression</p><p>${b.prog_t}</p></div><div><p class="eyebrow" style="color:var(--good);margin-bottom:.3rem">Farm</p><p>${b.farm_t}</p></div></div>
          ${b.detail ? `<p>${b.detail}</p>` : ""}
          <ul style="margin:0;padding-left:1.1rem">${b.ab.map(k => { const a = RL.ABIL[k]; return `<li><b>${a.n}</b> <span class="mono" style="color:var(--muted)">(${a.s}${a.u ? ", unresistable" : a.b ? ", binary" : ""})</span>: ${a.d}. ${a.note}</li>`; }).join("")}</ul>
          <p class="mono" style="font-size:.8rem;color:var(--dim)">Sources ${cite(b.src)} · ability values from the VMaNGOS database<span class="vm" data-vm="unres">V</span></p>
        </div></details></div>
        <div class="icons"></div>`;
      const ic = row.querySelector(".icons"); b.ab.forEach(k => ic.appendChild(abilIcon(k)));
      w.appendChild(row);
    });
    host.appendChild(s);
  });
  wireVM(host);
}

/* ================= stack calculator ================= */
const KENC = {
  rag:{school:"fire", n:"Elemental Fire hit", dmg:2400, note:"Original tactics: MT 300+, 315 buffed. On farm, tanks only.", target:315},
  vael:{school:"fire", n:"Fire Nova", dmg:600, note:"Progression: DPS 180+, tanks max. On farm, tanks only.", target:180},
  huh:{school:"nature", n:"Poison Bolt (berserk)", dmg:2000, note:"Only the 15 closest players need it. Potions absorb 1,950–3,250.", target:315},
  sap:{school:"frost", n:"Frost Aura tick", dmg:600, note:"Raid averages about 150 unbuffed, plus potions and Juju Chill.", target:150}
};
const BUFFS = [
  {id:"aura", n:"Resistance aura or totem", v:60, sch:["fire","frost","nature"], grp:"aura", i:"spell_fireresistancetotem_01", src:"21–24"},
  {id:"gotw", n:"Gift of the Wild", v:20, sch:["fire","frost","nature"], i:"spell_nature_regeneration", src:"25"},
  {id:"spell", n:"Spellbinder's Resist Fire", v:81, sch:["fire"], i:"spell_fire_sealoffire", src:"9, 11"},
  {id:"juju", n:"Juju Ember", v:15, sch:["fire"], i:"inv_misc_monsterscales_15", src:"11"},
  {id:"chill", n:"Juju Chill", v:15, sch:["frost"], i:"inv_misc_monsterscales_09", src:"17"},
  {id:"emblem", n:"Blazing Emblem (on use)", v:50, sch:["fire"], i:"spell_fire_firearmor", src:"11"}
];
function renderBuffs(){ const h = $("#kBuffs"); BUFFS.forEach(b => { const l = document.createElement("label"); l.className = "chk"; l.innerHTML = `<input type="checkbox" id="kb_${b.id}"${b.id === "aura" || b.id === "gotw" ? " checked" : ""}><img src="${ICON(b.i)}" alt=""><span>${b.n} <b style="color:var(--gold)">+${b.v}</b></span><span class="src">[${b.src}]</span>`; h.appendChild(l); l.querySelector("input").addEventListener("change", drawStack); }); }
function drawStack(){
  const e = KENC[$("#kEnc").value], gear = +$("#kGear").value; $("#kGearO").textContent = gear; $("#kGear").style.setProperty("--tc", css(SC[e.school]));
  const parts = [["Gear", gear, "--muted"]];
  BUFFS.forEach(b => { const box = $("#kb_" + b.id), ok = b.sch.includes(e.school); box.disabled = !ok; if (box.checked && ok) parts.push([b.n.split(" (")[0], b.v, SC[e.school]]); });
  const total = parts.reduce((s, p) => s + p[1], 0), AR = avgResist(total, 63), v = vmMean(AR); if (total >= 315) award("cap");
  $("#kStats").innerHTML = [["Total " + e.school, fmt(total), total > 315 ? `${total - 315} past the cap is wasted` : `${315 - total} short of 315`],["Average resist", (v*100).toFixed(1) + "%", `${(AR*100).toFixed(1)}% by formula`],[e.n, fmt(Math.round(e.dmg * (1 - v))), `of ${fmt(e.dmg)} on average`],["Guide target", e.target, total >= e.target ? "met" : "not yet"]].map(([k, val, d], i) => `<div class="big"><span class="k">${k}</span><span class="v"${i === 3 ? ` style="color:var(${total >= e.target ? "--good" : "--warn"})"` : ""}>${val}</span><span class="d">${d}</span></div>`).join("");
  const svg = $("#kBar"), f = frame(svg, {x0:0, x1:400, y0:0, y1:1, xt:[0,100,200,300,400], xl:"Resistance", m:{l:16, r:16, t:30, b:44}}); let acc = 0;
  parts.forEach(([n, val, c], i) => { if (val <= 0) return; const x = f.X(Math.min(400, acc)), w = f.X(Math.min(400, acc + val)) - x; el("rect", {x, y:f.Y(.85), width:Math.max(0, w), height:f.Y(.15) - f.Y(.85), fill:css(c), opacity:i ? .9 : .4, stroke:css("--bg"), "stroke-width":2, rx:3}, svg); if (w > 48) el("text", {class:"lab", x:x + w/2, y:f.Y(.5) + 4, "text-anchor":"middle", fill:i ? "#140c08" : css("--ink")}, svg, `${n.split(" ")[0]} ${val}`); acc += val; });
  [[315, "--bad", "315 cap"], [e.target, "--warn", "target " + e.target]].forEach(([x, c, l], i) => { if (i && x === 315) return; el("line", {x1:f.X(x), x2:f.X(x), y1:f.m.t - 8, y2:f.Y(0), stroke:css(c), "stroke-width":2, "stroke-dasharray":i ? "4 3" : ""}, svg); el("text", {class:"lab", x:f.X(x), y:f.m.t - 12, "text-anchor":"middle", fill:css(c)}, svg, l); });
  $("#kNote").textContent = e.note + " Only one aura or totem per school counts; Prayer of Shadow Protection and the shadow aura don't stack.";
}
$("#kEnc").addEventListener("change", drawStack); $("#kGear").addEventListener("input", drawStack);

/* ================= simulator ================= */
const sim = {lvl:"vm", type:"dmg", model:"V"};
function seg(attr, key){ $$(`[data-${attr}]`).forEach(b => b.addEventListener("click", () => { sim[key] = b.dataset[attr]; $$(`[data-${attr}]`).forEach(x => x.setAttribute("aria-pressed", x === b)); runSim(); })); }
seg("lvl", "lvl"); seg("type", "type"); seg("model", "model");
["#sRes","#sHit","#sPen"].forEach(id => $(id).addEventListener("input", () => { $("#sResO").textContent = $("#sRes").value; $("#sHitO").textContent = "+" + $("#sHit").value + "%"; $("#sPenO").textContent = $("#sPen").value; }));
["#sRes","#sHit","#sPen","#sDir","#sN"].forEach(id => $(id).addEventListener("change", runSim)); $("#sRun").addEventListener("click", runSim);
function theory(){
  const dir = $("#sDir").value, Lc = dir === "boss" ? 63 : 60, Lt = dir === "you" ? 63 : 60, vsPlayer = dir !== "you";
  const Rb = +$("#sRes").value, pen = +$("#sPen").value, hit = +$("#sHit").value, dl = Math.max(0, Lt - Lc), creature = dir === "you";
  let lt = 0; if (sim.type === "dmg" && creature && dl) lt = sim.lvl === "vm" ? Math.floor(8 * dl * Lc / 63) : dl * (+sim.lvl);
  const Reff = Math.max(0, Rb - pen) + lt, AR = avgResist(Reff, Lc), miss = Math.max(1, Math.min(99, missChance(Lt - Lc, vsPlayer) - hit)) / 100;
  return {Lc, Lt, Reff, AR, miss, lt};
}
function runSim(){
  const th = theory(), N = +$("#sN").value, dist = sliceDist(th.AR, sim.model); if (N >= 100000) award("crunch");
  const cnt = dist.xs.map(() => 0); let miss = 0, full = 0, land = 0, tot = 0; const conv = [], log = [], step = Math.max(1, Math.floor(N / 160));
  for (let i = 1; i <= N; i++){
    let dm = 0, k;
    if (Math.random() < th.miss){ miss++; k = ["miss", "Resist (miss)"]; }
    else if (sim.type === "bin"){ if (Math.random() < th.AR){ full++; k = ["full", "Resisted (effect failed)"]; } else { land++; dm = 1000; k = ["hit", "Lands"]; } }
    else { let r = Math.random(), j = 0; while (j < dist.p.length - 1 && r > dist.p[j]){ r -= dist.p[j]; j++; } const x = dist.xs[j]; cnt[j]++; dm = Math.round(1000 * (1 - x)); k = x >= 1 ? ["full", "Fully resisted"] : x > 0 ? ["part", `${dm} (${Math.round(1000 * x)} resisted)`] : ["hit", `${dm}`]; }
    tot += dm; if (i % step === 0 || i === N) conv.push([i, tot / i]); if (i > N - 14) log.push(`<div class="${k[0]}">#${fmt(i)}  ${k[1]}</div>`);
  }
  const exp = (1 - th.miss) * (sim.type === "bin" ? (1 - th.AR) : (1 - mean(dist))) * 1000, avg = tot / N;
  $("#sStats").innerHTML = [["Effective resist", fmt(th.Reff), th.lt ? `incl. +${th.lt} hidden level resist` : "no level bonus"],["Average resist", (th.AR*100).toFixed(1) + "%", "formula"],["Miss chance", (th.miss*100).toFixed(0) + "%", "roll one"],["Predicted / cast", fmt(exp, 1), "theory"],["Simulated / cast", fmt(avg, 1), `${((avg - exp) / (exp || 1) * 100).toFixed(2)}% off`]].map(([k, v, d]) => `<div class="big"><span class="k">${k}</span><span class="v" style="font-size:1.35rem">${v}</span><span class="d">${d}</span></div>`).join("");
  let bars = sim.type === "bin" ? [["Miss", miss/N, th.miss, "--dim"],["Effect failed", full/N, (1-th.miss)*th.AR, "--good"],["Lands", land/N, (1-th.miss)*(1-th.AR), "--bad"]] : [["Miss", miss/N, th.miss, "--dim"]].concat(dist.xs.map((x, i) => [Math.round(x*100) + "%", cnt[i]/N, (1-th.miss)*dist.p[i], x >= .75 ? "--good" : x > 0 ? "--warn" : "--bad"]));
  const ym = Math.max(.1, ...bars.map(b => Math.max(b[1], b[2]))) * 1.18, svg = $("#simHist");
  const f = frame(svg, {x0:-.5, x1:bars.length - .5, y0:0, y1:ym, yt:[0, ym/3, 2*ym/3].map(v => +v.toFixed(2)), yf:t => Math.round(t*100) + "%", xt:bars.map((b, i) => i), xf:i => bars[i][0], xl:sim.type === "bin" ? "Outcome" : "Share of the hit resisted", yl:"Share of casts"}); const bw = f.iw / bars.length * .6;
  bars.forEach((b, i) => { el("rect", {x:f.X(i) - bw/2, y:f.Y(b[1]), width:bw, height:f.Y(0) - f.Y(b[1]), fill:css(b[3]), opacity:.85, rx:3}, svg); el("line", {x1:f.X(i) - bw/2 - 4, x2:f.X(i) + bw/2 + 4, y1:f.Y(b[2]), y2:f.Y(b[2]), stroke:css("--ink"), "stroke-width":2, "stroke-dasharray":"5 3"}, svg); if (b[1] > .003) el("text", {class:"lab", x:f.X(i), y:Math.min(f.Y(b[1]), f.Y(b[2])) - 6, "text-anchor":"middle", fill:css("--ink")}, svg, (b[1]*100).toFixed(1) + "%"); });
  const lo = Math.min(exp, ...conv.map(p => p[1])), hi = Math.max(exp, ...conv.map(p => p[1])), pad = Math.max(20, (hi - lo) * .2), y0 = Math.max(0, lo - pad), y1 = Math.min(1000, hi + pad), c = $("#simConv");
  const g = frame(c, {x0:1, x1:N, y0, y1, yt:[y0, (y0+y1)/2, y1].map(Math.round), xt:[1, Math.round(N/2), N], xf:fmt, xl:"Casts so far", yl:"Avg damage"});
  let d = ""; conv.forEach((p, i) => d += (i ? "L" : "M") + g.X(p[0]) + " " + g.Y(p[1])); el("path", {d, fill:"none", stroke:css("--arcane"), "stroke-width":2.4}, c);
  el("line", {x1:g.m.l, x2:g.W - g.m.r, y1:g.Y(exp), y2:g.Y(exp), stroke:css("--ink"), "stroke-dasharray":"6 4"}, c); el("text", {class:"lab", x:g.W - g.m.r, y:g.Y(exp) - 6, "text-anchor":"end", fill:css("--ink")}, c, "predicted " + fmt(exp, 1));
  $("#sLog").innerHTML = log.join("");
}

/* ================= forever ================= */
function drawForever(){ const svg = $("#foreverChart"), f = frame(svg, {x0:0, x1:40, y0:0, y1:2, xt:[0,10,20,30,40], xl:"Players in a 40-player raid covered by 2 paladins' auras", m:{l:110, r:20, t:14, b:44}});
  [["Classic", 10, "--muted", "2 groups × 5 = 10"], ["Forever", 40, "--gold", "whole raid = 40"]].forEach(([n, v, c, l], i) => { const y = f.Y(1.5 - i), h = f.ih * .32; const r = el("rect", {x:f.X(0), y:y - h/2, width:0, height:h, fill:css(c), rx:4}, svg); r.animate([{width:"0px"},{width:(f.X(v) - f.X(0)) + "px"}], {duration:reduce ? 0 : 1200, fill:"forwards", easing:"cubic-bezier(.2,.9,.2,1)"}); r.setAttribute("width", f.X(v) - f.X(0)); el("text", {class:"lab", x:f.m.l - 10, y:y + 4, "text-anchor":"end", fill:css("--ink")}, svg, n); el("text", {class:"lab", x:f.X(v) - 8, y:y + 4, "text-anchor":"end", fill:"#140c08"}, svg, l); });
}

/* ================= myths ================= */
function renderMyths(){ const h = $("#mythList"), V = {f:["False","f"], p:["Partly","p"], t:["True","t"], u:["Unproven","u"]}; let n = 0;
  RL.MYTHS.forEach((m, i) => { const d = document.createElement("div"); d.className = "myth rv"; d.innerHTML = `<button class="q" type="button" aria-expanded="false" aria-controls="ma${i}">${m.q}<span class="go">Check it</span></button><div class="a" id="ma${i}"><span class="stamp ${V[m.v][1]}">${V[m.v][0]}</span><p>${m.a}${cite(m.s)}${m.vm ? `<span class="vm" data-vm="${m.vm}">V</span>` : ""}</p></div>`;
    d.querySelector("button").addEventListener("click", e => { const open = d.classList.toggle("open"); e.currentTarget.setAttribute("aria-expanded", open); if (open && !d.dataset.seen){ d.dataset.seen = 1; if (++n >= 5) award("myth"); } }); h.appendChild(d); });
  wireVM(h);
}

/* ================= vmangos summary ================= */
function renderVMSummary(){ const rows = [["Miss table 4/5/6/17, +11 per level","ok","Confirmed"],["Average resist = 0.75 × R ÷ 5L","ok","Confirmed"],["Effective cap 75%","mid","68.75% in VMaNGOS"],["Hidden boss resistance 15","no","22 in VMaNGOS"],["Binary spells skip level resist","ok","Confirmed"],["Auras and totems +60, Gift of the Wild +20","ok","Confirmed"],["Incinerate 3,675–4,275","no","3,675–4,725"],["Shadow Flame 2,210","no","3,938–5,062, unresistable"],["Kel'Thuzad Frostbolt unresistable","no","Binary, resistible"],["Frost Aura 600 every 2 s","ok","Confirmed (DB fix)"]];
  $("#vmSummary").innerHTML = `<div class="tbl-wrap"><table><thead><tr><th>Claim from the wiki and guides</th><th>VMaNGOS says</th></tr></thead><tbody>${rows.map(([a, c, b]) => `<tr><td>${a}</td><td class="${c}">${b}</td></tr>`).join("")}</tbody></table></div>`; }

/* ================= init ================= */
$$("img[src^='img/icons/']").forEach(i => { const k = i.getAttribute("src").slice(10, -4); if (window.RL_ICONS && RL_ICONS[k]) i.src = RL_ICONS[k]; });
renderRaids(); renderBuffs(); renderMyths(); renderVMSummary(); wireVM(document);
setEnc("rag"); drawHit(); drawAR(); drawPart(); drawPhase(); drawStack(); runSim(); drawForever();
$$("input[type=range]").forEach(fill);
})();
