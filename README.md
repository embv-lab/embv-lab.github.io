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

## Cómo se actualiza

`index.html` se genera, no se edita a mano:

- `fuente/publica.html` es la plantilla, con el marcador `/*DATA*/` donde van los datos.
- `fuente/data.json` contiene los datos que exporta `pagina/export.py` del repositorio privado.
  La única fuente de verdad sigue siendo `fuentes/datos_reactivos.py`.

Para regenerar la página, desde el repositorio privado:

```
python pagina/export.py ...        # como indica docs/PAGINA.md
python pagina/build.py <ruta a este repo>/fuente/publica.html pagina/data.json <ruta a este repo>/index.html
```

Después de generar, cambiar `ACTUALIZADO` en la plantilla y `CACHE` en `sw.js` (por ejemplo,
`embv-v2`), y hacer commit y push. GitHub Pages publica solo en un par de minutos.

## Datos

Clasificación, fichas de seguridad e inventario del laboratorio. No contiene datos personales.
Los documentos originales, las fotos y el resto del sistema están en el repositorio privado.
