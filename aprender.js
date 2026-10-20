// Aprender: seis lecciones cortas e interactivas sobre seguridad en el laboratorio.
// El contenido sale del manual de capacitación (documento 07) y de los afiches 11, 15, 16 y 17.
// Los ejemplos se toman de los reactivos reales del laboratorio (datos/reactivos.json).

const CLAVE = "embv-aprender-v1";

export const LECCIONES = [
  {id:"etiqueta",     ic:"tag",              t:"Cómo leer una etiqueta",  d:"Las siete partes de la etiqueta de cada frasco.", min:2},
  {id:"pictogramas",  ic:"warning-diamond",  t:"Los 9 pictogramas",       d:"Qué significa cada rombo rojo y cuáles hay acá.", min:2},
  {id:"rombo",        ic:"diamond",          t:"El rombo de colores",     d:"Cómo se lee el NFPA 704, color por color.", min:2},
  {id:"juntos",       ic:"arrows-left-right",t:"¿Pueden ir juntos?",      d:"Un juego con pares reales del estante.", min:2},
  {id:"reglas",       ic:"list-checks",      t:"Las reglas del laboratorio", d:"Las quince normas, una por una.", min:2},
  {id:"evaluacion",   ic:"graduation-cap",   t:"Autoevaluación",          d:"Diez preguntas para cerrar la capacitación.", min:3},
];

// Documento 15: qué significa cada pictograma.
const PICTO_TXT = {
  GHS01:["Explosivo", "Explota por golpe, roce o calor."],
  GHS02:["Inflamable", "Arde con facilidad. Lejos del mechero y de toda llama."],
  GHS03:["Comburente", "Alimenta el fuego de otras cosas. Nunca junto a inflamables ni papel."],
  GHS04:["Gas a presión", "El envase estalla si se calienta."],
  GHS05:["Corrosivo", "Quema la piel y destruye los ojos. Antiparras y guantes siempre."],
  GHS06:["Toxicidad aguda", "Puede matar en poca cantidad. Sólo lo manipula el docente."],
  GHS07:["Nocivo o irritante", "Irrita piel, ojos y vías respiratorias. No respirar el polvo ni los vapores."],
  GHS08:["Peligro grave para la salud", "Daño a largo plazo: cáncer, órganos, fertilidad. Exposición mínima."],
  GHS09:["Peligro ambiental", "Tóxico para los peces. Nunca a la pileta: va al recipiente de residuos."],
};
const PICTOS = Object.keys(PICTO_TXT);

// Documento 16: la escala de cada color del rombo.
const ROMBO = {
  f:{color:"Rojo, arriba", q:"¿Qué tan fácil se enciende?", tono:"#e1251b", esc:["No se inflama", "Se inflama por encima de 93 °C", "Se inflama por debajo de 93 °C", "Se inflama por debajo de 37 °C", "Se inflama por debajo de 25 °C"]},
  h:{color:"Azul, a la izquierda", q:"¿Cuánto daña la salud?", tono:"#1f5fbf", esc:["Sin riesgo", "Poco peligroso", "Peligroso", "Muy peligroso", "Mortal"]},
  r:{color:"Amarillo, a la derecha", q:"¿Qué tan inestable es?", tono:"#f6c700", esc:["Estable", "Inestable si se lo calienta", "Inestable si reacciona", "Puede explotar por choque o calor", "Puede explotar de golpe"]},
  s:{color:"Blanco, abajo", q:"¿Tiene un riesgo especial?", tono:"#ffffff"},
};
const ESPECIAL = {
  OX:["OX · Oxidante", "Alimenta el fuego de otras cosas. Nunca junto a inflamables, papel ni trapos."],
  W:["W tachada · No usar agua", "Reacciona violentamente con el agua. Si se incendia, nunca agua: con sodio, magnesio o carburo, sólo arena seca."],
  COR:["COR · Corrosivo", "Quema la piel y destruye los ojos."],
};

// Documento 07, módulo 4: los grupos que nunca se juntan.
const NUNCA = [
  ["Ácidos y bases", "Neutralización violentamente exotérmica, con proyecciones."],
  ["Oxidantes e inflamables", "El oxidante inflama el disolvente por contacto."],
  ["Oxidantes y combustibles sólidos", "Forman mezclas que detonan por fricción o golpe."],
  ["Ácidos y metales", "Liberan hidrógeno, un gas inflamable."],
  ["Ácidos y carbonatos", "Efervescencia violenta, con proyecciones."],
  ["Reactivos con agua y todo lo demás", "Liberan gas inflamable con la humedad: van en caja estanca aparte."],
  ["Ácido nítrico y productos orgánicos", "El nítrico oxida la materia orgánica."],
];

