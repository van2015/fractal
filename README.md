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
- Sección de **paso a paso**: con el botón "next" se revela el fractal iteración
  a iteración, viendo cómo la fórmula lo va "dibujando".

## Ejecutar el proyecto

### Requisitos

- **Node 23.6+** (usa el type-stripping nativo para correr los tests en
  TypeScript sin compilar). En Node 22.6–23.5 habría que añadir
  `--experimental-strip-types` al script de tests.
- **pnpm** (el proyecto trae `pnpm-lock.yaml`). También sirve `npm` si lo
  prefieres.

### Puesta en marcha

```bash
# 1. Instalar dependencias (solo TypeScript y los tipos de Node)
pnpm install

# 2. Compilar el dominio y la interfaz de TypeScript a dist/
pnpm build

# 3. Levantar el servidor estático
pnpm serve
```

Después abre **http://localhost:8080** en el navegador.

> `index.html` carga `./dist/main.js`, así que hay que ejecutar `pnpm build`
> **antes** de `pnpm serve`, y volver a compilar tras cada cambio en `src/`.

### Scripts disponibles

| Comando | Qué hace |
|---|---|
| `pnpm build` | Compila `src/` (TypeScript) a `dist/` (JavaScript de navegador). |
| `pnpm serve` | Sirve el proyecto en `http://localhost:8080` (`PORT` configurable). |
| `pnpm test` | Ejecuta los tests del dominio con el runner nativo de Node. |
| `pnpm typecheck` | Comprueba los tipos de `src/` y de `tests/` sin emitir. |

### Flujo de desarrollo

```bash
pnpm typecheck   # comprobar tipos
pnpm test        # correr los tests
pnpm build       # recompilar y recargar el navegador
```

## Cómo funciona

El núcleo separa el cálculo del color:

```
[ fórmula ] -> mapa de escape (Int32Array: un paso por píxel)
                    |
                    v
             paleta[zona] -> color -> canvas
```

- Una zona = un paso de escape.
- Pintar solo cambia la paleta (instantáneo); no recalcula la fórmula.
- Los colores personalizados siguen al número de paso, así que persisten al
  hacer zoom y al cambiar de fórmula.
- El render es progresivo: primero una versión gruesa y luego se afina por
  filas, de forma cancelable al hacer zoom.
- Mandelbrot y Julia comparten la misma fórmula; solo cambia el papel de `c`.

## Estructura

```
src/domain/   lógica pura, sin DOM (fórmulas, mapa de escape, paleta, vista...)
src/ui/       render en canvas, entrada, HUD, mini-mapa
src/main.ts   orquesta la app
tests/        tests del dominio (sin tests de UI)
openspec/     specs y cambios (OpenSpec)
```

## Tests

Cubren solo la lógica pura del dominio, con el runner nativo de Node sobre
TypeScript. No hay dependencias de runtime.

## Especificaciones

El comportamiento está descrito en las specs de `openspec/specs/`:
`fractal-formula`, `fractal-navigation`, `fractal-coloring`, `fractal-interface`
y `fractal-step-by-step`. Los cambios se proponen y archivan con OpenSpec.

## Alcance

- Sin persistencia: no se guarda, exporta ni comparte nada; la sesión se pierde
  al cerrar.
- Sin fractales recursivos (Koch, Sierpinski...) por ahora; el motor está
  preparado para añadirlos como cambio futuro.

## Licencia

MIT. Ver [`LICENSE`](./LICENSE).
