// Laboratorio EMBV · web pública de consulta.
// Los datos vienen de datos/reactivos.json, que exporta pagina/export.py del
// repositorio privado. No editar datos químicos acá.

import { crearAprender } from "./aprender.js";
import { crearEstante } from "./estante.js";
import { crearLavado } from "./lavado.js";

// Fecha de los datos que trae esta versión. Actualizarla al reemplazar el JSON.
const ACTUALIZADO = "21/10/2026";

let D;
try {
  const res = await fetch("datos/reactivos.json");
  if (!res.ok) throw new Error(res.status);
  D = await res.json();
} catch (e) {
  document.querySelector("main").innerHTML = `<div class="placa color rojo"><div class="cab"><span class="simbolo">${icon("warning", "fill")}</span><h3>No se pudieron cargar las fichas</h3></div><p>Revisá la conexión y volvé a abrir la página. Ante una emergencia: <b>107</b> · Intoxicaciones <b>0800-333-0160</b>.</p></div>`;
  throw e;
}
document.getElementById("cargando")?.remove();
const R = D.reactivos;
const RI = Object.fromEntries(R.map(r => [r.id, r]));
// Envases del mismo producto con renglón propio en el inventario (R050, R051 y R052 son tres
// frascos de ácido sulfúrico). Cada uno conserva su código y su enlace, porque así figura en su
// etiqueta, pero las listas los muestran una sola vez: tres filas iguales hacían dudar.
const GRUPO = {};
for (const r of R) (GRUPO[r.nom] ||= []).push(r);
const hermanos = r => GRUPO[r.nom];
const unicos = list => list.filter((r, i) => list.findIndex(x => x.nom === r.nom) === i);
const cantidad = r => (r.inv.match(/\d[\d.,]*\s*(?:ml|l|cc|g|kg)\b/i) || [""])[0];
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

let view = "estante", curSec = null, curLec = null;

const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const plain = s => String(s ?? "").replace(/<[^>]+>/g, "");
// Primera letra en mayúscula, aunque el texto empiece con una etiqueta (<b>…).
const may = s => String(s ?? "").replace(/^((?:\s|<[^>]+>)*)(\p{Ll})/u, (m, a, b) => a + b.toUpperCase());
const reduce = matchMedia("(prefers-reduced-motion: reduce)");
// Separador con espacio propio: Overpass pega el punto medio al texto que sigue.
const SEP = `<span class="sep" aria-hidden="true">·</span><span class="sr">, </span>`;
const EASE = "cubic-bezier(.16,1,.3,1)";
// Animación: sólo transform y opacity. Con movimiento reducido no hay animación ni espera.
const anim = (el, kf, o) => { if (reduce.matches || !el?.animate) return Promise.resolve(); const a = el.animate(kf, o); return a.finished.then(() => a, () => a); };

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
const claseVar = cl => CL_COLOR[cl] || "--c-neu";
const claseStyle = cl => `--clase:var(${claseVar(cl)})`;
const claro = cl => CL_CLARO.has(cl) ? " claro" : "";
const incompatibles = cl => Object.entries(D.mclase[cl] || {}).filter(([, v]) => v === 2).map(([k]) => k);
function placa(color, ic, titulo, cuerpo, extra = ""){
  return `<div class="placa color ${color}${extra}"><div class="cab"><span class="simbolo">${icon(ic, "fill")}</span><h3>${titulo}</h3></div>${cuerpo}</div>`;
}
const TELS = `<div class="tels">
  <a class="tel" href="tel:107">${icon("phone-call", "fill")}<span><small>Emergencias</small><b>107</b></span></a>
  <a class="tel" href="tel:100">${icon("fire", "fill")}<span><small>Bomberos</small><b>100</b></span></a>
  <a class="tel ancho" href="tel:08003330160">${icon("first-aid", "fill")}<span><small>Intoxicaciones (CNI)</small><b>0800-333-0160</b></span></a></div>`;

