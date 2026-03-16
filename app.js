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
      title: "Proyecto de Sistemas de Turnos CRUD",
      desc: "Caso práctico: gestión de turnos para un negocio local (peluquería).",
      img: "images/projects/sistema-de-turnos-de-trabajo.jpg",
      code: "https://github.com/lorenamp25/PROYECTO-SISTEMA-TURNOS",
      group: "Full Stack / PHP",
      tags: ["PHP", "MySQL", "HTML", "CSS", "JavaScript"]
    },
    {
        title: "Proyecto Carnicería CRUD",
      desc: "Diseño de una web para carnicería local, con enfoque en experiencia de usuario y jerarquía visual.",
      img: "images/projects/meat.avif",
      code: "https://github.com/lorenamp25/PROYECTO-CARNICERIA",
      group: "Full Stack / PHP",
      tags: ["PHP", "MySQL", "XML", "JSON", "HTML", "CSS"]
    },
    {
    title: "TFG Final Grado",
      desc: "App de recetas de cocina donde poder subir y compartir tus propias recetas.",
      img: "images/projects/ordenador.avif",
      code: "https://github.com/lorenamp25/TFG_DAW",
      group: "Full Stack / PHP",
      tags: ["API REST", "Responsive", "HTML", "CSS", "JavaScript"]
    },
   
  
    {
      title: "Streambox Angular",
      desc: "Aplicación de streaming desarrollada con Angular y desplegada en Vercel.",
      img: "images/projects/streambox-angular.png",
      live: "https://streambox-angular.vercel.app/",
      code: "https://github.com/lorenamp25/Streambox-Angular.git",
      group: "Angular",
      tags: ["Angular", "TypeScript", "HTML", "CSS"]
    },
    {
      title: "Hospital Management Angular",
      desc: "Aplicación hospitalaria en Angular para gestionar pacientes, doctores y citas.",
      img: "images/projects/hospital-app.png",
      live: "https://hospital-management-angular-six.vercel.app/",
      code: "https://github.com/lorenamp25/hospital-management-angular.git",
      group: "Angular",
      tags: ["Angular", "TypeScript", "HTML", "CSS"]
    },
    {
      title: "React Blog",
      desc: "Blog desarrollado con React y desplegado en Vercel.",
      img: "images/projects/react-blog.png",
      live: "https://react-blog-eta-henna.vercel.app/",
      code: "https://github.com/lorenamp25/react-blog.git",
      group: "React",
      tags: ["React", "JavaScript", "HTML", "CSS"]
    },
    {
      title: "React Carrito Compra",
      desc: "Aplicación de carrito de compra desarrollada con React.",
      img: "images/projects/react-carrito-compra.png",
      live: "https://react-carrito-compra.vercel.app/",
      code: "https://github.com/lorenamp25/react-carrito-compra.git",
      group: "React",
      tags: ["React", "JavaScript", "HTML", "CSS"]
    },
    {
      title: "React App Música",
      desc: "Aplicación musical desarrollada con React.",
      img: "images/projects/react-app-musica.png",
      live: "https://react-app-musica.vercel.app/",
      code: "https://github.com/lorenamp25/react-app-musica.git",
      group: "React",
      tags: ["React", "JavaScript", "HTML", "CSS"]
    },
    {
      title: "React App Red Social",
      desc: "Aplicación tipo red social desarrollada con React y desplegada en Vercel.",
      img: "images/projects/react-app-red-social.png",
      live: "https://react-app-red-social.vercel.app/",
      code: "https://github.com/lorenamp25/react-app-red-social.git",
      group: "React",
      tags: ["React", "JavaScript", "HTML", "CSS"]
    },
    {
      title: "Mario Bros JS",
      desc: "Juego inspirado en Mario Bros desarrollado en JavaScript y desplegado en Vercel.",
      img: "images/projects/mario-bros-js.png",
      live: "https://mario-bros-js2.vercel.app/",
      code: "https://github.com/lorenamp25/mario-bros-js.git",
      group: "JavaScript",
      tags: ["JavaScript", "HTML", "CSS", "Canvas"]
    },
    {
      title: "Bite Bazar JS",
      desc: "Proyecto web en JavaScript desplegado en Vercel.",
      img: "images/projects/bite-bazar-js.png",
      live: "https://bite-bazar-js.vercel.app/",
      code: "https://github.com/lorenamp25/bite-bazar-js.git",
      group: "JavaScript",
      tags: ["JavaScript", "HTML", "CSS", "Responsive"]
    }
  ],
 certs: [
  { 
    title:"Google UX Design", 
    desc:"Foundations of User Experience (UX) Design, ideación, prototipado y testeo.",
    pdf:"Coursera1.pdf",
    img:"images/certs/1.jpg"
  },
  { 
    title:"Blender (curso completo)", 
    desc:"Diseño grafico 3D, modelado, texturizado, animación y renderizado con Blender.",
    pdf:"certificate.pdf",
    img:"images/certs/blender.jpg"
  },
  { 
    title:"Google UX Design", 
    desc:"Design a User Experience for Social Good & Prepare for Jobs in UX Design",
    pdf:"Coursera5.pdf",
    img:"images/certs/2.jpg"
  },
  { 
    title:"Google UX Design", 
    desc:"Accelerate Your Job Search with AI",
    pdf:"Coursera3.pdf",
    img:"images/certs/3.jpg"
  },
  { 
    title:"Google UX Design", 
    desc:"Build Dynamic User Interfaces (UI) for Websites and Apps",
    pdf:"Coursera2.pdf",
    img:"images/certs/5.jpg"
  },
  { 
    title:"Curso IA", 
    desc:"Conduct UX Research and Test Early Concepts",
    pdf:"images/certs/ia.pdf",
    img:"images/certs/certificado-ia.png"
  }
  
],


  tech: [
    { name: "HTML", key: "html", group: "Frontend" },
    { name: "CSS", key: "css", group: "Frontend" },
    { name: "JavaScript", key: "js", group: "Frontend" },
    { name: "ReactJS", key: "react", group: "Frontend" },
    { name: "Angular", key: "angular", group: "Frontend" },
    { name: "TypeScript", key: "ts", group: "Frontend" },

    { name: "PHP", key: "php", group: "Backend" },
    { name: "MySQL", key: "mysql", group: "Database" },

    { name: "Figma", key: "figma", group: "Design" },
    { name: "Blender", key: "blender", group: "Design" },
    { name: "Photoshop", key: "ps", group: "Design" },
    { name: "Canva", key: "canva", group: "Design" },

    { name: "GitHub", key: "github", group: "Tools" },
    { name: "Docker Desktop", key: "docker", group: "Tools" },
    { name: "Visual Studio", key: "vs", group: "Tools" },

    { name: "XML", key: "xml", group: "Data" },
    { name: "JSON", key: "json", group: "Data" },
    { name: "WordPress", key: "wp", group: "CMS" }
  ]
};
const statProjects = document.getElementById("statProjects");
const statCerts = document.getElementById("statCerts");

