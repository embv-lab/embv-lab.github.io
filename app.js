// Laboratorio EMBV · web pública de consulta.
// Los datos vienen de datos/reactivos.json, que exporta pagina/export.py del
// repositorio privado. No editar datos químicos acá.

import { crearAprender } from "./aprender.js";

// Fecha de los datos que trae esta versión. Actualizarla al reemplazar el JSON.
const ACTUALIZADO = "19/10/2026";

let D;
try {
  const res = await fetch("datos/reactivos.json");
  if (!res.ok) throw new Error(res.status);
  D = await res.json();
} catch (e) {
  document.querySelector("main").innerHTML = `<div class="placa color rojo"><div class="cab"><span class="simbolo">${icon("warning", "fill")}</span><h3>No se pudieron cargar las fichas</h3></div><p>Revisá la conexión y volvé a abrir la página. Ante una emergencia: <b>107</b> · Intoxicaciones <b>0800-333-0160</b>.</p></div>`;
  throw e;
}
const R = D.reactivos;
const RI = Object.fromEntries(R.map(r => [r.id, r]));
const PIC_NOM = {GHS01:"Explosivo",GHS02:"Inflamable",GHS03:"Comburente",GHS04:"Gas a presión",GHS05:"Corrosivo",GHS06:"Toxicidad aguda",GHS07:"Nocivo o irritante",GHS08:"Peligro para la salud",GHS09:"Peligro para el ambiente"};
// Clase de almacenamiento → color de familia (los mismos grupos que los carteles).
const CL_COLOR = {A1:"--c-infl",A2:"--c-infl",F:"--c-ox",BC:"--c-cor",D:"--c-cor",E:"--c-cor",G:"--c-tox",H:"--c-esp"};
const CL_CLARO = new Set(["F"]); // fondo amarillo: texto negro
const SEC_NOMBRE = {"CAJA-RE":"Caja de riesgo especial","MATERIAL":"Material didáctico"};
// Sección → clase. Las secciones son los destinos de los QR de los carteles
// (documento 12): #E1-4 … #E2-9, #CAJA-RE y #MATERIAL.
const SEC = Object.fromEntries(Object.entries(D.seccion).map(([cl, s]) => [s, cl]));
// Los mismos avisos que lleva el cartel impreso de esas secciones.
const SEC_AVISO = {
  F: ["fire-fill", "Los oxidantes alimentan el fuego: no se sofocan."],
  H: ["fire-extinguisher-fill", "No usar agua ni extintor de CO₂: sólo arena seca. Manipula únicamente el ayudante de laboratorio."],
};
const VIA_ICON = {"Ojos":"eye", "Piel":"hand-palm", "Inhalación":"wind", "Ingestión":"fork-knife"};

let view = "reactivos", curSec = null, curLec = null;

const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const plain = s => String(s ?? "").replace(/<[^>]+>/g, "");
// Primera letra en mayúscula, aunque el texto empiece con una etiqueta (<b>…).
const may = s => String(s ?? "").replace(/^((?:\s|<[^>]+>)*)(\p{Ll})/u, (m, a, b) => a + b.toUpperCase());
const reduce = matchMedia("(prefers-reduced-motion: reduce)");
// Separador con espacio propio: Overpass pega el punto medio al texto que sigue.
const SEP = `<span class="sep" aria-hidden="true">·</span><span class="sr">, </span>`;

