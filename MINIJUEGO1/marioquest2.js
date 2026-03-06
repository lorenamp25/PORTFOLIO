/* =========================
   MARIOQUEST 2 (Portfolio)
   - World Map + 60 levels
   - ? blocks + bricks
   - Powerups: Big, Star, 1UP
   - Checkpoints
   - Boss each 10
   - Secret level per world (key unlock)
   - Speedrun best times
   - Avatar editor + presets
   - Fullscreen ONLY button / KeyF
========================= */

const $ = (q, el=document)=>el.querySelector(q);
const $$ = (q, el=document)=>[...el.querySelectorAll(q)];

const LEVELS = 60;
const WORLDS = 6; // 10 each
const PER_WORLD = 10;

const SAVE_KEY = "mq2_save_v2";
const AVA_KEY  = "mq2_avatar_v2";
const SET_KEY  = "mq2_set_v2";

/* ============ Storage ============ */
const LS = {
  get(k, fb){ try{ return JSON.parse(localStorage.getItem(k)) ?? fb; } catch { return fb; } },
  set(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
};

function defaultSave(){
  return {
    bestLevel: 1,
    done: {},          // "n": true
    coins: 0,
    score: 0,
    xp: 0,
    playerLevel: 1,
    selected: { type:"main", id:1 },   // {type:"main"/"secret", id:number(1..60) or world(1..6)}
    bestTimes: {},     // "main:12": 23.45   "secret:3": 18.22
    worldKeys: {},     // "1": true if key collected in world
    secretDone: {},    // "1": true secret world completed
  };
}
function defaultSettings(){ return { sound:true }; }
function defaultAvatar(){
  return {
    name:"Player",
    outfit:"Rookie",
    acc:"none",
    hair:"short",
    eyes:"soft",
    vibe:"neo",
    colSkin:"#F5C9A7",
    colOutfit:"#3b4fff",
    colHair:"#14161d",
    colAccent:"#00e0ff"
  };
}

let save = LS.get(SAVE_KEY, null) || defaultSave();
let settings = LS.get(SET_KEY, null) || defaultSettings();
let avatar = LS.get(AVA_KEY, null) || defaultAvatar();
function persist(){ LS.set(SAVE_KEY, save); LS.set(SET_KEY, settings); LS.set(AVA_KEY, avatar); }

/* ============ SFX (WebAudio no files) ============ */
const SFX = (() => {
  let ctx=null, enabled=true;
  function ensure(){
    if(!ctx) ctx = new (window.AudioContext||window.webkitAudioContext)();
    if(ctx.state==="suspended") ctx.resume().catch(()=>{});
    return ctx;
  }
  function tone(freq=440, dur=0.08, type="square", gain=0.05, when=0){
    if(!enabled) return;
    const c=ensure(); const t0=c.currentTime+when;
    const o=c.createOscillator(); const g=c.createGain();
    o.type=type; o.frequency.setValueAtTime(freq,t0);
    g.gain.setValueAtTime(0.0001,t0);
    g.gain.exponentialRampToValueAtTime(gain,t0+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001,t0+dur);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0+dur+0.02);
  }
  const ui=()=>{ tone(880,0.05,"square",0.05); tone(1320,0.05,"square",0.035,0.04); };
  const coin=()=>{ tone(1046,0.06,"square",0.06); tone(1568,0.06,"square",0.045,0.05); };
  const jump=()=>{ tone(659,0.05,"square",0.05); tone(880,0.06,"square",0.04,0.05); };
  const hit =()=>{ tone(196,0.10,"sawtooth",0.05); tone(165,0.12,"sawtooth",0.04,0.06); };
  const power=()=>{ tone(523,0.07,"triangle",0.05); tone(659,0.07,"triangle",0.05,0.07); tone(784,0.08,"triangle",0.05,0.14); };
  const win =()=>{ tone(523,0.07,"square",0.05); tone(659,0.07,"square",0.05,0.08); tone(784,0.08,"square",0.05,0.16); tone(1046,0.10,"square",0.055,0.24); };
  const boss =()=>{ tone(110,0.12,"sawtooth",0.06); tone(90,0.12,"sawtooth",0.05,0.12); tone(130,0.12,"sawtooth",0.05,0.24); };
  function toggle(){ enabled=!enabled; return enabled; }
  function unlock(){ ensure(); }
  return { ui, coin, jump, hit, power, win, boss, toggle, unlock, get enabled(){return enabled;} };
})();

// Unlock audio only when clicking non-button surface (prevents weird first gesture issues)
window.addEventListener("pointerdown", (e)=>{
  const t = e.target;
  if(t && (t.closest("button") || t.closest(".topbar"))) return;
  SFX.unlock();
}, { once:true, passive:true });

if(!settings.sound && SFX.enabled) SFX.toggle();

/* ============ XP / Outfits unlock ============ */
const OUTFITS = [
  {name:"Rookie", min:1},
  {name:"Hoodie", min:2},
  {name:"Jacket", min:4},
  {name:"Armor",  min:6},
  {name:"Cyber",  min:8},
  {name:"Royal",  min:10},
  {name:"Ninja",  min:12},
  {name:"Astral", min:15},
  {name:"Boss",   min:18},
];
function unlockedOutfits(){ return OUTFITS.filter(o=>save.playerLevel>=o.min).map(o=>o.name); }
function xpNeedForLevel(lvl){ return 120 + (lvl-1)*60; }
function gainXP(amount){
  save.xp += amount;
  while(save.xp >= xpNeedForLevel(save.playerLevel)){
    save.xp -= xpNeedForLevel(save.playerLevel);
    save.playerLevel += 1;
    save.coins += 10;
    save.score += 150;
    popText(`⭐ LEVEL UP → ${save.playerLevel}`, 1.2);
    SFX.power();
  }
  persist();
  refreshAvatarOutfits();
}

/* ============ Helpers ============ */
function clamp(v,a,b){ return Math.max(a, Math.min(b,v)); }
function pad2(n){ return String(n).padStart(2,"0"); }
function aabb(a,b){ return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }
function rect(x,y,w,h){ return {x,y,w,h}; }

function worldOfMain(levelId){ return Math.floor((levelId-1)/PER_WORLD)+1; } // 1..6
function indexInWorld(levelId){ return ((levelId-1)%PER_WORLD)+1; } // 1..10
function labelMain(levelId){ return `${worldOfMain(levelId)}-${indexInWorld(levelId)}`; }

function themeForWorld(w){
  return ["Sky","Cave","Forest","City","Ice","Lava"][w-1] || "Sky";
}
function isBossLevelMain(levelId){ return levelId % 10 === 0; }

function keyName(sel){ return `${sel.type}:${sel.id}`; }
function isUnlockedMain(levelId){ return levelId <= save.bestLevel; }
function isDoneMain(levelId){ return !!save.done[String(levelId)]; }
function isSecretUnlocked(world){ return !!save.worldKeys[String(world)]; }
function isSecretDone(world){ return !!save.secretDone[String(world)]; }

/* ============ Fullscreen (ONLY button / KeyF) ============ */
async function toggleFullscreen(){
  try{
    if(!document.fullscreenElement) await document.documentElement.requestFullscreen();
    else await document.exitFullscreen();
  }catch{}
  updateFullscreenBtn();
}
function updateFullscreenBtn(){
  $("#btnFullscreen").textContent = document.fullscreenElement ? "EXIT FULLSCREEN" : "FULLSCREEN";
}
window.addEventListener("keydown",(e)=>{
  if(e.code==="KeyF") toggleFullscreen();
});

/* =======================
   UI Screens
======================= */
const overlay = $("#overlay");
const screenHome = $("#screenHome");
const screenMap = $("#screenMap");
const screenLevels = $("#screenLevels");
const screenPause = $("#screenPause");

let paused = true;

function showOverlay(which){
  overlay.style.display = "grid";
  paused = true;
  screenHome.classList.toggle("hidden", which!=="home");
  screenMap.classList.toggle("hidden", which!=="map");
  screenLevels.classList.toggle("hidden", which!=="levels");
  screenPause.classList.toggle("hidden", which!=="pause");
  renderAllUI();
}
function hideOverlay(){
  overlay.style.display = "none";
  paused = false;
}

/* =======================
   World Map UI
======================= */
let mapWorld = 1;
let selected = save.selected || {type:"main", id:1};

function setSelected(sel){
  selected = sel;
  save.selected = sel;
  persist();
  renderAllUI();
}