// ---------- buscar ----------
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
  const g = hermanos(r), env = g.reduce((t, x) => t + x.nenv, 0);
  const cods = g.length > 1 ? `<span class="mono">${g.map(x => x.id).join(" · ")}</span><span class="etq">${env} envases</span>` : `<span class="mono">${r.id}</span>`;
  return `<li><button class="fila" type="button" data-r="${r.id}">
    <span class="n"><b>${esc(r.nom)}</b><span class="meta">${sig(r.sen)}${cods}${r.form && r.form !== "—" ? `<span>${r.form}</span>` : ""}${conSec ? `<span class="etq">${esc(secLabel(r.dest))}</span>` : ""}${r.baja ? `<span class="etq">Desaconsejado</span>` : ""}</span></span>
    <span class="pics">${r.pic.map(p => picto(p, 30)).join("")}</span>${icon("caret-right", "bold", "ic chev")}</button></li>`;
}
// El mismo cierre en todas las búsquedas sin resultado: ante la duda, el teléfono.
const NO_FIGURA = `Si el frasco no figura, tratalo como peligroso. Ante una emergencia: <a href="tel:107"><b>107</b></a> · Intoxicaciones <a href="tel:08003330160"><b>0800-333-0160</b></a>.`;
function renderReactivos(){
  const list = R.filter(r => match(r, fstate.q) && (!fstate.sec || r.dest === fstate.sec) && [...fstate.chips].every(k =>
    k === "cri" ? r.cri : k === "baja" ? r.baja : k === "pel" ? r.sen === "Peligro" : true));
  const prod = unicos(list);
  $("#rcount").innerHTML = `${prod.length} ${prod.length === 1 ? "producto" : "productos"}${SEP}${list.reduce((s, r) => s + r.nenv, 0)} envases`;
  $("#rlist").innerHTML = prod.length ? prod.map(r => filaHTML(r)).join("")
    : `<li class="vacio"><b>Ningún reactivo coincide.</b><span>Probá con otra parte del nombre o con la fórmula. ${NO_FIGURA}</span></li>`;
}

// ---------- ficha: la etiqueta del frasco y sus placas de seguridad, apiladas ----------
function hText(code, map){ return map[code] || code.split("+").map(c => map[c] || c).join(" "); }
let fichaId = null, fichaPush = false, carta = 0, arrastreFin = 0;
// Vías de exposición de los primeros auxilios. Arranca en "Ojos": es la
// salpicadura más frecuente en el laboratorio y la que menos espera (15 minutos
// de lavado), así que la ficha abre mostrando esa y no una pantalla vacía.
const RUTAS = ["Ojos", "Piel", "Inhalación", "Ingestión"];
let viaSel = RUTAS[0];
const CARTAS = [["Auxilios", "--verde"], ["Derrame", "--amarillo"], ["Fuego", "--rojo"], ["Protección", "--azul"], ["Ficha completa", "--tinta"]];

