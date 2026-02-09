function scrollToId(id){
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* nav smooth + active */
const navLinks = [...document.querySelectorAll("#navLinks a")];
navLinks.forEach(a=>{
  a.addEventListener("click",(e)=>{
    e.preventDefault();
    const id = a.getAttribute("href").slice(1);
    scrollToId(id);
  });
});
document.querySelectorAll("[data-scroll]").forEach(btn=>{
  btn.addEventListener("click",()=> scrollToId(btn.dataset.scroll));
});
const sections = navLinks.map(a => document.querySelector(a.getAttribute("href")));
const io = new IntersectionObserver((entries)=>{
  entries.forEach(en=>{
    if(en.isIntersecting){
      const hash = "#"+en.target.id;
      navLinks.forEach(a=> a.classList.toggle("active", a.getAttribute("href")===hash));
    }
  });
},{ threshold:.45 });
sections.forEach(s=> s && io.observe(s));

/* ===== DATA ===== */
const DATA = {
  projects: [
    {
      title:"Proyecto de Sistemas de Turnos CRUD ",
      desc:"Caso práctico: gestion de turnos para un negocio local (peluquería).",
      img:"sistema-de-turnos-de-trabajo.jpg",
      live:"https://github.com/lorenamp25/PROYECTO-SISTEMA-TURNOS",
      details:"Incluye MYSQL/PHP/HTML/CSS/Typescript(angular)/JavaScript y rutas. "
    },
    {
      title:"Proyecto Carniceria CRUD",
      desc:"Donde se muestra el proceso de diseño de una web para carnicería local, con enfoque en experiencia de usuario y jerarquía visual.",
      img:"meat.avif",
      live:"https://github.com/lorenamp25/PROYECTO-CARNICERIA",
      details:"Incluye MYSQL/PHP/XML/JSON/HTML/CSS. Enfoque en jerarquía visual y experiencia de usuario."
    },
    {
      title:"TFG FINAL GRADO ",
      desc:" APP de recetas de cocina donde poder subir y compartir tus propias recetas.",
      img:"ordenador.avif",
      live:"https://github.com/lorenamp25/TFG_DAW",
      details:"Proyecto final de grado superior de Desarrollo de aplicaciones web. Con todo lo visto en el grado y usando api/rest, con diseño responsive y mobile first."
    },
  ],
 certs: [
  { 
    title:"Google UX Design", 
    desc:"Foundations of User Experience (UX) Design, ideación, prototipado y testeo.",
    pdf:"Coursera1.pdf",
    img:"1.jpg"
  },
  { 
    title:"Blender (curso completo)", 
    desc:"Diseño grafico 3D, modelado, texturizado, animación y renderizado con Blender.",
    pdf:"certificate.pdf",
    img:"blender.jpg"
  },
  { 
    title:"Google UX Design", 
    desc:"Design a User Experience for Social Good & Prepare for Jobs in UX Design",
    pdf:"Coursera5.pdf",
    img:"2.jpg"
  },
  { 
    title:"Google UX Design", 
    desc:"Accelerate Your Job Search with AI",
    pdf:"Coursera3.pdf",
    img:"3.jpg"
  },
  { 
    title:"Google UX Design", 
    desc:"Build Dynamic User Interfaces (UI) for Websites and Apps",
    pdf:"Coursera2.pdf",
    img:"5.jpg"
  }
  
],


  tech: [
    { name: "HTML", key: "html" }, { name: "CSS", key: "css" }, { name: "JavaScript", key: "js" }, { name: "ReactJS", key: "react" }, { name: "PHP", key: "php" }, { name: "MySQL", key: "mysql" }, { name: "Figma", key: "figma" }, { name: "GitHub", key: "github" }, { name: "Docker Desktop", key: "docker" }, { name: "Angular", key: "angular" }, { name: "TypeScript", key: "ts" }, { name: "Visual Studio", key: "vs" }, { name: "Blender", key: "blender" }, { name: "Photoshop", key: "ps" }, { name: "XML", key: "xml" }, { name: "JSON", key: "json" },{ name: "Canva", key: "canva" },{ name: "WordPress", key: "wp" }
  ]
};

document.getElementById("statProjects").textContent = DATA.projects.length;
document.getElementById("statCerts").textContent = DATA.certs.length;

/* ===== tabs render ===== */
const tabs = [...document.querySelectorAll(".tab")];
const content = document.getElementById("portfolioContent");

const LOGOS = { html: `<svg viewBox="0 0 24 24"><path d="M4 3h16l-2 18-6 2-6-2L4 3Z" fill="#ff6a00"/></svg>`, 
  css: `<svg viewBox="0 0 24 24"><path d="M4 3h16l-2 18-6 2-6-2L4 3Z" fill="#1e90ff"/></svg>`, 
  js: `<svg viewBox="0 0 24 24"><path d="M3 3h18v18H3V3Z" fill="#ffd400"/></svg>`, 
  react: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2" fill="#22d3ee"/></svg>`, 
  php: `<svg viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="10" ry="6" fill="#777bb3"/></svg>`, 
  mysql: `<svg viewBox="0 0 24 24"><path d="M4 18c4-12 12-12 16 0" stroke="#00618a" fill="none"/></svg>`, 
  figma: `<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="3" fill="#f24e1e"/></svg>`, 
  github: `<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-3 19c.5.1.7-.2.7-.5v-2c-3 .7-3.6-1.5-3.6-1.5-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.6 2.4 1.1 3 .8.1-.7.4-1.1.7-1.4-2.4-.3-5-1.2-5-5.4 0-1.2.4-2.2 1-3-.1-.3-.4-1.4.1-3 0 0 .8-.3 2.7 1a9 9 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.6.2 2.7.1 3 .6.8 1 1.8 1 3 0 4.2-2.6 5-5 5.3.4.3.8 1 .8 2v3c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" fill="#fff"/></svg>`, docker: `<svg viewBox="0 0 24 24"><rect x="3" y="10" width="18" height="8" fill="#0db7ed"/></svg>`, 
  angular: `<svg viewBox="0 0 24 24"><path d="M12 2l10 4-4 14-6 3-6-3L2 6l10-4Z" fill="#dd0031"/></svg>`, 
  ts: `<svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#3178c6"/><text x="6" y="17" fill="#fff" font-size="10">TS</text></svg>`, 
  vs: `<svg viewBox="0 0 24 24"><path d="M4 4l8 8-8 8V4Zm8 0l8 8-8 8V4Z" fill="#5c2d91"/></svg>`, 
  blender: `<svg viewBox="0 0 24 24"><circle cx="12" cy="14" r="4" fill="#f5792a"/></svg>`, 
  ps: `<svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#001e36"/></svg>`, 
  xml: `<svg viewBox="0 0 24 24"><text x="4" y="16" font-size="10" fill="#fff">&lt;XML&gt;</text></svg>`, 
  json: `<svg viewBox="0 0 24 24"><text x="4" y="16" font-size="10" fill="#fff">{JSON}</text></svg>`, 
  default: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#fff" opacity=".3"/></svg>`,
canva: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#00c4cc"/></svg>`, 
wp: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#21759b"/></svg>`, }; function logoSvg(key) { return LOGOS[key] || LOGOS.default; }

function renderProjects(){
  const grid = document.createElement("div");
  grid.className = "projGrid";
  DATA.projects.forEach(p=>{
    const el = document.createElement("div");
    el.className = "proj";
    el.innerHTML = `
      <div class="shot"><img src="${p.img}" alt="${p.title}"></div>
      <div class="projBody"><h4>${p.title}</h4><p>${p.desc}</p></div>
      <div class="projFooter">
        <a class="link" href="${p.live}" target="_blank" rel="noopener">CODIGO↗</a>
        <button class="detailsBtn">DETAILS →</button>
      </div>
    `;
    el.querySelector(".detailsBtn").addEventListener("click", ()=> openModal(p.title, p.details));
    grid.appendChild(el);
  });
  content.innerHTML = "";
  content.appendChild(grid);
}

function renderCerts(){
  const grid = document.createElement("div");
  grid.className = "projGrid";

  DATA.certs.forEach(c=>{
    const el = document.createElement("div");
    el.className = "proj";

    el.innerHTML = `
      <div class="shot">
        <img src="${c.img}" alt="${c.title}">
      </div>

      <div class="projBody">
        <h4>${c.title}</h4>
        <p>${c.desc}</p>
      </div>

      <div class="projFooter">
        <a class="link" href="${c.pdf}" target="_blank" rel="noopener">VER PDF ↗</a>
        <button class="detailsBtn">DETAILS →</button>
      </div>
    `;

    el.querySelector(".detailsBtn")
      .addEventListener("click", ()=> openModal(c.title, c.desc));

    grid.appendChild(el);
  });

  content.innerHTML = "";
  content.appendChild(grid);
}


function renderTech(){
  const grid = document.createElement("div");
  grid.className = "techGrid";
  DATA.tech.forEach(t=>{
    const el = document.createElement("div");
    el.className = "tech";
    el.innerHTML = `<div class="logo">${logoSvg(t.key)}</div><b>${t.name}</b>`;
    grid.appendChild(el);
  });
  content.innerHTML = "";
  content.appendChild(grid);
}

function setTab(name){
  tabs.forEach(t=> t.classList.toggle("active", t.dataset.tab===name));
  if(name==="projects") renderProjects();
  if(name==="certs") renderCerts();
  if(name==="stack") renderTech();
}
tabs.forEach(t=> t.addEventListener("click", ()=> setTab(t.dataset.tab)));
setTab("projects");

/* ===== modal ===== */
const overlay = document.getElementById("overlay");
const mTitle = document.getElementById("mTitle");
const mBody  = document.getElementById("mBody");
document.getElementById("close").addEventListener("click", ()=> overlay.style.display="none");
overlay.addEventListener("click",(e)=>{ if(e.target===overlay) overlay.style.display="none"; });
document.addEventListener("keydown",(e)=>{ if(e.key==="Escape") overlay.style.display="none"; });
function openModal(title, text){
  mTitle.textContent = title;
  mBody.textContent = text;
  overlay.style.display = "flex";
}

/* ===== toast + copy ===== */
const toast = document.getElementById("toast");
function showToast(msg="Copied ✓"){
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(()=> toast.classList.remove("show"), 1200);
}
async function copyText(text){
  try{
    await navigator.clipboard.writeText(text);
    showToast("Copied ✓");
  }catch{
    const t = document.createElement("textarea");
    t.value = text;
    document.body.appendChild(t);
    t.select();
    document.execCommand("copy");
    t.remove();
    showToast("Copied ✓");
  }
}

/* Dock: click abre + copia (doble acción, original) */
document.querySelectorAll(".dockItem").forEach(btn=>{
  btn.addEventListener("click", async ()=>{
    const toCopy = btn.getAttribute("data-copy") || "";
    const toOpen = btn.getAttribute("data-open") || "";
    if(toCopy) await copyText(toCopy);
    if(toOpen){
      // abre después de copiar (queda “wow”)
      setTimeout(()=> window.open(toOpen, "_blank", "noopener"), 120);
    }
  });
});

/* Quick message templates */
const templates = {
  recruiter:
`Hola, soy Lorena Martín Piñero 👋
Perfil junior (DAW + Google UX + Blender). Me interesa Front-end / UX/UI.
¿Te puedo pasar mi CV y portfolio por aquí? Gracias 🙂`,
  studio:
`Hola! Soy Lorena 👋
Me gusta crear interfaces modernas y limpias (Front-end + UX/UI) y estoy buscando mi primera oportunidad.
¿Puedo enviarte portfolio y CV?`,
  network:
`Hola! Soy Lorena 😊
Estoy ampliando red en el sector (Front-end / UX/UI). Si te apetece, conectamos y te enseño mi portfolio.`
};

const quickText = document.getElementById("quickText");
const chips = [...document.querySelectorAll(".chip")];
function setTemplate(key){
  chips.forEach(c=> c.classList.toggle("active", c.dataset.template===key));
  quickText.value = templates[key] || templates.recruiter;
  // mailto con el texto
  const subject = encodeURIComponent("Portfolio + CV · Lorena Martín Piñero");
  const body = encodeURIComponent(quickText.value);
  document.getElementById("openMailBtn").href = `mailto:lorena@email.com?subject=${subject}&body=${body}`;
}
chips.forEach(c=> c.addEventListener("click", ()=> setTemplate(c.dataset.template)));
setTemplate("recruiter");

document.getElementById("copyMsgBtn").addEventListener("click", ()=> copyText(quickText.value));

/* CV demo */
document.getElementById("downloadCvBtn").addEventListener("click", ()=>{
  // cambia esto a tu archivo real si quieres: window.open("cv.pdf","_blank");
  window.open("cv.pdf", "_blank", "noopener");
});

/* year */
document.getElementById("year").textContent = new Date().getFullYear();
// BOTÓN DESCARGAR CV
 document.getElementById("downloadCvBtn").addEventListener("click", () => { window.open("C.V. Lorena Martin (1).pdf", "_blank"); }); // BOTÓN SCROLL A PORTFOLIO
  document.querySelectorAll("[data-scroll]").forEach(btn => { btn.addEventListener("click", () => { const section = document.getElementById(btn.dataset.scroll); if (section) { section.scrollIntoView({ behavior: "smooth" }); } }); });