# Design

Sistema visual de la web pública del Laboratorio EMBV, descripto a partir de lo construido
(octubre de 2026). Mundo: **señalética de seguridad** (IRAM 10005 / ISO 7010 / ISO 3864).

## Principio

Todo es una **placa**: un cartel con esquinas redondeadas, color pleno, borde interior de contraste y
sombra suave. Los colores de seguridad significan lo mismo que en la pared del laboratorio y **no
cambian con el tema** (como un cartel real); sólo cambian el suelo y las placas neutras.

| Color | Valor | Significa | Se usa en |
|---|---|---|---|
| Verde seguridad (RAL 6032) | `#237f52` | Primeros auxilios, salvamento, "compatible" | Placa de primeros auxilios, salpicadura en ojos y quemaduras |
| Rojo seguridad (RAL 3001) | `#9b2423` | Fuego, emergencia, prohibición | Botón y vista Emergencia, "Si hay fuego", avisos, "No almacenar aquí", palabra PELIGRO |
| Amarillo seguridad (RAL 1003) | `#f9a800` + texto `#14181b` | Advertencia | "Si se derrama", "separados", palabra ATENCIÓN, selección de texto |
| Azul de obligación | `#1e4f9c` | Equipo obligatorio | "Protección obligatoria", anillo de foco |

Clases de almacenamiento (color de familia de cada sección, mismo agrupamiento que los carteles):
inflamables `#c8282a`, oxidantes `#f9a800` (texto negro), ácidos y bases `#2f6d8f`, tóxicos `#5b3a8e`,
bajo riesgo `#5f6a73`, riesgo especial `#14181b`. Todos con texto blanco ≥ 4,5:1 salvo oxidantes (negro).

## Superficies

| Token | Claro | Oscuro |
|---|---|---|
| `--suelo` | `#e8ebed` | `#0d1012` |
| `--placa` | `#ffffff` | `#191e22` |
| `--placa-2` | `#f3f5f6` | `#21272c` |
| `--tinta` | `#14181b` | `#eef1f2` |
| `--tinta-2` | `#4b545b` | `#a9b2b8` |
| `--linea` | `#d5dade` | `#2c343a` |

El tema sigue al sistema (`prefers-color-scheme`).

## Tipografía

- **Overpass** (400, 600, 700, 800): descendiente de Highway Gothic, la letra de la señalización
  vial. Títulos en 800 con tracking −0,01em; títulos de placa en mayúsculas, 800, tracking 0,04em.
- **Overpass Mono** (600, 700): sólo para datos y códigos: códigos de sección (`E1-4`), de reactivo
  (`R024`), CAS, teléfonos.
- Cuerpo 17px, interlineado 1,5. Código de sección en el cartel: `clamp(2rem, 11vw, 3.4rem)`
  (`CAJA-RE` y `MATERIAL`, más chico y sin partirse). La fórmula de cada frasco del estante va en
  Overpass 800 con subíndices, ajustada al ancho de la etiqueta.
- Las dos son variables y se sirven desde `tipografia/` (subconjunto latino, licencia OFL), no desde
  Google Fonts: la página no depende de otro servidor y el service worker las guarda.
- Campos y selectores a 16px justos (con menos, iOS hace zoom al tocarlos).

## Forma

- Radios: placa 18px, controles 12px, pastillas 999px. Borde interior de la placa: inset 5px, 2px
  blanco al 88% (negro al 82% sobre amarillo).
- Sombra: `0 1px 2px` + `0 8px 22px -10px` (placa); `0 22px 48px -18px` (hoja de la ficha).
- Brillo de vinilo: degradé blanco 12% → 0 en la mitad superior de las placas de color.

## Componentes

- **Navegación:** cuatro pestañas, en la barra inferior en el celular y arriba en pantallas anchas:
  **Estante** (el inicio y el destino de los QR), **Buscar** (todos los reactivos), **Aprender** y
  **Emergencia** (en rojo, siempre a un toque; arriba también como botón rojo con la sirena). En el
  código la barra inferior va justo después de la cabecera para alcanzarla rápido con el teclado.
  El título de la pestaña del navegador dice la vista, la sección o el producto abierto.