function renderWorldTabs(){
  const el = $("#worldTabs");
  el.innerHTML = "";
  for(let w=1; w<=WORLDS; w++){
    const b = document.createElement("button");
    b.className = "tab" + (w===mapWorld ? " active":"");
    b.textContent = `WORLD ${w} • ${themeForWorld(w)}`;
    b.addEventListener("click", ()=>{
      mapWorld = w;
      SFX.ui();
      renderAllUI();
    });
    el.appendChild(b);
  }
}

function nodeClassFor(sel){
  const k = keyName(sel);
  let cls = "node";

  let unlocked=false, done=false, now=false, locked=false;

  if(sel.type==="main"){
    unlocked = isUnlockedMain(sel.id);
    done = isDoneMain(sel.id);
    now = (currentSel.type==="main" && currentSel.id===sel.id);
    locked = !unlocked;
    if(isBossLevelMain(sel.id)) cls += " boss";
  } else {
    unlocked = isSecretUnlocked(sel.id);
    done = isSecretDone(sel.id);
    now = (currentSel.type==="secret" && currentSel.id===sel.id);
    locked = !unlocked;
    cls += " secret";
  }

  if(locked) cls += " locked";
  if(done) cls += " done";
  if(now) cls += " now";
  if(keyName(selected)===k) cls += " selected";
  return cls;
}

function renderMapNodes(){
  const el = $("#mapNodes");
  el.innerHTML = "";

  // nodes 1..10 for world
  const base = (mapWorld-1)*PER_WORLD;
  for(let i=1;i<=PER_WORLD;i++){
    const id = base + i;
    const sel = {type:"main", id};
    const n = document.createElement("div");
    n.className = nodeClassFor(sel);
    n.textContent = pad2(i);
    n.title = `Level ${labelMain(id)}${isBossLevelMain(id) ? " (BOSS)" : ""}`;
    n.addEventListener("click", ()=>{
      if(!isUnlockedMain(id)) { SFX.hit(); return; }
      setSelected(sel);
      SFX.ui();
    });
    el.appendChild(n);
  }

  // secret node
  const secret = document.createElement("div");
  const sSel = {type:"secret", id: mapWorld}; // secret by world
  secret.className = nodeClassFor(sSel);
  secret.textContent = "S";
  secret.title = isSecretUnlocked(mapWorld) ? `Secret World ${mapWorld}` : `Locked (need 🔑)`;
  secret.addEventListener("click", ()=>{
    if(!isSecretUnlocked(mapWorld)) { SFX.hit(); return; }
    setSelected(sSel);
    SFX.ui();
  });
  el.appendChild(secret);

  renderMapSelectedInfo();
}

function bestTimeText(sel){
  const bt = save.bestTimes[keyName(sel)];
  if(typeof bt !== "number") return "—";
  return `${bt.toFixed(2)}s`;
}

function renderMapSelectedInfo(){
  const title = $("#mapSelTitle");
  const info  = $("#mapSelInfo");
  const best  = $("#mapSelBest");

  if(selected.type==="main"){
    const w = worldOfMain(selected.id);
    title.innerHTML = `<strong>LEVEL ${labelMain(selected.id)}</strong>${isBossLevelMain(selected.id) ? " • BOSS" : ""}`;
    info.textContent = `Mapa: ${themeForWorld(w)} • Unlocked: ${isUnlockedMain(selected.id) ? "YES":"NO"}`;
    best.textContent = `Best: ${bestTimeText(selected)}`;
  } else {
    title.innerHTML = `<strong>SECRET S</strong> • World ${selected.id}`;
    info.textContent = `Requiere 🔑 (ya la tienes) • recompensa extra`;
    best.textContent = `Best: ${bestTimeText(selected)}`;
  }
}

/* =======================
   Level List UI
======================= */
function renderLevelGrid(){
  const el = $("#levelGrid");
  el.innerHTML = "";

  // main levels 1..60
  for(let i=1;i<=LEVELS;i++){
    const b = document.createElement("button");
    const sel = {type:"main", id:i};
    let cls = "lv";
    if(!isUnlockedMain(i)) cls += " locked";
    if(isDoneMain(i)) cls += " done";
    if(isBossLevelMain(i)) cls += " boss";
    if(keyName(selected)===keyName(sel)) cls += " selected";
    b.className = cls;
    b.textContent = pad2(i);
    b.title = `Level ${labelMain(i)} • Best ${bestTimeText(sel)}`;
    b.addEventListener("click", ()=>{
      if(!isUnlockedMain(i)) { SFX.hit(); return; }
      setSelected(sel);
      SFX.ui();
    });
    el.appendChild(b);
  }

  // secrets row 6 items
  for(let w=1; w<=WORLDS; w++){
    const b = document.createElement("button");
    const sel = {type:"secret", id:w};
    let cls = "lv secret";
    if(!isSecretUnlocked(w)) cls += " locked";
    if(isSecretDone(w)) cls += " done";
    if(keyName(selected)===keyName(sel)) cls += " selected";
    b.className = cls;
    b.textContent = `S${w}`;
    b.title = isSecretUnlocked(w) ? `Secret World ${w} • Best ${bestTimeText(sel)}` : `Locked (need 🔑 in World ${w})`;
    b.addEventListener("click", ()=>{
      if(!isSecretUnlocked(w)) { SFX.hit(); return; }
      setSelected(sel);
      SFX.ui();
    });
    el.appendChild(b);
  }
}

/* =======================
   Avatar UI
======================= */
const avatarModal = $("#avatarModal");
const prevC = $("#avatarPreview");
const prevX = prevC.getContext("2d");
prevX.imageSmoothingEnabled = false;

const miniC = $("#avatarMini");
const miniX = miniC.getContext("2d");
miniX.imageSmoothingEnabled = false;

function openAvatar(open){
  avatarModal.setAttribute("aria-hidden", open ? "false":"true");
  if(open){
    refreshAvatarOutfits();
    fillAvatarControls();
    drawAvatarPreview();
  }
}
avatarModal.addEventListener("click",(e)=>{
  if(e.target?.dataset?.close) openAvatar(false);
});

function refreshAvatarOutfits(){
  const unlocked = unlockedOutfits();
  const sel = $("#avaOutfit");
  sel.innerHTML = unlocked.map(o=>`<option value="${o}">${o}</option>`).join("");
  if(!unlocked.includes(avatar.outfit)) avatar.outfit = unlocked[0] || "Rookie";
  persist();
}

function fillAvatarControls(){
  $("#avaName").value = avatar.name || "Player";
  $("#avaOutfit").value = avatar.outfit;
  $("#avaAcc").value = avatar.acc;
  $("#avaHair").value = avatar.hair;
  $("#avaEyes").value = avatar.eyes;
  $("#avaVibe").value = avatar.vibe;
  $("#colSkin").value = avatar.colSkin;
  $("#colOutfit").value = avatar.colOutfit;
  $("#colHair").value = avatar.colHair;
  $("#colAccent").value = avatar.colAccent;
}