// Documento 11: normas del laboratorio. El "por qué" sale del documento 07, 08 o 09.
const REGLAS = [
  ["door-open", "Entrar sólo con la autorización del docente.", "Nunca solo."],
  ["goggles", "Guardapolvo, antiparras, pelo recogido y calzado cerrado.", "Las antiparras, puestas desde el inicio y no cuando aparece el riesgo."],
  ["prohibit", "No comer, no beber, no probar nada.", "Jamás. Las manos contaminadas llevan el producto a la boca."],
  ["eyedropper", "Nunca pipetear con la boca.", "Siempre propipeta."],
  ["wind", "No oler ningún producto acercando la nariz al envase.", "Los vapores entran por la vía inhalatoria, la primera en importancia."],
  ["tag", "Leer la etiqueta antes de tomar el envase.", "Sin etiqueta, no se toca."],
  ["drop", "Ácido sobre agua, nunca agua sobre ácido.", "Al revés, la dilución es violenta y proyecta ácido hirviendo."],
  ["thermometer-hot", "No calentar nunca un recipiente cerrado.", ""],
  ["funnel", "Trasvasar con embudo y despacio.", "Nunca remover ácidos con metal: liberan hidrógeno, un gas inflamable."],
  ["fire", "Inflamables lejos del mechero.", "Apagarlo cuando no se usa."],
  ["arrows-left-right", "No cambiar un producto por otro sin permiso del docente.", ""],
  ["flask", "Cerrar cada envase al terminar y devolverlo a su sección.", "Al lugar del que salió, no al primer hueco libre."],
  ["warning", "Vidrio rajado o astillado no se usa.", "Avisar y descartarlo en el contenedor rígido, nunca en el cesto de papeles."],
  ["trash", "Nada se tira a la pileta sin autorización.", "Inflamables, reactivos con agua y productos no biodegradables van a residuos especiales."],
  ["hand-soap", "Lavarse las manos al terminar.", "Siempre, aunque se hayan usado guantes."],
];

// Cuestionario de verificación del documento 07, con las respuestas de los documentos 07, 08 y 09.
const PREGUNTAS = [
  {q:"¿Qué significa este pictograma?", pic:"GHS08", ops:["Daño a largo plazo: cáncer, órganos o fertilidad", "Toxicidad aguda: puede matar en poca cantidad", "Peligro para el ambiente"],
   x:"No mata hoy: daña con el tiempo. Suele tomarse menos en serio que la calavera, y es un error."},
  {q:"Encontrás un frasco sin etiqueta en el estante. ¿Qué hacés?", ops:["No se toca: se rotula «residuo a identificar» y se avisa al ayudante", "Se huele con cuidado para identificarlo", "Se usa si por el aspecto se sabe qué es"],
   x:"Un envase sin etiqueta no es un reactivo: es un residuo. No se huele, no se prueba y no se usa para ver qué es."},
  {q:"Una alumna se salpica un ojo con ácido. ¿Qué se hace primero?", ops:["Agua ya, quince minutos sin parar, y al médico", "Neutralizar con bicarbonato", "Agua dos minutos y esperar a ver si molesta"],
   x:"Es la única emergencia en la que no se consulta nada antes de actuar: se lava y después se averigua."},
  {q:"¿Por qué el clorato de potasio no puede estar junto al azufre?", ops:["Porque forman una mezcla que detona por roce o golpe", "Porque el azufre se evapora con el calor", "Pueden ir juntos si los frascos están cerrados"],
   x:"Oxidantes y combustibles sólidos son dos frascos inofensivos hasta que se rozan."},
  {q:"Se prende fuego una cinta de magnesio sobre la mesada. ¿Con qué se apaga?", ops:["Arena seca", "Agua en abundancia", "Extintor de CO₂"],
   x:"Con sodio, magnesio o carburo de calcio, el agua y el extintor de CO₂ empeoran el fuego."},
  {q:"¿Qué campo del rombo NFPA te dice si podés usar agua?", ops:["El blanco, abajo: una W tachada significa no usar agua", "El rojo, arriba", "El azul, a la izquierda"],
   x:"Rojo: se enciende. Azul: salud. Amarillo: reactividad. Blanco: riesgo especial, con letras."},
  {q:"Sobró alcohol etílico de una práctica. ¿Se puede tirar a la pileta?", ops:["No: es inflamable y va al bidón de residuos", "Sí, con mucha agua", "Sí, si son menos de 100 ml"],
   x:"Alcoholes, acetona, éter de petróleo, aguarrás y aceites van a un bidón cerrado, nunca al desagüe."},
  {q:"¿En qué sección de la ficha de seguridad buscás qué extintor usar?", ops:["En la 5, lucha contra incendios", "En la 4, primeros auxilios", "En la 9, propiedades físicas"],
   x:"En una emergencia se usan cuatro secciones: la 3 (peligros), la 4 (primeros auxilios), la 5 (incendio) y la 6 (derrame). La 5 decide si se puede echar agua."},
  {q:"Se derraman 50 ml de ácido sulfúrico sobre la mesada. ¿Con qué se neutraliza?", ops:["Bicarbonato de sodio, desde el borde hacia el centro", "Agua, para diluirlo", "Un trapo o papel"],
   x:"Nunca echar agua directamente sobre ácido sulfúrico concentrado: la dilución es violenta y proyecta ácido hirviendo."},
  {q:"Durante una emergencia, ¿qué hacen las alumnas y los alumnos?", ops:["Avisan y se alejan, sin intervenir", "Buscan el extintor", "Limpian el derrame con lo que tengan a mano"],
   x:"Avisar, alejar, actuar: en ese orden. Actúa sólo quien está capacitado y sólo si es seguro."},
];

