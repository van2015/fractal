## 1. Búfer complejo y kernel sin asignaciones

- [x] 1.1 Implementar la clase `ComplexBuffer` (campos mutables `re`/`im`; `set`, `square`, `multiply`, `cube`, `fourth`, `absolute`, `conjugate`, `add`, `magnitudeSquared`) en `src/domain/ComplexBuffer.ts`; verificar con tests que cada operación en sitio coincide con su equivalente inmutable de `Complex`
- [x] 1.2 Añadir `Formula.applyInto(z: ComplexBuffer): void` abstracto y reimplementar `apply(z: Complex): Complex` sobre él; verificar que los tests de las cinco formas siguen pasando sin cambios
- [x] 1.3 Reimplementar `Formula.escapeStep` con dos `ComplexBuffer` reutilizados (sin asignar por iteración); verificar con los tests existentes de interior/exterior y añadir un test que compare `escapeStep` contra una versión basada en `apply` inmutable sobre una muestra de puntos

## 2. Proyección y modo sin asignaciones

- [x] 2.1 Implementar la clase `Projection` (calculada una vez por render desde `Viewport`) con `reAt(x)` e `imAt(y)`; verificar con tests de que coincide con `Viewport.toComplex` para varios píxeles
- [x] 2.2 Añadir `FractalMode.prepare(z0, c, cr, ci, seed)` en las subclases Mandelbrot y Julia; verificar con tests de que producen los mismos `z0` y `c` que `initialZ`/`cFor`
- [x] 2.3 Añadir `FractalScene.zoneAtScalar(cr, ci)` reutilizando búferes internos y hacer que `EscapeTimeGenerator.generate` use `Projection` + `zoneAtScalar`; verificar con un test de que el `ZoneMap` generado es idéntico (mismos `data`) al de la versión anterior basada en `Complex`

## 3. Color memoizado

- [x] 3.1 Añadir a `Palette` una caché de color por defecto por id de zona; verificar con tests de que `colorFor` devuelve el mismo `Rgb` para la misma zona y de que `clear()` vacía la caché
- [x] 3.2 Comprobar que los overrides siguen teniendo prioridad sobre la caché; verificar con los tests de pintado existentes

## 4. Render por bloques

- [x] 4.1 Reescribir `CanvasRenderer.render` para recorrer con el paso del mapa y rellenar bloques `step × step`; verificar con un test (o comprobación manual) de que la imagen resultante es idéntica a la anterior para pasos 1, 2 y 4

## 5. Render troceado e interrumpible

- [x] 5.1 Añadir `EscapeTimeGenerator.generateRows(scene, width, height, yStart, yEnd, step, map)` que escriba en un `ZoneMap` existente; verificar con un test de que generar por filas produce el mismo mapa que `generate`
- [x] 5.2 Implementar `RenderScheduler` en `src/ui/RenderScheduler.ts` (dibuja el paso grueso, trocea el fino con `requestAnimationFrame` y un presupuesto de tiempo, y cancela al llegar otra petición); verificar manualmente en el navegador que el zoom es fluido y se refina sin bloquear
- [x] 5.3 Conectar `FractalApp.requestRender` al `RenderScheduler`; verificar manualmente que el zoom, el cambio de forma y el buceo a Julia siguen funcionando

## 6. Retirar código muerto

- [x] 6.1 Eliminar `ProgressiveRenderer` y su test, ya cubiertos por `generateRows` + `RenderScheduler`; verificar que `npm run build` y `npm test` siguen pasando sin referencias colgantes

## 7. Verificación final

- [x] 7.1 Ejecutar `npm test` y `npm run typecheck` completos y confirmar que pasan sin cambios en los tests existentes (salida idéntica)
- [x] 7.2 Medir manualmente en el navegador el tiempo del primer fotograma y del refinado antes/después, y confirmar la mejora de fluidez con `npm run serve`