// ---------- dibujo ----------
function icon(n, w = "bold", cls = "ic"){ return `<svg class="${cls}" aria-hidden="true"><use href="iconos.svg#i-${n}-${w}"/></svg>`; }
const picto = (code, size = 28) => `<svg class="ghs" width="${size}" height="${size}" role="img" aria-label="${esc(PIC_NOM[code] || code)}"><use href="iconos.svg#${code}"/></svg>`;
const PROHIBIDO = `<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="19.5" fill="none" stroke="currentColor" stroke-width="6"/><path d="M10.5 10.5 37.5 37.5" stroke="currentColor" stroke-width="6"/></svg>`;
function nfpa(n, size = 56){
  const [h, f, r, s] = n;
  const sp = s === "W" ? `<text x="50" y="84" text-anchor="middle" font-size="15" font-weight="800" fill="#111" text-decoration="line-through">W</text><line x1="40" y1="79" x2="60" y2="79" stroke="#111" stroke-width="2"/>`
         : s ? `<text x="50" y="84" text-anchor="middle" font-size="13" font-weight="800" fill="#111">${esc(s)}</text>` : "";
  return `<svg class="ghs" width="${size}" height="${size}" viewBox="0 0 100 100" role="img" aria-label="Rombo NFPA 704: salud ${h}, inflamabilidad ${f}, reactividad ${r}${s ? ", " + s : ""}">
    <g stroke="#111" stroke-width="1.6" stroke-linejoin="round">
    <path d="M50 2 74 26 50 50 26 26Z" fill="#e1251b"/><path d="M26 26 50 50 26 74 2 50Z" fill="#1f5fbf"/>
    <path d="M74 26 98 50 74 74 50 50Z" fill="#f6c700"/><path d="M50 50 74 74 50 98 26 74Z" fill="#fff"/></g>
    <g font-family="Overpass,Arial,sans-serif" font-weight="800" font-size="21" text-anchor="middle">
    <text x="50" y="34" fill="#fff">${f}</text><text x="26" y="58" fill="#fff">${h}</text><text x="74" y="58" fill="#111">${r}</text></g>${sp}</svg>`;
}
const sig = s => s === "Peligro" ? `<span class="palabra pel">Peligro</span>` : s === "Atención" ? `<span class="palabra ate">Atención</span>` : `<span class="palabra nc">Sin clasificar</span>`;
const secLabel = s => SEC_NOMBRE[s] || s;
const claseStyle = cl => `--clase:var(${CL_COLOR[cl] || "--c-neu"})`;
const claro = cl => CL_CLARO.has(cl) ? " claro" : "";
const incompatibles = cl => Object.entries(D.mclase[cl] || {}).filter(([, v]) => v === 2).map(([k]) => k);
function placa(color, ic, titulo, cuerpo, extra = ""){
  return `<div class="placa color ${color}${extra}"><div class="cab"><span class="simbolo">${icon(ic, "fill")}</span><h3>${titulo}</h3></div>${cuerpo}</div>`;
}

// ---------- reactivos ----------
const FILT = [["pel","Peligro"],["cri","Ficha completa"],["baja","Uso desaconsejado"]];
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
function filaHTML(r, conSec = true){
  return `<li><button class="fila" type="button" data-r="${r.id}">
    <span class="n"><b>${esc(r.nom)}</b><span class="meta">${sig(r.sen)}<span class="mono">${r.id}</span>${r.form && r.form !== "—" ? `<span>${r.form}</span>` : ""}${conSec ? `<span class="etq">${esc(secLabel(r.dest))}</span>` : ""}${r.baja ? `<span class="etq">Desaconsejado</span>` : ""}</span></span>
    <span class="pics">${r.pic.map(p => picto(p, 30)).join("")}</span>${icon("caret-right", "bold", "ic chev")}</button></li>`;
}
function renderReactivos(){
  const list = R.filter(r => match(r, fstate.q) && (!fstate.sec || r.dest === fstate.sec) && [...fstate.chips].every(k =>
    k === "cri" ? r.cri : k === "baja" ? r.baja : k === "pel" ? r.sen === "Peligro" : true));
  $("#rcount").innerHTML = `${list.length} ${list.length === 1 ? "reactivo" : "reactivos"}${SEP}${list.reduce((s, r) => s + r.nenv, 0)} envases`;
  $("#rlist").innerHTML = list.length ? list.map(r => filaHTML(r)).join("")
    : `<li class="vacio"><b>Ningún reactivo coincide.</b><span>Probá con otra parte del nombre o con la fórmula. Si el frasco no figura, tratalo como peligroso y consultá al ayudante de laboratorio.</span></li>`;
}