export function crearAprender(k){
  const {D, R, RI, $, esc, icon, picto, nfpa, sig, placa, may, secLabel, claseStyle, claro, SEP} = k;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");

  // ---------- progreso (sólo en este navegador) ----------
  let prog = {done:[], mejor:null};
  try { prog = {...prog, ...JSON.parse(localStorage.getItem(CLAVE) || "{}")}; } catch (e) {}
  const guardar = () => { try { localStorage.setItem(CLAVE, JSON.stringify(prog)); } catch (e) {} };
  const hecho = id => prog.done.includes(id);
  function marcar(id){ if (!hecho(id)){ prog.done.push(id); guardar(); } }

  const rand = a => a[Math.floor(Math.random() * a.length)];
  const mezclar = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const hText = (code, map) => map[code] || code.split("+").map(c => map[c] || c).join(" ");
  const pop = el => { if (!el || reduce.matches) return; el.classList.remove("pop"); void el.offsetWidth; el.classList.add("pop"); };

  let lec = null, host = null;
  // Estado de cada lección
  const st = {
    etiqueta:{r:null, paso:0, fin:false},
    pictogramas:{sel:null, vistos:new Set()},
    rombo:{r:null, q:"f", vistos:new Set(["f"])},
    juntos:{ronda:0, par:null, resp:null, aciertos:0, fin:false},
    reglas:{i:0},
    evaluacion:{i:0, orden:[], resp:[], fin:false},
  };

  // ---------- índice ----------
  function indice(){
    const n = LECCIONES.filter(l => hecho(l.id)).length;
    return `<div><h1 class="vt">Aprender</h1>
      <p class="lede">Seis lecciones cortas para leer una etiqueta, entender los símbolos y saber qué hacer. Salen del manual de capacitación del laboratorio.</p></div>
      <div class="progreso" role="img" aria-label="${n} de ${LECCIONES.length} lecciones vistas"><div class="barra"><i style="width:${Math.round(100 * n / LECCIONES.length)}%"></i></div><span>${n} de ${LECCIONES.length} lecciones vistas</span></div>
      <ul class="lista lecciones">${LECCIONES.map(l => `<li><button class="fila lec" type="button" data-a="ir" data-arg="${l.id}">
        <span class="lec-ic${hecho(l.id) ? " ok" : ""}">${icon(hecho(l.id) ? "check-circle" : l.ic, "fill")}</span>
        <span class="n"><b>${l.t}</b><span class="meta">${l.d}</span></span>
        <span class="lec-min">${l.id === "evaluacion" && prog.mejor != null ? `Mejor: ${prog.mejor}/10` : `${l.min} min`}</span>${icon("caret-right", "bold", "ic chev")}</button></li>`).join("")}</ul>
      ${n ? `<button class="btn" type="button" data-a="reiniciar" style="justify-self:start">${icon("arrow-counter-clockwise")}Empezar de nuevo</button>` : ""}`;
  }
  function cabecera(l){
    return `<div class="lec-cab"><button class="btn" type="button" data-a="ir" data-arg="">${icon("arrow-left")}Aprender</button></div>
      <div><h1 class="vt">${l.t}</h1></div>`;
  }
  function pie(l){
    const i = LECCIONES.indexOf(l), sig = LECCIONES[i + 1];
    return `<div class="lec-pie">${sig ? `<button class="btn pri" type="button" data-a="ir" data-arg="${sig.id}">Siguiente: ${sig.t}${icon("arrow-right")}</button>`
      : `<button class="btn pri" type="button" data-a="ir" data-arg="">Volver a las lecciones${icon("arrow-right")}</button>`}</div>`;
  }

  // ---------- 1. Etiqueta ----------
  const PARTES = ["Qué es", "Pictogramas", "Palabra de advertencia", "Rombo de colores", "Frases H: el peligro", "Frases P: la prudencia", "Dónde se guarda"];
  function frascoEtiqueta(){ return rand(R.filter(r => r.pic.length >= 2 && r.h.length && r.sen !== "No clasificado")); }
  function etiquetaHTML(r, paso, fin){
    const p = n => `parte${!fin && paso === n ? " activa" : ""}" type="button" data-a="parte" data-arg="${n}" aria-pressed="${!fin && paso === n}" aria-label="${n + 1}. ${PARTES[n]}`;
    const num = n => `<span class="num" aria-hidden="true">${n + 1}</span>`;
    const form = r.form && r.form !== "—" ? r.form : "";
    return `<div class="etiqueta${fin ? "" : " enfocada"}">
      <div class="e-cab">EMBV · Laboratorio de Ciencias Naturales</div>
      <div class="e-top">
        <div class="e-izq">
          <button class="${p(0)}">${num(0)}<b class="e-nom">${esc(r.nom)}</b><span class="e-chico">${form}${form && r.cas ? " · " : ""}${r.cas ? "CAS " + esc(r.cas) : ""}</span></button>
          <button class="${p(1)}">${num(1)}<span class="e-pics">${r.pic.map(c => picto(c, 34)).join("")}</span></button>
          <button class="${p(2)}">${num(2)}${sig(r.sen)}</button>
        </div>
        <button class="${p(3)} e-rombo">${num(3)}${nfpa(r.nfpa, 64)}</button>
      </div>
      <button class="${p(4)} e-h">${num(4)}<b>${r.h.join(", ")}</b><span>${r.h.map(h => esc(hText(h, D.H)).replace(/\.?$/, ".")).join(" ")}</span></button>
      <button class="${p(5)} e-p">${num(5)}<b>P:</b> ${r.p.join(", ")}</button>
      <button class="${p(6)} e-pie">${num(6)}<span><b>${esc(r.dest)}</b> · ${esc(D.clasesCorto[r.cl])}</span><span>${r.id}</span></button>
    </div>`;
  }
  function explicaEtiqueta(r, n){
    const [h, f, rr, s] = r.nfpa;
    const nombres = r.pic.map(c => PICTO_TXT[c][0].toLowerCase());
    const txt = [
      `El nombre del producto. Debajo, ${r.form && r.form !== "—" ? `la fórmula (${r.form}) y ` : ""}el número CAS${r.cas ? ` (${esc(r.cas)})` : ""}, que identifica la sustancia en cualquier ficha del mundo.`,
      `Cada rombo rojo es un tipo de peligro. Este frasco tiene ${r.pic.length}: ${nombres.join(", ")}. <button class="enlace" type="button" data-a="ir" data-arg="pictogramas">Ver los nueve pictogramas</button>`,
      `<b>Peligro</b> es el grado más severo; <b>Atención</b>, el menos severo del mismo peligro. Sin palabra no quiere decir inofensivo. Este frasco dice <b>${esc(r.sen)}</b>.`,
      `Rojo: se enciende (<b>${f}</b>). Azul: salud (<b>${h}</b>). Amarillo: reactividad (<b>${rr}</b>). Blanco: ${s ? `riesgo especial <b>${esc(s)}</b>` : "sin riesgo especial"}. Van de 0 a 4 y no se suman. <button class="enlace" type="button" data-a="ir" data-arg="rombo">Aprender a leerlo</button>`,
      `Las frases H describen el peligro, cada una con su código. Por ejemplo, ${r.h[0]}: <i>${esc(hText(r.h[0], D.H))}</i>`,
      `Las frases P dicen cómo protegerse${r.p.length ? `. Por ejemplo, ${r.p[0]}: <i>${esc(hText(r.p[0], D.P))}</i>` : "."}`,
      `Va en la sección <b>${esc(secLabel(r.dest))}</b> (${esc(D.clases[r.cl])}). Siempre vuelve al lugar del que salió. ${r.id} es su ficha en esta página. <button class="enlace" type="button" data-r="${r.id}">Abrir la ficha</button>`,
    ][n];
    return `<h3>${n + 1}. ${PARTES[n]}</h3><p>${txt}</p>`;
  }
  function renderEtiqueta(){
    const s = st.etiqueta; if (!s.r) s.r = frascoEtiqueta();
    const r = s.r;
    return `<p class="lede">Cada frasco del laboratorio lleva esta etiqueta, con los datos de su producto. Tocá cada parte o seguí con las flechas.</p>
      <div class="lec-etiqueta">
        <div class="grupo" style="justify-items:center">${etiquetaHTML(r, s.paso, s.fin)}
          <button class="btn" type="button" data-a="otro-frasco">${icon("shuffle")}Probar con otro frasco</button></div>
        <div class="grupo">
          ${s.fin ? "" : `<div class="placa explica pop" aria-live="polite">${explicaEtiqueta(r, s.paso)}
            <div class="nav-pasos"><button class="btn redondo" type="button" data-a="paso" data-arg="-1" aria-label="Parte anterior" ${s.paso ? "" : "disabled"}>${icon("arrow-left")}</button>
              <span class="puntos" aria-hidden="true">${PARTES.map((_, i) => `<i class="${i === s.paso ? "on" : i < s.paso ? "ya" : ""}"></i>`).join("")}</span>
              <button class="btn redondo" type="button" data-a="paso" data-arg="1" aria-label="${s.paso === 6 ? "Terminar" : "Parte siguiente"}">${icon(s.paso === 6 ? "check-circle" : "arrow-right")}</button></div></div>`}
          ${s.fin ? `${placa("rojo", "prohibit", "Sin etiqueta, no se toca", `<p>Un envase sin etiqueta no es un reactivo: es un residuo. No se huele, no se prueba y no se usa para ver qué es. Se rotula <b>residuo a identificar</b>, se deja donde está y se avisa al ayudante.</p>`)}
            <div class="placa grupo"><h3 class="h3" style="margin:0">La ficha amplía la etiqueta</h3><p>La ficha de seguridad tiene 16 secciones. En una emergencia se usan cuatro: la <b>3</b> (peligros), la <b>4</b> (primeros auxilios), la <b>5</b> (incendio: decide si se puede echar agua) y la <b>6</b> (derrame).</p></div>
            <div class="placa grupo"><h3 class="h3" style="margin:0">Ejercicio</h3><p>Tomá tres frascos y respondé en voz alta, mirando la etiqueta: qué es, qué pictogramas tiene, qué dice el blanco del rombo, dónde se guarda y qué se hace si cae sobre la piel.</p>
              <button class="btn" type="button" data-a="repasar" style="justify-self:start">${icon("arrow-counter-clockwise")}Repasar la etiqueta</button></div>` : ""}
        </div>
      </div>`;
  }

  // ---------- 2. Pictogramas ----------
  function renderPictogramas(){
    const s = st.pictogramas;
    const det = s.sel ? (() => {
      const c = s.sel, [nom, txt] = PICTO_TXT[c], rs = R.filter(r => r.pic.includes(c));
      return `<div class="placa detalle-pic pop" aria-live="polite">${picto(c, 96)}<div class="grupo">
        <h3 style="font-size:1.3rem;font-weight:800">${nom}</h3><p>${txt}</p>
        <p class="cuenta">${rs.length ? `En este laboratorio: ${rs.length} ${rs.length === 1 ? "reactivo" : "reactivos"}` : "No hay ninguno en este laboratorio."}</p>
        ${rs.length ? `<div class="chips">${rs.slice(0, 6).map(r => `<button class="chip" type="button" data-r="${r.id}">${esc(r.nom)}</button>`).join("")}${rs.length > 6 ? `<span class="cuenta">y ${rs.length - 6} más</span>` : ""}</div>` : ""}</div></div>`;
    })() : `<div class="placa explica"><p>Tocá un pictograma para ver qué significa y cuáles de los frascos del laboratorio lo llevan.</p></div>`;
    return `<p class="lede">El rombo rojo de la etiqueta dice qué tipo de peligro tiene el producto. Hay nueve.</p>
      <p class="cuenta">Viste ${s.vistos.size} de 9</p>
      <div class="lec-dos"><div class="grilla-pic">${PICTOS.map(c => `<button class="tarjeta-pic${s.sel === c ? " sel" : ""}${s.vistos.has(c) ? " visto" : ""}" type="button" data-a="pic" data-arg="${c}" aria-pressed="${s.sel === c}">${picto(c, 64)}<span>${PICTO_TXT[c][0]}</span></button>`).join("")}</div>
      <div class="grupo">${det}</div></div>
      <div class="placa grupo"><h3 class="h3" style="margin:0">Los dos que más se confunden</h3>
        <div class="dos"><div class="compara">${picto("GHS06", 56)}<p><b>La calavera:</b> una dosis pequeña puede matar en poco tiempo.</p></div>
        <div class="compara">${picto("GHS08", 56)}<p><b>El torso con la estrella:</b> cáncer, mutación, daño reproductivo o de órganos. No mata hoy: daña con el tiempo, y por eso suele tomarse menos en serio.</p></div></div></div>
      <div class="placa grupo"><h3 class="h3" style="margin:0">La palabra debajo de los pictogramas</h3>
        <div class="palabras"><div><span class="palabra pel">Peligro</span><p>El grado más severo.</p></div><div><span class="palabra ate">Atención</span><p>El grado menos severo del mismo peligro.</p></div><div><span class="palabra nc">Sin palabra</span><p>No es inofensivo: no se come ni se tira a la pileta.</p></div></div></div>`;
  }

  // ---------- 3. Rombo ----------
  function romboGrande(r, q){
    const [h, f, rr, s] = r.nfpa;
    const cuad = (k, d, fill, tx, ty, val, txtFill, extra = "") => `<g class="cuad${q === k ? " sel" : ""}" role="button" tabindex="0" data-a="cuad" data-arg="${k}" aria-pressed="${q === k}" aria-label="${ROMBO[k].color}: ${ROMBO[k].q}">
      <path d="${d}" fill="${fill}"/><text x="${tx}" y="${ty}" fill="${txtFill}">${val}</text>${extra}</g>`;
    return `<svg class="rombo-grande" viewBox="-4 -4 108 108" role="group" aria-label="Rombo NFPA de ${esc(r.nom)}">
      <g stroke="#111" stroke-width="1.4" stroke-linejoin="round" font-family="Overpass,Arial,sans-serif" font-weight="800" text-anchor="middle">
      ${cuad("f", "M50 2 74 26 50 50 26 26Z", "#e1251b", 50, 34, f, "#fff")}
      ${cuad("h", "M26 26 50 50 26 74 2 50Z", "#1f5fbf", 26, 58, h, "#fff")}
      ${cuad("r", "M74 26 98 50 74 74 50 50Z", "#f6c700", 74, 58, rr, "#111")}
      ${cuad("s", "M50 50 74 74 50 98 26 74Z", "#fff", 50, 82, s ? esc(s) : "", "#111", s === "W" ? `<line x1="41" y1="76" x2="59" y2="76" stroke="#111" stroke-width="2.2"/>` : "")}
      </g></svg>`;
  }
  function renderRombo(){
    const s = st.rombo;
    if (!s.r) s.r = R.find(r => r.id === "R097") || rand(R);
    const r = s.r, [h, f, rr, sp] = r.nfpa, val = {h, f, r: rr}[s.q];
    const info = ROMBO[s.q];
    const panel = s.q === "s"
      ? `<h3>${info.color}</h3><p class="cuenta">${info.q}</p>${sp ? `<p><b>${esc((ESPECIAL[sp] || [sp])[0])}</b></p><p>${esc((ESPECIAL[sp] || ["", "Riesgo especial indicado con letras."])[1])}</p>` : `<p>Este frasco no tiene riesgo especial.</p>`}
         <div class="especiales">${Object.values(ESPECIAL).map(([t, d]) => `<div><b>${esc(t)}</b><span>${esc(d)}</span></div>`).join("")}</div>`
      : `<h3>${info.color}</h3><p class="cuenta">${info.q}</p>
         <ol class="escala" reversed>${[4, 3, 2, 1, 0].map(n => `<li class="${n === val ? "aqui" : ""}" style="--tono:${info.tono}"><b>${n}</b><span>${info.esc[n]}</span>${n === val ? `<em>${esc(r.nom.split(" ")[0])}</em>` : ""}</li>`).join("")}</ol>`;
    return `<p class="lede">Va arriba a la derecha de cada etiqueta (norma NFPA 704). Cuatro colores, cada uno de 0 a 4. <b>Los números no se suman:</b> cada color se lee por separado.</p>
      <p class="cuenta">Viste ${s.vistos.size} de 4 colores</p>
      <div class="lec-dos"><div class="grupo" style="justify-items:center">
          <p class="rombo-de"><b>${esc(r.nom)}</b>${sig(r.sen)}</p>
          ${romboGrande(r, s.q)}
          <button class="btn" type="button" data-a="otro-rombo">${icon("shuffle")}Probar con otro frasco</button></div>
        <div class="placa explica pop" aria-live="polite">${panel}</div></div>`;
  }

  // ---------- 4. ¿Pueden ir juntos? ----------
  const RONDAS = 5;
  const conGrupo = R.filter(r => D.matriz[r.gr]);
  const nivel = (a, b) => a.gr === b.gr ? 0 : (D.matriz[a.gr] || {})[b.gr] ?? 0;
  function nuevoPar(){
    const objetivo = rand([0, 1, 2, 2]); // más rondas con incompatibles: es lo que importa reconocer
    for (let i = 0; i < 400; i++){ const a = rand(conGrupo), b = rand(conGrupo); if (a !== b && a.dest !== b.dest && nivel(a, b) === objetivo) return [a, b]; }
    const a = rand(conGrupo); return [a, rand(conGrupo.filter(b => b !== a))];
  }
  const OPC = [[0, "shield-check", "Pueden ir juntos"], [1, "warning", "Mismo estante, separados"], [2, "prohibit", "Nunca juntos"]];
  function frascoMini(r){
    return `<div class="placa frasco"><div class="pics">${r.pic.map(c => picto(c, 34)).join("") || `<span class="cuenta">Sin pictograma</span>`}</div><b>${esc(r.nom)}</b><span class="cuenta">${esc(D.gruposNom[r.gr] || "")}</span></div>`;
  }
  function renderJuntos(){
    const s = st.juntos;
    if (s.fin) return `<div class="placa color ${s.aciertos >= 4 ? "verde" : s.aciertos >= 2 ? "amarillo" : "rojo"} resultado pop"><div class="cab"><span class="simbolo">${icon("trophy", "fill")}</span><h3>Acertaste ${s.aciertos} de ${RONDAS}</h3></div>
        <p>${s.aciertos === RONDAS ? "Perfecto: reconocés las incompatibilidades del estante." : "Repasá los grupos que nunca se juntan y volvé a probar."}</p></div>
      <div class="placa grupo"><h3 class="h3" style="margin:0">Los grupos que nunca se juntan</h3><ul class="frases">${NUNCA.map(([g, p]) => `<li><span><b>${g}.</b> ${p}</span></li>`).join("")}</ul></div>
      <button class="btn" type="button" data-a="juntos-otra" style="justify-self:start">${icon("arrow-counter-clockwise")}Jugar de nuevo</button>`;
    if (!s.par) s.par = nuevoPar();
    const [a, b] = s.par, n = nivel(a, b);
    const mot = D.motivos[a.gr + "|" + b.gr] || D.motivos[b.gr + "|" + a.gr] || "";
    const fb = s.resp == null ? "" : (() => {
      const ok = s.resp === n, [, ic, t] = OPC[n];
      return placa(ok ? "verde" : "rojo", ok ? "check-circle" : "x-circle", ok ? "¡Bien!" : `No: ${t.toLowerCase()}`,
        `<p>${n === 2 ? (mot ? `${esc(may(mot))}.` : "Son grupos químicamente incompatibles.") : n === 1 ? "Pueden compartir estante, pero con separación física." : "Pueden compartir sección."}</p>
         <p>En el plan: ${esc(a.nom)} va en ${esc(secLabel(a.dest))} y ${esc(b.nom)} en ${esc(secLabel(b.dest))}.</p>`, " pop");
    })();
    return `<p class="lede">Dos frascos reales del estante. ¿Se pueden guardar juntos?</p>
      <div class="marcador" aria-label="Ronda ${s.ronda + 1} de ${RONDAS}">${Array.from({length: RONDAS}, (_, i) => `<i class="${i < s.ronda ? "ya" : i === s.ronda ? "on" : ""}"></i>`).join("")}<span>Ronda ${s.ronda + 1} de ${RONDAS}${SEP}${s.aciertos} ${s.aciertos === 1 ? "acierto" : "aciertos"}</span></div>
      <div class="par">${frascoMini(a)}<span class="mas" aria-hidden="true">+</span>${frascoMini(b)}</div>
      <div class="opciones-juego">${OPC.map(([v, ic, t]) => `<button class="btn opc${s.resp != null ? (v === n ? " correcta" : v === s.resp ? " mal" : "") : ""}" type="button" data-a="juntos" data-arg="${v}" ${s.resp != null ? "disabled" : ""}>${icon(ic, "fill")}${t}</button>`).join("")}</div>
      ${fb}
      ${s.resp != null ? `<button class="btn pri" type="button" data-a="juntos-sig" style="justify-self:start">${s.ronda + 1 < RONDAS ? "Otro par" : "Ver resultado"}${icon("arrow-right")}</button>` : ""}`;
  }

  // ---------- 5. Reglas ----------
  function renderReglas(){
    const s = st.reglas, [ic, t, x] = REGLAS[s.i];
    return `<p class="lede">Las normas que están pegadas en la pared del laboratorio. Deslizá o usá las flechas.</p>
      <div class="mazo" data-mazo>
        <div class="placa regla pop" aria-live="polite"><span class="regla-ic">${icon(ic, "fill")}</span><p class="regla-t">${esc(t)}</p>${x ? `<p class="regla-x">${esc(x)}</p>` : ""}</div>
      </div>
      <div class="nav-pasos"><button class="btn redondo" type="button" data-a="regla" data-arg="-1" aria-label="Regla anterior" ${s.i ? "" : "disabled"}>${icon("arrow-left")}</button>
        <span class="cuenta">${s.i + 1} de ${REGLAS.length}</span>
        <button class="btn redondo" type="button" data-a="regla" data-arg="1" aria-label="Regla siguiente" ${s.i < REGLAS.length - 1 ? "" : "disabled"}>${icon("arrow-right")}</button></div>
      <div class="barra" style="max-width:420px;justify-self:center;width:100%"><i style="width:${Math.round(100 * (s.i + 1) / REGLAS.length)}%"></i></div>`;
  }

  // ---------- 6. Autoevaluación ----------
  function iniciarEval(){ const e = st.evaluacion; e.i = 0; e.fin = false; e.resp = []; e.orden = PREGUNTAS.map(p => mezclar(p.ops.map((_, j) => j))); }
  function renderEvaluacion(){
    const e = st.evaluacion; if (!e.orden.length) iniciarEval();
    if (e.fin){
      const ok = e.resp.filter(x => x === 0).length;
      const mal = PREGUNTAS.map((p, i) => [p, e.resp[i]]).filter(([, x]) => x !== 0);
      return `<div class="placa color ${ok >= 8 ? "verde" : ok >= 5 ? "amarillo" : "rojo"} resultado pop"><div class="cab"><span class="simbolo">${icon("graduation-cap", "fill")}</span><h3>${ok} de ${PREGUNTAS.length} respuestas correctas</h3></div>
          <p>${ok === PREGUNTAS.length ? "Perfecto." : ok >= 8 ? "Muy bien. Repasá lo que quedó abajo." : "No es una evaluación con nota: sirve para ver qué repasar."}</p></div>
        ${mal.length ? `<div class="placa grupo"><h3 class="h3" style="margin:0">Para repasar</h3><ul class="frases aux">${mal.map(([p]) => `<li><span><b>${esc(p.q)}</b> ${esc(p.ops[0])}.</span></li>`).join("")}</ul></div>` : ""}
        <button class="btn" type="button" data-a="eval-otra" style="justify-self:start">${icon("arrow-counter-clockwise")}Hacerla de nuevo</button>`;
    }
    const p = PREGUNTAS[e.i], r = e.resp[e.i];
    return `<div class="marcador">${PREGUNTAS.map((_, i) => `<i class="${i < e.i ? (e.resp[i] === 0 ? "ya" : "mal") : i === e.i ? "on" : ""}"></i>`).join("")}<span>Pregunta ${e.i + 1} de ${PREGUNTAS.length}</span></div>
      <div class="placa pregunta pop"><h2>${esc(p.q)}</h2>${p.pic ? picto(p.pic, 84) : ""}
        <div class="opciones">${e.orden[e.i].map(j => `<button class="opc-q${r != null ? (j === 0 ? " correcta" : j === r ? " mal" : "") : ""}" type="button" data-a="resp" data-arg="${j}" ${r != null ? "disabled" : ""}>${r != null && j === 0 ? icon("check-circle", "fill") : r === j ? icon("x-circle", "fill") : `<span class="o" aria-hidden="true"></span>`}<span>${esc(p.ops[j])}</span></button>`).join("")}</div>
        ${r != null ? `<p class="porque pop">${r === 0 ? "<b>Correcto.</b> " : "<b>No.</b> "}${esc(p.x)}</p>
          <button class="btn pri" type="button" data-a="eval-sig" style="justify-self:start">${e.i + 1 < PREGUNTAS.length ? "Siguiente pregunta" : "Ver resultado"}${icon("arrow-right")}</button>` : ""}</div>`;
  }

  const RENDER = {etiqueta: renderEtiqueta, pictogramas: renderPictogramas, rombo: renderRombo, juntos: renderJuntos, reglas: renderReglas, evaluacion: renderEvaluacion};
  function render(id){
    lec = LECCIONES.find(l => l.id === id) ? id : null;
    host = $("#v-aprender");
    if (!lec){ host.innerHTML = indice(); return; }
    const l = LECCIONES.find(x => x.id === lec);
    host.innerHTML = `${cabecera(l)}<div class="lec-cuerpo grupo" style="gap:18px">${RENDER[lec]()}</div>${pie(l)}`;
  }
  // Redibuja sólo el cuerpo de la lección, sin mover la página.
  function refrescar(){ const c = host?.querySelector(".lec-cuerpo"); if (c) c.innerHTML = RENDER[lec](); }

  // ---------- interacción ----------
  function accion(a, arg, irA){
    switch (a){
      case "ir": irA(arg); return;
      case "reiniciar": prog = {done:[], mejor:null}; guardar(); render(null); return;
      case "parte": { const s = st.etiqueta; s.fin = false; s.paso = +arg; break; }
      case "paso": { const s = st.etiqueta; const n = s.paso + +arg; if (n > 6){ s.fin = true; marcar("etiqueta"); } else s.paso = Math.max(0, n); break; }
      case "repasar": st.etiqueta.fin = false; st.etiqueta.paso = 0; break;
      case "otro-frasco": { const s = st.etiqueta; s.r = frascoEtiqueta(); break; }
      case "pic": { const s = st.pictogramas; s.sel = arg; s.vistos.add(arg); if (s.vistos.size === 9) marcar("pictogramas"); break; }
      case "cuad": { const s = st.rombo; s.q = arg; s.vistos.add(arg); if (s.vistos.size === 4) marcar("rombo"); break; }
      case "otro-rombo": { const s = st.rombo; s.r = rand(R.filter(r => r.nfpa.some(v => v))); break; }
      case "juntos": { const s = st.juntos; if (s.resp != null) return; s.resp = +arg; if (s.resp === nivel(...s.par)) s.aciertos++; break; }
      case "juntos-sig": { const s = st.juntos; s.ronda++; s.resp = null; s.par = null; if (s.ronda >= RONDAS){ s.fin = true; marcar("juntos"); } break; }
      case "juntos-otra": st.juntos = {ronda:0, par:null, resp:null, aciertos:0, fin:false}; break;
      case "regla": { const s = st.reglas; s.i = Math.min(REGLAS.length - 1, Math.max(0, s.i + +arg)); if (s.i === REGLAS.length - 1) marcar("reglas"); break; }
      case "resp": { const e = st.evaluacion; if (e.resp[e.i] == null) e.resp[e.i] = +arg; break; }
      case "eval-sig": { const e = st.evaluacion; if (e.i + 1 < PREGUNTAS.length) e.i++; else { e.fin = true; const ok = e.resp.filter(x => x === 0).length; prog.mejor = Math.max(prog.mejor ?? 0, ok); marcar("evaluacion"); guardar(); } break; }
      case "eval-otra": iniciarEval(); break;
      default: return;
    }
    refrescar();
    // En el celular la explicación queda debajo de lo que se tocó: se la acerca a la vista.
    if (["parte", "pic", "cuad"].includes(a) && innerWidth < 860)
      host.querySelector(".explica, .detalle-pic")?.scrollIntoView({block: "nearest", behavior: reduce.matches ? "auto" : "smooth"});
    // Al cambiar de pregunta o de ronda, el foco va al bloque nuevo.
    if (["eval-sig", "juntos-sig", "eval-otra", "juntos-otra"].includes(a)) host.querySelector(".lec-cuerpo button:not([disabled])")?.focus({preventScroll: false});
  }
  function click(e, irA){
    const b = e.target.closest("[data-a]"); if (!b || !host?.contains(b)) return false;
    accion(b.dataset.a, b.dataset.arg ?? "", irA); return true;
  }
  function tecla(e, irA){
    const g = e.target.closest?.('[role="button"][data-a]');
    if (!g || !(e.key === "Enter" || e.key === " ")) return false;
    e.preventDefault(); accion(g.dataset.a, g.dataset.arg ?? "", irA); host.querySelector(`[data-a="${g.dataset.a}"][data-arg="${g.dataset.arg}"]`)?.focus(); return true;
  }
  // Deslizar el mazo de reglas con el dedo.
  let x0 = null;
  document.addEventListener("pointerdown", e => { x0 = e.target.closest("[data-mazo]") ? e.clientX : null; });
  document.addEventListener("pointerup", e => {
    if (x0 == null || lec !== "reglas") return; const dx = e.clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) accion("regla", dx < 0 ? "1" : "-1");
  });
  return {render, click, tecla, hayLeccion: id => LECCIONES.some(l => l.id === id)};
}
