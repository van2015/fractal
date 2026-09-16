## Why

No existe una herramienta de fractales pensada para que niños de 6 a 8 años exploren, en un navegador de escritorio, la idea de que **reglas simples repetidas producen formas infinitamente complejas**. Las apps existentes son o muy técnicas (pensadas para adultos) o tan simplificadas que ocultan la matemática. Esta app busca el punto medio: interacción directa con la fórmula y el color como propiedad matemática, sin dejar de ser usable por un niño.

## What Changes

- Nueva aplicación web de escritorio, sin instalación, que se abre directo en el Mandelbrot clásico.
- El niño elige una **forma** de fórmula (`z^2`, `z^3`, `z^4`, `|z|^2`, `conj(z^2)`) y la modifica; Mandelbrot y Julia son la misma fórmula con distinto rol de `c`.
- **Zoom y desplazamiento** sobre la imagen, con render progresivo y máximo de iteraciones auto-escalado.
- El **color representa el paso de escape** de cada zona (Modelo A: el color está pegado al número absoluto de iteración). Una zona = un paso.
- **Pintar sin selector**: al hacer click en una banda, la app le asigna automáticamente un color que contrasta con las bandas vecinas y que no está en uso entre las visibles.
- Modo **Julia**: se entra "buceando" desde un punto del Mandelbrot y se explora con un mini-mapa que mueve la semilla `c` en vivo.
- HUD mínimo (fórmula actual + nivel de zoom) con un botón `?` que revela el paso de escape bajo el cursor.
- Dominio en **TypeScript estructurado en clases**, con tests de la lógica pura (sin tests de UI).

**No-objetivos (non-goals):**

- No se guarda ni se comparte nada: sin exportar PNG, sin enlaces persistentes, sin cuentas. La app es efímera.
- No se incluyen familias de fractales recursivos (Koch, Sierpinski, helecho, L-systems) en este cambio. El núcleo se diseña extensible para que una familia futura se agregue como cambio aparte.

## Capabilities

### New Capabilities

- `fractal-formula`: selección y modificación de la forma de la fórmula; iteración `z <- f(z) + c`; equivalencia Mandelbrot/Julia y modo Julia con selección de semilla `c` mediante buceo y mini-mapa.
- `fractal-navigation`: transformada pantalla <-> plano complejo; zoom hacia el cursor, desplazamiento, máximo de iteraciones auto-escalado y render progresivo.
- `fractal-coloring`: mapa de escape (un paso por zona), paleta ligada al número de iteración, elección automática de color contrastante al pintar, y persistencia de colores ante cambios de fórmula y zoom.
- `fractal-interface`: layout de pantalla completa, controles mínimos para el niño, HUD de fórmula y zoom, y estado inicial (Mandelbrot clásico).

### Modified Capabilities

<!-- Ninguna: el proyecto no tiene specs previas. -->

## Impact

- **Proyecto nuevo**: no hay código, specs ni APIs existentes que se modifiquen.
- **Stack**: TypeScript para el dominio (clases), compilado a JavaScript para el navegador; render sobre Canvas 2D con `Int32Array` para el mapa de escape.
- **Dependencias**: sin dependencias de runtime; el runner de tests es el nativo de Node sobre TypeScript.
- **Extensibilidad**: el núcleo de iteración y el mapa de escape quedan abstraídos como clases del dominio, de modo que agregar una familia de fractales distinta (p. ej. recursivos) sea un cambio futuro sin rehacer el motor.
