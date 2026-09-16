## Context

Ver `proposal.md`. El comportamiento y las specs no cambian; esto es un refactor de rendimiento. El diagnóstico está en el análisis previo: el zoom dispara, por cada evento de rueda, cuatro pasadas de render (`PROGRESSIVE_STEPS = [8, 4, 2, 1]`), y las tres funciones calientes son:

- `Formula.escapeStep` + `Complex` inmutable: cada iteración asigna objetos.
- `EscapeTimeGenerator.generate` + `Viewport.toComplex` + `MandelbrotMode.initialZ`: asignan `Complex` por píxel.
- `CanvasRenderer.render` + `Palette.defaultColor` + `Rgb.fromHsl`: asignan `Rgb` por píxel y recorren la imagen completa en cada paso.

Restricciones de diseño vigentes: dominio en TypeScript con clases (sin funciones sueltas), sin dependencias nuevas, salida visual idéntica, y tests del dominio que deben seguir pasando.

## Goals / Non-Goals

**Goals:**

- Eliminar las asignaciones dentro de los bucles por píxel y por iteración.
- Reducir el número de recorridos completos de la imagen por zoom.
- Que el render a resolución completa no bloquee el hilo ni sea ininterrumpible.
- Mantener la salida exacta (mismos colores y mismos pasos de escape).

**Non-Goals:**

- Cambiar la apariencia, los colores, el degradado o la interacción.
- WebGL, Web Workers o cambio de stack.
- Persistencia o nuevas capacidades.
- Cambiar el comportamiento descrito en las specs.

## Decisions

### 1. Búfer complejo mutable para el camino caliente

Se introduce `ComplexBuffer`, una clase con campos mutables `re`/`im` y operaciones en sitio (`set`, `square`, `multiply`, `cube`, `fourth`, `absolute`, `conjugate`, `add`, `magnitudeSquared`).

`Formula` gana un método abstracto `applyInto(z: ComplexBuffer): void` que muta el búfer. El `apply(z: Complex): Complex` actual se conserva y se implementa sobre `applyInto` (crea un búfer, aplica, devuelve un `Complex`), de modo que los tests y el código legible no cambian. `Formula.escapeStep` reutiliza **dos búferes** para `z` y `c` y deja de asignar dentro del bucle.

Alternativas: mutar el propio `Complex` (rompe la inmutabilidad que usan los tests y la legibilidad); confiar en el escape analysis del JIT (no ocurre de forma fiable con clases y `Map`).

### 2. Proyección sin `Complex` por píxel

Se añade una clase `Projection` que representa la transformación de la rejilla de píxeles a escalares `re`/`im`, calculada **una vez** por render a partir de `Viewport` (centro y unidades por píxel). `EscapeTimeGenerator` la usa con `reAt(x)` / `imAt(y)`, sin crear un `Complex` por píxel.

Alternativa: seguir usando `Viewport.toComplex` (una asignación por píxel). `toComplex`/`toPixel` se mantienen para pintar, el mini-mapa y la inspección, donde el coste es despreciable.

### 3. El modo escribe en búferes

`FractalMode` gana `prepare(z0: ComplexBuffer, c: ComplexBuffer, cr, ci, seed)`:
- Mandelbrot: `z0 = (0,0)`, `c = (cr, ci)`.
- Julia: `z0 = (cr, ci)`, `c = seed`.

Así se conserva la polimorfia de la clase sin asignar `Complex` por píxel. `FractalScene` expone `zoneAtScalar(cr, ci)` que reutiliza búferes internos; `zoneAt(point)` se mantiene para tests y usos puntuales.

### 4. Colores memoizados por zona

`Palette` añade una caché `Map<number, Rgb>` para el color por defecto, de modo que `Rgb.fromHsl` se ejecuta una vez por id de zona y no por píxel. Los overrides siguen teniendo prioridad. La caché se limpia con `clear()` (mismo punto que descarta overrides); su tamaño está acotado por el número de zonas (paso máximo + interior).

### 5. Render por bloques y a resolución reducida

`CanvasRenderer.render` deja de llamar a `map.zoneAt` por píxel. Recorre la imagen con el paso del mapa y rellena bloques de `step × step`, reduciendo las llamadas a `colorFor` en un factor `step²`. El resto de la imagen se escala con `drawImage` como hasta ahora.

### 6. Render final troceado e interrumpible

Se añade un `RenderScheduler` (capa de interfaz) que sustituye al bucle actual de `requestRender`:

```
   peticion de render
     ├─ cancela lo pendiente
     ├─ dibuja el paso grueso (barato) al instante
     └─ trocea el paso fino con requestAnimationFrame
          - procesa filas hasta agotar un presupuesto de tiempo (~8 ms)
          - redibuja al cerrar cada trozo
          - si llega otra peticion, cancela y reinicia
```

`EscapeTimeGenerator` gana `generateRows(scene, width, height, yStart, yEnd, step, map)` que escribe en un `ZoneMap` existente, para que el planificador avance por filas sin recalcular. `requestRender` de `main.ts` pasa a delegar en el planificador.

### 7. Retirar `ProgressiveRenderer` sin uso

`ProgressiveRenderer` (dominio) no lo usa la app: la orquestación vive en `main.ts`. Sus responsabilidades quedan cubiertas por `EscapeTimeGenerator.generateRows` + `RenderScheduler`. Se elimina junto con su test, para no dejar código muerto ni dos mecanismos de progreso. La generación de mapas de baja resolución sigue existiendo vía `EscapeTimeGenerator`.

## Risks / Trade-offs

- **[La salida podría diferir por redondeo al cambiar el orden de operaciones]** -> el álgebra escalar es idéntica a la de `Complex`; los tests existentes (que comparan contra valores calculados a mano) deben pasar sin cambios, y se añaden tests que comparan el kernel escalar contra `apply` inmutable.
- **[La memoización de color crece con el zoom]** -> acotada por el número de zonas; se limpia con `clear()`. No hay fuga relevante.
- **[El troceado con `requestAnimationFrame` puede cambiar el orden visible de refinado]** -> el presupuesto de tiempo mantiene la responsividad; la spec de render progresivo sigue cumpliéndose.
- **[`generateRows` escribiendo en un mapa compartido mientras llega otro zoom]** -> el `RenderScheduler` cancela y descarta el mapa en curso antes de empezar otro; no hay acceso concurrente (un solo hilo).
- **[Duplicar la lógica de forma entre `apply` y `applyInto`]** -> `apply` se implementa sobre `applyInto`; una sola fuente de verdad.

## Migration Plan

Cambio puramente interno; no hay migración de datos ni de API pública. Se despliega como cualquier cambio de código: `npm test`, `npm run typecheck`, `npm run build`. Reversión: revertir el commit.

## Open Questions

- Presupuesto de tiempo por trozo y tamaño de bloque exactos (ajustables sin cambiar el diseño).
- Si conviene conservar la rejilla de pasos `[8, 4, 2, 1]` o saltar directo a un primer paso más fino.
