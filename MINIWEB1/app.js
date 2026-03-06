/* ===== Polyfill ===== */
if (!String.prototype.replaceAll) {
  String.prototype.replaceAll = function (search, replacement) {
    return this.split(search).join(replacement);
  };
}

/* ========= Shared utils ========= */
const $ = (q, el = document) => el.querySelector(q);
const $$ = (q, el = document) => [...el.querySelectorAll(q)];
const money = (n) => `${Number(n).toFixed(2)}€`.replace(".00", "");

const store = {
  get(k, fallback) {
    try {
      return JSON.parse(localStorage.getItem(k)) ?? fallback;
    } catch {
      return fallback;
    }
  },
  set(k, v) {
    localStorage.setItem(k, JSON.stringify(v));
  },
};

function toast(msg) {
  const t = $("#toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("is-on");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("is-on"), 1800);
}

/* ========= Theme ========= */
function initTheme() {
  const saved = store.get("theme", null);
  if (saved === "light") document.body.classList.add("light");

  const btn = $("#themeBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      document.body.classList.toggle("light");
      store.set("theme", document.body.classList.contains("light") ? "light" : "dark");
      toast(document.body.classList.contains("light") ? "Tema claro" : "Tema oscuro");
    });
  }
}

/* ========= Product image generator (offline SVG "photos") ========= */
function svgDataUri({ title = "ByteBazar", icon = "💻", a = "#7b7eff", b = "#ff78d2", c = "#50ffaa" }) {
  const safeTitle = (title || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const safeIcon = (icon || "💻").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${a}" stop-opacity="0.55"/>
      <stop offset="0.55" stop-color="${b}" stop-opacity="0.45"/>
      <stop offset="1" stop-color="${c}" stop-opacity="0.38"/>
    </linearGradient>
    <radialGradient id="glow" cx="30%" cy="20%" r="70%">
      <stop offset="0" stop-color="#fff" stop-opacity="0.25"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </radialGradient>
    <filter id="blur" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
  </defs>
  <rect width="1200" height="800" fill="#070A12"/>
  <rect width="1200" height="800" fill="url(#bg)"/>
  <circle cx="260" cy="200" r="220" fill="url(#glow)" filter="url(#blur)"/>
  <circle cx="980" cy="140" r="240" fill="url(#glow)" filter="url(#blur)"/>
  <circle cx="820" cy="720" r="260" fill="url(#glow)" filter="url(#blur)"/>
  <rect x="80" y="110" width="1040" height="580" rx="44" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>
  <rect x="120" y="160" width="760" height="64" rx="22" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.14)"/>
  <rect x="120" y="250" width="940" height="320" rx="32" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.14)"/>
  <text x="150" y="205" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="28" fill="rgba(236,240,255,0.82)">${safeTitle}</text>
  <text x="150" y="330" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="96" fill="rgba(255,255,255,0.82)">${safeIcon}</text>
  <text x="150" y="420" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="28" fill="rgba(236,240,255,0.68)">Aesthetic • Dev Setup • ByteBazar</text>
  <g opacity="0.7">
    <circle cx="930" cy="190" r="8" fill="rgba(80,255,170,0.9)"/>
    <circle cx="960" cy="190" r="8" fill="rgba(255,120,210,0.9)"/>
    <circle cx="990" cy="190" r="8" fill="rgba(120,126,255,0.9)"/>
  </g>
</svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

