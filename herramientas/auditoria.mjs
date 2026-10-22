/**
 * Auditoría de la web pública. Falla (código 1) si encuentra cualquiera de estos:
 *   · desborde horizontal de la página
 *   · objetivos táctiles de menos de 44 px (salvo enlaces dentro de un texto)
 *   · campos con letra de menos de 16 px (iOS hace zoom al tocarlos)
 *   · errores de consola o recursos que no cargan
 *   · texto con contraste por debajo de AA, en tema claro y oscuro
 *   · primeros auxilios fuera de la primera pantalla de la ficha (la métrica del producto)
 *   · el final de la ficha con letra gigante (la regresión de .mas del 21/10/2026)
 *   · con movimiento reducido, algo que siga invisible esperando una animación
 *
 * Uso, con la web servida en local (README → "Probar"):
 *   node herramientas/auditoria.mjs [url]
 * Necesita Playwright. Si no está instalado en este repo, se toma de PLAYWRIGHT
 * (ruta a su index.mjs) o de la landing de Kosmos, que lo tiene.
 */
import { pathToFileURL } from "node:url";

const BASE = (process.argv[2] || "http://localhost:8765/").replace(/#.*$/, "");
const PW = process.env.PLAYWRIGHT || "C:/Users/NPint/kosmos-meade-landing/node_modules/playwright/index.mjs";
const { chromium } = await import("playwright").catch(() => import(pathToFileURL(PW).href));

const CELULARES = [["iPhone SE 1.ª gen.", 320, 568], ["Android chico", 360, 740], ["iPhone SE", 375, 667], ["iPhone 13", 390, 844], ["iPhone Pro Max", 430, 932], ["Tablet", 768, 1024]];
const ESCRITORIO = [1024, 1180, 1280, 1440, 1600, 1920, 2560];
// Las vistas que importan: el QR de una sección con productos repetidos, la caja especial,
// la lista entera, una ficha, el estante, una lección y la emergencia.
const RUTAS = ["E1-8", "CAJA-RE", "reactivos", "R050", "estante", "aprender/etiqueta", "emergencia"];

const MEDIR = () => {
  const W = innerWidth, out = {chicos: [], inputs: [], desborde: []};
  const nombre = el => el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") +
    (typeof el.className === "string" && el.className.trim() ? "." + el.className.trim().split(/\s+/)[0] : "");
  const dlg = document.querySelector("dialog[open]");
  for (const el of document.querySelectorAll("body *")) {
    if (dlg && !dlg.contains(el)) continue;                      // lo de atrás de la ficha es inerte
    if (!el.checkVisibility({checkVisibilityCSS: true})) continue;
    const r = el.getBoundingClientRect(); if (!r.width && !r.height) continue;
    let recortado = false;
    for (let p = el.parentElement; p && p !== document.body; p = p.parentElement)
      if (getComputedStyle(p).overflowX !== "visible") { recortado = true; break; }
    if (!recortado && r.right > W + 1.5) out.desborde.push(nombre(el));
    // Las partes de la etiqueta de Aprender tienen el área táctil agrandada con ::after (no se mide acá).
    const enTexto = (el.tagName === "A" && getComputedStyle(el).display === "inline") || el.matches(".parte");
    if (el.matches("a[href],button,select,input,summary") && !enTexto && (r.height < 44 || r.width < 44))
      out.chicos.push(`${nombre(el)} ${Math.round(r.width)}×${Math.round(r.height)}`);
  }
  for (const el of document.querySelectorAll("input,select,textarea"))
    if (el.checkVisibility() && parseFloat(getComputedStyle(el).fontSize) < 16) out.inputs.push(el.id);
  const u = a => [...new Set(a)];
  return {scroll: document.documentElement.scrollWidth, W, chicos: u(out.chicos), inputs: u(out.inputs), desborde: u(out.desborde)};
};

const CONTRASTE = () => {
  const rgb = s => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p[3] ?? 1]; };
  const sobre = (a, b) => [0, 1, 2].map(i => a[i] * a[3] + b[i] * (1 - a[3])).concat(1);
  const lum = c => { const f = x => (x /= 255) <= .03928 ? x / 12.92 : ((x + .055) / 1.055) ** 2.4; return .2126 * f(c[0]) + .7152 * f(c[1]) + .0722 * f(c[2]); };
  const fallas = [], dlg = document.querySelector("dialog[open]"), vistos = new Set();
  const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (w.nextNode()) {
    const el = w.currentNode.parentElement;
    if (!w.currentNode.textContent.trim() || !el || vistos.has(el)) continue; vistos.add(el);
    if (el.closest("[aria-hidden=true],.sr,.etiqueta") || (dlg && !dlg.contains(el))) continue;  // .etiqueta: atenuado didáctico
    if (!el.checkVisibility({checkOpacity: true, checkVisibilityCSS: true})) continue;
    const cs = getComputedStyle(el); let fg = rgb(cs.color); if (!fg) continue;
    let op = 1, capas = [];
    for (let p = el; p; p = p.parentElement) {
      const c = getComputedStyle(p); op *= +c.opacity;
      // Placas, celdas y el segmento de la vía elegida pintan un fondo pleno con pseudo-elemento o imagen: se toma su color.
      const bg = rgb(c.backgroundColor); if (bg && bg[3] > 0) { capas.push(bg); if (bg[3] >= 1) break; }
    }
    let fondo = [255, 255, 255, 1]; for (let i = capas.length - 1; i >= 0; i--) fondo = sobre(capas[i], fondo);
    if (!capas.length || capas.at(-1)[3] < 1) fondo = sobre(fondo, rgb(getComputedStyle(document.body).backgroundColor));
    fg = sobre([fg[0], fg[1], fg[2], fg[3] * op], fondo);
    const a = lum(fg), b = lum(fondo), cr = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
    const fs = parseFloat(cs.fontSize), grande = fs >= 24 || (fs >= 18.66 && +cs.fontWeight >= 700);
    if (el.closest(".vias button[aria-pressed=true]")) continue;   // texto verde sobre la píldora blanca del ::before
    if (cr < (grande ? 3 : 4.5)) fallas.push(`"${w.currentNode.textContent.trim().slice(0, 30)}" ${cr.toFixed(2)}:1`);
  }
  return fallas;
};

