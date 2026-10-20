# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Sitio estático (HTML, CSS y JavaScript sin framework ni build) publicado con GitHub Pages en
https://embv-lab.github.io/. Los datos se cargan de `datos/reactivos.json`. Un service worker
guarda una copia para abrir sin conexión.

## Users

- **Docentes del Departamento de Ciencias Naturales** de la Escuela Modelo de Bella Vista:
  consultan la ficha de un reactivo, qué hacer ante una salpicadura, derrame o incendio, y si dos
  productos pueden guardarse juntos. Llegan escaneando el QR del cartel de una sección del estante.
- **Ayudante de laboratorio** (responsable del sistema): la usa a diario frente al estante para
  ubicar, reponer y consultar.
- **Dirección e inspección** (CoMiSaSEP): la miran como evidencia de que el laboratorio tiene fichas
  de seguridad accesibles y un plan de almacenamiento.

Las alumnas y los alumnos no son usuarios directos.

## Product Purpose

Que la ficha de seguridad de cada producto del laboratorio esté a un escaneo de distancia,
parado frente al estante, y que en una emergencia se encuentre en segundos qué hacer. Cumple el
punto 1.2 de la Recomendación N.º 9/13 de la CoMiSaSEP (ficha de datos de seguridad accesible para
cada producto) y acompaña el plan de almacenamiento (punto 2.3).

Éxito: un docente escanea el cartel de una sección, toca el frasco que tiene en la mano y en menos
de tres segundos sabe qué hacer si le salpicó.

## Positioning

No es una base genérica de fichas de seguridad: es el inventario real de este laboratorio (117
reactivos, 153 envases), con la sección del estante donde está cada uno, el plan de compatibilidad
que lo ordenó y los mismos datos que las etiquetas y carteles impresos, porque todo sale de una sola
base.

## Operating Context

- El estante tiene 12 secciones (E1-4 a E1-9 abajo, E2-4 a E2-9 arriba), más la caja de riesgo
  especial (CAJA-RE) y la zona de material didáctico. Cada sección lleva un cartel impreso de
  16,4 × 6 cm con un QR que abre su vista: `https://embv-lab.github.io/#E1-4`.
- Los enlaces de los QR (`#E1-4`, `#CAJA-RE`, `#R001`…) no pueden cambiar una vez impresos los
  carteles.
- Condiciones de uso normales: buena luz, celulares comunes, sin requisitos especiales.
- Existe además una versión privada (artifact de claude.ai) con el registro de la ejecución
  (etiquetado, reubicación, capacitación, residuos). Esta web es sólo de consulta.

## Capabilities and Constraints

- Vistas: sección (destino del QR), reactivos con búsqueda y filtros, ficha de cada reactivo,
  estante con verificador de compatibilidad, aprender (capacitación interactiva y resumida del
  manual, documento 07), emergencia.
- Aprender no reemplaza la capacitación presencial ni su registro de asistencia (que sigue en la
  versión privada): sirve para preparar y repasar.
- Los datos químicos no se editan acá: la fuente única es `fuentes/datos_reactivos.py` en el
  repositorio privado `WiseMKT/embv-laboratorio`; se exportan a `datos/reactivos.json`.
- Lo que muestra la web tiene que coincidir con la etiqueta y la ficha impresas.
- Pictogramas SGA, rombo NFPA 704 y colores de peligro tienen significado normativo: se usan con
  ese significado y no como decoración.
- Repositorio público: no publicar datos personales.

## Brand Commitments

- Escuela Modelo de Bella Vista (EMBV). Logo: `Formato documentos/EMBV.png` del repositorio privado
  (cuadrícula E-M-B-V en negro, rojo y blanco).
- La web tiene identidad visual propia; no está obligada a imitar los PDF impresos. Se mantienen el
  logo y los elementos normativos.
- Idioma: castellano rioplatense, voseo, frases cortas e imperativas en la emergencia.

## Evidence on Hand

- 117 reactivos con ficha resumida y 37 con datos de la ficha completa de 16 secciones.
- Pictogramas SGA oficiales en `fuentes/figs/GHS01.pdf` … `GHS09.pdf` (repositorio privado).
- Teléfonos: Emergencias 107, Bomberos 100, Centro Nacional de Intoxicaciones 0800-333-0160.
- No hay fotos del laboratorio ni del estante.

## Product Principles

1. La emergencia es lo primero: teléfonos y "Si pasa algo" a un toque desde cualquier pantalla, y
   una ficha que se lee con los nervios de punta.
2. Lo que dice la pantalla es lo mismo que dice la etiqueta.
3. Del estante al frasco en un gesto: el QR lleva a la sección y la sección al producto.
4. Los colores de seguridad significan algo; no se gastan en decoración.

## Accessibility & Inclusion

Contraste suficiente en modo claro y oscuro, controles táctiles cómodos y no depender sólo del color
para comunicar peligro.