function rotuloHTML(r){
  const form = r.form && r.form !== "—" ? r.form : "";
  const g = hermanos(r);
  return `<div class="rotulo" id="rotulo">
    <div class="ro-cab">EMBV · Laboratorio de Ciencias Naturales</div>
    <div class="ro-top"><div class="ro-izq">
        <h2 id="fh-t" tabindex="-1">${esc(r.nom)}</h2>
        <span class="ro-chico">${form}${form && r.cas ? " · " : ""}${r.cas ? "CAS " + esc(r.cas) : ""}</span>
        <div class="ro-pics">${r.pic.map(p => picto(p, 40)).join("")}${sig(r.sen)}</div></div>
      <div class="ro-rombo">${nfpa(r.nfpa, 70)}</div></div>
    ${r.h.length ? `<div class="ro-h"><b>${r.h.join(", ")}</b> ${esc(hText(r.h[r.h.length - 1], D.H))}</div>` : ""}
    <div class="ro-pie"><span><b>${esc(secLabel(r.dest))}</b> · ${esc(D.clasesCorto[r.cl])}</span><span class="mono">${r.id}${g.length > 1 ? ` · ${g.length} envases` : ""}${r.baja ? " · desaconsejado" : ""}</span></div>
  </div>`;
}
function viaHTML(r){
  const rutas = r.vias.filter(v => RUTAS.includes(v.t));
  const i = Math.max(0, rutas.findIndex(v => v.t === viaSel));
  const sel = rutas[i];
  // El contador de lavado aparece donde los datos piden 15 minutos (ojos siempre; piel con corrosivos).
  const lavar = sel && (sel.t === "Ojos" || sel.t === "Piel") && /15\s*minutos/.test(plain(sel.d));
  return `<div class="vias" role="group" aria-label="Primeros auxilios según la vía de exposición" style="--v:${i}">
      ${rutas.map(v => `<button type="button" data-via="${esc(v.t)}" aria-pressed="${v.t === sel?.t}">${icon(VIA_ICON[v.t] || "first-aid", "fill")}${esc(v.t)}</button>`).join("")}
    </div>
    <p class="via-txt" aria-live="polite">${sel ? may(sel.d) : ""}</p>
    ${lavar ? `<button class="b-lavar" type="button" data-lavar="${esc(sel.t)}" data-rid="${r.id}">${icon("drop", "fill")}Contar el lavado <span class="mono">15:00</span></button>` : ""}`;
}
// Placa "Ficha completa": todo lo que hay en los datos del reactivo, ordenado como las secciones
// de una ficha de datos de seguridad (las que existen en los datos), con subtítulos plegables.
function completaHTML(r){
  const f = r.fds, inc = incompatibles(r.cl).map(k => D.clasesCorto[k]), g = hermanos(r);
  const sec = (n, t, cuerpo, abierta = false) => `<details class="mas fc"${abierta ? " open" : ""}><summary><span><span class="fc-n mono">${n}</span>${t}</span>${icon("caret-down")}</summary><div class="dc">${cuerpo}</div></details>`;
  const kv = pares => `<div class="kv">${pares.map(([k, v]) => `<div><span>${k}</span>${v || esc(D.nd)}</div>`).join("")}</div>`;
  const [h, fl, re, es] = r.nfpa;
  return `<div class="cab"><span class="simbolo">${icon("file-text", "fill")}</span><h3>Ficha completa</h3></div>
    <p class="fc-fuente">Fuente: documento 04 (ficha resumida)${f ? " y documento 05 (ficha completa de 16 secciones)" : ""} del sistema de seguridad del laboratorio, generados de la misma base que las etiquetas.</p>
    ${sec("1", "Identificación", `<dl class="datos">
      <dt>Producto</dt><dd>${esc(r.nom)}</dd>
      ${r.form && r.form !== "—" ? `<dt>Fórmula</dt><dd>${r.form}</dd>` : ""}
      <dt>CAS</dt><dd class="mono">${esc(r.cas || "Mezcla o producto comercial")}</dd>
      <dt>Estado</dt><dd>${esc(r.est)}</dd>
      <dt>Código</dt><dd class="mono">${g.map(x => x.id).join(" · ")}</dd>
      <dt>En el inventario</dt><dd>${g.map(x => `${esc(x.inv)} <span class="mono">(${x.id}, ${x.nenv} ${x.nenv === 1 ? "envase" : "envases"})</span>`).join("<br>")}</dd>
      <dt>Clase</dt><dd>${esc(D.clases[r.cl])}</dd></dl>`)}
    ${sec("2", "Identificación de los peligros", `<div class="identidad">${sig(r.sen)}<div class="pics">${r.pic.map(p => picto(p, 44)).join("")}</div>${nfpa(r.nfpa, 52)}</div>
      ${r.pic.length ? `<p>${r.pic.map(p => PIC_NOM[p]).join(", ")}.</p>` : ""}
      <p class="fc-sub">Rombo NFPA 704: salud <b>${h}</b>, inflamabilidad <b>${fl}</b>, reactividad <b>${re}</b>${es ? `, riesgo especial <b>${esc(es)}</b>` : ""}.</p>
      <h4 class="fc-h">Frases H (peligro)</h4>
      ${r.h.length ? `<ul class="frases">${r.h.map(c => `<li><span>${esc(hText(c, D.H))}<span class="cod">${c}</span></span></li>`).join("")}</ul>` : `<p>No clasificado como peligroso.</p>`}
      <h4 class="fc-h">Frases P (prudencia)</h4>
      ${r.p.length ? `<ul class="frases aux">${r.p.map(c => `<li><span>${esc(hText(c, D.P))}<span class="cod">${c}</span></span></li>`).join("")}</ul>` : `<p>Sin consejos de prudencia.</p>`}`, true)}
    ${sec("4", "Primeros auxilios", `<ul class="frases aux">${r.vias.map(v => `<li><span><b>${esc(v.t)}:</b> ${v.d}</span></li>`).join("")}</ul>`)}
    ${sec("5", "Lucha contra incendios", `<p>${r.fuego}</p>${f?.ext ? `<p><b>Medios de extinción.</b> ${f.ext}</p>` : ""}`)}
    ${sec("6", "Derrame accidental", `<p>${r.derrame}</p>`)}
    ${sec("7", "Manipulación y almacenamiento", `<ul>${r.manip.map(x => `<li>${x}</li>`).join("")}</ul>
      <div class="prohibido">${PROHIBIDO}<div><b>No guardar junto a</b><p>${esc(r.inc)}${inc.length ? `. Clases del estante: ${inc.map(esc).join(", ")}.` : ""}</p></div></div>
      <div class="grupo"><span class="fc-sub">Dónde se guarda</span><button class="seccion-chip${claro(r.cl)}" type="button" data-sec="${esc(r.dest)}" style="${claseStyle(r.cl)}">${icon("map-pin", "fill")}${esc(secLabel(r.dest))}</button>
      ${g.length > 1 ? `<div class="envases" role="group" aria-label="${g.length} envases de este producto: elegí el código de la etiqueta">${g.map(x => `<button type="button" data-envase="${x.id}" aria-pressed="${x.id === r.id}"><b>${x.id}</b>${cantidad(x) ? `<span>${esc(cantidad(x))}</span>` : ""}</button>`).join("")}</div>` : ""}</div>`)}
    ${sec("8", "Protección personal", `<ul>${r.epp.map(x => `<li>${x}</li>`).join("")}</ul>${f?.epp ? `<p>${f.epp}</p>` : ""}`)}
    ${f ? sec("9", "Propiedades físicas y químicas", kv([["Aspecto", f.asp], ["Olor", f.olo], ["pH", f.pH], ["Punto de fusión", f.pf], ["Punto de ebullición", f.pe], ["Punto de inflamación", f.pi], ["Densidad", f.den], ["Solubilidad", f.sol]])) : ""}
    ${f ? sec("11", "Información toxicológica", `<p>${f.tox || esc(D.nd)}</p>`) : ""}
    ${f ? sec("12", "Información ecológica", `<p>${f.eco || esc(D.nd)}</p>`) : ""}
    ${sec("13", "Eliminación", `<p>${r.elim}</p>`)}
    ${f ? sec("14", "Transporte", kv([["N.º ONU", f.un], ["Clase de transporte", f.cla], ["Grupo de embalaje", f.ge]])) : ""}
    ${!f ? `<p class="fc-sub">Ficha completa de 16 secciones: ${esc(D.nd)}.</p>` : ""}
    ${r.obs && !r.ver ? `<div class="fc-obs"><b>Observaciones.</b> ${esc(r.obs)}</div>` : ""}`;
}
function cartasHTML(r){
  const gen = r.vias.find(v => v.t === "Medida general");
  return [
    `<section class="placa color verde carta" aria-label="Primeros auxilios"><div class="cab"><span class="simbolo">${icon("first-aid", "fill")}</span><h3>Primeros auxilios</h3><span class="n mono">1/5</span></div><div id="via">${viaHTML(r)}</div>${gen ? `<p class="gen">${may(gen.d)}</p>` : ""}</section>`,
    `<section class="placa color amarillo carta" aria-label="Si se derrama"><div class="cab"><span class="simbolo">${icon("warning", "fill")}</span><h3>Si se derrama</h3><span class="n mono">2/5</span></div><p>${r.derrame}</p></section>`,
    `<section class="placa color rojo carta" aria-label="Si hay fuego"><div class="cab"><span class="simbolo">${icon("fire-extinguisher", "fill")}</span><h3>Si hay fuego</h3><span class="n mono">3/5</span></div><p>${r.fuego}</p></section>`,
    `<section class="placa color azul carta" aria-label="Protección obligatoria"><div class="cab"><span class="simbolo">${icon("goggles", "fill")}</span><h3>Protección obligatoria</h3><span class="n mono">4/5</span></div><ul class="epp">${r.epp.map(x => `<li>${x}</li>`).join("")}</ul></section>`,
    `<section class="placa carta completa" aria-label="Ficha completa">${completaHTML(r)}</section>`,
  ].join("");
}
function fichaHTML(r){
  return `<div class="hcab" data-arrastre><div class="asa" aria-hidden="true"></div><div class="hc-fila">
      <button class="sos-mini" type="button" data-v="emergencia" aria-label="Emergencia">${icon("siren", "fill")}</button>
      <span class="hc-tit">${esc(secLabel(r.dest))}<span class="hc-ayuda"> · deslizá abajo para cerrar</span></span>
      <button class="cerrar" type="button" data-close aria-label="Cerrar ficha">${icon("x")}</button></div></div>
  <div class="hcuerpo">
    ${rotuloHTML(r)}
    <div class="pila" id="pila">${cartasHTML(r)}</div>
    <div class="indice" role="group" aria-label="Placas de seguridad">${CARTAS.map(([t, c], i) => `<button type="button" data-carta="${i}" aria-pressed="${i === carta}"><i style="background:var(${c})"></i>${t}</button>`).join("")}</div>
    <p class="nota desliza">Deslizá la placa de costado para ver la siguiente.</p>
    ${TELS}
  </div>`;
}
// Ubica las placas: la activa adelante, las siguientes asoman detrás, las vistas salen por la izquierda.
function apilar(arr = 0){
  const cs = [...document.querySelectorAll("#pila .carta")]; if (!cs.length) return;
  cs.forEach((c, i) => {
    const d = i - carta, k = Math.min(Math.abs(d), 2);
    c.style.zIndex = 20 - Math.abs(d);
    c.inert = d !== 0;
    c.setAttribute("aria-hidden", d !== 0);
    if (d < 0){ c.style.transform = "translateX(-112%) rotate(-5deg)"; c.style.opacity = 0; }
    else if (d === 0){ c.style.transform = arr ? `translateX(${arr}px) rotate(${(arr / 40).toFixed(2)}deg)` : "none"; c.style.opacity = 1; }
    else { c.style.transform = `translate(${k * 8}px,${k * 7}px) scale(${1 - k * .03})`; c.style.opacity = d > 2 ? 0 : 1; }
  });
  $("#pila").style.height = cs[carta].offsetHeight + 18 + "px";
  document.querySelectorAll("[data-carta]").forEach(b => b.setAttribute("aria-pressed", +b.dataset.carta === carta));
}
function irCarta(i){
  carta = Math.max(0, Math.min(CARTAS.length - 1, i));
  apilar();
  // El índice se corre de costado hasta el botón activo, sin mover la hoja.
  const bt = $(`[data-carta="${carta}"]`), ind = bt?.parentElement;
  if (ind) ind.scrollTo({left: Math.max(0, bt.offsetLeft - 8), behavior: reduce.matches ? "auto" : "smooth"});
}
// Deslizar la placa de costado: sigue al dedo, con umbral y velocidad.
function gestosPila(){
  const p = $("#pila"); if (!p) return;
  let x0 = 0, y0 = 0, dx = 0, modo = null, hist = [];
  p.addEventListener("pointerdown", e => { x0 = e.clientX; y0 = e.clientY; dx = 0; modo = null; hist = [[performance.now(), 0]]; });
  p.addEventListener("pointermove", e => {
    if (modo === "no") return;
    const ddx = e.clientX - x0, ddy = e.clientY - y0;
    if (!modo){
      if (Math.abs(ddx) > 9 && Math.abs(ddx) > Math.abs(ddy) * 1.2){ modo = "h"; try { p.setPointerCapture(e.pointerId); } catch(_){} p.classList.add("arrastrando"); }
      else if (Math.abs(ddy) > 9){ modo = "no"; return; } else return;
    }
    dx = ddx; hist.push([performance.now(), dx]); if (hist.length > 6) hist.shift();
    const tope = (carta === 0 && dx > 0) || (carta === CARTAS.length - 1 && dx < 0);
    apilar(tope ? dx * .25 : dx);
  });
  const fin = () => {
    if (modo !== "h"){ modo = null; return; }
    modo = null; p.classList.remove("arrastrando"); arrastreFin = performance.now();
    const v = (hist.at(-1)[1] - hist[0][1]) / Math.max(1, hist.at(-1)[0] - hist[0][0]);
    if (dx < -70 || v < -.45) irCarta(carta + 1);
    else if (dx > 70 || v > .45) irCarta(carta - 1);
    else apilar();
  };
  p.addEventListener("pointerup", fin); p.addEventListener("pointercancel", fin);
}
const enVista = rc => rc && rc.width > 0 && rc.bottom > 0 && rc.top < innerHeight && rc.right > 0 && rc.left < innerWidth;

