## Context

Proyecto nuevo, sin código ni specs previas. El alcance y la motivación están en `proposal.md`; el comportamiento exigido, en `specs/`. Este documento fija **cómo** se construye.

Restricciones que dan forma al diseño:

- Navegador de escritorio, entrada con ratón (rueda y arrastre).
- Dominio en TypeScript **estructurado en clases**, sin funciones sueltas ni interfaces que no abstraigan nada.
- Sin dependencias de runtime; render sobre Canvas 2D.
- Tests de la lógica pura, **sin tests de UI**.
- Debe quedar extensible a familias de fractales futuras (p. ej. recursivos) sin rehacer el núcleo.

## Goals / Non-Goals

**Goals:**

- Un núcleo de dominio puro, sin DOM, enteramente testeable.
- Pintar una zona en tiempo constante, independiente del coste de calcular el fractal.
- Que Mandelbrot y Julia compartan el mismo motor, sin duplicar la iteración.
- Que una familia futura de fractales pueda enchufarse sin tocar la pintura, la paleta ni la interfaz de pintado.

**Non-Goals:**

- Zoom infinito real con precisión arbitraria (no se necesita WebGL ni `decimal` de alta precisión).
- Persistencia, exportación o compartición de estado.
- Tests de interfaz, DOM o render.
- Fractales recursivos en este cambio (solo se deja el punto de extensión).

## Decisions

### 1. Dominio en TypeScript, por capas

El código se separa en dos capas con una frontera estricta:

```
   DOMINIO  (TypeScript puro, sin DOM, testeable)
   ------------------------------------------------
   Complex          valor inmutable; aritmetica compleja
   Formula          ABSTRACTA; subclases: Square, Cubic, Quartic,
                    BurningShip, Tricorn.  Sabe iterar  z <- f(z) + c
   FractalGenerator ABSTRACTA; produce un ZoneMap
   EscapeTimeGenerator  implementacion actual (escape-time)
   ZoneMap          Int32Array: 1 id de zona por pixel
   Viewport         transformada pantalla <-> complejo; zoom y pan
   Palette          id de zona -> color, con overrides
   ColorChooser     elige el color contrastante no usado
   JuliaSeed        mapea el mini-mapa a la semilla c
   FractalSession   orquesta formula + viewport + zonemap + palette

   INTERFAZ  (navegador, NO testeada)
   ------------------------------------------------
   CanvasRenderer   pinta el ZoneMap con la Palette
   InputController  gestos: rueda, arrastre, click (drag vs click)
   Hud / FormSelector / MiniMapView
```

Alternativas: funciones sueltas y módulos de utilidades (descartado por la restricción explícita); un framework reactivo (innecesario para una sola vista).

### 2. Canvas 2D con `Int32Array`, sin WebGL

El `ZoneMap` es un `Int32Array` con un id de zona por píxel. El `CanvasRenderer` lo traduce a `ImageData` y lo pinta.

Alternativas: WebGL (más rápido y con zoom infinito real, pero añade shaders y complejidad que este público no necesita); `Uint8ClampedArray` directo de colores (descartado: mezclaría cálculo y color, impidiendo el repintado instantáneo).

### 3. Separar el mapa de zonas de la paleta

El cálculo del fractal y el color son dos fases independientes:

```
   [ formula + viewport ]  --caro-->  ZoneMap (Int32Array)
                                           |
                    zoom / forma / semilla |  recalcula el ZoneMap
                                           v
   [ Palette: zona -> color ]  --barato-->  ImageData  -->  canvas
                    ^
                    |
              pintar una zona: cambia 1 entrada  -->  repinta al instante
```

Es la decision que hace posible "pintar es instantaneo": pintar nunca vuelve a recorrer la fórmula.

### 4. Una zona = un paso de escape, sin agrupar

Se descarta agrupar pasos en rangos. Las zonas finas se alcanzan con zoom, que es justo el bucle de juego deseado. Consecuencia de rendimiento: el `ZoneMap` se recalcula por completo al hacer zoom, por lo que el render progresivo (decisión 6) es imprescindible.

### 5. Color anclado al id de zona absoluto (Modelo A)

