## Context

Ver `proposal.md`. El revelado reutiliza el **mapa de escape** que ya existe: cada píxel guarda su paso de escape (`ZoneMap`, con `INTERIOR_ZONE` para los puntos que nunca escapan). El paso a paso es, por tanto, un **filtro de visualización** sobre un mapa que no cambia; no hay que recalcular la fórmula al pulsar "next".

Restricciones vigentes: dominio en TypeScript con clases (sin funciones sueltas), sin dependencias nuevas, y los tests del dominio existentes deben seguir pasando.

## Goals / Non-Goals

**Goals:**

- Que "next" sea instantáneo: revelar no recalcula el mapa de escape.
- Modelar el revelado como lógica de dominio pura y testeable.
- Reutilizar la fórmula, la vista y el render progresivo ya existentes.
- Acotar el pintado sin tocar el mecanismo de color.

**Non-Goals:**

- Animación o reproducción automática (el avance es manual).
- Cambiar el render progresivo, el zoom, la paleta o el comportamiento fuera de la sección.
- Persistir el estado de la sección.

## Decisions

### 1. Clase `StepReveal` en el dominio

`StepReveal` encapsula la profundidad y el máximo vigente:

```
   StepReveal
     depth                 (empieza en 0)
     setMaxIterations(max)  recorta depth si max < depth
     advance()              depth++ hasta max; devuelve si avanzo
     reset()                depth = 0
     isComplete()           depth >= max
     isRevealed(zone)       zone === INTERIOR ? isComplete() : zone <= depth
```

El revelado de una zona exterior es `zone <= depth`; el interior (que no escapa nunca) solo se revela al completar.

Alternativa: una función suelta de filtro en la interfaz (descartada: no es testeable ni encaja con el estilo del dominio).

### 2. El revelado es un filtro del `Rasterizer`

`Rasterizer.composeInto` gana dos parámetros opcionales: el estado de revelado y el color neutro. Si una zona no está revelada, se pinta con el color neutro en vez de su color de paleta. El mapa no cambia, así que re-renderizar por "next" es O(píxeles) de color, no de iteración.

Alternativa: regenerar el mapa con un máximo creciente por paso (descartada: repetiría el cálculo más caro).

### 3. La profundidad se conserva y se recorta

La profundidad vive en la sesión y **no** se reinicia al hacer zoom, desplazar o cambiar de fórmula; solo cambia con "next", "reiniciar" o al activar la sección. Al recalcular el máximo de iteraciones (el zoom lo hace crecer), `FractalSession.scene()` sincroniza `setMaxIterations`, que recorta la profundidad si el máximo bajó.

Alternativa: reiniciar el revelado ante cualquier cambio (descartada: impide explorar mientras se observa el dibujado).

### 4. El pintado se acota en la interfaz

El bloqueo del pintado se resuelve en `FractalApp.onClick`: si la sección está activa, el click no pinta. `Palette` y `ColorChooser` no cambian. Esto corresponde al requisito modificado de `fractal-coloring`.

Alternativa: permitir pintar solo zonas reveladas (descartada por ahora: la sección es para observar, y amplía el alcance).

### 5. Controles y render

```
   barra normal:  [formas] [borrar] [ir a Julia] [?] [paso a paso]
   con la seccion activa aparece ademas:
        [ next ] [ reiniciar ]   iteracion: N
```

`FractalApp` guarda si la sección está activa, delega `next`/`reiniciar` en la sesión, actualiza el indicador y vuelve a rasterizar el mapa actual con el revelado (sin pasar por el `RenderScheduler`, que solo hace falta cuando cambia el mapa). Al activar la sección se entra en profundidad 0; al desactivarla se vuelve al render completo.

## Risks / Trade-offs

- **[El color neutro podría confundirse con el interior]** -> el interior solo aparece al completar; el neutro es un gris oscuro distinto de la paleta y del color del interior.
- **[Cambiar de fórmula con la sección activa deja la profundidad "a medias"]** -> es el comportamiento buscado: la profundidad se conserva y se recorta al nuevo máximo.
- **[Re-renderizar en cada "next" recorre la imagen completa]** -> es una rasterización (sin iterar la fórmula) y se puede reutilizar `renderRows`; el coste es bajo y "next" es manual.
- **[La sesión muta el máximo del revelado dentro de `scene()`]** -> efecto acotado y determinista; se cubre con tests.

## Migration Plan

Cambio interno; no hay migración. Se despliega con `npm test`, `npm run typecheck`, `npm run build`. Reversión: revertir el commit.

## Open Questions

- Color neutro exacto y etiqueta del indicador ("iteración N" vs "paso N").
- Si "next" debe deshabilitarse visualmente al llegar al máximo.
- Si al activar la sección conviene mostrar primero la imagen completa y esperar al primer "next", o entrar directamente en profundidad 0 (se asume lo segundo).