function randColor(){
  const h=()=>Math.floor(Math.random()*256).toString(16).padStart(2,"0");
  return `#${h()}${h()}${h()}`;
}
function applyAvatarFromUI(){
  avatar.name = ($("#avaName").value || "Player").trim().slice(0,14) || "Player";
  avatar.outfit = $("#avaOutfit").value;
  avatar.acc = $("#avaAcc").value;
  avatar.hair = $("#avaHair").value;
  avatar.eyes = $("#avaEyes").value;
  avatar.vibe = $("#avaVibe").value;
  avatar.colSkin = $("#colSkin").value;
  avatar.colOutfit = $("#colOutfit").value;
  avatar.colHair = $("#colHair").value;
  avatar.colAccent = $("#colAccent").value;
  persist();
  drawAvatarPreview();
  drawAvatarMini();
  renderHUD();
}
function randomAvatar(){
  const outs = unlockedOutfits();
  const accs = ["none","cap","glasses","headphones","mask","cape"];
  const hairs = ["short","bob","curly","bun","spiky"];
  const eyes  = ["soft","focus","happy","wide"];
  const vibes = ["neo","soft","street","pro"];
  avatar.outfit = outs[Math.floor(Math.random()*outs.length)] || "Rookie";
  avatar.acc = accs[Math.floor(Math.random()*accs.length)];
  avatar.hair = hairs[Math.floor(Math.random()*hairs.length)];
  avatar.eyes = eyes[Math.floor(Math.random()*eyes.length)];
  avatar.vibe = vibes[Math.floor(Math.random()*vibes.length)];
  avatar.colSkin = randColor();
  avatar.colOutfit = randColor();
  avatar.colHair = randColor();
  avatar.colAccent = randColor();
  persist();
  fillAvatarControls();
  applyAvatarFromUI();
  SFX.ui();
}
function preset(n){
  const presets = [
    {name:"NeoKid", outfit:"Cyber", acc:"headphones", hair:"spiky", eyes:"focus", vibe:"neo", colSkin:"#F5C9A7", colOutfit:"#00e0ff", colHair:"#14161d", colAccent:"#2cff8a"},
    {name:"Frost", outfit:"Armor", acc:"mask", hair:"bob", eyes:"wide", vibe:"pro", colSkin:"#e8c7b1", colOutfit:"#cfe8ff", colHair:"#2b2f3a", colAccent:"#3b4fff"},
    {name:"Street", outfit:"Hoodie", acc:"cap", hair:"curly", eyes:"happy", vibe:"street", colSkin:"#c89a7b", colOutfit:"#ffcc00", colHair:"#14161d", colAccent:"#ff3b6b"},
  ];
  const p = presets[n-1];
  if(!p) return;
  const unlocked = unlockedOutfits();
  avatar.name = p.name;
  avatar.outfit = unlocked.includes(p.outfit) ? p.outfit : unlocked[0];
  avatar.acc = p.acc; avatar.hair = p.hair; avatar.eyes = p.eyes; avatar.vibe = p.vibe;
  avatar.colSkin = p.colSkin; avatar.colOutfit = p.colOutfit; avatar.colHair = p.colHair; avatar.colAccent = p.colAccent;
  persist();
  fillAvatarControls();
  applyAvatarFromUI();
  SFX.ui();
}

$("#avaRandom").addEventListener("click", randomAvatar);
$("#avaPreset1").addEventListener("click", ()=>preset(1));
$("#avaPreset2").addEventListener("click", ()=>preset(2));
$("#avaPreset3").addEventListener("click", ()=>preset(3));
$("#avaDefault").addEventListener("click", ()=>{
  avatar = defaultAvatar();
  persist();
  refreshAvatarOutfits();
  fillAvatarControls();
  applyAvatarFromUI();
  SFX.ui();
});
$("#avaApply").addEventListener("click", ()=>{
  // outfit locked check
  const unlocked = unlockedOutfits();
  const want = $("#avaOutfit").value;
  if(!unlocked.includes(want)){ SFX.hit(); popText("OUTFIT BLOQUEADO", 1.0); return; }
  applyAvatarFromUI();
  SFX.ui();
  openAvatar(false);
});

[
  "avaName","avaOutfit","avaAcc","avaHair","avaEyes","avaVibe","colSkin","colOutfit","colHair","colAccent"
].forEach(id=>{
  $("#"+id).addEventListener("input", ()=>{
    // live preview, but don't permanently block locked outfit
    drawAvatarPreviewLive();
    drawAvatarMini();
  });
});

function drawAvatarPreviewLive(){
  const tmp = {
    name: ($("#avaName").value||"Player").slice(0,14),
    outfit: $("#avaOutfit").value,
    acc: $("#avaAcc").value,
    hair: $("#avaHair").value,
    eyes: $("#avaEyes").value,
    vibe: $("#avaVibe").value,
    colSkin: $("#colSkin").value,
    colOutfit: $("#colOutfit").value,
    colHair: $("#colHair").value,
    colAccent: $("#colAccent").value,
  };
  drawAvatarOn(prevX, prevC.width, prevC.height, tmp, 6);
}

/* =======================
   Buttons / Navigation
======================= */
$("#btnHome").addEventListener("click", ()=>{ SFX.ui(); showOverlay("home"); });
$("#btnMap").addEventListener("click", ()=>{ SFX.ui(); showOverlay("map"); });
$("#btnLevels").addEventListener("click", ()=>{ SFX.ui(); showOverlay("levels"); });
$("#btnAvatar").addEventListener("click", ()=>{ SFX.ui(); openAvatar(true); });

$("#btnOpenMap").addEventListener("click", ()=>{ SFX.ui(); showOverlay("map"); });
$("#btnOpenLevels").addEventListener("click", ()=>{ SFX.ui(); showOverlay("levels"); });
$("#btnOpenAvatar").addEventListener("click", ()=>{ SFX.ui(); openAvatar(true); });

$("#btnBackHomeMap").addEventListener("click", ()=>{ SFX.ui(); showOverlay("home"); });
$("#btnBackHomeLv").addEventListener("click", ()=>{ SFX.ui(); showOverlay("home"); });

$("#btnMapLevels").addEventListener("click", ()=>{ SFX.ui(); showOverlay("levels"); });
$("#btnLevelsMap").addEventListener("click", ()=>{ SFX.ui(); showOverlay("map"); });

$("#btnMapPlay").addEventListener("click", ()=>{ SFX.ui(); startSelected(); });
$("#btnPlaySelected").addEventListener("click", ()=>{ SFX.ui(); startSelected(); });

$("#btnPlay").addEventListener("click", ()=>{ SFX.ui(); startContinue(); });

$("#btnResume").addEventListener("click", ()=>{ SFX.ui(); hideOverlay(); });
$("#btnPauseMap").addEventListener("click", ()=>{ SFX.ui(); showOverlay("map"); });
$("#btnPauseLevels").addEventListener("click", ()=>{ SFX.ui(); showOverlay("levels"); });
$("#btnPauseAvatar").addEventListener("click", ()=>{ SFX.ui(); openAvatar(true); });
$("#btnRestart").addEventListener("click", ()=>{ SFX.ui(); restartLevel(); hideOverlay(); });

$("#btnSound").addEventListener("click", ()=>{
  const on = SFX.toggle();
  settings.sound = on;
  persist();
  $("#btnSound").textContent = `SOUND: ${on ? "ON":"OFF"}`;
});
$("#btnFullscreen").addEventListener("click", ()=>{ SFX.ui(); toggleFullscreen(); });

$("#btnReset").addEventListener("click", ()=>{
  const ok = confirm("RESET TOTAL (progreso + avatar + tiempos)?");
  if(!ok) return;
  save = defaultSave();
  settings = defaultSettings();
  avatar = defaultAvatar();
  persist();
  selected = save.selected;
  mapWorld = 1;
  hardResetGame();
  $("#btnSound").textContent = "SOUND: ON";
  showOverlay("home");
  SFX.ui();
});

function startContinue(){
  // keep current selection
  startSelected();
}
function startSelected(){
  currentSel = {...selected};
  loadLevel(currentSel);
  hideOverlay();
}

/* =======================
   Game Core
======================= */
const canvas = $("#game");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

const W = canvas.width, H = canvas.height;
const GRAV = 1900;
const MOVE = 360;
const RUN  = 580;
const JUMP = 740;

let keys = {left:false,right:false,jump:false,run:false};
let camX=0;
let flash=0;
let popMsgs=[];

let runTime = 0;
let runDeaths = 0;

function popText(text, ttl=1.0){ popMsgs.push({text, t: ttl, y: 76}); }

/* ============ Input ============ */
function setKey(code,v){
  if(code==="ArrowLeft"||code==="KeyA") keys.left=v;
  if(code==="ArrowRight"||code==="KeyD") keys.right=v;
  if(code==="ArrowUp"||code==="KeyW"||code==="Space") keys.jump=v;
  if(code==="ShiftLeft"||code==="ShiftRight") keys.run=v;
}
window.addEventListener("keydown",(e)=>{
  if(e.code==="Escape"){ showOverlay("pause"); return; }
  if(e.code==="KeyR"){ restartLevel(); return; }
  setKey(e.code,true);
});
window.addEventListener("keyup",(e)=> setKey(e.code,false));

// mobile buttons
$$(".pad").forEach(b=>{
  const k=b.dataset.k;
  const down=()=>{ if(k==="left")keys.left=true; if(k==="right")keys.right=true; if(k==="jump")keys.jump=true; if(k==="run")keys.run=true; };
  const up=()=>{ if(k==="left")keys.left=false; if(k==="right")keys.right=false; if(k==="jump")keys.jump=false; if(k==="run")keys.run=false; };
  b.addEventListener("pointerdown",(e)=>{ e.preventDefault(); down(); });
  b.addEventListener("pointerup",(e)=>{ e.preventDefault(); up(); });
  b.addEventListener("pointercancel", up);
  b.addEventListener("pointerleave", up);
});

