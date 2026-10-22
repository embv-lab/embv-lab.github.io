# Laboratorio EMBV · fichas de seguridad (web pública)

Versión pública, **sólo de consulta**, de la página del laboratorio de la Escuela Modelo de
Bella Vista. Es la página a la que llevan los QR de los carteles del estante.

**Dirección:** https://embv-lab.github.io/

## Qué muestra

Cuatro pestañas (abajo en el celular, arriba en la compu):

- **Estante** (inicio): la vista que abre el QR de cada cartel. Arriba, el cartel impreso de la
  sección; abajo, el estante dibujado de frente, con un frasco por envase y la fórmula en cada
  etiqueta. Tocar un frasco lo acerca ("frasco en foco") y desde ahí se entra a su ficha; la lista de
  la sección abre la ficha de una. Debajo, el plano de las secciones y el control de compatibilidad
  entre dos reactivos.
- **Buscar:** las 117 fichas con búsqueda y filtros.
- **Ficha de cada reactivo:** la etiqueta del frasco y las placas de seguridad apiladas (primeros
  auxilios por vía, derrame, incendio, protección) y la **ficha completa** con todo lo que hay en
  los datos (frases H y P, manipulación, eliminación, inventario y las secciones de la ficha de 16
  secciones cuando existe). Desde Ojos o Piel se lanza el **contador de lavado de 15 minutos**.
- **Emergencia:** teléfonos, "primero, agua" con el contador de 15 minutos, los tres pasos y la
  búsqueda rápida de un producto.
- **Aprender:** seis lecciones cortas e interactivas, basadas en el manual de capacitación: cómo
  leer una etiqueta, los 9 pictogramas, el rombo de colores, un juego de compatibilidad con pares
  reales del estante, las reglas del laboratorio y una autoevaluación de diez preguntas. El
  progreso se guarda sólo en el navegador de quien la usa (no es un registro de asistencia).

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
| Estante entero / Buscar | `…/#estante` · `…/#reactivos` (también `#buscar`) |
| Lección de Aprender | `…/#aprender` · `…/#aprender/etiqueta` (y las demás lecciones) |

Los enlaces no distinguen mayúsculas (`#e1-4` también funciona). Si algún día la página pasa a un
dominio propio, GitHub Pages redirige las direcciones `github.io` al dominio nuevo, así que los QR
ya impresos siguen andando.

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | Estructura de la página. |
| `estilos.css` | Todo el diseño (ver `DESIGN.md`). |
| `app.js` | Lógica: navegación, búsqueda, ficha (etiqueta, placas apiladas, ficha completa), compatibilidad y emergencia. |
| `estante.js` | El estante: cartel de la sección, dibujo de frente, cámara, frasco en foco y lista enlazada. |
| `lavado.js` | El contador de lavado de 15 minutos y su píldora. |
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

- **Diseño o funciones:** editar `index.html`, `estilos.css`, `app.js`, `estante.js` o `lavado.js`, commit y push. GitHub Pages
  publica solo en uno o dos minutos.
- **Datos químicos:** la única fuente de verdad es `fuentes/datos_reactivos.py`, en el repositorio
  privado. Después de cambiarla, correr `pagina/export.py` (ver `docs/PAGINA.md` de ese repo),
  copiar el `data.json` resultante sobre `datos/reactivos.json` y actualizar `ACTUALIZADO` en `app.js`.
- **Siempre que cambie algún archivo:** subir el número de `CACHE` en `sw.js` (`embv-v6` → `embv-v7`)
  para que los celulares que ya la abrieron descarguen la versión nueva.
- **Antes de publicar:** con la página servida en local, `node herramientas/auditoria.mjs`. Tiene que
  terminar en "Todo limpio": revisa desbordes, botones chicos, contraste en los dos temas, errores,
  que los primeros auxilios de la ficha entren en la primera pantalla de un celular, el frasco en
  foco (botones a la vista, etiqueta sin tapar, Esc y "atrás") y el contador de lavado.

Para probarla en la compu hace falta un servidor local, porque abrir `index.html` con doble clic no
carga los datos: `python -m http.server` en esta carpeta, o sin Python,
`powershell -ExecutionPolicy Bypass -File herramientas\servir.ps1`. Después, abrir http://localhost:8765/.

## Pendiente

- **QR en los carteles:** se agregan en el repositorio privado (`fuentes/gen_carteles.py`) con los
  enlaces de la tabla de arriba.
- Sumar un segundo dueño a la organización `embv-lab`.
- Automatizar la copia de `datos/reactivos.json` desde el repositorio privado.
- **Probar en celulares reales** (Android e iPhone): gestos del estante y de la ficha, contador de
  lavado (pantalla encendida y vibración) y fluidez con los 153 frascos dibujados.
- **Textos de incendio y derrame del ácido sulfúrico (R050–R052) y de incendio de la cal viva
  (R043):** salen con el texto de los metales que reaccionan con agua. Se corrigen en el repositorio
  privado (`fuentes/gen_fds.py`), no acá.
- La lista completa y vigente está en `docs/revisiones/2026-10-22-web-estante.md` del repositorio
  privado.

## Datos

Clasificación, fichas de seguridad e inventario del laboratorio. No contiene datos personales.
Los documentos originales, las fotos y el resto del sistema están en el repositorio privado.
