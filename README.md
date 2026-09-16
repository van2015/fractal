# Explorador de Fractales

App web educativa para explorar fractales en el navegador de escritorio. Pensada
para niños de 6 a 8 años, pero con profundidad real: se elige una fórmula, se
hace zoom hasta el infinito y se pintan las zonas matemáticas que se descubren.

## Qué hace

- Elige entre varias formas de fórmula: `z^2`, `z^3`, `z^4`, `|z|^2`, `conj(z^2)`.
- Zoom con la rueda (hacia el cursor) y desplazamiento arrastrando.
- El color representa el paso de escape: al hacer click en una banda, la app le
  asigna un color que contrasta con las vecinas, sin selector de color.
- Modo Julia: se entra "buceando" desde un punto del Mandelbrot y se mueve la
  semilla con un mini-mapa.
- HUD con la fórmula y el nivel de zoom; el botón `?` revela el paso de escape
  bajo el cursor.

## Empezar

Requisitos: Node 23.6+ (usa type-stripping nativo) y pnpm.

    pnpm install
    pnpm build      # compila TypeScript a dist/
    pnpm serve      # http://localhost:8080

Pruebas y comprobación de tipos:

    pnpm test
    pnpm typecheck

## Cómo funciona

El núcleo separa el cálculo del color:

    [ fórmula ] -> mapa de escape (Int32Array: un paso por píxel)
                        |
                        v
                 paleta[zona] -> color -> canvas

- Una zona = un paso de escape.
- Pintar solo cambia la paleta (instantáneo); no recalcula la fórmula.
- Los colores personalizados siguen al número de paso, así que persisten al
  hacer zoom y al cambiar de fórmula.
- El render es progresivo: primero una versión gruesa y luego se afina por
  filas, de forma cancelable al hacer zoom.
- Mandelbrot y Julia comparten la misma fórmula; solo cambia el papel de `c`.

## Estructura

    src/domain/   lógica pura, sin DOM (fórmulas, mapa de escape, paleta, vista...)
    src/ui/       render en canvas, entrada, HUD, mini-mapa
    src/main.ts   orquesta la app
    tests/        tests del dominio (sin tests de UI)
    openspec/     specs y cambios (OpenSpec)

## Tests

Cubren solo la lógica pura del dominio, con el runner nativo de Node sobre
TypeScript. No hay dependencias de runtime.

## Especificaciones

El comportamiento está descrito en las specs de `openspec/specs/`:
`fractal-formula`, `fractal-navigation`, `fractal-coloring` y `fractal-interface`.
Los cambios se proponen y archivan con OpenSpec.

## Alcance

- Sin persistencia: no se guarda, exporta ni comparte nada; la sesión se pierde
  al cerrar.
- Sin fractales recursivos (Koch, Sierpinski...) por ahora; el motor está
  preparado para añadirlos como cambio futuro.

## Licencia

MIT. Ver [`LICENSE`](./LICENSE).