// ---------- sección (QR del cartel) ----------
function localizador(s){
  const fila = cls => cls.map(cl => `<i class="${D.seccion[cl] === s ? "aqui" : ""}"></i>`).join("");
  return `<div class="loc" role="img" aria-label="Ubicación en el estante: ${esc(s)}">${fila(D.filaE2)}${fila(D.filaE1)}<span class="loc-cap">Usted está aquí</span></div>`;
}
function renderSeccion(){
  const s = curSec, cl = SEC[s];
  const rs = R.filter(r => r.dest === s).sort((a, b) => a.nom.localeCompare(b.nom, "es"));
  const nenv = rs.reduce((t, r) => t + r.nenv, 0);
  const enEstante = D.filaE1.includes(cl) || D.filaE2.includes(cl);
  const nivel = D.filaE2.includes(cl) ? "Estante de arriba" : D.filaE1.includes(cl) ? "Estante de abajo" : "Fuera del estante";
  const pics = [...new Set(rs.flatMap(r => r.pic))].sort();
  const inc = incompatibles(cl);
  const av = SEC_AVISO[cl];
  $("#v-seccion").innerHTML = `
    <div class="placa color cartel${claro(cl)}" style="${claseStyle(cl)}">
      <span class="cod">${esc(s)}</span>
      <div><h1>${esc(D.clases[cl])}</h1><p class="meta">${nivel}${SEP}${nenv} ${nenv === 1 ? "envase" : "envases"}${enEstante ? ` de ${D.capacidad}` : ""}</p></div>
      ${enEstante ? localizador(s) : `<span class="fuera">${icon("map-pin", "fill")}Fuera del estante</span>`}
    </div>
    ${av ? placa("rojo", av[0].replace("-fill", ""), "Atención", `<p>${esc(av[1])}</p>`) : ""}
    <div class="grupo"><h2 class="h3">Qué se guarda acá${SEP}${rs.length}</h2><ul class="lista">${rs.map(r => filaHTML(r, false)).join("")}</ul></div>
    ${pics.length ? `<div class="placa"><h2 class="h3">Peligros en esta sección</h2><div class="peligros">${pics.map(p => `<figure>${picto(p, 56)}<figcaption>${PIC_NOM[p]}</figcaption></figure>`).join("")}</div></div>` : ""}
    ${enEstante ? `<div class="placa prohibido">${PROHIBIDO}<div><b>No almacenar aquí</b><p>${inc.length ? inc.map(k => `${esc(D.clasesCorto[k])} <span class="mono">(${esc(D.seccion[k])})</span>`).join(", ") : "No hay clases críticamente incompatibles con ésta, pero igual no se mezcla con otras."}</p></div></div>` : ""}
    <div class="acciones"><button class="btn" type="button" data-go="estante">${icon("squares-four")}Ver todo el estante</button><button class="btn" type="button" data-go="reactivos">${icon("magnifying-glass")}Buscar otro reactivo</button></div>`;
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
  dlg.classList.remove("saliendo");
  dlg.innerHTML = fichaHTML(r);
  if (!dlg.open) dlg.showModal();
  dlg.scrollTop = 0;
  // El foco va al título (lo anuncia el lector de pantalla) y no al botón de cerrar.
  $("#fh-t").focus({preventScroll: true});
}
// Cierra con la animación de bajada; el evento "close" del diálogo maneja el historial.
function closeFicha(animar = true){
  const d = $("#ficha"); if (!d.open || d.classList.contains("saliendo")) return;
  if (!animar || reduce.matches){ d.close(); return; }
  d.classList.add("saliendo");
  const fin = () => { d.removeEventListener("animationend", fin); if (d.classList.contains("saliendo")){ d.classList.remove("saliendo"); d.close(); } };
  d.addEventListener("animationend", fin);
  setTimeout(fin, 400);
}
function viaHTML(r){
  const rutas = r.vias.filter(v => RUTAS.includes(v.t));
  const i = Math.max(0, rutas.findIndex(v => v.t === viaSel));
  const sel = rutas[i];
  return `<div class="vias" role="group" aria-label="Primeros auxilios según la vía de exposición" style="--v:${i}">
      ${rutas.map(v => `<button type="button" data-via="${esc(v.t)}" aria-pressed="${v.t === sel?.t}">${icon(VIA_ICON[v.t] || "first-aid", "fill")}${esc(v.t)}</button>`).join("")}
    </div>
    <p class="via-txt" aria-live="polite">${sel ? may(sel.d) : ""}</p>`;
}
function fichaHTML(r){
  const inc = incompatibles(r.cl).map(k => D.clasesCorto[k]);
  const f = r.fds;
  const gen = r.vias.find(v => v.t === "Medida general");
  let n = 0; const e = () => `entra" style="--i:${n++}`;
  return `<div class="hcab"><div class="asa" aria-hidden="true"></div><div class="t"><div>
      <h2 id="fh-t" tabindex="-1">${esc(r.nom)}</h2>
      <div class="sig">${sig(r.sen)}<span class="id">${r.id}</span>${r.baja ? `<span class="etq">Uso desaconsejado</span>` : ""}</div></div>
      <button class="cerrar" type="button" data-close aria-label="Cerrar ficha">${icon("x")}</button></div></div>
  <div class="hcuerpo">
    <div class="identidad ${e()}"><div class="pics">${r.pic.map(p => picto(p, 58)).join("")}</div>${nfpa(r.nfpa, 58)}</div>
    <div class="tels ${e()}">
      <a class="tel" href="tel:107">${icon("phone-call", "fill")}<span><small>Emergencias</small><b>107</b></span></a>
      <a class="tel" href="tel:100">${icon("fire", "fill")}<span><small>Bomberos</small><b>100</b></span></a>
      <a class="tel ancho" href="tel:08003330160">${icon("first-aid", "fill")}<span><small>Intoxicaciones (CNI)</small><b>0800-333-0160</b></span></a>
    </div>
    <div class="${e()}">${placa("verde", "first-aid", "Primeros auxilios", `${gen ? `<p class="gen">${may(gen.d)}</p>` : ""}<div id="via">${viaHTML(r)}</div>`)}</div>
    <div class="dos ${e()}">
      ${placa("amarillo", "warning", "Si se derrama", `<p>${r.derrame}</p>`)}
      ${placa("rojo", "fire-extinguisher", "Si hay fuego", `<p>${r.fuego}</p>`)}
    </div>
    <div class="${e()}">${placa("azul", "goggles", "Protección obligatoria", `<ul style="margin:0;padding-left:18px;display:grid;gap:6px">${r.epp.map(x => `<li>${x}</li>`).join("")}</ul>`)}</div>
    <div class="placa ${e()}"><h3 class="h3">Peligros</h3>${r.h.length ? `<ul class="frases">${r.h.map(h => `<li><span>${esc(hText(h, D.H))}<span class="cod">${h}</span></span></li>`).join("")}</ul>` : `<p>No clasificado como peligroso.</p>`}</div>
    <div class="placa prohibido ${e()}">${PROHIBIDO}<div><b>No guardar junto a</b><p>${esc(r.inc)}${inc.length ? `. Clases del estante: ${inc.map(esc).join(", ")}.` : ""}</p></div></div>
    <div class="placa ${e()}"><h3 class="h3">Dónde se guarda</h3>
      <div class="grupo"><button class="seccion-chip${claro(r.cl)}" type="button" data-sec="${esc(r.dest)}" style="${claseStyle(r.cl)}">${icon("map-pin", "fill")}${esc(secLabel(r.dest))}</button>
      <dl class="datos">
        <dt>Clase</dt><dd>${esc(D.clases[r.cl])}</dd>
        ${r.form && r.form !== "—" ? `<dt>Fórmula</dt><dd>${r.form}</dd>` : ""}
        <dt>CAS</dt><dd class="mono">${esc(r.cas || "Mezcla o producto comercial")}</dd>
        <dt>Estado</dt><dd>${esc(r.est)}</dd>
        <dt>En el inventario</dt><dd>${esc(r.inv)}${SEP}${esc(r.cant)}</dd>
      </dl></div></div>
    ${r.obs && !r.ver ? `<div class="placa ${e()}"><p>${esc(r.obs)}</p></div>` : ""}
    <details class="mas ${e()}"><summary>Manipulación y eliminación${icon("caret-down")}</summary><div class="dc">
      <ul>${r.manip.map(x => `<li>${x}</li>`).join("")}</ul><p>${r.elim}</p></div></details>
    <details class="mas ${e()}"><summary>Consejos de prudencia (frases P)${icon("caret-down")}</summary><div class="dc">
      <ul class="frases">${r.p.map(p => `<li><span>${esc(hText(p, D.P))}<span class="cod">${p}</span></span></li>`).join("")}</ul></div></details>
    ${f ? `<details class="mas ${e()}"><summary>Ficha completa de 16 secciones${icon("caret-down")}</summary><div class="dc"><div class="kv">
      ${[["Aspecto", f.asp], ["Olor", f.olo], ["pH", f.pH], ["Punto de fusión", f.pf], ["Punto de ebullición", f.pe], ["Punto de inflamación", f.pi], ["Densidad", f.den], ["Solubilidad", f.sol], ["N.º ONU", f.un], ["Clase de transporte", f.cla], ["Grupo de embalaje", f.ge]].map(([k, v]) => `<div><span>${k}</span>${v || D.nd}</div>`).join("")}</div>
      <p><b>Toxicología.</b> ${f.tox || D.nd}</p><p><b>Ecología.</b> ${f.eco || D.nd}</p>${f.ext ? `<p><b>Extinción.</b> ${f.ext}</p>` : ""}${f.epp ? `<p><b>Protección.</b> ${f.epp}</p>` : ""}</div></details>` : ""}
    <p class="nota">Fuente: documentos 04${r.cri ? " y 05" : ""} del sistema de seguridad del laboratorio, generados de la misma base que las etiquetas.</p>
  </div>`;
}
function cambiarVia(t){
  viaSel = t;
  const box = $("#via"); if (!box || !fichaId) return;
  const r = RI[fichaId], rutas = r.vias.filter(v => RUTAS.includes(v.t));
  const i = rutas.findIndex(v => v.t === t); if (i < 0) return;
  box.querySelector(".vias").style.setProperty("--v", i);
  box.querySelectorAll("[data-via]").forEach(b => b.setAttribute("aria-pressed", b.dataset.via === t));
  const p = box.querySelector(".via-txt");
  p.innerHTML = may(rutas[i].d);
  p.classList.remove("cambia"); void p.offsetWidth; p.classList.add("cambia");
}

