## Why

La app muestra el fractal ya terminado, pero el proceso que lo produce —la fórmula aplicada iteración tras iteración— queda invisible. Una sección de dibujado paso a paso hace visible ese proceso: cada pulsación de "next" revela las zonas que escapan en la siguiente iteración, de modo que el niño ve al fractal "dibujarse" a medida que la fórmula avanza.

## What Changes

- Nueva **sección de paso a paso**, accesible desde la interfaz, que reutiliza la fórmula y la vista actuales (Mandelbrot o Julia).
- **Revelado por profundidad de iteración**: las zonas aún no reveladas se muestran en un color neutro distinto de la paleta; las reveladas usan su color normal de paso de escape.
- Botón **"next"** que avanza la profundidad en una iteración y revela las zonas que escapan en ese paso; botón **"reiniciar"** que vuelve al inicio; indicador de la **profundidad actual**.
- En la profundidad máxima se revela todo el fractal, **incluido el interior** (los puntos que nunca escapan).
- La profundidad **se conserva** al hacer zoom, desplazar o cambiar de fórmula, y se recorta si el máximo de iteraciones baja.
- **Pintar queda deshabilitado** mientras la sección está activa (la sección es para observar el dibujado); esto acota el requisito de pintado de `fractal-coloring`.

**No-objetivos (non-goals):**

- No se añade reproducción automática/animation; el avance es manual con "next".
- No se cambia el render progresivo, el zoom ni el resto de la interfaz.
- No se persiste el estado de la sección.

## Capabilities

### New Capabilities

- `fractal-step-by-step`: la sección de dibujado paso a paso, su activación y desactivación, la semántica de revelado por profundidad de iteración, y sus controles (next, reiniciar, indicador de profundidad).

### Modified Capabilities

- `fractal-coloring`: el requisito de pintar una zona con un click se acota a cuando la sección de paso a paso **no** está activa.

## Impact

- **Dominio**: nueva clase `StepReveal` (profundidad, avance, reinicio, revelado); `Rasterizer` gana un filtro de revelado con color neutro; `FractalSession` guarda y expone el estado de la sección.
- **Interfaz**: nuevos controles (activar/desactivar, next, reiniciar, indicador); `RenderScheduler`/`main.ts` renderizan con el revelado y bloquean el pintado cuando la sección está activa.
- **Sin dependencias nuevas** y sin cambios en `package.json`.
- **Comportamiento fuera de la sección**: sin cambios.
