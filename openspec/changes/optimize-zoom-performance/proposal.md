## Why

El zoom se siente lento y con tirones. El camino de render hace trabajo evitable: el bucle numérico más interno asigna objetos `Complex` en cada iteración, la coloración asigna un `Rgb` por píxel, y cada zoom ejecuta cuatro pasadas completas sobre la imagen, la última a resolución completa y sin poder interrumpirse.

Es una mejora de rendimiento: **no cambia ningún comportamiento observable**. Las specs de comportamiento existentes (`fractal-navigation`, `fractal-coloring`, etc.) siguen describiendo la app tal cual.

## What Changes

- **Kernel numérico sin asignaciones**: el bucle de iteración deja de crear objetos `Complex`; itera con `re`/`im` escalares. Es el mayor impacto.
- **Evitar asignaciones por píxel**: `Viewport.toComplex` y `MandelbrotMode.initialZ` dejan de crear un `Complex` por píxel; el punto de arranque constante no se materializa.
- **Color memoizado**: `Palette` cachea el `Rgb` por id de zona, eliminando `Rgb.fromHsl` por píxel.
- **Pasos gruesos a resolución gruesa**: el render progresivo genera los mapas de baja resolución al tamaño reducido y los escala, en vez de recorrer la imagen completa con `zoneAt`.
- **Render final troceado e interrumpible**: el paso de resolución completa se reparte por tiempo (`requestAnimationFrame`) y se cancela si llega otro zoom, en vez de bloquear el hilo.

## Capabilities

### New Capabilities

<!-- Ninguna: no hay comportamiento nuevo. -->

### Modified Capabilities

<!-- Ninguna: no cambia el comportamiento exigido por las specs existentes. -->

Este cambio no modifica ninguna capacidad. Su `.openspec.yaml` declara `skip_specs: true`, ya que se trata de un refactor de rendimiento sin cambios de comportamiento.

## Impact

- **Archivos del dominio**: `Complex`, `Formula`, `FractalScene`, `FractalMode`, `Viewport`, `EscapeTimeGenerator`, `Palette`, `FractalSession`.
- **Archivos de interfaz**: `CanvasRenderer`, `main.ts` (orquestación del render progresivo).
- **Sin dependencias nuevas** y sin cambios en `package.json`.
- **Salida idéntica**: el fractal y los colores resultantes no cambian; solo el tiempo y la fluidez.
- **Verificación**: tests del dominio existentes deben seguir pasando sin cambios (misma salida), más una comprobación manual de fluidez en el navegador.