/* ========= PRODUCTS ========= */
const PRODUCTS = [
  { id:"p01", name:"Teclado Glass 60%", cat:"peripherals", price:129, rating:4.8, featured:true, tags:["keyboard","setup","rgb"], desc:"Compacto, clicky y precioso.",
    variants:{ color:["Smoke","Ice","Pink"], layout:["ES","US"] }, img: svgDataUri({title:"Teclado Glass 60%", icon:"⌨️"}) },

  { id:"p02", name:"Mouse Nebula Pro", cat:"peripherals", price:69, rating:4.7, featured:true, tags:["mouse","dpi","wireless"], desc:"Ergonomía + sensor suave.",
    variants:{ color:["Negro","Blanco","Lavanda"] }, img: svgDataUri({title:"Mouse Nebula Pro", icon:"🖱️", a:"#50ffaa", b:"#7b7eff", c:"#ff78d2"}) },

  { id:"p03", name:"Auriculares Studio Flux", cat:"peripherals", price:89, rating:4.6, featured:false, tags:["audio","mic","wireless"], desc:"Bajos limpios, micro decente.",
    variants:{ color:["Negro","Blanco"] }, img: svgDataUri({title:"Auriculares Studio Flux", icon:"🎧", a:"#ff78d2", b:"#7b7eff", c:"#50ffaa"}) },

  { id:"p04", name:"Micrófono USB PodCast", cat:"peripherals", price:59, rating:4.5, featured:false, tags:["mic","stream","usb"], desc:"Tu voz suena PRO en Discord.",
    variants:{ finish:["Mate","Metal"] }, img: svgDataUri({title:"Micrófono USB", icon:"🎙️", a:"#7b7eff", b:"#50ffaa", c:"#ff78d2"}) },

  { id:"p05", name:"Alfombrilla XL Neon", cat:"peripherals", price:24, rating:4.4, featured:false, tags:["desk","pad","xl"], desc:"Deskmat grande con textura suave.",
    variants:{ color:["Midnight","Neon","Aurora"] }, img: svgDataUri({title:"Deskmat XL", icon:"🧩", a:"#50ffaa", b:"#ff78d2", c:"#7b7eff"}) },

  { id:"p06", name:"Hub USB-C 8en1", cat:"hardware", price:49, rating:4.6, featured:true, tags:["usb-c","hub","laptop"], desc:"HDMI + SD + USB + carga.",
    variants:{ color:["Space Gray","Silver"] }, img: svgDataUri({title:"Hub USB-C 8en1", icon:"🔌", a:"#7b7eff", b:"#1fd1f9", c:"#ff78d2"}) },

  { id:"p07", name:"Soporte Laptop Aero", cat:"hardware", price:29, rating:4.5, featured:false, tags:["laptop","stand","ergonomic"], desc:"Mejor postura y ventilación.",
    variants:{ color:["Negro","Plata"] }, img: svgDataUri({title:"Soporte Laptop", icon:"💻", a:"#50ffaa", b:"#7b7eff", c:"#ff78d2"}) },

  { id:"p08", name:"Luz Monitor RGB Bar", cat:"hardware", price:39, rating:4.3, featured:false, tags:["light","rgb","monitor"], desc:"Luz suave, cero reflejos.",
    variants:{ mode:["Warm","Cool","RGB"] }, img: svgDataUri({title:"Luz Monitor", icon:"💡"}) },

  { id:"p09", name:"Curso CSS Animations PRO", cat:"dev", price:59, rating:4.8, featured:true, tags:["css","animations","frontend"], desc:"Microinteracciones y UI pro.",
    variants:{ access:["30 días","Lifetime"] }, img: svgDataUri({title:"CSS Animations PRO", icon:"✨"}) },

  { id:"p10", name:"Pack Componentes UI (Vanilla)", cat:"dev", price:45, rating:4.6, featured:true, tags:["ui","components","vanilla"], desc:"Modals, tabs, toasts, cards.",
    variants:{ license:["Personal","Comercial"] }, img: svgDataUri({title:"UI Components", icon:"🧱", a:"#50ffaa", b:"#7b7eff", c:"#ff78d2"}) },

  { id:"p11", name:"Icon Pack Dev Aesthetic", cat:"dev", price:19, rating:4.5, featured:false, tags:["icons","svg","ui"], desc:"450 iconos SVG para apps.",
    variants:{ style:["Line","Solid"] }, img: svgDataUri({title:"Icon Pack", icon:"🧩", a:"#ff78d2", b:"#7b7eff", c:"#50ffaa"}) },

  { id:"p12", name:"Cable USB-C Trenzado 2m", cat:"hardware", price:14, rating:4.4, featured:false, tags:["cable","usb-c","charge"], desc:"Resistente, carga rápida.",
    variants:{ color:["Negro","Blanco","Neon"] }, img: svgDataUri({title:"USB-C Trenzado", icon:"🧵"}) },

  { id:"p13", name:"SSD NVMe 1TB (demo)", cat:"hardware", price:99, rating:4.7, featured:true, tags:["ssd","nvme","speed"], desc:"Velocidad absurda (demo).",
    variants:{ warranty:["2 años","5 años"] }, img: svgDataUri({title:"SSD NVMe 1TB", icon:"⚡"}) },

  { id:"p14", name:"Mini NAS HomeLab (demo)", cat:"hardware", price:199, rating:4.6, featured:false, tags:["nas","homelab","backup"], desc:"Backups y proyectos, easy.",
    variants:{ bays:["2-bay","4-bay"] }, img: svgDataUri({title:"Mini NAS HomeLab", icon:"🗄️"}) },

  { id:"p15", name:"Plantilla Portfolio (HTML)", cat:"dev", price:49, rating:4.6, featured:false, tags:["portfolio","template","html"], desc:"Secciones modernas y limpias.",
    variants:{ theme:["Dark","Light"] }, img: svgDataUri({title:"Portfolio Template", icon:"🧑‍💻"}) },

  { id:"p16", name:"Notas Entrevista Tech (PDF)", cat:"dev", price:9, rating:4.3, featured:false, tags:["interview","notes","cs"], desc:"Checklist y preguntas típicas.",
    variants:{ level:["Junior","Mid","Senior"] }, img: svgDataUri({title:"Interview Notes", icon:"📄"}) },

  { id:"p17", name:"Planner Dev Semanal", cat:"productivity", price:12, rating:4.4, featured:false, tags:["planner","habit","study"], desc:"Organiza tareas + foco.",
    variants:{ format:["A5","A4"] }, img: svgDataUri({title:"Planner Dev", icon:"🗓️"}) },

  { id:"p18", name:"Pack Fondos Setup (4K)", cat:"productivity", price:7, rating:4.2, featured:false, tags:["wallpaper","4k","setup"], desc:"Fondos minimal para escritorio.",
    variants:{ style:["Neon","Minimal","Gradient"] }, img: svgDataUri({title:"Wallpapers 4K", icon:"🖼️"}) },

  { id:"p19", name:"Stickers IDE Shortcuts", cat:"productivity", price:6, rating:4.3, featured:false, tags:["shortcuts","vscode","tips"], desc:"Atajos para pegar en el portátil.",
    variants:{ pack:["VSCode","IntelliJ","Vim"] }, img: svgDataUri({title:"IDE Shortcuts", icon:"⌘"}) },
];