// ---------- estante ----------
function celda(cl, conLista = false){
  const s = D.seccion[cl], rs = R.filter(r => r.dest === s), env = rs.reduce((t, r) => t + r.nenv, 0);
  return `<button class="celda${claro(cl)}" type="button" data-sec="${s}" style="${claseStyle(cl)}">
    <span class="sc">${esc(secLabel(s))}</span>
    <span><span class="cn">${esc(conLista ? D.clases[cl] : D.clasesCorto[cl])}</span><br><span class="cap">${rs.length} reactivos${SEP}${env} envases</span></span></button>`;
}
function renderEstante(){
  $("#shelf").innerHTML = `
    <div class="nivel"><h2>Estante de arriba${SEP}E2</h2><div class="fila6">${D.filaE2.map(cl => celda(cl)).join("")}</div></div>
    <div class="nivel"><h2>Estante de abajo${SEP}E1</h2><div class="fila6">${D.filaE1.map(cl => celda(cl)).join("")}</div></div>
    <div class="nivel"><h2>Fuera del estante</h2><div class="fuera-est">${["H", "M"].map(cl => celda(cl, true)).join("")}</div></div>`;
}
function setupCompat(){
  const opts = `<option value="">Elegir reactivo…</option>` + [...R].sort((a, b) => a.nom.localeCompare(b.nom, "es")).map(r => `<option value="${r.id}">${esc(r.nom)} (${r.id})</option>`).join("");
  $("#ca").innerHTML = opts; $("#cb").innerHTML = opts;
  const upd = () => {
    const a = RI[$("#ca").value], b = RI[$("#cb").value];
    if (!a || !b){ $("#cverdict").innerHTML = ""; return; }
    const n = a.gr === b.gr ? 0 : (D.matriz[a.gr] || {})[b.gr] ?? 0;
    const mot = D.motivos[a.gr + "|" + b.gr] || D.motivos[b.gr + "|" + a.gr] || "";
    const [color, ic, tit, txt] = n === 2 ? ["rojo", "x", "Incompatibles: nunca juntos", mot ? `Motivo: ${mot}.` : "Grupos químicamente incompatibles según el criterio 2.3 del instructivo."]
      : n === 1 ? ["amarillo", "warning", "En el mismo estante, separados", "Requieren separación física: material no reactivo en el medio o secciones distintas."]
      : ["verde", "shield-check", "Compatibles", "Pueden compartir sección."];
    $("#cverdict").innerHTML = placa(color, ic, tit, `<p>${esc(txt)}</p><p>${esc(a.nom)}: ${esc(D.gruposNom[a.gr] || a.gr)} (${a.dest})${SEP}${esc(b.nom)}: ${esc(D.gruposNom[b.gr] || b.gr)} (${b.dest}).</p>`, " veredicto");
  };
  $("#ca").addEventListener("change", upd); $("#cb").addEventListener("change", upd);
}

