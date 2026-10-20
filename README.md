# Laboratorio EMBV · fichas de seguridad (web pública)

Versión pública, **sólo de consulta**, de la página del laboratorio de la Escuela Modelo de
Bella Vista. Es la página a la que llevan los QR de los carteles del estante.

**Dirección:** https://embv-lab.github.io/

## Qué muestra

- **Reactivos:** las 117 fichas resumidas (peligros, primeros auxilios por vía de exposición,
  derrame, incendio, protección personal, eliminación y dónde se guarda).
- **Estante:** el plan de las 12 secciones y el control de compatibilidad entre dos reactivos.
- **Emergencia:** teléfonos, los tres pasos y la búsqueda rápida de un producto.
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
| `iconos.svg` | Pictogramas SGA oficiales (dominio público) e íconos Phosphor (MIT). |
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
- **Siempre que cambie algún archivo:** subir el número de `CACHE` en `sw.js` (`embv-v2` → `embv-v3`)
  para que los celulares que ya la abrieron descarguen la versión nueva.

Para probarla en la compu hace falta un servidor local, porque abrir `index.html` con doble clic no
carga los datos. Por ejemplo, `python -m http.server` en esta carpeta.

## Datos

Clasificación, fichas de seguridad e inventario del laboratorio. No contiene datos personales.
Los documentos originales, las fotos y el resto del sistema están en el repositorio privado.