- **Estante** (`estante.js`): lo que el docente tiene adelante.
  - **Cartel impreso de la sección:** la misma composición del cartel de 16,4 × 6 cm pegado en el
    estante (`gen_carteles.py` del repositorio privado): papel blanco con borde negro en los dos
    temas, el código grande en mono sobre el color de la clase, la clase, "N envases de 14 de
    capacidad" y el nivel, los pictogramas de la sección, los avisos del cartel (oxidantes, caja de
    riesgo especial) y, en rojo, "NO almacenar aquí".
  - **El estante dibujado de frente** (SVG, sin imágenes): 2 estantes × 6 secciones, la caja de
    riesgo especial con su balde de arena y el material didáctico. Un frasco por envase (botella si
    es líquido, pote si es sólido), agrupados por producto; con más de 7 envases van en dos filas,
    la de atrás sobre un escalón. Cada sección tiene su caja del color de la clase y el cartel en
    chico sobre el larguero. La etiqueta de cada frasco muestra la **fórmula** grande (o un nombre
    corto si no hay fórmula) y el código R chico.
  - **Cámara:** la sección del QR queda encendida y llena el visor, con las vecinas atenuadas a los
    costados. Elegir otra sección (tocándola, deslizando o desde el plano) mueve la cámara por el
    estante; si queda lejos, se aleja para mostrar el recorrido. Sin sección (`#estante`), se ve el
    estante entero.
  - **Lista de la sección** enlazada con el estante: señalar una fila marca su frasco en azul y
    tocar un frasco marca su fila. Tocar una fila abre la ficha de una (el camino rápido para la
    emergencia), y la etiqueta sale de su frasco.
  - **Plano** de las secciones (seis por fila, 44 px aun a 320) y el verificador "¿Se pueden guardar
    juntos?".
- **Frasco en foco:** tocar un frasco lo acerca (zoom de la cámara) y lo deja grande y legible,
  con el resto atenuado; sube una tarjeta con el nombre completo, la fórmula, la palabra de
  advertencia, los pictogramas y dos botones grandes: **Primeros auxilios** (verde: abre la ficha
  en la placa verde) y **Ver ficha**. Flechas y deslizar pasan al frasco vecino sin salir. Se sale
  tocando afuera, arrastrando la tarjeta hacia abajo, con la X, con Esc o con "atrás".
- **Ficha:** hoja que sube desde abajo (celular) o panel lateral (≥ 900 px). Arriba, la
  **etiqueta del frasco** (réplica de la etiqueta pegada en el envase: nombre, fórmula y CAS,
  pictogramas, palabra de advertencia, rombo NFPA, frases H, sección y código), blanca en los dos
  temas. Debajo, las **placas de seguridad apiladas**: Primeros auxilios (verde, con el control por
  vía: Ojos, Piel, Inhalación, Ingestión; **la instrucción de la vía va antes que la medida
  general**), Si se derrama (amarillo), Si hay fuego (rojo), Protección obligatoria (azul) y Ficha
  completa. La placa activa va adelante y las siguientes asoman detrás; se pasan deslizando de
  costado o con los botones del índice. Después, los teléfonos. Se cierra arrastrando hacia abajo
  la cabecera o la etiqueta (umbral y velocidad), con la X, con Esc o con "atrás"; la sirena roja
  de la cabecera lleva a Emergencia. La instrucción de Ojos entra en la primera pantalla aun a
  320 × 568 (en pantallas bajas la etiqueta se compacta); `herramientas/auditoria.mjs` lo verifica.
- **Ficha completa:** todo lo que hay en los datos, ordenado como las secciones de una ficha de
  datos de seguridad, en plegables numerados: 1 Identificación (con el inventario de cada envase),
  2 Peligros (todas las frases H y P con su texto, pictogramas y rombo), 4 Primeros auxilios,
  5 Incendio, 6 Derrame, 7 Manipulación y almacenamiento (con las incompatibilidades, dónde se
  guarda y el selector de envase), 8 Protección, 9 Propiedades, 11 Toxicología, 12 Ecología,
  13 Eliminación y 14 Transporte. Las secciones 9, 11, 12 y 14 existen para los 37 reactivos con
  ficha completa. Rótulo de la fuente: documentos 04 y 05.