const browser = await chromium.launch();
let fallos = 0;
const mal = (titulo, lista) => { fallos++; console.log(`  ✗ ${titulo}: ${lista.slice(0, 8).join(" | ")}${lista.length > 8 ? ` (+${lista.length - 8})` : ""}`); };

async function pagina(w, h, extra = {}) {
  const ctx = await browser.newContext({viewport: {width: w, height: h}, isMobile: w < 900, hasTouch: w < 900, deviceScaleFactor: 2, serviceWorkers: "block", ...extra});
  const page = await ctx.newPage(), errores = [];
  page.on("pageerror", e => errores.push(String(e)));
  page.on("console", m => m.type() === "error" && errores.push(m.text()));
  page.on("response", r => r.status() >= 400 && errores.push(`${r.status()} ${r.url()}`));
  return {ctx, page, errores};
}
async function ir(page, ruta) { await page.goto(BASE + "#" + ruta, {waitUntil: "networkidle"}); await page.waitForTimeout(800); }

// 1. Layout, táctiles, campos, consola: todos los celulares y un barrido de escritorio.
for (const [nom, w, h] of [...CELULARES, ...ESCRITORIO.map(w => [`Escritorio ${w}`, w, 900])]) {
  const {ctx, page, errores} = await pagina(w, h);
  let ok = true;
  for (const ruta of RUTAS) {
    errores.length = 0; await ir(page, ruta);
    const r = await page.evaluate(MEDIR), antes = fallos;
    if (r.scroll > r.W || r.desborde.length) mal(`${nom} #${ruta} desborda (${r.scroll} > ${r.W})`, r.desborde);
    if (r.chicos.length) mal(`${nom} #${ruta} táctiles < 44 px`, r.chicos);
    if (r.inputs.length) mal(`${nom} #${ruta} campos < 16 px`, r.inputs);
    if (errores.length) mal(`${nom} #${ruta} errores`, errores);
    if (fallos > antes) ok = false;
    await page.goto("about:blank");
  }
  if (ok) console.log(`✓ ${nom} ${w}×${h}`);
  await ctx.close();
}

// 2. Contraste en los dos temas.
for (const tema of ["light", "dark"]) for (const w of [390, 1280]) {
  const {ctx, page} = await pagina(w, 900, {colorScheme: tema, reducedMotion: "reduce"});
  let ok = true;
  for (const ruta of RUTAS) {
    await ir(page, ruta);
    const f = await page.evaluate(CONTRASTE);
    if (f.length) { mal(`contraste ${tema} ${w} #${ruta}`, f); ok = false; }
  }
  if (ok) console.log(`✓ contraste ${tema} ${w}`);
  await ctx.close();
}

// 3. La métrica del producto: en la ficha, la instrucción de la vía entra en la primera pantalla.
for (const [w, h] of [[390, 844], [360, 740], [320, 568]]) {
  const {ctx, page} = await pagina(w, h, {reducedMotion: "reduce"});
  for (const id of ["R050", "R025", "R037"]) {
    await ir(page, id);
    const y = await page.evaluate(() => document.querySelector("#ficha .via-txt")?.getBoundingClientRect().bottom ?? Infinity);
    if (y > h) mal(`primeros auxilios bajo el pliegue en #${id} a ${w}×${h}`, [`termina en y=${Math.round(y)}`]);
    else console.log(`✓ primeros auxilios de #${id} a la vista a ${w}×${h} (y=${Math.round(y)})`);
  }
  await ctx.close();
}

// 4. Regresiones puntuales.
{
  const {ctx, page} = await pagina(390, 844, {reducedMotion: "reduce"});
  await ir(page, "R001");
  const fs = await page.evaluate(() => Math.max(...[...document.querySelectorAll("#ficha details.mas summary")].map(s => parseFloat(getComputedStyle(s).fontSize))));
  if (fs > 20) mal("final de la ficha con letra gigante (.mas)", [`${fs}px`]); else console.log(`✓ final de la ficha a ${fs}px`);
  // Con movimiento reducido nada queda esperando: a los 50 ms todo lo de la ficha ya es visible.
  await ir(page, "reactivos");
  await page.click("#rlist button[data-r]");
  await page.waitForTimeout(50);
  const ocultos = await page.evaluate(() => [...document.querySelectorAll("#ficha .entra")].filter(e => +getComputedStyle(e).opacity < .99).length);
  if (ocultos) mal("movimiento reducido: placas invisibles esperando la cascada", [`${ocultos}`]); else console.log("✓ movimiento reducido sin esperas");
  await ctx.close();
}

await browser.close();
console.log(fallos ? `\n${fallos} problema(s). No publicar.` : "\nTodo limpio.");
process.exit(fallos ? 1 : 0);