// ---------- emergencia ----------
function renderEmergencia(){ renderEsearch(); }
function renderEsearch(){
  const q = $("#eq").value.trim();
  if (!q){ $("#eres").innerHTML = `<p class="cuenta">Muestra los primeros auxilios, cómo apagar un incendio y cómo contener un derrame de ese producto.</p>`; return; }
  const list = R.filter(r => match(r, q)).slice(0, 4);
  $("#eres").innerHTML = list.length ? list.map(r => `<div class="placa grupo">
      <div class="identidad" style="justify-content:space-between"><div><h3 style="font-size:1.2rem;font-weight:800">${esc(r.nom)}</h3><div class="sig" style="margin-top:4px">${sig(r.sen)}</div></div><div class="pics" style="display:flex;gap:4px">${r.pic.map(p => picto(p, 40)).join("")}</div></div>
      <ul class="frases aux">${r.vias.filter(v => RUTAS.includes(v.t)).map(v => `<li><span><b>${esc(v.t)}:</b> ${v.d}</span></li>`).join("")}</ul>
      <div class="dos">${placa("amarillo", "warning", "Si se derrama", `<p>${r.derrame}</p>`)}${placa("rojo", "fire-extinguisher", "Si hay fuego", `<p>${r.fuego}</p>`)}</div>
      <button class="btn" type="button" data-r="${r.id}" style="justify-self:start">Ver la ficha completa${icon("caret-right")}</button></div>`).join("")
    : placa("rojo", "warning", "No está en el inventario", `<p>Si no se sabe qué es, tratarlo como peligroso: avisar, alejarse y llamar al <b>107</b>.</p>`);
}

