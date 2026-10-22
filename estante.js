// Estante: la vista a la que llevan los QR de los carteles.
// Arriba, el cartel impreso de la sección (el mismo de 16,4 × 6 cm que está pegado en el estante);
// abajo, el estante dibujado de frente, con un frasco por envase. La sección del QR queda
// encendida y la cámara se mueve por el estante al elegir otra. Tocar un frasco lo trae al frente
// ("frasco en foco"): se agranda, se lee qué es y desde ahí se entra a la ficha.
// Sólo se animan transform y opacity; con movimiento reducido, todo es instantáneo.

export function crearEstante(ctx){
  const {D, R, RI, $, esc, icon, picto, sig, claseVar, SEC, reduce, SEC_AVISO, incompatibles, secLabel, abrirFicha, irSeccion, SEP} = ctx;
  const GRUPO = {}; for (const r of R) (GRUPO[r.nom] ||= []).push(r);
  const INFL = new Set(["A1", "A2"]);
  const CLARO = new Set(["F"]);
  const HEX = {"--c-infl":"#c8282a","--c-ox":"#f9a800","--c-cor":"#2f6d8f","--c-tox":"#5b3a8e","--c-neu":"#5f6a73","--c-esp":"#14181b"};
  const EASE = "cubic-bezier(.16,1,.3,1)";
  const anim = (el, kf, o) => {
    if (reduce.matches || !el?.animate) return Promise.resolve();
    const a = el.animate(kf, o); return a.finished.then(() => a, () => a);
  };
  const plain = s => String(s ?? "").replace(/<[^>]+>/g, "");
  const productos = s => { const v = new Set(); return R.filter(r => r.dest === s).sort((a, b) => a.nom.localeCompare(b.nom, "es") || a.id.localeCompare(b.id)).filter(r => !v.has(r.nom) && v.add(r.nom)); };
  const hermanos = r => GRUPO[r.nom].filter(x => x.dest === r.dest);

  /* ---------- geometría (unidades: una sección mide 100 de ancho) ---------- */
  const SW = 100, U = 4, TB = 14, OH = 56, X0 = 10, Y0 = 8, RISE = 22;
  const SHELF_W = 6 * (SW + U) + U;
  const CAJA_X = X0 + SHELF_W + 48, MAT_X = CAJA_X + SW + 2 * U + 30;
  const GEO = {};
  D.filaE2.forEach((cl, i) => GEO[D.seccion[cl]] = {x: X0 + U + i * (SW + U), top: Y0, row: 0, col: i, cl});
  D.filaE1.forEach((cl, i) => GEO[D.seccion[cl]] = {x: X0 + U + i * (SW + U), top: Y0 + TB + OH, row: 1, col: i, cl});
  GEO["CAJA-RE"] = {x: CAJA_X + U, top: Y0 + TB + OH, row: 1, col: 6, cl: "H"};
  GEO["MATERIAL"] = {x: MAT_X + U, top: Y0 + TB + OH, row: 1, col: 7, cl: "M"};
  const PISO = Y0 + 2 * (TB + OH) + 5;
  const SCENE_W = MAT_X + SW + 2 * U + 12, SCENE_H = PISO + 16;
  const ORDEN = [...D.filaE2.map(c => D.seccion[c]), ...D.filaE1.map(c => D.seccion[c]), "CAJA-RE", "MATERIAL"];

  // Un frasco por envase, agrupados por producto (los tres ácidos sulfúricos, juntos).
  const frascos = s => { const out = []; for (const p of productos(s)) for (const r of hermanos(p)) for (let i = 0; i < r.nenv; i++) out.push(r); return out; };

  // Lo que se lee en la etiqueta del frasco: la fórmula; si no hay o es un nombre, un nombre corto.
  function rotuloFrasco(r){
    let f = String(r.form || "").replace(/\s*\(aq\)\s*$/, "");
    const p = plain(f);
    if (!f || f === "—" || /[a-záéíóú]{4,}/.test(p) || p.length > 13){
      // Nombre corto: "pH 7" para las soluciones reguladoras; si la primera palabra es genérica
      // (Solución, Mezcla, Reactivo…), la que la distingue.
      const ph = r.nom.match(/pH\s*\d+/);
      if (ph) return {txt: ph[0], form: false, largo: ph[0].length};
      const pal = r.nom.replace(/\s*\(.*$/, "").split(/\s+/).filter(w => !/^(de|del|la|el|en|y)$/i.test(w));
      let n = /^(Solución|Mezcla|Reactivo|Agua|Papel|Tintura|Cinta)$/i.test(pal[0]) && pal[1] ? pal[1] : pal[0];
      if (n.length <= 3 && pal[1] && n !== pal[1]) n += " " + pal[1];
      n = n.charAt(0).toUpperCase() + n.slice(1);
      return {txt: n, form: false, largo: n.length};
    }
    return {txt: f, form: true, largo: p.length};
  }
  // Fórmula con subíndices en SVG (tspan con dy), escalada para que entre en la etiqueta.
  function formulaSVG(r, ancho, fs0){
    const {txt, form, largo} = rotuloFrasco(r);
    const fs = Math.min(fs0, (ancho * .94) / (largo * .6));
    const partes = form ? txt.split(/(<sub>.*?<\/sub>)/).filter(Boolean) : [esc(txt)];
    let abajo = false, out = "";
    for (const p of partes){
      const m = p.match(/^<sub>(.*)<\/sub>$/);
      if (m){ out += `<tspan dy="${abajo ? 0 : fs * .28}" font-size="${(fs * .72).toFixed(2)}">${esc(m[1])}</tspan>`; abajo = true; }
      else { out += `<tspan dy="${abajo ? -fs * .28 : 0}" font-size="${fs.toFixed(2)}">${form ? esc(p) : p}</tspan>`; abajo = false; }
    }
    return out;
  }
  function frascoSVG(r, cx, base, atras, hit, esc_){
    const liq = r.est === "Líquido";
    const L = liq ? {x: -5.5, y: -18.6, w: 11, h: 10.6} : {x: -6.1, y: -16.8, w: 12.2, h: 10};
    const cuerpo = liq
      ? `<path class="vidrio" d="M-6 -1.3V-18.4Q-6-21.4-3.2-22.2V-24.6H3.2V-22.2Q6-21.4 6-18.4V-1.3Q6 0 4.7 0H-4.7Q-6 0-6-1.3Z"/><rect class="liq" x="-5.4" y="-13" width="10.8" height="12.4" rx="1"/><rect class="tapa" x="-3.8" y="-28" width="7.6" height="3.8" rx=".7"/>`
      : `<rect class="vidrio" x="-6.8" y="-17.8" width="13.6" height="17.8" rx="1.8"/><rect class="pol" x="-6.1" y="-8.6" width="12.2" height="8" rx="1"/><rect class="tapa" x="-7.4" y="-21.8" width="14.8" height="4.2" rx=".9"/>`;
    const dia = r.pic.length ? `<path d="M${L.x + L.w - 2.1} ${L.y + .5}l1.5 1.5-1.5 1.5-1.5-1.5Z" fill="#fff" stroke="#c4161c" stroke-width=".5"/>` : "";
    return `<g class="jar${atras ? " atras" : ""}" data-frasco="${r.id}">
      <rect class="hitj" x="${cx - hit.w / 2}" y="${hit.y0}" width="${hit.w}" height="${hit.y1 - hit.y0}" fill="transparent"/>
      <g transform="translate(${cx.toFixed(2)} ${base}) scale(${esc_})"><g class="jar-in">${cuerpo}
        <rect class="lab" x="${L.x}" y="${L.y}" width="${L.w}" height="${L.h}" rx=".5" fill="#fff" stroke="#14181b" stroke-width=".3"/>${dia}
        <text x="0" y="${L.y + L.h * .55}" text-anchor="middle" font-weight="800" fill="#14181b">${formulaSVG(r, L.w, 4.3)}</text>
        <text x="0" y="${L.y + L.h - 1.1}" text-anchor="middle" font-family="Overpass Mono,monospace" font-weight="700" font-size="2.1" fill="#3f474d">${r.id}</text></g></g></g>`;
  }
  function seccionSVG(s){
    const g = GEO[s], cl = g.cl, color = HEX[claseVar(cl)], claro = CLARO.has(cl), infl = INFL.has(cl);
    const x = g.x, top = g.top, oy = top + TB, piso = oy + OH, txt = claro ? "#14181b" : "#fff";
    const fs = frascos(s);
    // Hasta 7 en una fila; con más, dos filas: la de atrás sobre un escalón, para que se lea su etiqueta.
    const nF = fs.length <= 7 ? fs.length : Math.ceil(fs.length / 2);
    const front = fs.slice(0, nF), back = fs.slice(nF);
    const slot = SW / Math.max(7, nF), sc = Math.min(1, slot / 15.2);
    let jars = "";
    back.forEach((r, i) => {
      const cx = x + SW * (i + .5) / Math.max(back.length, 1) * (back.length < nF ? back.length / nF : 1) + (back.length < nF ? SW * (nF - back.length) / nF / 2 : 0);
      jars += frascoSVG(r, cx, piso - RISE, true, {w: slot, y0: piso - 52, y1: piso - 30}, sc);
    });
    const off = (Math.max(7, nF) - front.length) / 2;
    front.forEach((r, i) => jars += frascoSVG(r, x + slot * (i + .5 + off), piso - 1, false, {w: slot, y0: piso - 30, y1: piso}, sc));
    const corto = esc(D.clasesCorto[cl] || "");
    const frente = `<rect x="${x + 1.5}" y="${piso - 7.5}" width="${SW - 3}" height="7.5" rx="1" fill="${color}"/>
      <rect x="${x + 2.6}" y="${piso - 6.5}" width="${SW - 5.2}" height="5.5" rx=".6" fill="none" stroke="${claro ? "rgba(20,24,27,.6)" : "rgba(255,255,255,.75)"}" stroke-width=".4"/>
      ${infl ? `<use href="iconos.svg#GHS02" x="${x + SW / 2 - 3.9}" y="${piso - 7.6}" width="7.8" height="7.8"/>` : `<text x="${x + SW / 2}" y="${piso - 2.5}" text-anchor="middle" font-size="3.4" font-weight="800" fill="${txt}" letter-spacing=".2">${corto.toUpperCase()}</text>`}`;
    const escalon = back.length ? `<rect x="${x + 2}" y="${piso - RISE}" width="${SW - 4}" height="${RISE}" fill="var(--e-mueble-2)" opacity=".55"/>` : "";
    // El cartel en chico, pegado en el larguero de arriba de la sección, como en el estante real.
    const cw = SW - 12, cx0 = x + 6, cy0 = top + 2.2, ch = TB - 4.4, bw = s.length > 4 ? 33 : 24;
    const cartelito = `<rect x="${cx0}" y="${cy0}" width="${cw}" height="${ch}" fill="#fff" stroke="#14181b" stroke-width=".5"/>
      <rect x="${cx0}" y="${cy0}" width="${bw}" height="${ch}" fill="${color}" stroke="#14181b" stroke-width=".5"/>
      <text x="${cx0 + bw / 2}" y="${cy0 + ch / 2 + 2.1}" text-anchor="middle" font-family="Overpass Mono,monospace" font-weight="700" font-size="${s.length > 4 ? 4.6 : 6.2}" fill="${txt}">${s}</text>
      <text x="${cx0 + bw + 3}" y="${cy0 + ch / 2 + 1.3}" font-size="3.5" font-weight="800" fill="#14181b">${corto}</text>
      ${infl ? `<use href="iconos.svg#GHS02" x="${cx0 + cw - 9}" y="${cy0 + .6}" width="8.4" height="8.4"/>` : ""}`;
    return `<g class="sec" data-seccion="${s}">
      <rect class="hit-sec" x="${x - U}" y="${top}" width="${SW + 2 * U}" height="${TB + OH}" fill="transparent"/>
      <rect x="${x}" y="${oy}" width="${SW}" height="${OH}" fill="var(--e-hueco)"/>
      <rect class="luz" x="${x}" y="${oy}" width="${SW}" height="${OH}" fill="url(#e-luz)"/>
      ${cartelito}${escalon}${jars}${frente}</g>`;
  }
  function escenaSVG(){
    const e1 = Y0 + TB + OH;
    let s = `<defs><radialGradient id="e-luz" cx="50%" cy="0%" r="95%"><stop offset="0" stop-color="var(--e-luz)"/><stop offset="1" stop-color="var(--e-luz)" stop-opacity="0"/></radialGradient></defs>
    <rect width="${SCENE_W}" height="${SCENE_H}" fill="var(--e-pared)"/>
    <rect y="${PISO + 4}" width="${SCENE_W}" height="${SCENE_H - PISO}" fill="var(--e-piso)"/>
    <rect x="${X0}" y="${Y0}" width="${SHELF_W}" height="${PISO - Y0}" rx="1.5" fill="var(--e-mueble)"/>
    <rect x="${X0 + 2}" y="${PISO}" width="4" height="5" fill="var(--e-mueble-2)"/><rect x="${X0 + SHELF_W - 6}" y="${PISO}" width="4" height="5" fill="var(--e-mueble-2)"/>
    <rect x="${CAJA_X}" y="${e1}" width="${SW + 2 * U}" height="${PISO + 4 - e1}" rx="2" fill="#22282d"/>
    <rect x="${MAT_X}" y="${e1}" width="${SW + 2 * U}" height="${PISO + 4 - e1}" rx="2" fill="var(--e-mueble)"/>
    <g transform="translate(${CAJA_X - 26} ${PISO + 4})"><path d="M-11 -20H11L8.5 0H-8.5Z" fill="var(--e-balde)" stroke="var(--e-mueble-2)" stroke-width=".6"/><rect x="-12" y="-22" width="24" height="3" rx="1" fill="var(--e-mueble-2)"/>
      <text x="0" y="-8" text-anchor="middle" font-size="3.6" font-weight="800" fill="#14181b">ARENA</text></g>`;
    for (const k of ORDEN) s += seccionSVG(k);
    return s;
  }

  /* ---------- cámara ---------- */
  let visor, escena, k = 3, vw = 300, vh = 200, cur = null, camAnim = null, camAhora = null;
  function medir(){
    vw = visor.clientWidth;
    k = Math.min(vw * (vw < 380 ? .94 : .9), 520) / SW;
    // Con una sección, el visor mide lo que la sección; en la toma general, lo que el estante entero.
    vh = cur ? Math.round((TB + OH + 5) * k) : Math.round(SCENE_H * vw * .97 / SCENE_W) + 18;
    visor.style.height = vh + "px";
    escena.setAttribute("viewBox", `0 0 ${SCENE_W} ${SCENE_H}`);
    escena.setAttribute("width", Math.round(SCENE_W * k));
    escena.setAttribute("height", Math.round(SCENE_H * k));
  }
  const centro = s => { const g = GEO[s]; return {x: g.x + SW / 2, y: g.top + (TB + OH) / 2 + 2, z: 1}; };
  // Toma general: todo el estante entra en el ancho del visor.
  const general = () => ({x: SCENE_W / 2, y: SCENE_H / 2, z: Math.min(vw / (SCENE_W * k), vh / (SCENE_H * k)) * .98});
  const T = c => `translate(${(vw / 2 - c.x * k * c.z).toFixed(1)}px,${((c.fy ?? .5) * vh - c.y * k * c.z).toFixed(1)}px) scale(${c.z.toFixed(4)})`;
  function camara(dest, animar = true){
    const fin = T(dest);
    if (camAnim){ try { camAnim.commitStyles(); } catch(e){} camAnim.cancel(); camAnim = null; }
    const ini = escena.style.transform, desde = camAhora;
    escena.style.transform = fin; camAhora = dest;
    if (!animar || reduce.matches || !ini || ini === fin || !desde) return;
    const dist = Math.hypot(desde.x - dest.x, (desde.y - dest.y) * 1.6);
    const lejos = dist > SW * 1.2 && Math.abs(desde.z - dest.z) < .3;
    // Lejos: la cámara se aleja para mostrar el recorrido y vuelve a acercarse.
    const mid = {x: (desde.x + dest.x) / 2, y: (desde.y + dest.y) / 2, z: Math.max(general().z, Math.min(.88, 1 - dist / 520)) * Math.min(desde.z, dest.z), fy: .5};
    camAnim = escena.animate(lejos ? [{transform: ini}, {transform: T(mid), offset: .5}, {transform: fin}] : [{transform: ini}, {transform: fin}],
      {duration: lejos ? 760 : 480, easing: lejos ? "cubic-bezier(.65,0,.35,1)" : EASE});
    camAnim.finished.then(() => { camAnim = null; }, () => {});
  }

  /* ---------- la vista ---------- */
  function cartelHTML(s){
    if (!s) return `<div class="placa grupo est-intro">
      <h1 class="vt">Estante</h1>
      <p class="lede">Cada sección guarda una sola clase y ninguna queda al lado ni encima de otra incompatible. Escaneá el QR del cartel o tocá una sección.</p>
      <div class="leyenda" aria-label="Colores de las clases"><span><i style="background:var(--c-infl)"></i>Inflamables</span><span><i style="background:var(--c-ox)"></i>Oxidantes</span><span><i style="background:var(--c-cor)"></i>Ácidos y bases</span><span><i style="background:var(--c-tox)"></i>Tóxicos</span><span><i style="background:var(--c-neu)"></i>Bajo riesgo</span><span><i style="background:var(--c-esp)"></i>Riesgo especial</span></div></div>`;
    const cl = SEC[s], todos = R.filter(r => r.dest === s), n = todos.reduce((t, r) => t + r.nenv, 0);
    const enEst = D.filaE1.includes(cl) || D.filaE2.includes(cl);
    const nivel = D.filaE2.includes(cl) ? "Estante de arriba" : D.filaE1.includes(cl) ? "Estante de abajo" : "Fuera del estante";
    const pics = [...new Set(todos.flatMap(r => r.pic))].sort();
    const inc = incompatibles(cl), av = SEC_AVISO[cl];
    return `<div class="cartel-imp" style="--clase:var(${claseVar(cl)})">
      <div class="ci-cod${CLARO.has(cl) ? " claro" : ""}"><span class="cod${s.length > 4 ? " largo" : ""}">${esc(s)}</span>${INFL.has(cl) ? `<svg class="ghs llama" role="img" aria-label="Inflamable"><use href="iconos.svg#GHS02"/></svg>` : ""}</div>
      <div class="ci-cl"><h1>${esc(D.clases[cl])}</h1><p><span>${n} ${n === 1 ? "envase" : "envases"}${enEst ? ` de ${D.capacidad} de capacidad` : ""}</span><span>${nivel}</span></p></div>
      ${pics.length ? `<div class="ci-pics">${pics.map(p => picto(p, 30)).join("")}</div>` : ""}
      ${av ? `<div class="ci-aviso">${icon(av[0].replace(/-fill$/, ""), "fill")}<span>${esc(av[1])}</span></div>` : ""}
      ${enEst ? `<div class="ci-no"><b>NO almacenar aquí:</b> ${inc.length ? inc.map(c => `${esc(D.clasesCorto[c])} <span class="mono">(${esc(D.seccion[c])})</span>`).join(", ") : "no hay clases críticamente incompatibles con ésta, pero igual no se mezcla con otras."}</div>` : ""}
    </div>`;
  }
  function filaHTML(r){
    const g = hermanos(r), env = g.reduce((t, x) => t + x.nenv, 0);
    const f = r.form && r.form !== "—" ? `<span class="fq">${r.form}</span>` : "";
    return `<li><button class="fila" type="button" data-r="${r.id}" data-prod="${esc(r.nom)}">
      <span class="n"><b>${esc(r.nom)}</b><span class="meta">${sig(r.sen)}${f}<span class="mono">${g.map(x => x.id).join(" · ")}</span>${env > 1 ? `<span class="etq">${env} envases</span>` : ""}</span></span>
      <span class="pics">${r.pic.map(p => picto(p, 28)).join("")}</span>${icon("caret-right", "bold", "ic chev")}</button></li>`;
  }
  function planoHTML(){
    const b = s => { const cl = SEC[s];
      return `<button type="button" data-sec="${s}" style="--clase:var(${claseVar(cl)})" class="${CLARO.has(cl) ? "claro" : ""}${s.length > 4 ? " ancho" : ""}" aria-label="${esc(secLabel(s))}: ${esc(D.clasesCorto[cl])}"><span class="mono">${esc(s)}</span>${INFL.has(cl) ? `<svg class="lla" aria-hidden="true"><use href="iconos.svg#GHS02"/></svg>` : ""}</button>`; };
    return `<span class="pl-cap">Arriba · E2</span><div class="pl-fila">${D.filaE2.map(c => b(D.seccion[c])).join("")}</div>
      <span class="pl-cap">Abajo · E1</span><div class="pl-fila">${D.filaE1.map(c => b(D.seccion[c])).join("")}</div>
      <span class="pl-cap">Fuera del estante</span><div class="pl-fila dos">${b("CAJA-RE")}${b("MATERIAL")}</div>`;
  }

  let montado = false;
  function montar(){
    if (montado) return; montado = true;
    visor = $("#visor"); escena = $("#escena");
    escena.innerHTML = escenaSVG();
    $("#plano").innerHTML = planoHTML();
    gestos();
    addEventListener("resize", () => { if ($("#v-estante").hidden) return; medir(); camara(enFoco ? camFoco(enFoco) : cur ? centro(cur) : general(), false); });
  }
  // Muestra una sección (o el estante entero si s es null). La cámara viaja desde donde estaba.
  function render(s, {animar = true} = {}){
    montar();
    if (enFoco) salirFoco({hist: false, animar: false});
    const prev = cur; cur = s || null;
    medir();
    document.querySelectorAll("#escena .sec").forEach(g => g.classList.toggle("on", !cur || g.dataset.seccion === cur));
    visor.classList.toggle("general", !cur);
    camara(cur ? {...centro(cur), z: 1} : general(), animar && prev !== cur);
    const c = $("#cartel");
    c.innerHTML = cartelHTML(cur);
    if (animar && prev && cur && prev !== cur){
      const d = ORDEN.indexOf(cur) > ORDEN.indexOf(prev) ? 1 : -1;
      anim(c.firstElementChild, [{transform: `translateX(${d * 28}px)`, opacity: 0}, {transform: "none", opacity: 1}], {duration: 420, easing: EASE});
    }
    const ps = cur ? productos(cur) : [];
    $("#sec-lista-w").hidden = !cur;
    if (cur){
      $("#sec-tit").innerHTML = `Qué se guarda acá${SEP}${ps.length} ${ps.length === 1 ? "producto" : "productos"}`;
      $("#sec-lista").innerHTML = ps.map(filaHTML).join("") || `<li class="vacio">Esta sección está vacía.</li>`;
    }
    $("#visor-nota").textContent = cur ? "Tocá el frasco que tenés en la mano: se acerca y se lee qué es. Desde la lista, la ficha abre de una." : "Tocá una sección del estante o elegila abajo.";
    document.querySelectorAll("#plano [data-sec]").forEach(b => b.setAttribute("aria-current", b.dataset.sec === cur));
    visor.setAttribute("aria-label", cur ? `Estante visto de frente. Sección ${cur} encendida: ${D.clases[SEC[cur]]}, ${frascos(cur).length} frascos.` : "Estante visto de frente: las doce secciones, la caja de riesgo especial y el material didáctico.");
  }

  /* ---------- enlace lista ↔ frasco ---------- */
  function marcar(nom){
    document.querySelectorAll("#escena .jar.marca").forEach(j => j.classList.remove("marca"));
    document.querySelectorAll("#sec-lista .fila.marca").forEach(f => f.classList.remove("marca"));
    if (!nom) return;
    const ids = new Set(GRUPO[nom]?.map(r => r.id) || []);
    document.querySelectorAll("#escena .sec.on .jar").forEach(j => ids.has(j.dataset.frasco) && j.classList.add("marca"));
    document.querySelector(`#sec-lista .fila[data-prod="${CSS.escape(nom)}"]`)?.classList.add("marca");
  }

  /* ---------- frasco en foco ---------- */
  let enFoco = null, focoT = 0;   // el <g class="jar"> en foco y cuándo entró
  const jarsSec = () => [...document.querySelectorAll(`#escena .sec[data-seccion="${cur}"] .jar`)];
  function camFoco(j){
    const b = j.querySelector(".jar-in").getBBox(), m = j.querySelector(".jar-in").parentNode.transform.baseVal.consolidate()?.matrix;
    const sc = m ? m.a : 1, cx = m ? m.e : 0, by = m ? m.f : 0;
    const h = b.height * sc, y = by + (b.y + b.height / 2) * sc;
    // El frasco ocupa poco más de la mitad del alto del visor, un poco por encima del centro.
    const z = Math.min(3.2, (vh * .58) / (h * k));
    return {x: cx, y, z, fy: innerWidth < 900 ? .4 : .5};
  }
  function tarjetaHTML(r, j){
    const g = hermanos(r), js = jarsSec(), i = js.indexOf(j);
    const f = r.form && r.form !== "—" ? r.form : "";
    return `<div class="fo-asa" aria-hidden="true"></div>
      <div class="fo-cab">
        <button class="cerrar" type="button" data-foco-cerrar aria-label="Volver al estante">${icon("x")}</button>
        <div class="fo-nav"><button class="cerrar" type="button" data-foco-paso="-1" aria-label="Frasco anterior"${i <= 0 ? " disabled" : ""}>${icon("arrow-left")}</button>
          <span class="mono">${i + 1}/${js.length}</span>
          <button class="cerrar" type="button" data-foco-paso="1" aria-label="Frasco siguiente"${i >= js.length - 1 ? " disabled" : ""}>${icon("arrow-right")}</button></div>
      </div>
      <h2 id="foco-t" tabindex="-1">${esc(r.nom)}</h2>
      <div class="fo-meta">${f ? `<span class="fo-form">${f}</span>` : ""}${sig(r.sen)}<span class="mono">${r.id}${g.length > 1 ? ` · ${g.length} envases` : ""}</span></div>
      ${r.pic.length ? `<div class="fo-pics">${r.pic.map(p => picto(p, 40)).join("")}</div>` : ""}
      <div class="fo-btns">
        <button class="btn fo-aux" type="button" data-foco-ficha="aux">${icon("first-aid", "fill")}Primeros auxilios</button>
        <button class="btn pri" type="button" data-foco-ficha="ficha">${icon("file-text", "fill")}Ver ficha</button>
      </div>`;
  }
  function entrarFoco(j, {hist = true} = {}){
    const r = RI[j.dataset.frasco]; if (!r) return;
    const cambio = !!enFoco;
    focoT = performance.now();
    enFoco?.classList.remove("enfoco");
    enFoco = j; j.classList.add("enfoco");
    escena.classList.add("con-foco");
    document.body.classList.add("en-foco");
    marcar(r.nom);
    const t = $("#foco");
    t.innerHTML = tarjetaHTML(r, j);
    if (!cambio){
      t.hidden = false; $("#foco-velo").hidden = false;
      if (hist) history.pushState({foco: r.id}, "", location.hash);
      // El visor sube hasta debajo de la barra para que el frasco quede a la vista sobre la tarjeta.
      const top = visor.getBoundingClientRect().top - ($(".bar")?.offsetHeight || 0) - 10;
      if (Math.abs(top) > 4) scrollBy({top, behavior: reduce.matches ? "auto" : "smooth"});
      anim($("#foco-velo"), [{opacity: 0}, {opacity: 1}], {duration: 260});
      anim(t, [{transform: "translateY(100%)"}, {transform: "none"}], {duration: 420, easing: EASE});
    } else {
      history.replaceState({foco: r.id}, "", location.hash);
      anim(t.querySelector("h2"), [{opacity: 0, transform: "translateY(6px)"}, {opacity: 1, transform: "none"}], {duration: 240, easing: EASE});
    }
    camara(camFoco(j));
    t.querySelector("#foco-t").focus({preventScroll: true});
  }
  function salirFoco({hist = true, animar = true} = {}){
    if (!enFoco) return;
    if (hist && history.state?.foco){ history.back(); return; }   // popstate vuelve a llamar con hist:false
    const j = enFoco; enFoco = null;
    j.classList.remove("enfoco");
    escena.classList.remove("con-foco");
    document.body.classList.remove("en-foco");
    const t = $("#foco"), v = $("#foco-velo");
    if (cur) camara({...centro(cur), z: 1}, animar);
    const fin = () => { if (!enFoco){ t.hidden = true; v.hidden = true; t.style.transform = ""; } };
    if (!animar || reduce.matches) fin();
    else { anim(v, [{opacity: 1}, {opacity: 0}], {duration: 220, fill: "forwards"}).then(a => a?.cancel?.());
      anim(t, [{transform: t.style.transform || "none"}, {transform: "translateY(105%)"}], {duration: 260, easing: "cubic-bezier(.3,0,.8,.15)", fill: "forwards"}).then(a => { fin(); a?.cancel?.(); }); }
    document.querySelector(`#sec-lista .fila[data-r="${j.dataset.frasco}"], #sec-lista .fila.marca`)?.focus({preventScroll: true});
    marcar(null);
  }
  function pasoFoco(d){
    if (!enFoco) return;
    const js = jarsSec(), i = js.indexOf(enFoco) + d;
    if (js[i]) entrarFoco(js[i]);
  }

  function gestos(){
    // Visor: tocar un frasco lo trae al frente; tocar otra sección mueve la cámara; deslizar pasa
    // a la sección vecina (o, con un frasco en foco, al frasco vecino).
    let x0 = 0, y0 = 0, on = false;
    visor.addEventListener("pointerdown", e => { x0 = e.clientX; y0 = e.clientY; on = true; });
    visor.addEventListener("pointercancel", () => { on = false; });
    visor.addEventListener("pointerup", e => {
      if (!on) return; on = false;
      const dx = e.clientX - x0, dy = e.clientY - y0;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.3){
        if (enFoco) { pasoFoco(dx < 0 ? 1 : -1); return; }
        if (!cur) return;
        const g = GEO[cur], fila = ORDEN.filter(s => GEO[s].row === g.row);
        const n = fila[fila.indexOf(cur) + (dx < 0 ? 1 : -1)];
        if (n) irSeccion(n);
        return;
      }
      if (Math.abs(dx) > 10 || Math.abs(dy) > 10) return;
      const el = document.elementFromPoint(e.clientX, e.clientY);
      const jar = el?.closest?.(".sec.on .jar");
      if (jar && cur){ if (jar === enFoco) abrirDesdeFoco("ficha"); else entrarFoco(jar); return; }
      if (enFoco){ salirFoco(); return; }
      const sec = el?.closest?.(".sec");
      if (sec && sec.dataset.seccion !== cur) irSeccion(sec.dataset.seccion);
    });
    // Tarjeta del frasco en foco: se cierra arrastrándola hacia abajo.
    const t = $("#foco");
    let ty = 0, dy = 0, arr = false, hist = [];
    t.addEventListener("pointerdown", e => { if (e.target.closest("button")) return; arr = true; ty = e.clientY; dy = 0; hist = [[performance.now(), 0]]; });
    t.addEventListener("pointermove", e => {
      if (!arr) return; dy = Math.max(0, e.clientY - ty);
      if (dy > 4) { try { t.setPointerCapture(e.pointerId); } catch(_){} }
      hist.push([performance.now(), dy]); if (hist.length > 6) hist.shift();
      t.style.transform = `translateY(${dy}px)`;
    });
    const suelta = () => {
      if (!arr) return; arr = false;
      const v = (hist.at(-1)[1] - hist[0][1]) / Math.max(1, hist.at(-1)[0] - hist[0][0]);
      if (dy > 80 || v > .5) salirFoco();
      else { anim(t, [{transform: t.style.transform}, {transform: "none"}], {duration: 260, easing: EASE}); t.style.transform = ""; }
    };
    t.addEventListener("pointerup", suelta); t.addEventListener("pointercancel", suelta);
    // El toque que trae el frasco termina en un "click" que, con la página ya desplazada, cae sobre el velo: se ignora.
    $("#foco-velo").addEventListener("click", () => { if (performance.now() - focoT > 450) salirFoco(); });
    // Lista ↔ estante: pasar por una fila marca su frasco.
    const lista = $("#sec-lista");
    lista.addEventListener("pointerover", e => { const f = e.target.closest(".fila"); if (f && !enFoco) marcar(f.dataset.prod); });
    lista.addEventListener("pointerleave", () => { if (!enFoco) marcar(null); });
    lista.addEventListener("focusin", e => { const f = e.target.closest(".fila"); if (f && !enFoco) marcar(f.dataset.prod); });
    addEventListener("popstate", e => { if (enFoco && !e.state?.foco && !document.querySelector("dialog[open]")) salirFoco({hist: false}); });
    document.addEventListener("keydown", e => {
      if (!enFoco || document.querySelector("dialog[open]")) return;
      if (e.key === "Escape"){ e.preventDefault(); salirFoco(); }
      else if (e.key === "ArrowRight") pasoFoco(1);
      else if (e.key === "ArrowLeft") pasoFoco(-1);
    });
    t.addEventListener("click", e => {
      if (e.target.closest("[data-foco-cerrar]")) salirFoco();
      const p = e.target.closest("[data-foco-paso]"); if (p) pasoFoco(+p.dataset.focoPaso);
      const f = e.target.closest("[data-foco-ficha]"); if (f) abrirDesdeFoco(f.dataset.focoFicha);
    });
  }
  // De la tarjeta a la ficha: la etiqueta del frasco grande se vuelve la etiqueta de la ficha.
  function abrirDesdeFoco(modo){
    if (!enFoco) return;
    abrirFicha(enFoco.dataset.frasco, {desde: enFoco.querySelector(".jar-in"), aux: modo === "aux"});
  }

  return {
    render, montar, marcar, GEO,
    salirFoco, hayFoco: () => !!enFoco,
    frascoDe: id => document.querySelector(`#escena .sec.on .jar[data-frasco="${id}"] .jar-in`),
    actual: () => cur,
  };
}
