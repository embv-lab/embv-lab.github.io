// Lavado de 15 minutos (ojos o piel). La cuenta se calcula con Date.now(): sigue bien aunque la
// pantalla se apague o el navegador duerma la pestaña. Pide Wake Lock si puede (en un marco
// puede estar bloqueado: no rompe nada) y vibra al terminar. Al minimizarlo queda una píldora
// verde con el tiempo, a un toque, en cualquier vista.

export function crearLavado(ctx){
  const {RI, $, esc, icon, picto, may, reduce, irEmergencia} = ctx;
  const TOTAL = 15 * 60 * 1000, CLAVE = "embv-lavado-v1", C = 2 * Math.PI * 86;
  const VIA_IC = {"Ojos": "eye", "Piel": "hand-palm"};
  const EASE = "cubic-bezier(.16,1,.3,1)";
  const dlg = $("#lavado"), pil = $("#pildora");
  const st = {activo: false, fin: 0, resta: TOTAL, pausado: false, terminado: false, via: "Ojos", rid: null, txt: "", conf: 0};
  let wl = null, tick = null, seg = -1, empujado = false;
  const anim = (el, kf, o) => { if (reduce.matches || !el?.animate) return Promise.resolve(); const a = el.animate(kf, o); return a.finished.then(() => a, () => a); };

  async function pedirWL(){ try { if ("wakeLock" in navigator && !wl && document.visibilityState === "visible"){ wl = await navigator.wakeLock.request("screen"); wl.addEventListener("release", () => { wl = null; }); } } catch(e){ wl = null; } }
  function soltarWL(){ try { wl?.release(); } catch(e){} wl = null; }
  function guardar(){ try { st.activo ? localStorage.setItem(CLAVE, JSON.stringify(st)) : localStorage.removeItem(CLAVE); } catch(e){} }
  const restante = () => st.pausado || st.terminado ? st.resta : Math.max(0, st.fin - Date.now());
  const mmss = ms => { const s = Math.ceil(ms / 1000); return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; };
  const PAUSA = `<svg class="dib" viewBox="0 0 20 20" aria-hidden="true"><rect x="4" y="3" width="4.5" height="14" rx="1.2"/><rect x="11.5" y="3" width="4.5" height="14" rx="1.2"/></svg>`;
  const PLAY = `<svg class="dib" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 3.2v13.6a1 1 0 0 0 1.5.9l11-6.8a1 1 0 0 0 0-1.8l-11-6.8A1 1 0 0 0 5 3.2Z"/></svg>`;

  function html(){
    const r = st.rid ? RI[st.rid] : null;
    const chip = r ? `<div class="lv-chip" id="lv-chip">${r.pic.slice(0, 2).map(p => picto(p, 30)).join("")}<span><b>${esc(r.nom)}</b><small><span class="via">${icon(VIA_IC[st.via], "fill")}${esc(st.via)}</span> <span class="mono">${r.id}</span></small></span></div>`
      : `<div class="lv-chip" id="lv-chip"><span class="lv-ojo">${icon(VIA_IC[st.via], "fill")}</span><span><b>Lavado de ${st.via === "Ojos" ? "ojos" : "piel"}</b><small>Producto sin elegir</small></span></div>`;
    return `<div class="lv-top"><span class="asa" aria-hidden="true"></span>
        <button class="cerrar" type="button" data-lv-min aria-label="Minimizar el contador (sigue corriendo)">${icon("caret-down")}</button>
        <span class="lv-tit">El tiempo sigue aunque lo minimices</span>
        <button class="sos-mini" type="button" data-lv-sos aria-label="Emergencia">${icon("siren", "fill")}</button></div>
      <div class="lv-cuerpo">
        ${chip}
        <div class="anillo${reduce.matches ? " quieto" : ""}" id="lv-anillo">
          <svg viewBox="0 0 200 200" aria-hidden="true"><circle class="pista" cx="100" cy="100" r="86"/>
            <circle class="prog" id="lv-prog" cx="100" cy="100" r="86" stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${C.toFixed(1)}"/>
            ${reduce.matches ? "" : `<g class="punto" id="lv-punto"><circle cx="186" cy="100" r="9"/></g>`}</svg>
          <div class="lv-num" role="timer" aria-live="off"><span class="mono" id="lv-n">15:00</span><small id="lv-s">quedan</small></div>
        </div>
        <p class="lv-estado" id="lv-est" aria-live="polite">Agua corriente, sin parar</p>
        <div class="lv-btns"><button class="btn pri" type="button" id="lv-pausa"></button><button class="btn" type="button" id="lv-fin">Terminar</button></div>
        <p class="lv-txt">${st.txt}</p>
      </div>`;
  }
  function pintar(){
    const ms = restante(), txt = mmss(ms);
    pil.querySelector(".mono").textContent = txt;
    pil.hidden = !st.activo || dlg.open;
    if (!dlg.open) return;
    $("#lv-n").textContent = txt;
    const s = Math.ceil(ms / 1000);
    if (s !== seg){
      seg = s;
      const hecho = 1 - ms / TOTAL;
      $("#lv-prog").setAttribute("stroke-dashoffset", (C * (1 - hecho)).toFixed(1));
      const p = $("#lv-punto"); if (p) p.style.transform = `rotate(${(hecho * 360).toFixed(2)}deg)`;
    }
    $("#lv-anillo").classList.toggle("quieto", reduce.matches || st.pausado);
    $("#lv-pausa").innerHTML = st.terminado ? `${icon("check-circle", "fill")}Listo` : st.pausado ? `${PLAY}Reanudar` : `${PAUSA}Pausar`;
    const f = $("#lv-fin"), conf = Date.now() < st.conf;
    f.hidden = st.terminado; f.classList.toggle("confirma", conf); f.textContent = conf ? "¿Terminar? Tocá de nuevo" : "Terminar";
    const e = $("#lv-est");
    e.classList.toggle("fin", st.terminado);
    e.textContent = st.terminado ? "15 minutos cumplidos" : st.pausado ? "En pausa: el agua no debería parar" : "Agua corriente, sin parar";
    $("#lv-s").textContent = st.terminado ? "cumplidos" : "quedan";
  }
  function bucle(){
    clearInterval(tick);
    tick = setInterval(() => {
      if (st.activo && !st.pausado && !st.terminado && restante() <= 0) terminar();
      pintar();
    }, 250);
  }
  function terminar(){
    st.terminado = true; st.resta = 0; guardar(); soltarWL();
    try { navigator.vibrate?.([400, 200, 400, 200, 600]); } catch(e){}
    pintar();
  }
  function detener(){ Object.assign(st, {activo: false, terminado: false, pausado: false}); clearInterval(tick); soltarWL(); guardar(); pintar(); }

  // Abre el contador. `desde`: la etiqueta de la ficha, que vuela y queda arriba, chica.
  function abrir(desde){
    const de = desde?.getBoundingClientRect();
    dlg.innerHTML = html(); seg = -1;
    if (!dlg.open) dlg.showModal();
    history.pushState({lavado: 1, foco: history.state?.foco}, "", location.hash); empujado = true;
    pintar();
    $("#lv-pausa").focus({preventScroll: true});
    const chip = $("#lv-chip");
    if (de && de.width && chip){
      const to = chip.getBoundingClientRect(), s = de.width / to.width;
      anim(chip, [{transform: `translate(${de.left + de.width / 2 - to.left - to.width / 2}px,${de.top + de.height / 2 - to.top - to.height / 2}px) scale(${s})`, opacity: .6}, {transform: "none", opacity: 1}], {duration: 520, easing: EASE});
    }
    anim($("#lv-anillo"), [{opacity: 0, transform: "scale(.8)"}, {opacity: 1, transform: "none"}], {duration: 520, delay: 120, easing: EASE, fill: "backwards"});
  }
  function empezar(via, rid, desde){
    const r = rid ? RI[rid] : null, v = r?.vias.find(x => x.t === via);
    Object.assign(st, {activo: true, fin: Date.now() + TOTAL, resta: TOTAL, pausado: false, terminado: false, via, rid: rid || null, conf: 0,
      txt: v ? may(v.d) : via === "Ojos" ? "Al lavaojos o a la canilla, ya. Párpado abierto. Siempre al médico." : "Sacale la ropa mojada. No frotes, no neutralices, sin cremas."});
    guardar(); pedirWL(); bucle(); abrir(desde);
  }
  // Minimizar: vuelve atrás en el historial (lo que estaba abajo sigue ahí) y queda la píldora.
  function minimizar(){
    if (!dlg.open) return;
    if (empujado && history.state?.lavado){ history.back(); return; }
    cerrarVisual();
  }
  function cerrarVisual(){
    empujado = false;
    const fin = () => { if (dlg.open) dlg.close(); pintar(); };
    if (reduce.matches) fin();
    else anim(dlg, [{opacity: 1, transform: "none"}, {opacity: 0, transform: "translateY(40px)"}], {duration: 220, fill: "forwards"}).then(a => { fin(); a?.cancel?.(); });
  }
  dlg.addEventListener("cancel", e => { e.preventDefault(); minimizar(); });
  addEventListener("popstate", e => { if (dlg.open && !e.state?.lavado) cerrarVisual(); });
  dlg.addEventListener("click", e => {
    if (e.target.closest("[data-lv-min]")) minimizar();
    else if (e.target.closest("#lv-pausa")){
      if (st.terminado){ detener(); minimizar(); return; }
      if (st.pausado){ st.fin = Date.now() + st.resta; st.pausado = false; pedirWL(); }
      else { st.resta = restante(); st.pausado = true; soltarWL(); }
      seg = -1; guardar(); pintar();
    } else if (e.target.closest("#lv-fin")){
      if (Date.now() < st.conf){ detener(); minimizar(); }
      else { st.conf = Date.now() + 3000; pintar(); }
    } else if (e.target.closest("[data-lv-sos]")){ minimizar(); setTimeout(irEmergencia, 80); }
  });
  pil.addEventListener("click", () => abrir(null));
  document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && st.activo){ if (!st.pausado && !st.terminado) pedirWL(); seg = -1; pintar(); } });
  // Si se recargó la página con un lavado en curso, sigue.
  try { const g = JSON.parse(localStorage.getItem(CLAVE) || "null"); if (g?.activo && (g.pausado || g.terminado || g.fin > Date.now() - 60 * 60 * 1000)){ Object.assign(st, g, {conf: 0}); bucle(); pintar(); } } catch(e){}

  return {empezar, minimizar, activo: () => st.activo};
}