/* ========= CART MODEL =========
   cart = [{ lineId, id, qty, opts:{...}, note:"" }]
*/
const uid = () => Math.random().toString(16).slice(2) + Date.now().toString(16);
function defaultOpts(p){
  const out = {};
  if(!p?.variants) return out;
  for(const k of Object.keys(p.variants)) out[k] = p.variants[k][0];
  return out;
}
function sameOpts(a = {}, b = {}){
  const ka = Object.keys(a), kb = Object.keys(b);
  if(ka.length !== kb.length) return false;
  return ka.every(k => a[k] === b[k]);
}

/* ========= SHOP ========= */
function initShop(){
  const grid = $("#productGrid");
  if(!grid) return;

  const q = $("#q"), cat = $("#cat"), sort = $("#sort"),
        maxPrice = $("#maxPrice"), maxPriceLabel = $("#maxPriceLabel");

  const openCart = $("#openCart"), closeCart = $("#closeCart"),
        cartBackdrop = $("#cartBackdrop"), drawer = $("#cartDrawer");

  const checkoutBtn = $("#checkoutBtn"), checkoutModal = $("#checkoutModal"),
        closeCheckout = $("#closeCheckout"), checkoutBackdrop = $("#checkoutBackdrop"),
        checkoutForm = $("#checkoutForm"), checkoutHint = $("#checkoutHint");

  const couponInput = $("#couponInput"), applyCoupon = $("#applyCoupon"), couponHint = $("#couponHint");

  let cart = store.get("cart", []);
  let coupon = store.get("coupon", { code:"", type:"none" });
  let orders = store.get("orders", []);

  // Normaliza datos antiguos (evita que pete y deje la tienda “muerta”)
  if(!Array.isArray(cart)) cart = [];
  if(!Array.isArray(orders)) orders = [];
  if(!coupon || typeof coupon !== "object") coupon = { code:"", type:"none" };

  function saveCart(){ store.set("cart", cart); }
  function cartCount(){ return cart.reduce((s,l)=>s+l.qty,0); }

  function subtotal(){
    return cart.reduce((sum,l)=>{
      const p = PRODUCTS.find(x=>x.id===l.id);
      return sum + (p ? p.price*l.qty : 0);
    },0);
  }
  function discountAmount(sub){
    if(coupon.type === "byte10") return sub * 0.10;
    return 0;
  }
  function shippingCost(afterDisc){
    if(coupon.type === "freeship") return 0;
    if(afterDisc <= 0) return 0;
    return afterDisc >= 35 ? 0 : 4.99;
  }
  function total(){
    const sub = subtotal();
    const disc = discountAmount(sub);
    const after = Math.max(0, sub - disc);
    return after + shippingCost(after);
  }

  function setCartCountUI(){
    $("#cartCount").textContent = cartCount();
  }

  function addToCart(productId){
    const p = PRODUCTS.find(x=>x.id===productId);
    if(!p) return;
    const opts = defaultOpts(p);

    const existing = cart.find(l => l.id===productId && sameOpts(l.opts, opts));
    if(existing) existing.qty += 1;
    else cart.push({ lineId: uid(), id: productId, qty: 1, opts, note:"" });

    saveCart();
  }

  function renderProducts(){
    const query = (q?.value ?? "").trim().toLowerCase();
    const category = cat?.value ?? "all";
    const s = sort?.value ?? "featured";
    const mp = Number(maxPrice?.value ?? 350);
    if(maxPriceLabel) maxPriceLabel.textContent = `${mp}€`;

    let items = PRODUCTS.filter(p => p.price <= mp);
    if(category !== "all") items = items.filter(p => p.cat === category);

    if(query){
      items = items.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.desc.toLowerCase().includes(query) ||
        p.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    if(s==="priceAsc") items.sort((a,b)=>a.price-b.price);
    if(s==="priceDesc") items.sort((a,b)=>b.price-a.price);
    if(s==="ratingDesc") items.sort((a,b)=>b.rating-a.rating);
    if(s==="featured") items.sort((a,b)=> (b.featured?1:0)-(a.featured?1:0) || b.rating-a.rating);

    grid.innerHTML = items.map(p=>`
      <article class="card product" data-id="${p.id}">
        <a class="pimg" href="#" data-open="${p.id}" aria-label="Ver ${p.name}">
          <img alt="${p.name}" src="${p.img}">
        </a>
        <div class="product__meta">
          <span class="tag">${p.cat}</span>
          <span class="stars">★ ${p.rating.toFixed(1)}</span>
        </div>
        <h3>${p.name}</h3>
        <p class="desc">${p.desc}</p>
        <div class="product__meta">
          <span class="price">${p.price}€</span>
          <span class="muted">${p.tags.slice(0,2).join(" • ")}</span>
        </div>
        <div class="product__actions">
          <button class="btn primary" data-add="${p.id}" type="button">Añadir</button>
          <button class="btn ghost" data-like="${p.id}" type="button">♡</button>
        </div>
      </article>
    `).join("") || `<p class="muted">No hay productos con esos filtros.</p>`;

    $$("[data-add]", grid).forEach(btn=>{
      btn.addEventListener("click", ()=>{
        addToCart(btn.dataset.add);
        setCartCountUI();
        renderCart();
        toast("Añadido al carrito ✨");
      });
    });

    $$("[data-like]", grid).forEach(btn=>{
      btn.addEventListener("click", ()=>{
        btn.textContent = btn.textContent.includes("♡") ? "♥" : "♡";
        toast("Guardado");
      });
    });

    $$("[data-open]", grid).forEach(a=>{
      a.addEventListener("click", (e)=>{
        e.preventDefault();
        addToCart(a.dataset.open);
        setCartCountUI();
        renderCart();
        toast("Añadido 👀");
      });
    });
  }

  function renderCart(){
    const wrap = $("#cartItems");
    if(!wrap) return;

    if(cart.length===0){
      wrap.innerHTML = `<p class="muted">Tu carrito está vacío.</p>`;
    } else {
      wrap.innerHTML = cart.map(line=>{
        const p = PRODUCTS.find(x=>x.id===line.id);
        if(!p) return "";

        const variantUI = p.variants ? Object.entries(p.variants).map(([key, values])=>{
          const options = values.map(v=>`<option ${line.opts?.[key]===v?"selected":""} value="${v}">${v}</option>`).join("");
          return `
            <div class="field" style="margin-top:10px">
              <label>${key}</label>
              <select class="select" data-opt="${key}" data-line="${line.lineId}">
                ${options}
              </select>
            </div>
          `;
        }).join("") : "";

        return `
          <div class="cartItem">
            <div class="cartThumb" aria-hidden="true"><img alt="" src="${p.img}"></div>

            <div>
              <strong>${p.name}</strong>
              <div class="muted tiny">${p.price}€ • ★ ${p.rating.toFixed(1)}</div>

              ${variantUI}

              <div class="field" style="margin-top:10px">
                <label>Nota (opcional)</label>
                <input class="input" data-note="${line.lineId}" value="${(line.note||"").replaceAll('"','&quot;')}" placeholder="Ej: para regalo, entrega tarde…"/>
              </div>

              <div class="qty" style="margin-top:10px">
                <button class="btn" data-dec="${line.lineId}" type="button">−</button>
                <span><strong>${line.qty}</strong></span>
                <button class="btn" data-inc="${line.lineId}" type="button">+</button>
                <button class="btn ghost" data-rm="${line.lineId}" type="button">Eliminar</button>
              </div>
            </div>

            <div style="text-align:right">
              <div class="muted tiny">Total</div>
              <strong>${money(p.price*line.qty)}</strong>
            </div>
          </div>
        `;
      }).join("");
    }

    const sub = subtotal();
    const disc = discountAmount(sub);
    const after = Math.max(0, sub - disc);
    const ship = shippingCost(after);
    $("#cartSubtotal").textContent = money(sub);
    $("#cartDiscount").textContent = disc ? `- ${money(disc)}` : money(0);
    $("#cartShipping").textContent = ship===0 ? "Gratis" : money(ship);
    $("#cartTotal").textContent = money(total());

    $$("[data-inc]").forEach(b => b.onclick = ()=>{
      const line = cart.find(x=>x.lineId===b.dataset.inc);
      if(!line) return;
      line.qty += 1;
      saveCart(); setCartCountUI(); renderCart();
    });

    $$("[data-dec]").forEach(b => b.onclick = ()=>{
      const line = cart.find(x=>x.lineId===b.dataset.dec);
      if(!line) return;
      line.qty = Math.max(1, line.qty-1);
      saveCart(); setCartCountUI(); renderCart();
    });

    $$("[data-rm]").forEach(b => b.onclick = ()=>{
      cart = cart.filter(x=>x.lineId!==b.dataset.rm);
      saveCart(); setCartCountUI(); renderCart();
      toast("Eliminado");
    });

    $$("select[data-line]").forEach(sel=>{
      sel.addEventListener("change", ()=>{
        const line = cart.find(x=>x.lineId===sel.dataset.line);
        if(!line) return;
        line.opts = line.opts || {};
        line.opts[sel.dataset.opt] = sel.value;
        saveCart();
        toast("Actualizado");
      });
    });

    $$("input[data-note]").forEach(inp=>{
      inp.addEventListener("input", ()=>{
        const line = cart.find(x=>x.lineId===inp.dataset.note);
        if(!line) return;
        line.note = inp.value.slice(0, 140);
        saveCart();
      });
    });
  }

  function openDrawer(){
    drawer.classList.add("is-open");
    drawer.setAttribute("aria-hidden","false");
  }
  function closeDrawer(){
    drawer.classList.remove("is-open");
    drawer.setAttribute("aria-hidden","true");
  }

  function openCheckout(){
    if(cart.length===0) return toast("Añade algo primero 🙂");
    checkoutModal.classList.add("is-open");
    checkoutModal.setAttribute("aria-hidden","false");
    if(checkoutHint) checkoutHint.textContent = `Vas a comprar ${cartCount()} item(s) por ${money(total())}.`;
  }
  function closeCheckoutModal(){
    checkoutModal.classList.remove("is-open");
    checkoutModal.setAttribute("aria-hidden","true");
  }

  function setCoupon(code){
    const c = (code||"").trim().toUpperCase();
    let next = { code:c, type:"none" };
    if(c==="BYTE10") next.type="byte10";
    if(c==="FREESHIP") next.type="freeship";
    coupon = next;
    store.set("coupon", coupon);

    if(!couponHint) return renderCart();
    couponHint.textContent =
      coupon.type==="byte10" ? "Aplicado: 10% descuento" :
      coupon.type==="freeship" ? "Aplicado: envío gratis" :
      (c ? "Cupón no válido" : "");

    toast(coupon.type==="none" ? "Cupón rechazado" : "Cupón aplicado");
    renderCart();
  }

  function showReceipt(order){
    const panel = $("#checkoutPanel");
    if(!panel) return;

    const itemsHtml = order.items.map(it=>{
      const opts = Object.entries(it.opts||{}).map(([k,v])=>`${k}: ${v}`).join(" • ");
      return `
        <div style="padding:10px 0; border-bottom:1px solid var(--stroke); display:flex; justify-content:space-between; gap:10px">
          <div>
            <strong>${it.name}</strong>
            <div class="muted tiny">${opts || "—"}${it.note ? ` • Nota: ${it.note}` : ""}</div>
          </div>
          <div><strong>${it.qty} x ${it.unit}€</strong></div>
        </div>
      `;
    }).join("");

    panel.innerHTML = `
      <div class="modal__head">
        <h2 class="h2">Recibo</h2>
        <button class="iconBtn" id="closeReceipt" type="button" aria-label="Cerrar">✕</button>
      </div>

      <div class="card" style="padding:14px">
        <div style="display:flex; justify-content:space-between; gap:10px; flex-wrap:wrap">
          <div><div class="muted tiny">Pedido</div><strong>${order.id}</strong></div>
          <div><div class="muted tiny">Total</div><strong>${money(order.pricing.total)}</strong></div>
          <div><div class="muted tiny">Pago</div><strong>${order.customer.pay}</strong></div>
        </div>

        <div style="margin-top:10px">${itemsHtml}</div>

        <div style="display:flex; justify-content:space-between; padding-top:10px">
          <span class="muted">Subtotal</span><strong>${money(order.pricing.subtotal)}</strong>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span class="muted">Descuento</span><strong>${money(order.pricing.discount)}</strong>
        </div>
        <div style="display:flex; justify-content:space-between;">
          <span class="muted">Envío</span><strong>${money(order.pricing.shipping)}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:1.05rem">
          <span>Total</span><strong>${money(order.pricing.total)}</strong>
        </div>

        <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:12px">
          <button class="btn primary" id="downloadTicket" type="button">Descargar ticket</button>
          <a class="btn ghost" href="dashboard.html">Ver en dashboard</a>
          <a class="btn ghost" href="shop.html">Seguir comprando</a>
        </div>
        <p class="tiny muted" style="margin-top:10px">Guardado en localStorage como historial.</p>
      </div>
    `;

    $("#closeReceipt")?.addEventListener("click", ()=>location.reload());
    $("#checkoutBackdrop")?.addEventListener("click", ()=>location.reload());

    $("#downloadTicket")?.addEventListener("click", ()=>{
      const text = [
        `ByteBazar — Ticket`,
        `Pedido: ${order.id}`,
        `Fecha: ${new Date(order.date).toLocaleString()}`,
        `Cliente: ${order.customer.name} (${order.customer.email})`,
        `Dirección: ${order.customer.addr}, ${order.customer.city}`,
        `Pago: ${order.customer.pay}`,
        ``,
        `Items:`,
        ...order.items.map(it=>{
          const opts = Object.entries(it.opts||{}).map(([k,v])=>`${k}=${v}`).join(", ");
          return `- ${it.name} | qty=${it.qty} | unit=${it.unit}€ | ${opts}${it.note?` | note=${it.note}`:""}`;
        }),
        ``,
        `Subtotal: ${order.pricing.subtotal}€`,
        `Descuento: ${order.pricing.discount}€`,
        `Envío: ${order.pricing.shipping}€`,
        `TOTAL: ${order.pricing.total}€`,
      ].join("\n");

      const blob = new Blob([text], {type:"text/plain"});
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${order.id}.txt`;
      a.click();
      URL.revokeObjectURL(a.href);
      toast("Ticket descargado");
    });
  }

  // Events
  openCart?.addEventListener("click", ()=>{ renderCart(); openDrawer(); });
  closeCart?.addEventListener("click", closeDrawer);
  cartBackdrop?.addEventListener("click", closeDrawer);

  applyCoupon?.addEventListener("click", ()=>setCoupon(couponInput.value));
  couponInput?.addEventListener("keydown", (e)=>{
    if(e.key==="Enter"){ e.preventDefault(); setCoupon(couponInput.value); }
  });

  checkoutBtn?.addEventListener("click", openCheckout);
  closeCheckout?.addEventListener("click", closeCheckoutModal);
  checkoutBackdrop?.addEventListener("click", closeCheckoutModal);

  checkoutForm?.addEventListener("submit", async (e)=>{
    e.preventDefault();
    if(cart.length===0) return toast("Carrito vacío");

    const fd = new FormData(checkoutForm);
    const sub = subtotal();
    const disc = discountAmount(sub);
    const after = Math.max(0, sub - disc);
    const ship = shippingCost(after);
    const tot = after + ship;

    const btn = $("#payBtn");
    const old = btn.textContent;
    btn.disabled = true;
    btn.textContent = "Procesando…";

    await new Promise(r=>setTimeout(r, 900));

    const order = {
      id: "ORD-" + Math.random().toString(16).slice(2,8).toUpperCase(),
      date: new Date().toISOString(),
      customer: {
        name: fd.get("name"),
        email: fd.get("email"),
        addr: fd.get("addr"),
        city: fd.get("city"),
        pay: fd.get("pay"),
        shipnote: fd.get("shipnote") || ""
      },
      pricing: {
        subtotal: Number(sub.toFixed(2)),
        discount: Number(disc.toFixed(2)),
        shipping: Number(ship.toFixed(2)),
        total: Number(tot.toFixed(2)),
        coupon: coupon.code || ""
      },
      items: cart.map(line=>{
        const p = PRODUCTS.find(x=>x.id===line.id);
        return { id: line.id, name: p?.name, qty: line.qty, unit: p?.price, opts: line.opts||{}, note: line.note||"" };
      }),
      status: "Pagado"
    };

    orders.unshift(order);
    store.set("orders", orders);

    cart = [];
    saveCart();
    setCartCountUI();
    renderCart();
    closeDrawer();

    checkoutModal.classList.add("is-open");
    checkoutModal.setAttribute("aria-hidden","false");
    showReceipt(order);

    toast(`Pago OK ✓ Pedido ${order.id}`);

    checkoutForm.reset();
    btn.disabled = false;
    btn.textContent = old;
  });

  [q, cat, sort, maxPrice].forEach(el=>el?.addEventListener("input", renderProducts));

  // Init: que se vean productos AL ENTRAR (sin buscar)
  if(q) q.value = "";
  if(cat) cat.value = "all";
  if(sort) sort.value = "featured";
  if(maxPrice){ maxPrice.value = maxPrice.max || 350; }
  if(maxPriceLabel) maxPriceLabel.textContent = `${maxPrice?.value ?? 350}€`;

  coupon = store.get("coupon", {code:"", type:"none"});
  if(!coupon || typeof coupon !== "object") coupon = {code:"", type:"none"};
  if(couponInput) couponInput.value = coupon.code || "";
  if(couponHint){
    couponHint.textContent =
      coupon.type==="byte10" ? "Aplicado: 10% descuento" :
      coupon.type==="freeship" ? "Aplicado: envío gratis" : "";
  }

  setCartCountUI();
  renderProducts();
  renderCart();
}

/* ========= DASHBOARD ========= */
function initDashboard(){
  const main = $("#mainChart");
  if(!main) return;

  const regenBtn = $("#regenBtn");
  const exportBtn = $("#exportBtn");
  const table = $("#ordersTable tbody");
  const clearOrders = $("#clearOrders");
  const seedOrders = $("#seedOrders");
  const toggles = $$(".toggles .pill");

  let series = "revenue";
  const randomSeries = (n=12, base=100, jitter=40) =>
    Array.from({length:n}, (_,i)=>Math.max(10, base + Math.sin(i/2)*jitter + (Math.random()*jitter - jitter/2)));

  let data = { revenue: randomSeries(12, 220, 90), users: randomSeries(12, 140, 60), carts: randomSeries(12, 90, 45) };

  function pctDelta(arr){
    if(arr.length<2) return 0;
    const a = arr[arr.length-2], b = arr[arr.length-1];
    return ((b-a)/Math.max(1,a))*100;
  }

  function drawSpark(canvas, arr){
    if(!canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h);

    const min = Math.min(...arr), max = Math.max(...arr);
    const pad=12;
    const xStep=(w-pad*2)/((arr.length-1)||1);
    const yMap=(v)=>{
      const t=(v-min)/((max-min)||1);
      return h-pad - t*(h-pad*2);
    };

    ctx.lineWidth=2;
    ctx.strokeStyle="rgba(255,255,255,.7)";
    ctx.beginPath();
    arr.forEach((v,i)=>{
      const x=pad+i*xStep, y=yMap(v);
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.stroke();

    ctx.fillStyle="rgba(120,126,255,.85)";
    const lx=pad+(arr.length-1)*xStep, ly=yMap(arr[arr.length-1]);
    ctx.beginPath(); ctx.arc(lx,ly,4,0,Math.PI*2); ctx.fill();
  }

  function drawLine(canvas, arr){
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0,0,w,h);

    ctx.globalAlpha = 0.35;
    for(let i=1;i<=4;i++){
      const y=(h/5)*i;
      ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y);
      ctx.strokeStyle="rgba(255,255,255,.12)"; ctx.stroke();
    }
    ctx.globalAlpha = 1;

    const min = Math.min(...arr), max = Math.max(...arr);
    const pad=22;
    const xStep=(w-pad*2)/((arr.length-1)||1);
    const yMap=(v)=>{
      const t=(v-min)/((max-min)||1);
      return h-pad - t*(h-pad*2);
    };

    ctx.lineWidth=2.2;
    ctx.strokeStyle="rgba(255,255,255,.75)";
    ctx.beginPath();
    arr.forEach((v,i)=>{
      const x=pad+i*xStep, y=yMap(v);
      if(i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    });
    ctx.stroke();

    ctx.fillStyle="rgba(120,126,255,.9)";
    arr.forEach((v,i)=>{
      const x=pad+i*xStep, y=yMap(v);
      ctx.beginPath(); ctx.arc(x,y,3.4,0,Math.PI*2); ctx.fill();
    });

    ctx.fillStyle="rgba(255,255,255,.75)";
    ctx.font="12px system-ui";
    ctx.fillText(series.toUpperCase(), 14, 18);
  }

  function animateChart(){
    const target = data[series];
    const frames=14;
    const start = target.map(v=>v*(0.9+Math.random()*0.12));
    let f=0;
    (function step(){
      f++;
      const t=f/frames;
      const eased = 1 - Math.pow(1-t,3);
      const cur = target.map((v,i)=>start[i]+(v-start[i])*eased);
      drawLine(main, cur);
      if(f<frames) requestAnimationFrame(step);
      else drawLine(main, target);
    })();
  }

  function setChip(el, v){
    el.textContent = `${v>=0?"+":""}${v.toFixed(1)}%`;
    el.classList.toggle("up", v>=0);
    el.classList.toggle("down", v<0);
  }

  function setStats(){
    const s = data.revenue.reduce((a,b)=>a+b,0);
    const u = data.users.reduce((a,b)=>a+b,0);
    const c = data.carts.reduce((a,b)=>a+b,0);
    $("#salesValue").textContent = money(s);
    $("#usersValue").textContent = Math.round(u).toString();
    $("#cartsValue").textContent = Math.round(c).toString();

    setChip($("#salesDelta"), pctDelta(data.revenue));
    setChip($("#usersDelta"), pctDelta(data.users));
    setChip($("#cartsDelta"), pctDelta(data.carts));

    drawSpark($("#spark1"), data.revenue);
    drawSpark($("#spark2"), data.users);
    drawSpark($("#spark3"), data.carts);
  }

  function loadOrdersToTable(){
    const orders = store.get("orders", []);
    if(!table) return;

    if(!Array.isArray(orders) || orders.length===0){
      table.innerHTML = `<tr><td colspan="4" class="muted">No hay pedidos aún. Ve a la tienda y compra algo.</td></tr>`;
      return;
    }

    table.innerHTML = orders.slice(0,10).map(o=>{
      const st = o.status || "Pagado";
      return `
        <tr>
          <td>${o.id}</td>
          <td>${o.customer?.name || "—"}</td>
          <td>${money(Number(o.pricing?.total ?? 0))}</td>
          <td><span class="chip ${st==="Pagado"?"up":"down"}">${st}</span></td>
        </tr>
      `;
    }).join("");
  }

  regenBtn?.addEventListener("click", ()=>{
    data = { revenue: randomSeries(12, 220, 90), users: randomSeries(12, 140, 60), carts: randomSeries(12, 90, 45) };
    setStats(); animateChart(); toast("Datos regenerados");
  });

  exportBtn?.addEventListener("click", ()=>{
    const payload = { at:new Date().toISOString(), data, orders: store.get("orders", []) };
    navigator.clipboard?.writeText(JSON.stringify(payload, null, 2));
    toast("JSON copiado");
  });

  toggles.forEach(b=>{
    b.addEventListener("click", ()=>{
      toggles.forEach(x=>x.classList.remove("is-on"));
      b.classList.add("is-on");
      series = b.dataset.series;
      animateChart();
    });
  });

  clearOrders?.addEventListener("click", ()=>{
    store.set("orders", []);
    loadOrdersToTable();
    toast("Pedidos borrados");
  });

  seedOrders?.addEventListener("click", ()=>{
    const demo = store.get("orders", []);
    const names = ["Ana","Mario","Lucía","Adri","Hugo","Sara","Noa","Dani"];
    for(let i=0;i<5;i++){
      demo.unshift({
        id:"ORD-"+Math.random().toString(16).slice(2,8).toUpperCase(),
        customer:{ name:names[Math.floor(Math.random()*names.length)] },
        pricing:{ total:Number((15+Math.random()*140).toFixed(2)) },
        status: Math.random()>0.2 ? "Pagado":"Pendiente"
      });
    }
    store.set("orders", demo);
    loadOrdersToTable();
    toast("Pedidos demo creados");
  });

  setStats();
  animateChart();
  loadOrdersToTable();
}

/* ========= LANDING ========= */
function initLanding(){
  if(!$(".hero")) return;

  $("#year") && ($("#year").textContent = new Date().getFullYear());
  $("#scrollPricing")?.addEventListener("click", ()=>$("#pricing")?.scrollIntoView({behavior:"smooth"}));

  const monthly = $("#billMonthly");
  const yearly = $("#billYearly");
  const priceEls = $$("[data-price]");
  const PRICES = { monthly:{starter:9, pro:19, team:39}, yearly:{starter:79, pro:169, team:349} };
  let mode = store.get("billing", "monthly");

  function setPricing(){
    const m = mode==="yearly" ? "yearly" : "monthly";
    priceEls.forEach(el=>{
      el.textContent = PRICES[m][el.dataset.price];
    });
    $$(".price__num .muted").forEach(el=>{
      el.textContent = m==="yearly" ? "/año" : "/mes";
    });
  }
  function setMode(next){
    mode = next;
    store.set("billing", mode);
    monthly?.classList.toggle("is-on", mode==="monthly");
    yearly?.classList.toggle("is-on", mode==="yearly");
    setPricing();
    toast(mode==="yearly" ? "Modo anual" : "Modo mensual");
  }

  monthly?.addEventListener("click", ()=>setMode("monthly"));
  yearly?.addEventListener("click", ()=>setMode("yearly"));
  setMode(mode);

  $$("[data-plan]").forEach(btn=>{
    btn.addEventListener("click", ()=>toast(`Plan elegido: ${btn.dataset.plan}`));
  });

  const acc = $("#faqAcc");
  if(acc){
    const buttons = $$(".acc", acc);
    buttons.forEach(b=>{
      b.addEventListener("click", ()=>{
        const panel = b.nextElementSibling;
        const isOpen = b.getAttribute("aria-expanded")==="true";
        buttons.forEach(x=>{
          x.setAttribute("aria-expanded","false");
          const p = x.nextElementSibling;
          if(p) p.style.maxHeight = 0;
        });
        if(!isOpen){
          b.setAttribute("aria-expanded","true");
          panel.style.maxHeight = panel.scrollHeight+"px";
        }
      });
    });
  }

  const f = $("#leadForm");
  const hint = $("#leadHint");
  f?.addEventListener("submit", (e)=>{
    e.preventDefault();
    const fd = new FormData(f);
    const name = (fd.get("name")||"").toString().trim();
    const email = (fd.get("email")||"").toString().trim();
    const msg = (fd.get("msg")||"").toString().trim();

    if(name.length<2) return toast("Nombre muy corto");
    if(!email.includes("@")) return toast("Email inválido");
    if(msg.length<8) return toast("Mensaje demasiado corto");

    const leads = store.get("leads", []);
    leads.unshift({name,email,msg,at:new Date().toISOString()});
    store.set("leads", leads);

    f.reset();
    if(hint) hint.textContent = "Enviado ✓ (demo). Guardado en localStorage.";
    toast("Mensaje enviado ✨");
  });
}

/* ========= INIT (a prueba de bombas) ========= */
document.addEventListener("DOMContentLoaded", ()=>{
  initTheme();
  initShop();
  initDashboard();
  initLanding();
});
