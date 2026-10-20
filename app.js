// Laboratorio EMBV · web pública de consulta.
// Los datos vienen de datos/reactivos.json, que exporta pagina/export.py del
// repositorio privado. No editar datos químicos acá.

// Fecha de los datos que trae esta versión. Actualizarla al reemplazar el JSON.
const ACTUALIZADO = "19/10/2026";

let D;
try {
  const res = await fetch("datos/reactivos.json");
  if (!res.ok) throw new Error(res.status);
  D = await res.json();
} catch (e) {
  document.querySelector("main").innerHTML = `<div class="alert crit" style="margin-top:24px"><b>No se pudieron cargar las fichas.</b>Revisá la conexión y volvé a abrir la página. Ante una emergencia: 107 · Intoxicaciones 0800-333-0160.</div>`;
  throw e;
}
const R = D.reactivos;
const RI = Object.fromEntries(R.map(r => [r.id, r]));
const PIC_NOM = {GHS01:"Explosivo",GHS02:"Inflamable",GHS03:"Comburente",GHS04:"Gas a presión",GHS05:"Corrosivo",GHS06:"Toxicidad aguda",GHS07:"Nocivo o irritante",GHS08:"Peligro para la salud",GHS09:"Peligro para el ambiente"};
const CL_COLOR = {A1:"--c-infl",A2:"--c-infl",F:"--c-ox",BC:"--c-cor",D:"--c-cor",E:"--c-cor",G:"--c-tox",H:"--c-esp"};
const SEC_NOMBRE = {"CAJA-RE":"Caja estanca de riesgo especial","MATERIAL":"Zona de material didáctico"};
// Sección → clase. Las secciones son los destinos de los QR de los carteles
// (documento 12): #E1-4 … #E2-9, #CAJA-RE y #MATERIAL.
const SEC = Object.fromEntries(Object.entries(D.seccion).map(([cl, s]) => [s, cl]));
// Los mismos avisos que lleva el cartel impreso de esas secciones.
const SEC_AVISO = {
  F: "Los oxidantes alimentan el fuego: no se sofocan.",
  H: "No usar agua ni extintor de CO₂: sólo arena seca. Manipulación restringida al ayudante de laboratorio.",
};

let view = "reactivos", curSec = null;

const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const plain = s => String(s ?? "").replace(/<[^>]+>/g, "");