/* =======================
   RNG (seeded)
======================= */
function xorshift32(seed){
  let x = seed >>> 0;
  return () => {
    x ^= x << 13; x >>>= 0;
    x ^= x >> 17; x >>>= 0;
    x ^= x << 5;  x >>>= 0;
    return (x >>> 0) / 4294967296;
  };
}
function rint(r,a,b){ return Math.floor(r()*(b-a+1))+a; }
function rpick(r,arr){ return arr[Math.floor(r()*arr.length)]; }
function seedFor(sel){
  // keep deterministic for best times fairness
  if(sel.type==="main") return 1337*sel.id + 9001;
  return 7777*sel.id + 4242; // secret seed by world
}

/* =======================
   Entities
======================= */
function newPlayer(){
  return {
    x:80,y:180,w:26,h:30,
    vx:0,vy:0,
    onGround:false,
    jumpBuffered:0,
    canDouble:true,
    invuln:0,
    lives:3,
    big:false,
    star:0, // seconds
    hasKey:false,
  };
}
let player = newPlayer();

function resizePlayer(){
  if(player.big){
    player.w = 28;
    player.h = 44;
  } else {
    player.w = 26;
    player.h = 30;
  }
}

let currentSel = save.selected || {type:"main", id:1};
let level = null;

function hardResetGame(){
  currentSel = save.selected || {type:"main", id:1};
  level = null;
  player = newPlayer();
  camX=0; flash=0;
  runTime=0; runDeaths=0;
}
hardResetGame();

/* =======================
   Level generation
======================= */
function genParams(sel){
  if(sel.type==="secret"){
    return { world: sel.id, len: 2200, enemyCount: 8, gapiness:0.35, heightiness:0.65, coinDensity:0.9, secret:true, boss:false };
  }
  const id=sel.id;
  const w=worldOfMain(id);
  const t=(id-1)/(LEVELS-1);
  const boss=isBossLevelMain(id);
  const len = boss ? 2400 : Math.round(2600 + t*2500 + (w-1)*120);
  const enemyCount = boss ? 0 : Math.round(2 + t*10 + (w-1)*1.2);
  return {
    world:w, len,
    enemyCount,
    gapiness: Math.min(0.55, 0.18 + t*0.45),
    heightiness: Math.min(0.65, 0.20 + t*0.45),
    coinDensity: Math.min(0.9, 0.35 + t*0.6),
    secret:false,
    boss
  };
}

function loadLevel(sel){
  currentSel = {...sel};
  const r = xorshift32(seedFor(sel));
  const p = genParams(sel);

  player = newPlayer();
  player.hasKey = false;
  resizePlayer();

  runTime = 0;
  runDeaths = 0;

  // speedrun timer (400 is displayed but we track real runTime)
  level = {
    sel,
    world: p.world,
    theme: themeForWorld(p.world),
    boss: p.boss,
    secret: p.secret,
    len: p.len,
    platforms: [],
    coins: [],
    enemies: [],
    blocks: [],       // {x,y,type:"q"/"brick"/"used", hit:false}
    items: [],        // powerups moving
    particles: [],
    checkpointX: Math.floor(p.len*0.52),
    checkpointActive: false,
    respawn: {x:80,y:160},
    goalX: p.boss ? (p.len - 220) : (p.len - 160),
    bossEnt: null,
    keyPlaced: false,
    keyPos: null,
  };

  // Ground segments + gaps
  const groundY = 310;
  const segH = 60;
  let x = 0;

  while(x < p.len){
    const segW = rint(r, 220, 520);
    const gapW = (r() < p.gapiness) ? rint(r, 90, 200) : rint(r, 20, 80);
    level.platforms.push({x, y: groundY, w: Math.min(segW, p.len-x), h: segH});

    // upper platforms + blocks
    const count = rint(r, 1, 3);
    for(let i=0;i<count;i++){
      if(r() > p.heightiness) continue;
      const px = x + rint(r, 60, Math.max(70, segW-120));
      const py = rpick(r, [260,250,240,230,220,210,200]) - rint(r,0,(p.world-1)*6);
      const pw = rint(r, 120, 240);
      const yy = Math.max(170, py);
      level.platforms.push({x:px, y:yy, w:pw, h:20});

      // place some blocks over platform
      if(r() < 0.85){
        const bx = px + rint(r, 10, Math.max(20, pw-80));
        const by = yy - 36;
        const kind = r() < 0.6 ? "q" : "brick";
        level.blocks.push({x: snap(bx), y: snap(by), type: kind, used:false, bump:0});
        if(r()<0.35){
          level.blocks.push({x: snap(bx+36), y: snap(by), type: "q", used:false, bump:0});
        }
      }

      // coins above platform
      if(r() < p.coinDensity){
        const cN = rint(r, 2, 5);
        for(let c=0;c<cN;c++) level.coins.push({x: px + 24 + c*28, y: yy - 30, taken:false});
      }
    }

    // ground coins
    if(r() < p.coinDensity){
      const cN = rint(r, 2, 6);
      for(let c=0;c<cN;c++){
        level.coins.push({x: x + rint(r, 20, Math.max(40, segW-40)), y: groundY-24, taken:false});
      }
    }

    x += segW + gapW;
  }

  // enemies (not in boss levels)
  if(!p.boss){
    const usable = level.platforms.filter(pl => pl.y===groundY && pl.w>=240);
    for(let i=0;i<p.enemyCount;i++){
      const base = rpick(r, usable);
      const ex = base.x + rint(r, 40, Math.max(60, base.w-60));
      level.enemies.push({
        x:ex, y:groundY-20, w:26, h:18,
        baseX:ex, range:rint(r,90,220),
        speed:rint(r,90,190)+(p.world-1)*6,
        dir:r()<.5?-1:1,
        dead:false
      });
    }
  }

  // Key placement (only main levels, not boss, not secret)
  if(!p.secret && !p.boss){
    // key only if not already collected for this world
    const w = p.world;
    if(!save.worldKeys[String(w)]){
      // place key around 70-85% level
      const keyX = Math.floor(p.len * (0.72 + r()*0.12));
      const keyY = rpick(r, [190,210,230]);
      level.keyPlaced = true;
      level.keyPos = {x:keyX, y:keyY, taken:false};
    }
  }

  // Boss setup
  if(p.boss){
    // boss arena: solid ground and some platforms
    level.platforms = [
      {x:0, y:groundY, w:p.len, h:segH},
      {x:p.len-840, y:240, w:180, h:20},
      {x:p.len-620, y:200, w:180, h:20},
    ];
    level.blocks = [];
    level.coins = [];
    level.enemies = [];
    level.goalX = p.len - 170;
    level.checkpointX = Math.floor(p.len*0.35);
    level.keyPlaced = false;

    level.bossEnt = {
      x: p.len - 520, y: groundY-48,
      w: 64, h: 48,
      vx: -90, vy: 0,
      hp: 3 + Math.floor((p.world-1)*0.5), // 3..5
      inv: 0,
      phase: 0,
      leapCD: 1.6,
      shotCD: 1.0,
      alive:true
    };
  }

  // checkpoint flag must sit on ground; activate when player passes it
  level.checkpointX = clamp(level.checkpointX, 240, p.len-400);

  camX=0;
  flash=0;
  popText(p.secret ? `SECRET WORLD ${p.world}` : `WORLD ${p.secret ? "S" : label(sel)}`, 1.1);

  renderAllUI();
}

function label(sel){
  if(sel.type==="secret") return `S${sel.id}`;
  return labelMain(sel.id);
}

function snap(v){ return Math.round(v/6)*6; }

/* =======================
   Blocks / Powerups
======================= */
function spawnItem(x,y,kind){
  // kind: "coin" "big" "star" "1up"
  level.items.push({
    kind,
    x, y,
    w: 18, h: 18,
    vx: (Math.random()<0.5?-1:1)*110,
    vy: -250,
    life: 999
  });
}
function blockDropForWorld(w, r){
  // weighted: coin 60%, big 20%, star 10%, 1up 10% (later worlds slightly more star)
  const t = r();
  const starBoost = Math.min(0.08, (w-1)*0.015);
  if(t < 0.60) return "coin";
  if(t < 0.80) return "big";
  if(t < 0.90 - starBoost) return "1up";
  return "star";
}

