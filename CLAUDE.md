# Contexto para Claude Code

Web pública, sólo de consulta, del laboratorio de la Escuela Modelo de Bella Vista (EMBV):
https://embv-lab.github.io/ (GitHub Pages, rama `main`, raíz). Responsable: el ayudante de
laboratorio. Idioma: castellano rioplatense, con voseo.

Leer primero `README.md`, `PRODUCT.md` (a quién sirve) y `DESIGN.md` (sistema visual: señalética
de seguridad). La dirección de diseño acordada está en `.impeccable/briefs/index.md`.

## Reglas

- **Los enlaces de los QR no cambian:** `#E1-4` … `#E2-9`, `#CAJA-RE`, `#MATERIAL`, `#R001` …
  `#R117`, `#emergencia`, `#aprender/<lección>`. Están impresos en los carteles del estante.
- **Los datos químicos no se editan acá.** `datos/reactivos.json` se genera en el repositorio
  privado `WiseMKT/embv-laboratorio` (fuente única: `fuentes/datos_reactivos.py`, exportada con
  `pagina/export.py`). Ver `docs/WEB_PUBLICA.md` de ese repositorio.
- **Repositorio público:** nunca agregar datos personales, fotos ni documentos del repositorio
  privado.
- Lo que muestra la web tiene que coincidir con la etiqueta y la ficha impresas.
- Los colores de seguridad (verde, rojo, amarillo, azul) significan algo: no usarlos de adorno.
- En cada cambio de archivos, subir `CACHE` en `sw.js` (`embv-v6` → `embv-v7`) y, si cambian los
  datos, `ACTUALIZADO` en `app.js`. Si se agrega un archivo, sumarlo a `ARCHIVOS` en `sw.js`.
- `_config.yml` excluye de la publicación los archivos de trabajo (`README.md`, `PRODUCT.md`,
  `DESIGN.md`, `CLAUDE.md`, `herramientas/`, `.impeccable/`).

- Sólo se animan `transform` y `opacity` (nada de `width`, `height`, `padding` ni `margin`) y nada de
  `backdrop-filter` sobre lo que se mueve. Con `prefers-reduced-motion`, todo instantáneo.

## Cómo está armada

`app.js` (navegación por hash, Buscar, ficha con etiqueta y placas apiladas, ficha completa,
compatibilidad, emergencia), `estante.js` (cartel de la sección, estante en SVG con un frasco por
envase, cámara, frasco en foco, lista enlazada), `lavado.js` (contador de 15 minutos y su píldora),
`aprender.js` (lecciones). Detalle visual en `DESIGN.md`.

## Retomar

Estado, decisiones y pendientes al 22/10/2026: `docs/revisiones/2026-10-22-web-estante.md` del
repositorio privado `WiseMKT/embv-laboratorio`. La crítica de diseño que originó la versión actual
está en `.impeccable/critique/`.

## Probar

**Antes de publicar, `node herramientas/auditoria.mjs` tiene que dar "Todo limpio"** (necesita la
página servida en local, Node y Playwright; ver el encabezado del script). En la PC del trabajo no
hay Python ni Node, así que la auditoría se corre en la otra. Servidor local:
`powershell -ExecutionPolicy Bypass -File herramientas\servir.ps1` → http://localhost:8765/.
Sin la extensión de Chrome, Edge headless sirve para verificar: `msedge --headless=new
--dump-dom <url>` (ejecuta el JavaScript) y `--screenshot` (la ventana no baja de unos 500 px de
ancho: para ver el celular, cargar la página en un iframe de 390 px).

## Publicar

`git push` a `main`; GitHub Pages publica en uno o dos minutos. Verificar con `curl` que los
archivos servidos coincidan con los del repositorio.