- **Lavado de 15 minutos** (`lavado.js`): se lanza desde Ojos o Piel cuando los datos piden 15
  minutos, y desde las placas de Emergencia. La etiqueta queda arriba, chica, y el anillo ocupa el
  centro con la cuenta grande; Pausar/Reanudar y Terminar (pide un segundo toque). Calcula con la
  hora del sistema, así que sigue bien con la pantalla apagada; pide Wake Lock si puede y vibra al
  terminar. Minimizado, queda una píldora verde con el tiempo, a un toque desde cualquier vista.
- **Emergencia:** la abre el docente o el ayudante con alguien salpicado al lado. Orden: placa roja con
  los teléfonos; "Salpicadura: primero, agua" con dos placas verdes lado a lado (Ojos y Piel, **15**
  grande, "minutos como mínimo" y el botón para contar el lavado); "¿Qué producto fue?"; los tres
  movimientos del plan de emergencias (Avisar, Alejar, Actuar) y, al final, la regla de los alumnos.
- **Aprender:** índice como lista de placas con ícono por lección y barra de progreso verde. Cada
  lección tiene un enlace propio (`#aprender/etiqueta`, `…/pictogramas`, `…/rombo`, `…/juntos`,
  `…/reglas`, `…/evaluacion`). La etiqueta interactiva es blanca en los dos temas (es el papel del
  frasco), con siete partes numeradas en azul; la activa se enmarca y el resto se atenúa. El rombo
  grande tiene cuadrantes tocables que crecen al elegirlos. Las respuestas correctas van en verde y
  las incorrectas en rojo. El progreso se guarda en el navegador.
- **Prohibición:** señal de prohibición dibujada (círculo y diagonal rojos) + texto.
- **Inflamables y el rojo de emergencia:** el rojo de la clase de inflamables (`#c8282a`) nunca va
  solo: lleva siempre impresa la llama SGA (GHS02), en el código del cartel, en el frente de la caja
  del estante, en el cartel chico y en el plano, como una caja rotulada. El rojo de seguridad
  (`#9b2423`) va liso, con la sirena o el matafuego, y sólo para emergencia, fuego y prohibición.
- **Objetivos táctiles:** 44 px como mínimo en todo (las partes de la etiqueta de Aprender agrandan su
  área con un `::after` para no deformar el dibujo). Los frascos del dibujo no son botones: la lista
  de la sección es el camino accesible.

## Íconos y pictogramas

`iconos.svg` es un sprite: pictogramas SGA oficiales (Wikimedia Commons, dominio público, UNECE) con
ids `GHS01`…`GHS09`, e íconos Phosphor 2.1.1 (MIT) con ids `i-<nombre>-bold` / `i-<nombre>-fill`.
Peso bold para navegación y controles, fill dentro de los símbolos de las placas. Sin emoji ni glifos
Unicode como íconos.

## Movimiento

Una sola curva: `cubic-bezier(.16, 1, .3, 1)`. Sólo se animan `transform` y `opacity`, y nada que se
mueva lleva desenfoque de fondo.
- La cámara del estante: paneo entre secciones vecinas (0,48 s); a una sección lejana se aleja y se
  vuelve a acercar (0,76 s). Las secciones se encienden y apagan con opacidad.
- Frasco en foco: la cámara se acerca al frasco y la tarjeta sube desde abajo.
- Momento firma: la etiqueta del frasco crece desde el frasco hasta la ficha (FLIP) y las placas se
  despliegan desde atrás de la etiqueta, la verde primero. Al cerrar, la etiqueta vuelve al frasco.
- La pila de placas sigue al dedo al deslizar; la hoja sigue al dedo al arrastrarla hacia abajo.
- El indicador de la vía se desliza (0,4 s) y el texto entra con un corrimiento corto.
- El anillo del lavado avanza segundo a segundo, con un punto que gira (transform).
- Transición cruzada entre vistas (View Transitions, 0,22 s).
- `prefers-reduced-motion` anula todo: cada estado aparece de una, sin esperas.

## Superficies del navegador

Selección amarilla con texto negro, cursor de texto rojo, foco azul de 3px, scrollbar del suelo.