`Palette` guarda un color por id de zona. Los colores personalizados son *overrides* indexados por id de zona y **no** se descartan al cambiar de fórmula ni de zoom. Al crecer el zoom y aparecer ids nuevos, la paleta se extiende interpolando el degradado por defecto.

Alternativas: paleta cíclica (estable visualmente pero rompe el vínculo color-número, descartada); overrides por posición de píxel (se rompen con el zoom, descartada).

### 6. Render progresivo y máximo de iteraciones auto-escalado

Durante la interacción se calcula el `ZoneMap` a baja resolución y se escala; al detenerse, se refina hasta resolución completa. El máximo de iteraciones crece con el nivel de zoom según una curva fija (p. ej. proporcional al logaritmo del zoom). El niño nunca lo ajusta.

### 7. Mandelbrot y Julia como una sola `Formula` con distinto rol de `c`

La iteración `z <- f(z) + c` es idéntica. Lo único que cambia es de dónde sale `c` y dónde arranca `z`:

```
   Mandelbrot:  c = pixel          z0 = 0
   Julia:       c = semilla fija   z0 = pixel
```

Se modela como una configuración de la sesión, no como dos motores. El buceo (Mandelbrot -> Julia) solo copia el punto elegido a la semilla; el mini-mapa escribe la semilla.

### 8. Extensibilidad por `FractalGenerator` + `ZoneMap`

El núcleo no conoce "escape-time": conoce un `ZoneMap` (ids enteros por píxel) y una `Palette`. El `EscapeTimeGenerator` es la implementación actual; una familia futura (recursiva, IFS, L-system) sería otro `FractalGenerator` que produzca su propio `ZoneMap` con otra semántica de zona (p. ej. profundidad de recursión). Pintura, paleta, zoom y HUD se reutilizan sin cambios.

### 9. Elección automática de color

`ColorChooser` recibe una paleta fija de colores vivos y el conjunto de ids visibles; descarta los colores ya usados entre los visibles y, entre los restantes, elige el de mayor contraste con los ids vecinos. Si no quedan colores libres, devuelve el de mayor contraste con las vecinas. El click repetido avanza por la lista de candidatos.

### 10. Tests del dominio, sin UI

Los módulos del dominio no importan DOM ni Canvas, así que se ejecutan en Node. Se usa el runner nativo (`node:test`) sobre TypeScript con type-stripping (Node moderno), sin dependencias. Se testean: iteración por `Formula`, cálculo del `ZoneMap` y escalado de maxIter, transformadas de `Viewport`, mapeo de `JuliaSeed`, `ColorChooser` y `Palette`.

### 11. Distinción arrastre vs. click

`InputController` mide el desplazamiento del puntero entre `pointerdown` y `pointerup`; por debajo de un umbral es click (pinta) y por encima es arrastre (mueve). Evita pintar sin querer al mover la vista.

## Risks / Trade-offs

- **[Zoom profundo lento con maxIter alto]** -> render progresivo; tope de maxIter; `Int32Array` y bucles ajustados.
- **[Bandas sub-píxel difíciles de clickear]** -> el zoom las ensancha (bucle aceptado); el click resuelve el id exacto bajo el cursor aunque sea fino.
- **[`ColorChooser` puede agotar colores con muchas bandas visibles]** -> fallback explícito a máximo contraste con las vecinas.
- **[Combinaciones de color feas o poco pedagógicas]** -> paleta fija curada; elección determinista y reversible con "borrar colores".
- **[Type-stripping de Node no admite `enum` ni `namespace`]** -> usar clases y objetos `const`; nada de sintaxis no borrable.
- **[Recalcular al cambiar de fórmula puede parpadear]** -> mismo render progresivo que el zoom.
- **[La extensibilidad podría sobre-abstraer]** -> se introduce solo `FractalGenerator` + `ZoneMap`; no se generaliza más de lo que el segundo caso (futuro) justifica.

## Migration Plan

No hay migración: el proyecto parte vacío. La app se compila con `tsc` a JavaScript y se sirve como estáticos. No hay despliegue remoto en este cambio.

## Open Questions

- Colores exactos de la paleta fija y del degradado por defecto (no afecta specs ni tareas).
- Coordenadas de la vista inicial del Mandelbrot y factor de zoom inicial exacto.
- Tamaño y posición del mini-mapa.
- Si el cambio de forma se anima (morphing) o se aplica de golpe.