/* =======================
   Checkpoint / Respawn
======================= */
function activateCheckpoint(){
  if(level.checkpointActive) return;
  level.checkpointActive = true;
  level.respawn = {x: level.checkpointX+20, y: 160};
  popText("CHECKPOINT!", 1.0);
  SFX.power();
}

/* =======================
   Win / Best times / Progress
======================= */
function bestTimeKey(){ return keyName(currentSel); }

function commitBestTime(){
  const k = bestTimeKey();
  const t = runTime;
  if(!(t>0)) return;
  const prev = save.bestTimes[k];
  if(typeof prev !== "number" || t < prev){
    save.bestTimes[k] = t;
    popText("NEW BEST!", 1.0);
    SFX.power();
  }
  persist();
}

function winLevel(){
  paused = true;
  SFX.win();
  flash = Math.max(flash, 0.35);

  commitBestTime();

  // rewards
  save.coins += 5;
  save.score += 900;
  gainXP(40);

  if(currentSel.type==="main"){
    save.done[String(currentSel.id)] = true;
    if(currentSel.id < LEVELS){
      save.bestLevel = Math.max(save.bestLevel, currentSel.id+1);
    } else {
      save.bestLevel = LEVELS;
    }
  } else {
    save.secretDone[String(currentSel.id)] = true;
    save.coins += 20;
    save.score += 400;
    gainXP(30);
  }

  persist();

  // auto next for main
  if(currentSel.type==="main" && currentSel.id < LEVELS){
    setSelected({type:"main", id: currentSel.id+1});
    loadLevel({type:"main", id: currentSel.id+1});
    hideOverlay();
  } else {
    showOverlay("home");
  }
}

/* =======================
   Damage / Death
======================= */
function damage(){
  if(player.star > 0) return; // invincible
  if(player.invuln > 0) return;

  if(player.big){
    // shrink instead of losing life
    player.big = false;
    resizePlayer();
    player.invuln = 1.2;
    flash = Math.max(flash, 0.25);
    SFX.hit();
    popText("HIT → SMALL", 0.9);
    return;
  }

  player.lives -= 1;
  runDeaths += 1;
  player.invuln = 1.2;
  flash = Math.max(flash, 0.28);
  SFX.hit();
  popText("HIT!", 0.8);

  if(player.lives <= 0){
    save.score = Math.max(0, save.score - 250);
    persist();
    $("#pauseTitle").textContent = "GAME OVER";
    $("#pauseText").textContent = "Sin vidas. Reintenta o vuelve al mapa.";
    showOverlay("pause");
    return;
  }

  // respawn
  player.x = level.respawn.x;
  player.y = level.respawn.y;
  player.vx = 0;
  player.vy = 0;
}

/* =======================
   Boss logic
======================= */
function bossHit(){
  if(!level.bossEnt || !level.bossEnt.alive) return;
  const b = level.bossEnt;
  if(b.inv > 0) return;
  b.hp -= 1;
  b.inv = 0.8;
  flash = Math.max(flash, 0.22);
  SFX.boss();
  popText(`BOSS HP ${b.hp}`, 0.9);
  if(b.hp <= 0){
    b.alive = false;
    popText("BOSS DEFEATED!", 1.2);
    SFX.win();
    // open goal immediately
    level.goalX = level.len - 160;
  }
}

function bossUpdate(dt){
  const b = level.bossEnt;
  if(!b || !b.alive) return;

  if(b.inv > 0) b.inv -= dt;

  // basic AI: chase + leap + shoot
  b.leapCD -= dt;
  b.shotCD -= dt;

  // horizontal chase
  const targetDir = (player.x < b.x) ? -1 : 1;
  b.vx += (targetDir*220 - b.vx) * Math.min(1, dt*2.4);

  // leap
  if(b.leapCD <= 0){
    b.leapCD = 1.6 + Math.random()*0.6;
    b.vy = -820;
    b.vx += targetDir*180;
  }

  // shoot (spawns fire particles that hurt)
  if(b.shotCD <= 0){
    b.shotCD = 1.0 + Math.random()*0.9;
    const sx = b.x + (targetDir>0 ? b.w : -10);
    const sy = b.y + 10;
    level.particles.push({
      kind:"fire",
      x:sx, y:sy,
      w:12, h:12,
      vx: targetDir*(240 + Math.random()*90),
      vy: -80 + Math.random()*60,
      life: 2.3
    });
  }

  // gravity for boss
  b.vy += GRAV*dt;
  b.x += b.vx*dt;
  b.y += b.vy*dt;

  // floor collision (ground platform)
  const ground = 310;
  if(b.y + b.h > ground){
    b.y = ground - b.h;
    b.vy = 0;
  }

  // clamp arena
  b.x = clamp(b.x, level.len-900, level.len-80);

  // collision with player
  const br = rect(b.x, b.y, b.w, b.h);
  const pr = rect(player.x, player.y, player.w, player.h);
  if(aabb(pr, br)){
    // player can stomp from above
    if(player.vy > 260 && (player.y + player.h - player.vy*dt) <= br.y + 10){
      player.vy = -JUMP*0.72;
      bossHit();
    } else {
      damage();
    }
  }
}