// ---------- dibujo ----------
const picto = (code, size = 26) => `<svg class="picto" width="${size}" height="${size}" role="img" aria-label="${esc(PIC_NOM[code] || code)}"><use href="#${code}"/></svg>`;
function nfpa(n, size = 84){
  const [h, f, r, s] = n;
  const sp = s === "W" ? `<text x="50" y="84" text-anchor="middle" font-size="15" font-weight="800" fill="#111" font-family="Archivo,Arial" text-decoration="line-through">W</text><line x1="40" y1="79" x2="60" y2="79" stroke="#111" stroke-width="2"/>`
         : s ? `<text x="50" y="84" text-anchor="middle" font-size="13" font-weight="800" fill="#111" font-family="Archivo,Arial">${esc(s)}</text>` : "";
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="Rombo NFPA: salud ${h}, inflamabilidad ${f}, reactividad ${r}${s ? ", " + s : ""}">
    <g stroke="#111" stroke-width="1.6">
    <path d="M50 2 74 26 50 50 26 26Z" fill="#d7261e"/><path d="M26 26 50 50 26 74 2 50Z" fill="#1f5fbf"/>
    <path d="M74 26 98 50 74 74 50 50Z" fill="#f2c200"/><path d="M50 50 74 74 50 98 26 74Z" fill="#fff"/></g>
    <g font-family="Archivo,Arial" font-weight="800" font-size="20" text-anchor="middle">
    <text x="50" y="34" fill="#fff">${f}</text><text x="26" y="57" fill="#fff">${h}</text><text x="74" y="57" fill="#111">${r}</text></g>${sp}</svg>`;
}
const sig = s => s === "Peligro" ? `<span class="sig pel">PELIGRO</span>` : s === "Atención" ? `<span class="sig ate">ATENCIÓN</span>` : `<span class="sig nc">Sin clasificar</span>`;
const secLabel = s => SEC_NOMBRE[s] || s;
const incompatibles = cl => Object.entries(D.mclase[cl] || {}).filter(([, v]) => v === 2).map(([k]) => k);

// ---------- reactivos ----------
const FILT = [["pel","PELIGRO"],["cri","Ficha completa"],["baja","Uso desaconsejado"]];
const fstate = {q:"", sec:"", chips:new Set()};
function setupReactivos(){
  const secs = [...new Set(R.map(r => r.dest))].sort();
  $("#fsec").innerHTML = `<option value="">Todas las secciones</option>` + secs.map(s => `<option value="${s}">${esc(secLabel(s))} · ${esc(D.clasesCorto[SEC[s]] || "")}</option>`).join("");
  $("#fchips").innerHTML = FILT.map(([k, l]) => `<button class="chip" type="button" data-f="${k}" aria-pressed="false">${l}</button>`).join("");
  $("#q").addEventListener("input", e => { fstate.q = e.target.value; renderReactivos(); });
  $("#fsec").addEventListener("change", e => { fstate.sec = e.target.value; renderReactivos(); });
  $("#fchips").addEventListener("click", e => { const b = e.target.closest(".chip"); if (!b) return; const k = b.dataset.f;
    fstate.chips.has(k) ? fstate.chips.delete(k) : fstate.chips.add(k); b.setAttribute("aria-pressed", fstate.chips.has(k)); renderReactivos(); });
}
const norm = s => plain(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
function match(r, q){ if (!q) return true; const n = norm(q); return [r.id, r.nom, r.inv, r.cas, r.form].some(x => norm(x).includes(n)); }
function rowHTML(r, conSec = true){
  return `<button class="ritem" type="button" data-r="${r.id}"><span class="rid">${r.id}</span>
    <span class="rn"><b>${esc(r.nom)}</b><span class="meta">${r.form ? `<span>${r.form}</span>` : ""}${sig(r.sen)}${conSec ? `<span class="mono">${esc(r.dest)}</span>` : ""}${r.baja ? `<span class="pill neu">Desaconsejado</span>` : ""}</span></span>
    <span class="rr"><span class="pics" style="gap:2px">${r.pic.map(p => picto(p, 24)).join("")}</span></span></button>`;
}
function renderReactivos(){
  const list = R.filter(r => match(r, fstate.q) && (!fstate.sec || r.dest === fstate.sec) && [...fstate.chips].every(k =>
    k === "cri" ? r.cri : k === "baja" ? r.baja : k === "pel" ? r.sen === "Peligro" : true));
  $("#rcount").textContent = `${list.length} ${list.length === 1 ? "reactivo" : "reactivos"} · ${list.reduce((s, r) => s + r.nenv, 0)} envases`;
  $("#rlist").innerHTML = list.length ? list.map(r => rowHTML(r)).join("") : `<div class="empty">Ningún reactivo coincide con la búsqueda.</div>`;
}

// ---------- sección (QR del cartel) ----------
function renderSeccion(){
  const s = curSec, cl = SEC[s];
  const rs = R.filter(r => r.dest === s).sort((a, b) => a.nom.localeCompare(b.nom, "es"));
  const nenv = rs.reduce((t, r) => t + r.nenv, 0);
  const enEstante = D.filaE1.includes(cl) || D.filaE2.includes(cl);
  const nivel = D.filaE2.includes(cl) ? "Estante de arriba (E2)" : D.filaE1.includes(cl) ? "Estante de abajo (E1)" : "Fuera del estante";
  const pics = [...new Set(rs.flatMap(r => r.pic))].sort();
  const inc = incompatibles(cl);
  $("#v-seccion").innerHTML = `
    <div class="sechead" style="border-top-color:var(${CL_COLOR[cl] || "--c-neu"})">
      <span class="code">${esc(s)}</span>
      <h2>${esc(D.clases[cl])}</h2>
      <span class="cap">${nivel} · ${nenv} ${nenv === 1 ? "envase" : "envases"}${enEstante ? ` de ${D.capacidad} de capacidad` : ""}</span>
    </div>
    ${SEC_AVISO[cl] ? `<div class="alert crit"><b>${esc(SEC_AVISO[cl])}</b></div>` : ""}
    <div class="fsec"><h3>Qué se guarda acá (${rs.length})</h3>
      <p class="muted" style="font-size:.9rem">Tocá un producto para ver su ficha: primeros auxilios, derrame, incendio y peligros.</p>
      <div class="rlist">${rs.map(r => rowHTML(r, false)).join("")}</div></div>
    ${pics.length ? `<div class="fsec"><h3>Peligros presentes en esta sección</h3><div class="hazrow">${pics.map(p => `<figure>${picto(p, 48)}<figcaption>${PIC_NOM[p]}</figcaption></figure>`).join("")}</div></div>` : ""}
    ${enEstante ? `<div class="never"><b>No almacenar aquí</b><span>${inc.length ? inc.map(k => `${esc(D.clasesCorto[k])} <span class="mono muted">(${esc(D.seccion[k])})</span>`).join(", ") : "No hay clases críticamente incompatibles con ésta, pero igual no se mezcla con otras."}</span></div>` : ""}
    <div class="secnav"><button class="btn" type="button" data-go="estante">Ver todo el estante</button><button class="btn" type="button" data-go="reactivos">Buscar otro reactivo</button></div>`;
}

// ---------- ficha ----------
function hText(code, map){ return map[code] || code.split("+").map(c => map[c] || c).join(" "); }
let fichaId = null, fichaPush = false;
// Vías de exposición de los primeros auxilios. Arranca en "Ojos": es la
// salpicadura más frecuente en el laboratorio y la que menos espera (15 minutos
// de lavado), así que la ficha abre mostrando esa y no una pantalla vacía.
const RUTAS = ["Ojos", "Piel", "Inhalación", "Ingestión"];
let viaSel = RUTAS[0];
function openFicha(id, push = true){
  const r = RI[id]; if (!r) return;
  if (fichaId !== id) viaSel = RUTAS[0];
  fichaId = id;
  // pushState para que "atrás" en el celular cierre la ficha en vez de salir de la página.
  if (location.hash !== "#" + id){ history[push ? "pushState" : "replaceState"](null, "", "#" + id); fichaPush = push; }
  else fichaPush = false;
  const dlg = $("#ficha");
  dlg.innerHTML = fichaHTML(r);
  if (!dlg.open) dlg.showModal();
  dlg.scrollTop = 0;
}
function closeFicha(){ const d = $("#ficha"); if (d.open) d.close(); }
function fichaHTML(r){
  const inc = incompatibles(r.cl).map(k => D.clasesCorto[k]);
  const f = r.fds;
  const gen = r.vias.find(v => v.t === "Medida general");
  const rutas = r.vias.filter(v => RUTAS.includes(v.t));
  const sel = rutas.find(v => v.t === viaSel) || rutas[0];
  return `<div class="fhead"><div class="t"><span class="eyebrow">${r.id} · Ficha</span><h2 id="fh-t">${esc(r.nom)}</h2><div class="row" style="gap:8px">${sig(r.sen)}${r.baja ? `<span class="pill neu">Uso desaconsejado</span>` : ""}</div></div>
    <div class="fid">${r.pic.map(p => picto(p, 34)).join("")}${nfpa(r.nfpa, 42)}</div>
    <button class="btn sm" type="button" data-close aria-label="Cerrar ficha">Cerrar</button></div>
  <div class="fbody">
    <div class="telrow">
      <a class="tel" href="tel:107"><span>Emergencias</span><b>107</b></a>
      <a class="tel" href="tel:100"><span>Bomberos</span><b>100</b></a>
      <a class="tel wide" href="tel:08003330160"><span>Intoxicaciones (CNI)</span><b>0800-333-0160</b></a>
    </div>
    <div class="fsec act"><h3>Qué hacer</h3>
      ${gen ? `<p class="gen"><b>${esc(gen.t)}:</b> ${gen.d}</p>` : ""}
      <div class="vias" role="group" aria-label="Primeros auxilios por vía de exposición">
        ${rutas.map(v => `<button class="via" type="button" data-via="${esc(v.t)}" aria-pressed="${v.t === sel.t}">${esc(v.t)}</button>`).join("")}
      </div>
      ${sel ? `<div class="viapanel" id="viapanel" role="region" aria-live="polite"><h4>${esc(sel.t)}</h4><p>${sel.d}</p></div>` : ""}
      <div class="grid2" style="margin-top:4px"><div><h4 class="lbl">En caso de derrame</h4><p>${r.derrame}</p></div>
        <div><h4 class="lbl">En caso de incendio</h4><p>${r.fuego}</p></div></div>
    </div>
    <div class="fsec"><h3>Peligros</h3>${r.h.length ? `<ul class="codes">${r.h.map(h => `<li><span>${esc(hText(h, D.H))}</span><span class="mono">${h}</span></li>`).join("")}</ul>` : `<p class="muted">No clasificado como peligroso.</p>`}</div>
    <div class="fsec"><h3>No guardar junto a</h3><p>${esc(r.inc)}</p>${inc.length ? `<p class="muted" style="font-size:.9rem">Clases del estante incompatibles: ${inc.map(esc).join(", ")}.</p>` : ""}</div>
    <div class="idcard"><dl>
      ${r.form ? `<dt>Fórmula</dt><dd>${r.form}</dd>` : ""}
      <dt>CAS</dt><dd class="mono">${esc(r.cas || "Mezcla o producto comercial")}</dd>
      <dt>Estado</dt><dd>${esc(r.est)}</dd>
      <dt>Clase</dt><dd>${esc(D.clases[r.cl])}</dd>
    </dl><div class="pics">${r.pic.length ? r.pic.map(p => `<figure>${picto(p, 48)}<figcaption>${PIC_NOM[p]}</figcaption></figure>`).join("") : `<span class="muted">Sin pictograma SGA</span>`}</div></div>
    <div class="fsec"><h3>Dónde se guarda</h3><div class="loc"><button class="sec-tag" type="button" data-sec="${esc(r.dest)}" style="background:none;cursor:pointer;color:var(--ink)">${esc(secLabel(r.dest))}</button><span class="muted" style="font-family:var(--f-ui);font-weight:400;font-size:.9rem">${esc(D.clases[r.cl])}</span></div></div>
    ${r.obs && !r.ver ? `<div class="alert info">${esc(r.obs)}</div>` : ""}
    <details class="more fsec"><summary>Manipulación, protección personal y eliminación</summary>
      <div class="grid2" style="margin-top:10px"><div class="fsec"><h3>Manipulación y almacenamiento</h3><ul>${r.manip.map(x => `<li>${x}</li>`).join("")}</ul></div>
        <div class="fsec"><h3>Protección personal</h3><ul>${r.epp.map(x => `<li>${x}</li>`).join("")}</ul></div></div>
      <div class="fsec" style="margin-top:10px"><h3>Eliminación</h3><p>${r.elim}</p></div></details>
    <details class="more fsec"><summary>Consejos de prudencia (frases P de la etiqueta)</summary>
      <ul class="codes" style="margin-top:10px">${r.p.map(p => `<li><span>${esc(hText(p, D.P))}</span><span class="mono">${p}</span></li>`).join("")}</ul></details>
    ${f ? `<details class="more fsec"><summary>Datos de la ficha completa de 16 secciones</summary><div class="kv" style="margin-top:10px">
      ${[["Aspecto", f.asp], ["Olor", f.olo], ["pH", f.pH], ["Punto de fusión", f.pf], ["Punto de ebullición", f.pe], ["Punto de inflamación", f.pi], ["Densidad", f.den], ["Solubilidad", f.sol], ["N.º ONU", f.un], ["Clase de transporte", f.cla], ["Grupo de embalaje", f.ge]].map(([k, v]) => `<div><span>${k}</span>${v || D.nd}</div>`).join("")}</div>
      <div class="fsec" style="margin-top:10px"><p><b>Toxicología.</b> ${f.tox || D.nd}</p><p><b>Ecología.</b> ${f.eco || D.nd}</p>${f.ext ? `<p><b>Extinción.</b> ${f.ext}</p>` : ""}${f.epp ? `<p><b>Protección.</b> ${f.epp}</p>` : ""}</div></details>` : ""}
    <p class="muted" style="font-size:.84rem">Fuente: documentos 04${r.cri ? " y 05" : ""} del sistema de seguridad del laboratorio, generados de la misma base que las etiquetas.</p>
  </div>`;
}

// ---------- estante ----------
function renderEstante(){
  const cell = cl => {
    const s = D.seccion[cl], plan = D.envClase[cl] || 0, n = R.filter(r => r.dest === s).length;
    return `<button class="cell" type="button" data-sec="${s}" style="border-top-color:var(${CL_COLOR[cl] || "--c-neu"})">
      <span class="sc">${s}</span><span class="cn">${esc(D.clasesCorto[cl])}</span>
      <span class="cap">${n} reactivos · ${plan} envases</span></button>`;
  };
  $("#shelf").innerHTML = `<div class="shelfrow"><span class="lvl">E2 · arriba</span>${D.filaE2.map(cell).join("")}</div><div class="shelfrow"><span class="lvl">E1 · abajo</span>${D.filaE1.map(cell).join("")}</div>`;
  $("#offshelf").innerHTML = ["H", "M"].map(cl => {
    const s = D.seccion[cl], rs = R.filter(r => r.dest === s);
    return `<button class="cell" type="button" data-sec="${s}" style="min-height:0;border-top-color:var(${CL_COLOR[cl] || "--c-neu"})"><span class="sc">${esc(secLabel(s))}</span><span class="cn">${esc(D.clases[cl])}</span><span class="cap">${rs.map(r => esc(r.nom)).join(", ")}</span></button>`;
  }).join("");
}
function setupCompat(){
  const opts = `<option value="">Elegir reactivo…</option>` + [...R].sort((a, b) => a.nom.localeCompare(b.nom, "es")).map(r => `<option value="${r.id}">${esc(r.nom)} (${r.id})</option>`).join("");
  $("#ca").innerHTML = opts; $("#cb").innerHTML = opts;
  const upd = () => {
    const a = RI[$("#ca").value], b = RI[$("#cb").value];
    if (!a || !b){ $("#cverdict").innerHTML = ""; return; }
    const n = a.gr === b.gr ? 0 : (D.matriz[a.gr] || {})[b.gr] ?? 0;
    const mot = D.motivos[a.gr + "|" + b.gr] || D.motivos[b.gr + "|" + a.gr] || "";
    const msg = n === 2 ? ["Incompatibles: nunca juntos", mot ? `Motivo: ${mot}.` : "Grupos químicamente incompatibles según el criterio 2.3 del instructivo."]
      : n === 1 ? ["Pueden estar en el mismo estante, separados", "Requieren separación física: material no reactivo en el medio o secciones distintas."]
      : ["Compatibles", "Pueden compartir sección."];
    $("#cverdict").innerHTML = `<div class="verdict v${n}"><b>${msg[0]}</b><span>${esc(msg[1])}</span><span class="muted" style="font-size:.88rem">${esc(a.nom)}: ${esc(D.gruposNom[a.gr] || a.gr)} · ${esc(b.nom)}: ${esc(D.gruposNom[b.gr] || b.gr)}. En el plan: ${a.dest} y ${b.dest}.</span></div>`;
  };
  $("#ca").addEventListener("change", upd); $("#cb").addEventListener("change", upd);
}

// ---------- emergencia ----------
function renderEmergencia(){ renderEsearch(); }
function renderEsearch(){
  const q = $("#eq").value.trim();
  if (!q){ $("#eres").innerHTML = `<p class="muted" style="font-size:.94rem">Muestra primeros auxilios, cómo apagar un incendio y cómo contener un derrame de ese producto.</p>`; return; }
  const list = R.filter(r => match(r, q)).slice(0, 4);
  $("#eres").innerHTML = list.length ? list.map(r => `<div class="panel" style="display:grid;gap:10px;padding:14px"><div class="row" style="justify-content:space-between"><b style="font-family:var(--f-disp);font-size:1.1rem">${esc(r.nom)}</b><span class="row" style="gap:4px">${r.pic.map(p => picto(p, 30)).join("")}</span></div>
    <div class="fsec act"><h3>Primeros auxilios</h3><ul class="codes">${r.vias.filter(v => v.t === "Medida general" || RUTAS.includes(v.t)).map(v => `<li><span><b>${esc(v.t)}:</b> ${v.d}</span></li>`).join("")}</ul></div>
    <div class="grid2"><div class="fsec"><h3>Incendio</h3><p>${r.fuego}</p></div><div class="fsec"><h3>Derrame</h3><p>${r.derrame}</p></div></div>
    <button class="btn sm" type="button" data-r="${r.id}" style="justify-self:start">Ver ficha completa</button></div>`).join("")
    : `<p class="muted">No hay ningún producto con ese nombre en el inventario. Si no se sabe qué es, tratarlo como peligroso: avisar, alejarse y llamar al 107.</p>`;
}

// ---------- eventos ----------
document.addEventListener("click", e => {
  const go = e.target.closest("[data-go]"); if (go){ setView(go.dataset.go); return; }
  const rb = e.target.closest("[data-r]"); if (rb){ e.preventDefault(); openFicha(rb.dataset.r); return; }
  if (e.target.closest("[data-close]")){ closeFicha(); return; }
  const via = e.target.closest("[data-via]"); if (via){ viaSel = via.dataset.via; if (fichaId){ const d = $("#ficha"), st = d.scrollTop; d.innerHTML = fichaHTML(RI[fichaId]); d.scrollTop = st; } return; }
  const sec = e.target.closest("[data-sec]"); if (sec){ showSec(sec.dataset.sec); return; }
});
// Al cerrar la ficha, si la abrimos nosotros con pushState se vuelve atrás en el
// historial (así "atrás" no repite la misma vista); si se entró directo por un
// enlace #R001, se reemplaza por la vista de fondo.
$("#ficha").addEventListener("close", () => {
  if (!/^#R\d+$/i.test(location.hash)) return;
  if (fichaPush){ fichaPush = false; history.back(); }
  else history.replaceState(null, "", "#" + viewHash());
});
$("#ficha").addEventListener("click", e => { if (e.target === $("#ficha")) closeFicha(); });
$("#btn-sos").addEventListener("click", () => setView("emergencia"));
$("#tabs").addEventListener("click", e => { const b = e.target.closest("[data-v]"); if (b) setView(b.dataset.v); });
$("#eq").addEventListener("input", renderEsearch);

// ---------- navegación ----------
const VIEWS = ["reactivos", "estante", "emergencia", "seccion"];
const viewHash = () => view === "seccion" ? curSec : view;
function setView(v){
  if (!VIEWS.includes(v) || (v === "seccion" && !curSec)) v = "reactivos";
  view = v; closeFicha();
  for (const x of VIEWS) $("#v-" + x).hidden = x !== v;
  document.querySelectorAll("#tabs [data-v]").forEach(b => b.setAttribute("aria-selected", b.dataset.v === v));
  if (location.hash !== "#" + viewHash()) history.replaceState(null, "", "#" + viewHash());
  ({reactivos: renderReactivos, estante: renderEstante, emergencia: renderEmergencia, seccion: renderSeccion})[v]();
  window.scrollTo(0, 0);
}
function showSec(s){ if (!SEC[s]) return; curSec = s; setView("seccion"); }
function route(){
  const h = decodeURIComponent(location.hash.slice(1)).toUpperCase();
  if (/^R\d{3}$/.test(h) && RI[h]){ if ($("#v-" + view).hidden) setView("reactivos"); openFicha(h, false); return; }
  // Volver de una ficha a la vista que estaba abajo: no se redibuja ni se pierde el scroll.
  if (!$("#v-" + view).hidden && h === viewHash().toUpperCase()){ closeFicha(); return; }
  if (SEC[h]){ showSec(h); return; }
  setView(h.toLowerCase());
}
window.addEventListener("hashchange", route);

// ---------- arranque ----------
setupReactivos(); setupCompat();
$("#ver-datos").textContent = `Datos actualizados al ${ACTUALIZADO}.`;
for (const x of VIEWS) $("#v-" + x).hidden = true;
route();
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