// opts: push (entra al historial), desde (elemento del que "sale" la etiqueta: el frasco),
// aux (abrir mostrando los primeros auxilios), carta (placa inicial).
function openFicha(id, opts = {}){
  const {push = true, desde = null, aux = false} = typeof opts === "boolean" ? {push: opts} : opts;
  const r = RI[id]; if (!r) return;
  const dlg = $("#ficha"), abierta = dlg.open && !dlg.classList.contains("saliendo");
  // Cambiar de envase del mismo producto conserva la vía y la placa; otro producto arranca en Ojos.
  const mismo = abierta && RI[fichaId]?.nom === r.nom;
  if (!mismo){ viaSel = RUTAS[0]; carta = 0; }
  fichaId = id;
  // pushState para que "atrás" en el celular cierre la ficha en vez de salir de la página.
  // Con la ficha ya abierta (cambio de envase) se reemplaza: "atrás" la sigue cerrando de una vez.
  if (location.hash !== "#" + id){
    if (push && !abierta){ history.pushState(history.state?.foco ? {foco: history.state.foco} : null, "", "#" + id); fichaPush = true; }
    else { history.replaceState(history.state, "", "#" + id); if (!abierta) fichaPush = false; }
  } else if (!abierta) fichaPush = false;
  const flip = !abierta && desde && enVista(desde.getBoundingClientRect()) && !reduce.matches;
  const rectDesde = flip ? desde.getBoundingClientRect() : null;
  dlg.classList.remove("saliendo");
  dlg.classList.toggle("quieta", mismo);
  dlg.classList.toggle("desde-frasco", !!flip);
  const scroll = dlg.scrollTop;
  dlg.innerHTML = fichaHTML(r);
  if (!dlg.open) dlg.showModal();
  apilar(); gestosPila();
  dlg.scrollTop = mismo ? scroll : 0;
  document.title = `${r.nom} · Laboratorio EMBV`;
  estante.marcar(r.nom);
  // El foco va al título (lo anuncia el lector de pantalla) y no al botón de cerrar.
  if (mismo) $(`[data-envase="${id}"]`)?.focus({preventScroll: true});
  else $("#fh-t").focus({preventScroll: true});
  if (aux) $("#pila").scrollIntoView({block: "start"});
  if (mismo || reduce.matches) return;
  if (flip){
    // El frasco crece y se vuelve la etiqueta (FLIP: sólo transform y opacity).
    const et = $("#rotulo"), to = et.getBoundingClientRect(), s = Math.max(.12, rectDesde.height / to.height);
    const dx = rectDesde.left + rectDesde.width / 2 - (to.left + to.width / 2), dy = rectDesde.top + rectDesde.height / 2 - (to.top + to.height / 2);
    anim(dlg, [{opacity: 0}, {opacity: 1}], {duration: 260, easing: "linear"});
    anim(et, [{transform: `translate(${dx}px,${dy}px) scale(${s})`, opacity: .3}, {opacity: 1, offset: .35}, {transform: "none", opacity: 1}], {duration: 560, easing: EASE});
  }
  // Las placas se despliegan desde atrás de la etiqueta, la verde primero.
  [...document.querySelectorAll("#pila .carta")].slice(0, 3).forEach((c, i) =>
    c.animate([{opacity: 0, transform: "translateY(-40px) scale(.92)"}], {duration: 460, delay: 160 + i * 70, easing: EASE, fill: "backwards"}));
}
// Cierra con la animación de bajada; el evento "close" del diálogo maneja el historial.
// Si el frasco está en foco en el estante, la etiqueta vuelve a él.
function closeFicha(animar = true, dyArrastre = 0){
  const d = $("#ficha"); if (!d.open || d.classList.contains("saliendo")) return;
  if (!animar || reduce.matches){ d.close(); return; }
  const et = $("#rotulo"), hacia = estante.hayFoco() && fichaId ? estante.frascoDe(fichaId)?.getBoundingClientRect() : null;
  if (dyArrastre){
    d.classList.add("saliendo", "sin-css");
    anim(d, [{transform: `translateY(${dyArrastre}px)`}, {transform: "translateY(100%)"}], {duration: 260, easing: "cubic-bezier(.3,0,.8,.15)", fill: "forwards"})
      .then(a => { d.classList.remove("saliendo", "sin-css"); d.close(); a?.cancel?.(); });
    return;
  }
  if (et && enVista(hacia)){
    const to = et.getBoundingClientRect(), s = Math.max(.12, hacia.height / to.height);
    const dx = hacia.left + hacia.width / 2 - (to.left + to.width / 2), dy = hacia.top + hacia.height / 2 - (to.top + to.height / 2);
    d.classList.add("saliendo", "sin-css");
    d.querySelectorAll(".pila,.indice,.desliza,.hcuerpo>.tels,.hcab").forEach(el => anim(el, [{opacity: 1}, {opacity: 0}], {duration: 160, fill: "forwards"}));
    anim(d, [{opacity: 1}, {opacity: 1, offset: .5}, {opacity: 0}], {duration: 420, fill: "forwards"});
    anim(et, [{transform: "none"}, {transform: `translate(${dx}px,${dy}px) scale(${s})`, opacity: .4}], {duration: 420, easing: "cubic-bezier(.5,0,.2,1)", fill: "forwards"})
      .then(() => { d.classList.remove("saliendo", "sin-css"); d.getAnimations().forEach(a => a.cancel()); d.close(); });
    return;
  }
  d.classList.add("saliendo");
  const fin = () => { d.removeEventListener("animationend", fin); if (d.classList.contains("saliendo")){ d.classList.remove("saliendo"); d.close(); } };
  d.addEventListener("animationend", fin);
  setTimeout(fin, 400);
}
// La hoja se cierra arrastrándola hacia abajo desde la cabecera o la etiqueta (celular).
(() => {
  const d = $("#ficha");
  let y0 = 0, dy = 0, on = false, mov = false, hist = [];
  d.addEventListener("pointerdown", e => {
    if (innerWidth >= 900 || e.button > 0) return;
    const z = e.target.closest("[data-arrastre],.rotulo"); if (!z || e.target.closest("button,a")) return;
    // La cabecera es fija y siempre arrastra; la etiqueta, sólo con la hoja arriba de todo.
    if (z.classList.contains("rotulo") && d.scrollTop > 4) return;
    on = true; mov = false; y0 = e.clientY; dy = 0; hist = [[performance.now(), 0]];
  });
  d.addEventListener("pointermove", e => {
    if (!on) return;
    dy = Math.max(0, e.clientY - y0);
    if (!mov && dy > 6){ mov = true; try { d.setPointerCapture(e.pointerId); } catch(_){} d.classList.add("arrastrando"); }
    if (!mov) return;
    hist.push([performance.now(), dy]); if (hist.length > 6) hist.shift();
    d.style.transform = `translateY(${dy}px)`;
  });
  const fin = () => {
    if (!on) return; on = false;
    d.classList.remove("arrastrando");
    if (!mov) return;
    arrastreFin = performance.now();
    const v = (hist.at(-1)[1] - hist[0][1]) / Math.max(1, hist.at(-1)[0] - hist[0][0]);
    d.style.transform = "";
    if (dy > 120 || v > .55) closeFicha(true, dy);
    else anim(d, [{transform: `translateY(${dy}px)`}, {transform: "none"}], {duration: 300, easing: EASE});
  };
  d.addEventListener("pointerup", fin); d.addEventListener("pointercancel", fin);
})();
function cambiarVia(t){
  viaSel = t;
  const box = $("#via"); if (!box || !fichaId) return;
  box.innerHTML = viaHTML(RI[fichaId]);
  const p = box.querySelector(".via-txt");
  p.classList.remove("cambia"); void p.offsetWidth; p.classList.add("cambia");
  apilar();
}

