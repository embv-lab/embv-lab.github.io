# Laboratorio EMBV · fichas de seguridad (web pública)

Versión pública, **sólo de consulta**, de la página del laboratorio de la Escuela Modelo de
Bella Vista. Es la página a la que llevan los QR de los carteles del estante.

**Dirección:** https://embv-lab.github.io/

## Qué muestra

- **Reactivos:** las 117 fichas resumidas (peligros, primeros auxilios por vía de exposición,
  derrame, incendio, protección personal, eliminación y dónde se guarda).
- **Estante:** el plan de las 12 secciones y el control de compatibilidad entre dos reactivos.
- **Emergencia:** teléfonos, los tres pasos y la búsqueda rápida de un producto.
- **Aprender:** seis lecciones cortas e interactivas, basadas en el manual de capacitación: cómo
  leer una etiqueta, los 9 pictogramas, el rombo de colores, un juego de compatibilidad con pares
  reales del estante, las reglas del laboratorio y una autoevaluación de diez preguntas. El
  progreso se guarda sólo en el navegador de quien la usa (no es un registro de asistencia).
- **Sección:** la vista que abre el QR de cada cartel. Qué va ahí, sus peligros y qué no se
  puede guardar en esa sección.

No guarda nada. El registro del avance (etiquetado, reubicación, capacitación, residuos) está en
la versión privada de la página, dentro del repositorio privado `embv-laboratorio`.

## Enlaces para los QR

| Destino | Enlace |
|---|---|
| Sección del estante | `https://embv-lab.github.io/#E1-4` … `#E1-9`, `#E2-4` … `#E2-9` |
| Caja de riesgo especial | `…/#CAJA-RE` |
| Material didáctico | `…/#MATERIAL` |
| Ficha de un reactivo | `…/#R001` … `#R117` |
| Emergencia | `…/#emergencia` |

Los enlaces no distinguen mayúsculas (`#e1-4` también funciona). Si algún día la página pasa a un
dominio propio, GitHub Pages redirige las direcciones `github.io` al dominio nuevo, así que los QR
ya impresos siguen andando.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | Estructura de la página. |
| `estilos.css` | Todo el diseño (ver `DESIGN.md`). |
| `app.js` | Lógica: búsqueda, fichas, estante, secciones y navegación. |
| `aprender.js` | Las seis lecciones de Aprender. Su contenido sale de los documentos 07, 08, 09, 11, 15, 16 y 17. |
| `iconos.svg` | Pictogramas SGA oficiales (dominio público) e íconos Phosphor (MIT). |
| `tipografia/` | Overpass y Overpass Mono (variables, subconjunto latino) y su licencia OFL. |
| `herramientas/auditoria.mjs` | Auditoría automática antes de publicar (no se publica). |
| `logo.svg` | Logo EMBV. |
| `manifest.webmanifest` | Permite instalar la página en el celular como app. |
| `datos/reactivos.json` | Los datos. Se generan, no se editan a mano. |
| `sw.js` | Guarda una copia para que la página abra sin conexión. |
| `PRODUCT.md`, `DESIGN.md` | Para quien siga el diseño: a quién sirve la página y cómo es su sistema visual. |

## Cómo se actualiza

- **Diseño o funciones:** editar `index.html`, `estilos.css` o `app.js`, commit y push. GitHub Pages
  publica solo en uno o dos minutos.
- **Datos químicos:** la única fuente de verdad es `fuentes/datos_reactivos.py`, en el repositorio
  privado. Después de cambiarla, correr `pagina/export.py` (ver `docs/PAGINA.md` de ese repo),
  copiar el `data.json` resultante sobre `datos/reactivos.json` y actualizar `ACTUALIZADO` en `app.js`.
- **Siempre que cambie algún archivo:** subir el número de `CACHE` en `sw.js` (`embv-v5` → `embv-v6`)
  para que los celulares que ya la abrieron descarguen la versión nueva.
- **Antes de publicar:** con la página servida en local, `node herramientas/auditoria.mjs`. Tiene que
  terminar en "Todo limpio": revisa desbordes, botones chicos, contraste en los dos temas, errores, y
  que los primeros auxilios de la ficha entren en la primera pantalla de un celular.

Para probarla en la compu hace falta un servidor local, porque abrir `index.html` con doble clic no
carga los datos: `python -m http.server` en esta carpeta, o sin Python,
`powershell -ExecutionPolicy Bypass -File herramientas\servir.ps1`. Después, abrir http://localhost:8765/.

## Pendiente

- **QR en los carteles:** se agregan en el repositorio privado (`fuentes/gen_carteles.py`) con los
  enlaces de la tabla de arriba.
- Sumar un segundo dueño a la organización `embv-lab`.
- Automatizar la copia de `datos/reactivos.json` desde el repositorio privado.
- La lista completa y vigente está en `docs/revisiones/2026-10-20-web-publica.md` del repositorio
  privado.

## Datos

Clasificación, fichas de seguridad e inventario del laboratorio. No contiene datos personales.
Los documentos originales, las fotos y el resto del sistema están en el repositorio privado.