if (statProjects) statProjects.textContent = DATA.projects.length;
if (statCerts) statCerts.textContent = DATA.certs.length;

/* =========================
   TABS + CONTENT
========================= */
const tabs = [...document.querySelectorAll(".tab")];
const content = document.getElementById("portfolioContent");

/* =========================
   SVG LOGOS
========================= */
const LOGOS = {
  html: `<svg viewBox="0 0 24 24"><path d="M4 3h16l-2 18-6 2-6-2L4 3Z" fill="#ff6a00"/></svg>`,
  css: `<svg viewBox="0 0 24 24"><path d="M4 3h16l-2 18-6 2-6-2L4 3Z" fill="#1e90ff"/></svg>`,
  js: `<svg viewBox="0 0 24 24"><path d="M3 3h18v18H3V3Z" fill="#ffd400"/></svg>`,
  react: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="2" fill="#22d3ee"/></svg>`,
  php: `<svg viewBox="0 0 24 24"><ellipse cx="12" cy="12" rx="10" ry="6" fill="#777bb3"/></svg>`,
  mysql: `<svg viewBox="0 0 24 24"><path d="M4 18c4-12 12-12 16 0" stroke="#00618a" fill="none"/></svg>`,
  figma: `<svg viewBox="0 0 24 24"><circle cx="12" cy="5" r="3" fill="#f24e1e"/></svg>`,
  github: `<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-3 19c.5.1.7-.2.7-.5v-2c-3 .7-3.6-1.5-3.6-1.5-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.6 1 1.6 1 .9 1.6 2.4 1.1 3 .8.1-.7.4-1.1.7-1.4-2.4-.3-5-1.2-5-5.4 0-1.2.4-2.2 1-3-.1-.3-.4-1.4.1-3 0 0 .8-.3 2.7 1a9 9 0 0 1 5 0c1.9-1.3 2.7-1 2.7-1 .5 1.6.2 2.7.1 3 .6.8 1 1.8 1 3 0 4.2-2.6 5-5 5.3.4.3.8 1 .8 2v3c0 .3.2.6.7.5A10 10 0 0 0 12 2Z" fill="#fff"/></svg>`,
  docker: `<svg viewBox="0 0 24 24"><rect x="3" y="10" width="18" height="8" fill="#0db7ed"/></svg>`,
  angular: `<svg viewBox="0 0 24 24"><path d="M12 2l10 4-4 14-6 3-6-3L2 6l10-4Z" fill="#dd0031"/></svg>`,
  ts: `<svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#3178c6"/><text x="6" y="17" fill="#fff" font-size="10">TS</text></svg>`,
  vs: `<svg viewBox="0 0 24 24"><path d="M4 4l8 8-8 8V4Zm8 0l8 8-8 8V4Z" fill="#5c2d91"/></svg>`,
  blender: `<svg viewBox="0 0 24 24"><circle cx="12" cy="14" r="4" fill="#f5792a"/></svg>`,
  ps: `<svg viewBox="0 0 24 24"><rect width="24" height="24" fill="#001e36"/></svg>`,
  xml: `<svg viewBox="0 0 24 24"><text x="4" y="16" font-size="10" fill="#fff">&lt;XML&gt;</text></svg>`,
  json: `<svg viewBox="0 0 24 24"><text x="4" y="16" font-size="10" fill="#fff">{JSON}</text></svg>`,
  canva: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#00c4cc"/></svg>`,
  wp: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#21759b"/></svg>`,
  default: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="#fff" opacity=".3"/></svg>`
};

function logoSvg(key) {
  return LOGOS[key] || LOGOS.default;
}

/* =========================
   HELPERS
========================= */
function createProjectCard(p) {
  const el = document.createElement("div");
  el.className = "proj";

  let buttons = "";

  if (p.live) {
    buttons += `<a class="projectBtn demoBtn" href="${p.live}" target="_blank" rel="noopener">Demo ↗</a>`;
  }

  if (p.code) {
    buttons += `<a class="projectBtn codeBtn" href="${p.code}" target="_blank" rel="noopener">Código ↗</a>`;
  }

  const tags = (p.tags || [])
    .map((tag) => `<span class="projectTag">${tag}</span>`)
    .join("");

  el.innerHTML = `
    <div class="shot">
      <img src="${p.img}" alt="${p.title}">
      <div class="categoryBadge">${p.group}</div>
    </div>

    <div class="projBody">
      <div class="projectTags">${tags}</div>
      <h4>${p.title}</h4>
      <p>${p.desc}</p>
    </div>

    <div class="projFooter">
      ${buttons}
    </div>
  `;

  return el;
}

/* =========================
   RENDER PROJECTS
========================= */
function renderProjects() {
  const wrapper = document.createElement("div");
  wrapper.className = "accordionWrap";

  const groups = ["Angular", "React", "JavaScript", "Full Stack / PHP"];

  groups.forEach((group, index) => {
    const items = DATA.projects.filter((p) => p.group === group);
    if (!items.length) return;

    const block = document.createElement("div");
    block.className = "accordionBlock customAccordion";

    const button = document.createElement("button");
    button.className = "accordionTitle customAccordionBtn";
    button.type = "button";
    button.innerHTML = `
      <span>${group}</span>
      <small>${items.length} proyectos</small>
    `;

    const body = document.createElement("div");
    body.className = "accordionBody customAccordionBody";

    const grid = document.createElement("div");
    grid.className = "projGrid";

    items.forEach((p) => {
      grid.appendChild(createProjectCard(p));
    });

    body.appendChild(grid);

    if (index === 0) {
      block.classList.add("open");
      body.style.display = "block";
    } else {
      body.style.display = "none";
    }

    button.addEventListener("click", () => {
      const isOpen = block.classList.contains("open");

      document.querySelectorAll(".customAccordion").forEach((acc) => {
        acc.classList.remove("open");
        const accBody = acc.querySelector(".customAccordionBody");
        if (accBody) accBody.style.display = "none";
      });

      if (!isOpen) {
        block.classList.add("open");
        body.style.display = "block";
      }
    });

    block.appendChild(button);
    block.appendChild(body);
    wrapper.appendChild(block);
  });

  content.innerHTML = "";
  content.appendChild(wrapper);
}
/* =========================
   RENDER CERTS
========================= */
function renderCerts() {
  const grid = document.createElement("div");
  grid.className = "projGrid";

  DATA.certs.forEach((c) => {
    const el = document.createElement("div");
    el.className = "proj";

    el.innerHTML = `
      <div class="shot">
        <img src="${c.img}" alt="${c.title}">
      </div>

      <div class="projBody">
        <div class="projectTags">
          <span class="projectTag">Certificate</span>
        </div>
        <h4>${c.title}</h4>
        <p>${c.desc}</p>
      </div>

      <div class="projFooter">
        <a class="projectBtn demoBtn" href="${c.pdf}" target="_blank" rel="noopener">Ver PDF ↗</a>
      </div>
    `;

    grid.appendChild(el);
  });

  content.innerHTML = "";
  content.appendChild(grid);
}

/* =========================
   RENDER TECH STACK
========================= */
function renderTech() {
  const wrapper = document.createElement("div");
  wrapper.className = "accordionWrap";

  const groups = ["Frontend", "Backend", "Database", "Design", "Tools", "Data", "CMS"];

  groups.forEach((group, index) => {
    const items = DATA.tech.filter((t) => t.group === group);
    if (!items.length) return;

    const block = document.createElement("div");
    block.className = "accordionBlock customAccordion";

    const button = document.createElement("button");
    button.className = "accordionTitle customAccordionBtn";
    button.type = "button";
    button.innerHTML = `
      <span>${group}</span>
      <small>${items.length} tecnologías</small>
    `;

    const body = document.createElement("div");
    body.className = "accordionBody customAccordionBody";

    const grid = document.createElement("div");
    grid.className = "techGrid";

    items.forEach((t) => {
      const el = document.createElement("div");
      el.className = "tech";
      el.innerHTML = `
        <div class="logo">${logoSvg(t.key)}</div>
        <b>${t.name}</b>
        <span class="techMiniLabel">${t.group}</span>
      `;
      grid.appendChild(el);
    });

    body.appendChild(grid);

    if (index === 0) {
      block.classList.add("open");
      body.style.display = "block";
    } else {
      body.style.display = "none";
    }

    button.addEventListener("click", () => {
      const isOpen = block.classList.contains("open");

      document.querySelectorAll(".customAccordion").forEach((acc) => {
        acc.classList.remove("open");
        const accBody = acc.querySelector(".customAccordionBody");
        if (accBody) accBody.style.display = "none";
      });

      if (!isOpen) {
        block.classList.add("open");
        body.style.display = "block";
      }
    });

    block.appendChild(button);
    block.appendChild(body);
    wrapper.appendChild(block);
  });

  content.innerHTML = "";
  content.appendChild(wrapper);
}

/* =========================
   TAB SWITCH
========================= */
function setTab(name) {
  tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === name));

  if (name === "projects") renderProjects();
  if (name === "certs") renderCerts();
  if (name === "stack") renderTech();
}

tabs.forEach((t) => t.addEventListener("click", () => setTab(t.dataset.tab)));
setTab("projects");

/* =========================
   TOAST + COPY
========================= */
const toast = document.getElementById("toast");

function showToast(msg = "Copied ✓") {
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 1200);
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("Copied ✓");
  } catch {
    const t = document.createElement("textarea");
    t.value = text;
    document.body.appendChild(t);
    t.select();
    document.execCommand("copy");
    t.remove();
    showToast("Copied ✓");
  }
}

/* =========================
   DOCK ITEMS
========================= */
document.querySelectorAll(".dockItem").forEach((btn) => {
  btn.addEventListener("click", async () => {
    const toCopy = btn.getAttribute("data-copy") || "";
    const toOpen = btn.getAttribute("data-open") || "";

    if (toCopy) await copyText(toCopy);

    if (toOpen) {
      setTimeout(() => window.open(toOpen, "_blank", "noopener"), 120);
    }
  });
});

/* =========================
   QUICK MESSAGE TEMPLATES
========================= */
const templates = {
  recruiter: `Hola, soy Lorena Martín Piñero 👋
Perfil junior (DAW + Google UX + Blender). Me interesa Front-end / UX/UI.
¿Te puedo pasar mi CV y portfolio por aquí? Gracias 🙂`,

  studio: `Hola! Soy Lorena 👋
Me gusta crear interfaces modernas y limpias (Front-end + UX/UI) y estoy buscando mi primera oportunidad.
¿Puedo enviarte portfolio y CV?`,

  network: `Hola! Soy Lorena 😊
Estoy ampliando red en el sector (Front-end / UX/UI). Si te apetece, conectamos y te enseño mi portfolio.`
};

const quickText = document.getElementById("quickText");
const chips = [...document.querySelectorAll(".chip")];
const openMailBtn = document.getElementById("openMailBtn");
const copyMsgBtn = document.getElementById("copyMsgBtn");

function setTemplate(key) {
  chips.forEach((c) => c.classList.toggle("active", c.dataset.template === key));

  if (!quickText) return;

  quickText.value = templates[key] || templates.recruiter;

  const subject = encodeURIComponent("Portfolio + CV · Lorena Martín Piñero");
  const body = encodeURIComponent(quickText.value);

  if (openMailBtn) {
    openMailBtn.href = `mailto:lorena@email.com?subject=${subject}&body=${body}`;
  }
}

chips.forEach((c) => c.addEventListener("click", () => setTemplate(c.dataset.template)));
if (chips.length) setTemplate("recruiter");

if (copyMsgBtn && quickText) {
  copyMsgBtn.addEventListener("click", () => copyText(quickText.value));
}

/* =========================
   CV BUTTON
========================= */
const downloadCvBtn = document.getElementById("downloadCvBtn");

if (downloadCvBtn) {
  downloadCvBtn.addEventListener("click", () => {
    window.open("C.V. Lorena Martin (1).pdf", "_blank", "noopener");
  });
}

/* =========================
   YEAR
========================= */
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}