// ---------- aprender ----------
const aprender = crearAprender({D, R, RI, $, esc, icon, picto, nfpa, sig, placa, may, secLabel, claseStyle, claro, SEP});
// Cada lección tiene su propio enlace (#aprender/etiqueta…) y entra al historial: "atrás" vuelve al índice.
const irLeccion = id => { location.hash = id ? "#aprender/" + id : "#aprender"; };
document.addEventListener("keydown", e => aprender.tecla(e, irLeccion));

// ---------- eventos ----------
document.addEventListener("click", e => {
  if (aprender.click(e, irLeccion)) return;
  const go = e.target.closest("[data-go]"); if (go){ setView(go.dataset.go); return; }
  const vb = e.target.closest("[data-v]"); if (vb){ if (vb.dataset.v === "aprender") curLec = null; setView(vb.dataset.v); return; }
  const rb = e.target.closest("[data-r]"); if (rb){ e.preventDefault(); openFicha(rb.dataset.r); return; }
  if (e.target.closest("[data-close]")){ closeFicha(); return; }
  const via = e.target.closest("[data-via]"); if (via){ cambiarVia(via.dataset.via); return; }
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
$("#ficha").addEventListener("cancel", e => { e.preventDefault(); closeFicha(); });
$("#ficha").addEventListener("click", e => { if (e.target === $("#ficha")) closeFicha(); });
$("#btn-sos").addEventListener("click", () => setView("emergencia"));
$("#eq").addEventListener("input", renderEsearch);

// ---------- navegación ----------
const VIEWS = ["reactivos", "estante", "aprender", "emergencia", "seccion"];
const viewHash = () => view === "seccion" ? curSec : view === "aprender" && curLec ? "aprender/" + curLec : view;
let primera = true;
function setView(v){
  if (!VIEWS.includes(v) || (v === "seccion" && !curSec)) v = "reactivos";
  view = v; closeFicha(false);
  const pintar = () => {
    for (const x of VIEWS) $("#v-" + x).hidden = x !== v;
    document.querySelectorAll("[data-v]").forEach(b => b.dataset.v === v ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current"));
    ({reactivos: renderReactivos, estante: renderEstante, emergencia: renderEmergencia, seccion: renderSeccion, aprender: () => aprender.render(curLec)})[v]();
    window.scrollTo(0, 0);
  };
  if (location.hash !== "#" + viewHash()) history.replaceState(null, "", "#" + viewHash());
  if (!primera && document.startViewTransition && !reduce.matches){
    // Si se navega rápido, una transición corta a la anterior: no es un error.
    const t = document.startViewTransition(pintar);
    t.ready.catch(() => {}); t.finished.catch(() => {});
  } else pintar();
  primera = false;
}
function showSec(s){ if (!SEC[s]) return; curSec = s; setView("seccion"); }
function route(){
  const h = decodeURIComponent(location.hash.slice(1)).toUpperCase();
  if (/^R\d{3}$/.test(h) && RI[h]){ if ($("#v-" + view).hidden) setView("reactivos"); openFicha(h, false); return; }
  // Volver de una ficha a la vista que estaba abajo: no se redibuja ni se pierde el scroll.
  if (!$("#v-" + view).hidden && h === viewHash().toUpperCase()){ closeFicha(); return; }
  if (SEC[h]){ showSec(h); return; }
  const m = h.match(/^APRENDER(?:\/([A-Z]+))?$/);
  if (m){ const id = m[1]?.toLowerCase() || null; curLec = id && aprender.hayLeccion(id) ? id : null; setView("aprender"); return; }
  setView(h.toLowerCase());
}
window.addEventListener("hashchange", route);

// ---------- arranque ----------
setupReactivos(); setupCompat();
$("#ver-datos").textContent = `Datos actualizados al ${ACTUALIZADO}.`;
for (const x of VIEWS) $("#v-" + x).hidden = true;
route();
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