// ---------- compatibilidad ----------
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
  const list = unicos(R.filter(r => match(r, q))).slice(0, 3);
  $("#eres").innerHTML = list.length ? list.map(r => `<div class="placa grupo">
      <div class="identidad" style="justify-content:space-between"><div><h3 style="font-size:1.2rem;font-weight:800">${esc(r.nom)}</h3><div class="sig" style="margin-top:4px">${sig(r.sen)}<span class="id mono">${hermanos(r).map(x => x.id).join(" · ")}</span></div></div><div class="pics" style="display:flex;gap:4px">${r.pic.map(p => picto(p, 40)).join("")}</div></div>
      <ul class="frases aux">${r.vias.filter(v => RUTAS.includes(v.t)).map(v => `<li><span><b>${esc(v.t)}:</b> ${v.d}</span></li>`).join("")}</ul>
      <div class="dos">${placa("amarillo", "warning", "Si se derrama", `<p>${r.derrame}</p>`)}${placa("rojo", "fire-extinguisher", "Si hay fuego", `<p>${r.fuego}</p>`)}</div>
      <button class="btn" type="button" data-r="${r.id}" style="justify-self:start">Ver la ficha completa${icon("caret-right")}</button></div>`).join("")
    : placa("rojo", "warning", "No está en el inventario", `<p>Si no se sabe qué es, tratarlo como peligroso: avisar, alejar a todos y llamar al <a href="tel:107"><b>107</b></a>. Intoxicaciones: <a href="tel:08003330160"><b>0800-333-0160</b></a>.</p>`);
}

