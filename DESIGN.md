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
- Cuerpo 17px, interlineado 1,5. Código de sección en la placa: `clamp(3.2rem, 16vw, 5.6rem)`.

## Forma

- Radios: placa 18px, controles 12px, pastillas 999px. Borde interior de la placa: inset 5px, 2px
  blanco al 88% (negro al 82% sobre amarillo).
- Sombra: `0 1px 2px` + `0 8px 22px -10px` (placa); `0 22px 48px -18px` (hoja de la ficha).
- Brillo de vinilo: degradé blanco 12% → 0 en la mitad superior de las placas de color.

## Componentes

- **Placa de sección** (destino del QR): color de la clase, código gigante en mono, nombre de la clase,
  localizador "Usted está aquí" (estante 2 × 6 de frente, la sección marcada con un pulso).
- **Lista de reactivos:** placa blanca con filas; palabra de advertencia, código, fórmula, pictogramas
  SGA oficiales a la derecha y chevron.
- **Ficha:** hoja que sube desde abajo (celular) o panel lateral (≥ 900px). Orden: pictogramas y rombo
  NFPA, teléfonos, placa verde de primeros auxilios con control segmentado por vía (Ojos, Piel,
  Inhalación, Ingestión), placas amarilla (derrame) y roja (fuego), placa azul (protección), peligros,
  "No guardar junto a", dónde se guarda, y lo técnico plegado.
- **Prohibición:** señal de prohibición dibujada (círculo y diagonal rojos) + texto.
- **Navegación:** barra inferior de 3 pestañas en el celular (Reactivos, Estante, Emergencia); arriba
  en pantallas anchas, con el botón rojo Emergencia a la derecha.

## Íconos y pictogramas

`iconos.svg` es un sprite: pictogramas SGA oficiales (Wikimedia Commons, dominio público, UNECE) con
ids `GHS01`…`GHS09`, e íconos Phosphor 2.1.1 (MIT) con ids `i-<nombre>-bold` / `i-<nombre>-fill`.
Peso bold para navegación y controles, fill dentro de los símbolos de las placas. Sin emoji ni glifos
Unicode como íconos.

## Movimiento

Una sola curva: `cubic-bezier(.16, 1, .3, 1)`.
- Momento firma: la ficha sube (0,5 s) y sus placas entran en cascada (55 ms entre una y otra).
- El indicador de la vía se desliza (0,4 s) y el texto entra con un corrimiento corto.
- El localizador pulsa dos veces al abrir una sección.
- Transición cruzada entre vistas (View Transitions, 0,22 s).
- `prefers-reduced-motion` anula todo.

## Superficies del navegador

Selección amarilla con texto negro, cursor de texto rojo, foco azul de 3px, scrollbar del suelo.