/* =======================
   Update loop
======================= */
let last = performance.now();
function loop(now){
  const dt = Math.min(0.033, (now-last)/1000);
  last = now;
  if(!paused) update(dt);
  draw(dt);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

function update(dt){
  if(!level) return;

  runTime += dt;

  if(player.invuln > 0) player.invuln -= dt;
  if(player.star > 0) player.star -= dt;

  // movement
  const speed = keys.run ? RUN : MOVE;
  let ax=0;
  if(keys.left) ax -= 1;
  if(keys.right) ax += 1;
  player.vx = ax * speed;

  if(keys.jump) player.jumpBuffered = 0.12;
  else player.jumpBuffered = Math.max(0, player.jumpBuffered - dt);

  player.vy += GRAV*dt;

  // integrate X
  player.x += player.vx*dt;
  player.x = clamp(player.x, 0, level.len - player.w);

  // integrate Y
  player.y += player.vy*dt;
  player.onGround = false;

  // collide platforms
  for(const p of level.platforms){
    const pr = rect(p.x, p.y, p.w, p.h);
    const pl = rect(player.x, player.y, player.w, player.h);
    if(aabb(pl, pr)){
      // landing
      if(player.vy > 0 && (pl.y + pl.h - player.vy*dt) <= pr.y + 8){
        player.y = pr.y - player.h;
        player.vy = 0;
        player.onGround = true;
        player.canDouble = true;
      } else if(player.vy < 0){
        // head hit
        player.y = pr.y + pr.h;
        player.vy = 0;
      }
    }
  }

  // collide blocks (hit from below)
  for(const b of level.blocks){
    const br = rect(b.x, b.y, 30, 30);
    const pl = rect(player.x, player.y, player.w, player.h);
    if(aabb(pl, br)){
      // landing on top
      if(player.vy > 0 && (pl.y + pl.h - player.vy*dt) <= br.y + 10){
        player.y = br.y - player.h;
        player.vy = 0;
        player.onGround = true;
        player.canDouble = true;
      } else if(player.vy < 0 && (pl.y - player.vy*dt) >= br.y + br.h - 10){
        // hit from below
        player.y = br.y + br.h;
        player.vy = 0;
        bumpBlock(b);
      } else {
        // side push
        if(player.x < br.x) player.x = br.x - player.w;
        else player.x = br.x + br.w;
      }
    }
    if(b.bump>0) b.bump = Math.max(0, b.bump - dt*10);
  }

  // jump
  if(player.jumpBuffered > 0){
    if(player.onGround){
      player.vy = -JUMP;
      player.jumpBuffered = 0;
      SFX.jump();
    } else if(player.canDouble){
      player.vy = -JUMP*0.90;
      player.canDouble = false;
      player.jumpBuffered = 0;
      SFX.jump();
    }
  }

  // enemies
  for(const e of level.enemies){
    e.x += e.dir * e.speed * dt;
    if(e.x < e.baseX - e.range){ e.x = e.baseX - e.range; e.dir = 1; }
    if(e.x > e.baseX + e.range){ e.x = e.baseX + e.range; e.dir = -1; }

    const er = rect(e.x, e.y-18, e.w, e.h);
    const pl = rect(player.x, player.y, player.w, player.h);

    if(aabb(pl, er)){
      if(player.star > 0){
        e.dead = true;
        save.score += 100;
        gainXP(6);
        SFX.coin();
        popText("+100", 0.6);
      } else if(player.vy > 220 && (player.y + player.h - player.vy*dt) <= er.y + 8){
        e.dead = true;
        player.vy = -JUMP*0.65;
        save.score += 200;
        gainXP(10);
        SFX.coin();
        popText("+200", 0.7);
      } else {
        damage();
      }
    }
  }
  level.enemies = level.enemies.filter(e=>!e.dead);

  // coins
  for(const c of level.coins){
    if(c.taken) continue;
    if(aabb(rect(player.x,player.y,player.w,player.h), rect(c.x,c.y,14,14))){
      c.taken = true;
      save.coins += 1;
      save.score += 50;
      gainXP(5);
      SFX.coin();
      popText("+50", 0.6);
      flash = Math.max(flash, 0.08);
      persist();
    }
  }

  // key pickup
  if(level.keyPlaced && level.keyPos && !level.keyPos.taken){
    const k = level.keyPos;
    if(aabb(rect(player.x,player.y,player.w,player.h), rect(k.x,k.y,18,18))){
      k.taken = true;
      player.hasKey = true;
      save.worldKeys[String(level.world)] = true;
      persist();
      popText("🔑 GOT KEY!", 1.1);
      SFX.power();
    }
  }

  // items (powerups)
  for(const it of level.items){
    it.vy += GRAV*dt;
    it.x += it.vx*dt;
    it.y += it.vy*dt;

    // bounce from platforms
    for(const p of level.platforms){
      const pr = rect(p.x,p.y,p.w,p.h);
      const ir = rect(it.x,it.y,it.w,it.h);
      if(aabb(ir, pr)){
        if(it.vy > 0 && (ir.y + ir.h - it.vy*dt) <= pr.y + 8){
          it.y = pr.y - it.h;
          it.vy = -260;
        } else {
          it.vx *= -1;
        }
      }
    }

    // pickup
    if(aabb(rect(player.x,player.y,player.w,player.h), rect(it.x,it.y,it.w,it.h))){
      pickupItem(it.kind);
      it.life = 0;
    }

    it.life -= dt;
  }
  level.items = level.items.filter(it=>it.life>0);

  // particles (boss fire)
  for(const p of level.particles){
    p.life -= dt;
    p.vy += GRAV*0.55*dt;
    p.x += p.vx*dt;
    p.y += p.vy*dt;

    if(p.kind==="fire"){
      // hurt player
      if(aabb(rect(player.x,player.y,player.w,player.h), rect(p.x,p.y,p.w,p.h))){
        damage();
        p.life = 0;
      }
    }
  }
  level.particles = level.particles.filter(p=>p.life>0);

  // checkpoint activation
  if(!level.checkpointActive && player.x >= level.checkpointX){
    activateCheckpoint();
  }

  // boss update
  if(level.boss){
    bossUpdate(dt);
  }

  // fall death
  if(player.y > H + 160){
    damage();
    // respawn even if not dead (handled in damage)
    player.y = level.respawn.y;
  }

  // goal
  const goalRect = rect(level.goalX, 170, 26, 140);
  if(aabb(rect(player.x,player.y,player.w,player.h), goalRect)){
    // if boss level require boss dead
    if(level.boss && level.bossEnt && level.bossEnt.alive){
      popText("DEFEAT BOSS!", 0.8);
    } else {
      winLevel();
      return;
    }
  }

  // camera
  const target = player.x - W*0.35;
  camX += (target - camX) * Math.min(1, dt*6);
  camX = clamp(camX, 0, Math.max(0, level.len - W));

  persist();
}

/* =======================
   Block bump logic
======================= */
function bumpBlock(b){
  b.bump = 1;
  SFX.hit();

  if(b.type==="q"){
    if(b.used) return;
    b.used = true;

    // spawn something
    const r = xorshift32(seedFor(currentSel) + Math.floor(b.x*7 + b.y*11));
    const drop = blockDropForWorld(level.world, r);
    const sx = b.x + 6;
    const sy = b.y - 18;

    if(drop==="coin"){
      // instant coin
      save.coins += 1;
      save.score += 50;
      gainXP(4);
      SFX.coin();
      popText("+50", 0.6);
    } else {
      spawnItem(sx, sy, drop);
      SFX.power();
      popText(drop.toUpperCase(), 0.8);
    }
    persist();
  }

  if(b.type==="brick"){
    // break only if big or star
    if(player.big || player.star>0){
      // break -> particles + score
      b.used = true;
      b.type = "used";
      save.score += 80;
      gainXP(3);
      popText("+80", 0.6);
      SFX.coin();
    } else {
      popText("NEED BIG", 0.6);
    }
  }
}

function pickupItem(kind){
  if(kind==="coin"){
    save.coins += 1;
    save.score += 50;
    gainXP(4);
    SFX.coin();
    popText("+50", 0.6);
  }
  if(kind==="big"){
    player.big = true;
    resizePlayer();
    save.score += 120;
    gainXP(6);
    SFX.power();
    popText("BIG!", 0.8);
  }
  if(kind==="star"){
    player.star = 8.0;
    save.score += 160;
    gainXP(8);
    SFX.power();
    popText("STAR!", 0.8);
  }
  if(kind==="1up"){
    player.lives += 1;
    save.score += 100;
    gainXP(6);
    SFX.power();
    popText("1UP!", 0.8);
  }
  persist();
}

/* =======================
   Restart
======================= */
function restartLevel(){
  SFX.hit();
  flash = Math.max(flash, 0.16);
  loadLevel(currentSel);
  hideOverlay();
}

/* =======================
   Draw
======================= */
function rr(c,x,y,w,h,r,fill){
  c.beginPath();
  c.moveTo(x+r,y);
  c.arcTo(x+w,y,x+w,y+h,r);
  c.arcTo(x+w,y+h,x,y+h,r);
  c.arcTo(x,y+h,x,y,r);
  c.arcTo(x,y,x+w,y,r);
  c.closePath();
  if(fill) c.fill();
}

function vibeColor(v){
  if(v==="soft") return "#ff78d2";
  if(v==="street") return "#2cff8a";
  if(v==="pro") return "#cfe8ff";
  return "#3b4fff";
}

function draw(dt){
  ctx.clearRect(0,0,W,H);
  if(!level){
    // still draw avatar mini
    drawAvatarMini();
    return;
  }

  drawBackground(level.theme);

  // parallax clouds
  drawCloud(220 - camX*0.15, 66);
  drawCloud(610 - camX*0.10, 42);
  drawCloud(920 - camX*0.12, 82);

  // platforms
  for(const p of level.platforms){
    drawPlatform(level.theme, p.x-camX, p.y, p.w, p.h);
  }

  // checkpoint flag
  drawCheckpoint(level.checkpointX - camX, 170, level.checkpointActive);

  // blocks
  for(const b of level.blocks){
    drawBlock(b.x - camX, b.y - (b.bump*6), b);
  }

  // coins
  for(const c of level.coins){
    if(!c.taken) drawCoin(c.x - camX, c.y);
  }

  // key
  if(level.keyPlaced && level.keyPos && !level.keyPos.taken){
    drawKey(level.keyPos.x - camX, level.keyPos.y);
  }

  // items
  for(const it of level.items){
    drawItem(it.x - camX, it.y, it.kind);
  }

  // enemies
  for(const e of level.enemies){
    drawEnemy(e.x - camX, e.y, level.theme);
  }

  // boss
  if(level.boss && level.bossEnt){
    drawBoss(level.bossEnt.x - camX, level.bossEnt.y, level.bossEnt);
  }

  // boss particles
  for(const p of level.particles){
    drawParticle(p.x - camX, p.y, p);
  }

  // goal
  drawGoal(level.goalX - camX, 170);

  // player
  drawPlayer(Math.floor(player.x - camX), Math.floor(player.y));

  // pop messages
  for(const m of popMsgs){
    m.t -= dt;
    m.y -= 26*dt;
    drawTextCenter(m.text, W/2, m.y, 18);
  }
  popMsgs = popMsgs.filter(m=>m.t>0);

  // flash
  if(flash > 0){
    flash = Math.max(0, flash - dt*0.8);
    ctx.fillStyle = `rgba(255,255,255,${flash})`;
    ctx.fillRect(0,0,W,H);
  }

  renderHUD();
  drawAvatarMini();
}

function drawTextCenter(text,x,y,size=16){
  ctx.save();
  ctx.font = `900 ${size}px ui-monospace, monospace`;
  ctx.textAlign="center";
  ctx.textBaseline="middle";
  ctx.fillStyle="rgba(0,0,0,.45)";
  ctx.fillText(text,x+2,y+2);
  ctx.fillStyle="#eaf0ff";
  ctx.fillText(text,x,y);
  ctx.restore();
}

function drawBackground(theme){
  // solid but with subtle pattern using avatar accent
  ctx.fillStyle = "#0f1428";
  ctx.fillRect(0,0,W,H);

  ctx.save();
  ctx.globalAlpha = 0.12;
  ctx.fillStyle = vibeColor(avatar.vibe);
  for(let i=0;i<20;i++){
    const bx = (i*110 - (camX*0.12)%110);
    rr(ctx, bx, 40 + (i%3)*22, 90, 30, 10, true);
  }
  ctx.restore();

  // horizon
  ctx.fillStyle = "#0b1020";
  ctx.fillRect(0,300,W,60);
}

function drawCloud(x,y){
  ctx.save();
  ctx.globalAlpha=0.6;
  ctx.fillStyle="#cfe8ff";
  rr(ctx,x,y,120,40,18,true);
  rr(ctx,x+20,y-18,56,34,18,true);
  rr(ctx,x+62,y-14,64,38,18,true);
  ctx.restore();
}

function drawPlatform(theme,x,y,w,h){
  ctx.save();
  ctx.fillStyle="#0b1020";
  ctx.fillRect(x,y,w,h);

  let top="#2cff8a";
  if(theme==="Cave") top="#cfe8ff";
  if(theme==="Forest") top="#2cff8a";
  if(theme==="City") top="#00e0ff";
  if(theme==="Ice") top="#cfe8ff";
  if(theme==="Lava") top="#ff6b00";

  ctx.fillStyle=top;
  ctx.fillRect(x,y,w,10);

  ctx.globalAlpha=.30;
  ctx.fillStyle="#eaf0ff";
  for(let i=0;i<w;i+=24) ctx.fillRect(x+i,y,2,h);
  for(let j=0;j<h;j+=24) ctx.fillRect(x,y+j,w,2);
  ctx.globalAlpha=1;

  ctx.strokeStyle="#2a3cff";
  ctx.lineWidth=2;
  ctx.strokeRect(x+1,y+1,w-2,h-2);
  ctx.restore();
}

function drawBlock(x,y,b){
  const used = b.used || b.type==="used";
  const isQ = b.type==="q";
  const isBrick = b.type==="brick";

  ctx.save();
  const w=30,h=30;

  if(used){
    ctx.fillStyle="#11162a";
    ctx.fillRect(x,y,w,h);
    ctx.strokeStyle="#3b4fff";
    ctx.lineWidth=2;
    ctx.strokeRect(x+1,y+1,w-2,h-2);
  } else if(isQ){
    ctx.fillStyle="#ffcc00";
    rr(ctx,x,y,w,h,6,true);
    ctx.fillStyle="#0b1020";
    drawTextCenter("?", x+w/2, y+h/2+1, 18);
  } else if(isBrick){
    ctx.fillStyle="#cfe8ff";
    rr(ctx,x,y,w,h,6,true);
    ctx.globalAlpha=.25;
    ctx.fillStyle="#0b1020";
    for(let i=0;i<w;i+=10) ctx.fillRect(x+i,y,2,h);
    for(let j=0;j<h;j+=10) ctx.fillRect(x,y+j,w,2);
    ctx.globalAlpha=1;
  }

  ctx.restore();
}

function drawCoin(x,y){
  ctx.save();
  const t = performance.now()*0.004;
  const bob = Math.sin(t + x*0.01)*3;
  ctx.translate(x, y + bob);
  ctx.fillStyle="#ffcc00";
  rr(ctx,-2,-2,18,18,6,true);
  ctx.fillStyle="rgba(0,0,0,.25)";
  rr(ctx,4,4,6,10,3,true);
  ctx.restore();
}

function drawKey(x,y){
  ctx.save();
  const t = performance.now()*0.004;
  const bob = Math.sin(t + x*0.01)*3;
  ctx.translate(x, y + bob);
  ctx.fillStyle="#b36bff";
  rr(ctx,0,0,16,10,5,true);
  ctx.fillRect(10,4,14,3);
  ctx.fillRect(20,3,3,5);
  ctx.fillStyle="#0b1020";
  rr(ctx,3,3,6,4,2,true);
  ctx.restore();
}

function drawItem(x,y,kind){
  ctx.save();
  ctx.translate(x,y);
  if(kind==="big"){
    ctx.fillStyle="#2cff8a";
    rr(ctx,0,0,18,18,6,true);
    ctx.fillStyle="#0b1020";
    drawTextCenter("🍄", 9, 10, 14);
  } else if(kind==="star"){
    ctx.fillStyle="#ffcc00";
    rr(ctx,0,0,18,18,6,true);
    ctx.fillStyle="#0b1020";
    drawTextCenter("⭐", 9, 10, 14);
  } else if(kind==="1up"){
    ctx.fillStyle="#00e0ff";
    rr(ctx,0,0,18,18,6,true);
    ctx.fillStyle="#0b1020";
    drawTextCenter("1", 9, 10, 14);
  } else {
    ctx.fillStyle="#ffcc00";
    rr(ctx,0,0,18,18,6,true);
  }
  ctx.restore();
}

function drawEnemy(x,y,theme){
  ctx.save();
  ctx.translate(x,y);
  ctx.fillStyle = theme==="Lava" ? "#ff6b00" : "#ff3b6b";
  rr(ctx,0,-18,26,18,6,true);
  ctx.fillStyle="#0b1020";
  ctx.fillRect(6,-14,5,6);
  ctx.fillRect(15,-14,5,6);
  ctx.fillStyle="#eaf0ff";
  ctx.fillRect(8,-12,2,3);
  ctx.fillRect(17,-12,2,3);
  ctx.restore();
}

function drawBoss(x,y,b){
  ctx.save();
  ctx.translate(x,y);
  // blink if invuln
  if(b.inv>0 && Math.floor(performance.now()/80)%2===0){
    ctx.globalAlpha=0.4;
  }
  ctx.fillStyle="#ff6b00";
  rr(ctx,0,0,b.w,b.h,10,true);
  ctx.fillStyle="#0b1020";
  ctx.fillRect(10,12,12,8);
  ctx.fillRect(40,12,12,8);
  ctx.fillStyle="#eaf0ff";
  ctx.fillRect(14,14,4,4);
  ctx.fillRect(44,14,4,4);

  // hp bar
  ctx.globalAlpha=1;
  ctx.fillStyle="#0b1020";
  rr(ctx,0,-14,b.w,10,6,true);
  ctx.fillStyle="#ff3b6b";
  const hpMax = 5;
  rr(ctx,2,-12, (b.w-4)*clamp(b.hp/hpMax,0,1), 6, 4, true);
  ctx.restore();
}

function drawParticle(x,y,p){
  ctx.save();
  ctx.translate(x,y);
  if(p.kind==="fire"){
    ctx.fillStyle="#ff3b6b";
    rr(ctx,0,0,p.w,p.h,4,true);
    ctx.fillStyle="#ffcc00";
    rr(ctx,3,3,p.w-6,p.h-6,3,true);
  }
  ctx.restore();
}

function drawCheckpoint(x,y,active){
  ctx.save();
  // pole
  ctx.strokeStyle="#cfe8ff";
  ctx.lineWidth=4;
  ctx.beginPath();
  ctx.moveTo(x+10,170);
  ctx.lineTo(x+10,320);
  ctx.stroke();
  // flag
  ctx.fillStyle = active ? "#2cff8a" : "#00e0ff";
  ctx.fillRect(x+10,190,44,22);
  ctx.fillStyle="#0b1020";
  ctx.fillRect(x+18,196,14,10);
  ctx.restore();
}

function drawGoal(x,y){
  ctx.save();
  ctx.strokeStyle="#eaf0ff";
  ctx.lineWidth=4;
  ctx.beginPath();
  ctx.moveTo(x+14,170);
  ctx.lineTo(x+14,320);
  ctx.stroke();
  ctx.fillStyle="#eaf0ff";
  ctx.fillRect(x+14,190,56,28);
  ctx.fillStyle=avatar.colAccent || "#00e0ff";
  ctx.fillRect(x+22,196,20,16);
  ctx.restore();
}

function drawPlayer(x,y){
  // blink if invuln
  if(player.invuln>0 && Math.floor(performance.now()/90)%2===0) return;

  const skin = avatar.colSkin;
  const outfit = avatar.colOutfit;
  const hair = avatar.colHair;

  // star glow
  if(player.star>0){
    ctx.save();
    ctx.globalAlpha=0.25;
    ctx.fillStyle="#ffcc00";
    rr(ctx, x-10, y-10, player.w+20, player.h+20, 14, true);
    ctx.restore();
  }

  // body
  ctx.save();
  ctx.fillStyle=outfit;
  rr(ctx, x, y+10, player.w, player.h-14, 6, true);

  // head
  ctx.fillStyle=skin;
  rr(ctx, x+4, y, player.w-8, 14, 6, true);

  // hair
  ctx.fillStyle=hair;
  if(avatar.hair==="short") rr(ctx,x+5,y-1,player.w-10,6,4,true);
  if(avatar.hair==="bob") rr(ctx,x+4,y-1,player.w-8,8,4,true);
  if(avatar.hair==="curly"){ rr(ctx,x+4,y-1,player.w-8,7,4,true); ctx.fillRect(x+4,y+6,3,3); ctx.fillRect(x+player.w-7,y+6,3,3); }
  if(avatar.hair==="bun"){ rr(ctx,x+5,y-1,player.w-10,6,4,true); rr(ctx,x+player.w-12,y-7,8,8,4,true); }
  if(avatar.hair==="spiky"){ rr(ctx,x+4,y-2,player.w-8,7,4,true); ctx.fillRect(x+6,y-6,4,6); ctx.fillRect(x+player.w-10,y-6,4,6); }

  // eyes
  ctx.fillStyle="#0b1020";
  const eyeY = (avatar.eyes==="happy") ? 7 : 6;
  const eyeH = (avatar.eyes==="happy") ? 1 : (avatar.eyes==="focus" ? 3 : 2);
  ctx.fillRect(x+9,y+eyeY,2,eyeH);
  ctx.fillRect(x+player.w-11,y+eyeY,2,eyeH);

  // accessories
  if(avatar.acc==="cap"){
    ctx.fillStyle="#0b1020";
    rr(ctx, x+2, y-2, player.w-4, 6, 4, true);
  }
  if(avatar.acc==="glasses"){
    ctx.strokeStyle="#0b1020";
    ctx.lineWidth=2;
    ctx.strokeRect(x+7,y+5,5,4);
    ctx.strokeRect(x+player.w-12,y+5,5,4);
  }
  if(avatar.acc==="headphones"){
    ctx.strokeStyle="#0b1020";
    ctx.lineWidth=3;
    ctx.beginPath();
    ctx.arc(x+player.w/2,y+7,11,Math.PI,0);
    ctx.stroke();
  }
  if(avatar.acc==="mask"){
    ctx.fillStyle="rgba(0,0,0,.35)";
    rr(ctx, x+7, y+9, player.w-14, 5, 3, true);
  }
  if(avatar.acc==="cape"){
    ctx.save();
    ctx.globalAlpha=0.35;
    ctx.fillStyle=avatar.colAccent;
    rr(ctx, x-10, y+12, 12, player.h-10, 8, true);
    ctx.restore();
  }

  // outline
  ctx.strokeStyle="#2a3cff";
  ctx.lineWidth=2;
  ctx.strokeRect(x+1,y+1,player.w-2,player.h-2);

  ctx.restore();
}

/* =======================
   Avatar draw helpers for preview/mini
======================= */
function drawAvatarOn(c, w, h, a, scale){
  c.clearRect(0,0,w,h);
  c.fillStyle="#0b1020";
  c.fillRect(0,0,w,h);
  c.fillStyle=vibeColor(a.vibe);
  c.globalAlpha=0.18;
  rr(c, 30, 40, w-60, 80, 18, true);
  c.globalAlpha=1;

  const pw = 26, ph = 30;
  const big = false;
  const px = Math.floor(w/2 - (pw*scale)/2);
  const py = 150;

  // head
  c.fillStyle=a.colSkin;
  rr(c, px+4*scale, py, (pw-8)*scale, 14*scale, 6*scale, true);
  // hair
  c.fillStyle=a.colHair;
  rr(c, px+5*scale, py-1*scale, (pw-10)*scale, 6*scale, 4*scale, true);
  // body
  c.fillStyle=a.colOutfit;
  rr(c, px, py+10*scale, pw*scale, (ph-14)*scale, 6*scale, true);
  // eyes
  c.fillStyle="#0b1020";
  c.fillRect(px+9*scale, py+6*scale, 2*scale, 2*scale);
  c.fillRect(px+(pw-11)*scale, py+6*scale, 2*scale, 2*scale);

  c.save();
  c.font = `900 ${16}px ui-monospace, monospace`;
  c.textAlign="center";
  c.fillStyle="#eaf0ff";
  c.fillText(a.name || "Player", w/2, 28);
  c.restore();
}

function drawAvatarPreview(){
  drawAvatarOn(prevX, prevC.width, prevC.height, avatar, 6);
}
function drawAvatarMini(){
  drawAvatarOn(miniX, miniC.width, miniC.height, avatar, 4);
}

/* =======================
   HUD / Side UI
======================= */
function renderHUD(){
  if(!level) return;

  // world/level text
  const world = level.world;
  const theme = level.theme;

  $("#hudWorld").textContent = (currentSel.type==="main") ? labelMain(currentSel.id) : `S${currentSel.id}`;
  $("#hudLevel").textContent = (currentSel.type==="main") ? pad2(currentSel.id) : `S${currentSel.id}`;
  $("#hudTheme").textContent = theme;

  // speedrun
  $("#hudRunTime").textContent = `${runTime.toFixed(2)}s`;
  $("#sideRunTime").textContent = `${runTime.toFixed(2)}s`;
  $("#sideDeaths").textContent = runDeaths;

  const bt = save.bestTimes[bestTimeKey()];
  $("#hudBestTime").textContent = (typeof bt==="number") ? `${bt.toFixed(2)}s` : "—";
  $("#sideBestTime").textContent = (typeof bt==="number") ? `${bt.toFixed(2)}s` : "—";

  $("#hudLives").textContent = player.lives;
  $("#hudCoins").textContent = save.coins;
  $("#hudPLvl").textContent = save.playerLevel;
  $("#hudXP").textContent = save.xp;

  $("#hudOutfit").textContent = avatar.outfit;
  $("#hudState").textContent = player.star>0 ? "STAR" : (player.big ? "BIG":"SMALL");
  $("#hudPower").textContent = player.star>0 ? "⭐" : (player.big ? "🍄":"—");
  $("#hudKey").textContent = (save.worldKeys[String(level.world)] ? "YES" : "NO");

  // side progress
  $("#sideUnlocked").textContent = save.bestLevel;
  $("#sideDone").textContent = Object.keys(save.done).length;
  $("#sideSecrets").textContent = Object.keys(save.secretDone).length;
  $("#sideSelected").textContent = (selected.type==="main") ? selected.id : `S${selected.id}`;

  // home
  $("#homeBest").textContent = save.bestLevel;
  $("#homeCoins").textContent = save.coins;
  $("#homePLvl").textContent = save.playerLevel;
  $("#homeXP").textContent = save.xp;
  $("#homeSecrets").textContent = Object.keys(save.secretDone).length;
}

/* =======================
   Render all UI
======================= */
function renderAllUI(){
  renderWorldTabs();
  renderMapNodes();
  renderLevelGrid();
  renderMapSelectedInfo();
  renderHUD();
}

/* =======================
   Boot
======================= */
$("#btnSound").textContent = `SOUND: ${settings.sound ? "ON":"OFF"}`;
updateFullscreenBtn();
renderAllUI();
drawAvatarMini();
drawAvatarPreview();
showOverlay("home");

// ensure selection valid
if(selected.type==="main"){
  selected.id = clamp(selected.id,1,LEVELS);
  if(!isUnlockedMain(selected.id)) selected.id = save.bestLevel;
} else {
  selected.id = clamp(selected.id,1,WORLDS);
  if(!isSecretUnlocked(selected.id)) selected = {type:"main", id: save.bestLevel};
}
setSelected(selected);

// load initial level lazily when play
loadLevel(save.selected || {type:"main", id:1});
persist();