// ---------- módulos ----------
const estante = crearEstante({D, R, RI, $, esc, icon, picto, sig, claseVar, SEC, reduce, SEC_AVISO, incompatibles, secLabel, SEP,
  abrirFicha: (id, o) => openFicha(id, o), irSeccion: s => showSec(s)});
const lavado = crearLavado({RI, $, esc, icon, picto, may, reduce, irEmergencia: () => setView("emergencia")});
const aprender = crearAprender({D, R, RI, $, esc, icon, picto, nfpa, sig, placa, may, secLabel, claseStyle, claro, SEP});
// Cada lección tiene su propio enlace (#aprender/etiqueta…) y entra al historial: "atrás" vuelve al índice.
const irLeccion = id => { location.hash = id ? "#aprender/" + id : "#aprender"; };
document.addEventListener("keydown", e => aprender.tecla(e, irLeccion));

// ---------- eventos ----------
document.addEventListener("click", e => {
  // Un arrastre que termina sobre un botón no cuenta como toque.
  if (performance.now() - arrastreFin < 350) return;
  if (aprender.click(e, irLeccion)) return;
  const go = e.target.closest("[data-go]"); if (go){ setView(go.dataset.go); return; }
  const vb = e.target.closest("[data-v]"); if (vb){
    if (vb.dataset.v === "aprender") curLec = null;
    if (vb.dataset.v === "estante" && view === "estante" && !$("#ficha").open) curSec = null;
    setView(vb.dataset.v); return; }
  const lv = e.target.closest("[data-lavar]"); if (lv){ lavado.empezar(lv.dataset.lavar, lv.dataset.rid || null, lv.dataset.rid ? $("#rotulo") : null); return; }
  const env = e.target.closest("[data-envase]"); if (env){ openFicha(env.dataset.envase, {push: false}); return; }
  const rb = e.target.closest("[data-r]"); if (rb){
    e.preventDefault();
    // Desde la lista de la sección la ficha abre de una (un toque, para la emergencia) y la
    // etiqueta sale de su frasco en el estante.
    const enSec = rb.closest("#sec-lista");
    openFicha(rb.dataset.r, enSec ? {desde: estante.frascoDe(rb.dataset.r)} : {}); return; }
  if (e.target.closest("[data-close]")){ closeFicha(); return; }
  const via = e.target.closest("[data-via]"); if (via){ cambiarVia(via.dataset.via); return; }
  const c = e.target.closest("[data-carta]"); if (c){ irCarta(+c.dataset.carta); return; }
  const sec = e.target.closest("[data-sec]"); if (sec){ showSec(sec.dataset.sec); return; }
});
// Al cerrar la ficha, si la abrimos nosotros con pushState se vuelve atrás en el
// historial (así "atrás" no repite la misma vista); si se entró directo por un
// enlace #R001, se reemplaza por la vista de fondo.
$("#ficha").addEventListener("close", () => {
  document.title = tituloVista();
  $("#ficha").style.transform = "";
  if (!estante.hayFoco()) estante.marcar(null);
  if (!/^#R\d+$/i.test(location.hash)) return;
  if (fichaPush){ fichaPush = false; history.back(); }
  else history.replaceState(null, "", "#" + viewHash());
});
$("#ficha").addEventListener("cancel", e => { e.preventDefault(); closeFicha(); });
$("#ficha").addEventListener("click", e => { if (e.target === $("#ficha")) closeFicha(); });
$("#eq").addEventListener("input", renderEsearch);

// ---------- navegación ----------
// Cuatro pestañas: Estante (inicio y destino de los QR), Buscar, Aprender y Emergencia.
const VIEWS = ["estante", "reactivos", "aprender", "emergencia"];
const viewHash = () => view === "estante" ? (curSec || "estante") : view === "aprender" && curLec ? "aprender/" + curLec : view;
// El título de la pestaña dice dónde se está (historial, pestañas abiertas, lector de pantalla).
const TITULO = {estante: "Estante", reactivos: "Buscar", aprender: "Aprender", emergencia: "Si pasa algo"};
const tituloVista = () => `${view === "estante" && curSec ? `${curSec} · ${D.clasesCorto[SEC[curSec]] || ""}` : TITULO[view]} · Laboratorio EMBV`;
let primera = true;
function setView(v){
  if (v === "buscar") v = "reactivos";
  if (!VIEWS.includes(v)) v = "estante";
  const antes = view, enEstante = !primera && antes === "estante" && v === "estante" && !$("#v-estante").hidden;
  view = v;
  if ($("#ficha").open) closeFicha(false);
  if (estante.hayFoco()) estante.salirFoco({hist: false, animar: false});
  const pintar = () => {
    for (const x of VIEWS) $("#v-" + x).hidden = x !== v;
    document.querySelectorAll("[data-v]").forEach(b => b.dataset.v === v ? b.setAttribute("aria-current", "page") : b.removeAttribute("aria-current"));
    ({reactivos: renderReactivos, estante: () => estante.render(curSec, {animar: enEstante}), emergencia: renderEmergencia, aprender: () => aprender.render(curLec)})[v]();
    if (!$("#ficha").open) document.title = tituloVista();
    // Dentro del estante, la cámara se mueve y la página no salta al principio.
    if (!enEstante) window.scrollTo(0, 0);
    else { const c = $("#cartel").getBoundingClientRect(); if (c.top < 60 || c.top > innerHeight * .5) $("#cartel").scrollIntoView({block: "start", behavior: reduce.matches ? "auto" : "smooth"}); }
  };
  if (location.hash !== "#" + viewHash()) history.replaceState(null, "", "#" + viewHash());
  if (!primera && !enEstante && document.startViewTransition && !reduce.matches){
    // Si se navega rápido, una transición corta a la anterior: no es un error.
    const t = document.startViewTransition(pintar);
    t.ready.catch(() => {}); t.finished.catch(() => {});
  } else pintar();
  primera = false;
}
function showSec(s){ if (!SEC[s]) return; curSec = s; setView("estante"); }
function route(){
  const h = decodeURIComponent(location.hash.slice(1)).toUpperCase();
  if (/^R\d{3}$/.test(h) && RI[h]){
    // Detrás de la ficha, el estante en la sección de ese frasco (salvo que ya haya una vista abierta).
    if ($("#v-" + view).hidden){ curSec = RI[h].dest; setView("estante"); }
    openFicha(h, false); return;
  }
  // Volver de una ficha a la vista que estaba abajo: no se redibuja ni se pierde el scroll.
  if (!$("#v-" + view).hidden && h === viewHash().toUpperCase()){ closeFicha(); return; }
  if (SEC[h]){ showSec(h); return; }
  const m = h.match(/^APRENDER(?:\/([A-Z]+))?$/);
  if (m){ const id = m[1]?.toLowerCase() || null; curLec = id && aprender.hayLeccion(id) ? id : null; setView("aprender"); return; }
  if (h === "ESTANTE" || !h) curSec = null;
  setView(h.toLowerCase() || "estante");
}
window.addEventListener("hashchange", route);

// ---------- arranque ----------
setupReactivos(); setupCompat();
$("#ver-datos").textContent = `Datos actualizados al ${ACTUALIZADO}.`;
for (const x of VIEWS) $("#v-" + x).hidden = true;
route();
document.fonts?.ready.then(() => { if ($("#ficha").open) apilar(); });
addEventListener("resize", () => { if ($("#ficha").open) apilar(); });
if ("serviceWorker" in navigator && location.protocol === "https:") navigator.serviceWorker.register("sw.js").catch(() => {});
