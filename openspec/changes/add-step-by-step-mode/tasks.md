## 1. Dominio: estado de revelado

- [ ] 1.1 Implementar la clase `StepReveal` en `src/domain/StepReveal.ts` (`depth`, `advance`, `reset`, `isComplete`, `isRevealed`, `setMaxIterations`); verificar con tests de que empieza en 0, que `advance` no pasa del máximo, que `reset` vuelve a 0 y que el interior solo se revela al completar
- [ ] 1.2 Verificar con tests que `setMaxIterations` recorta la profundidad cuando el nuevo máximo es menor

## 2. Dominio: filtro de revelado en el render

- [ ] 2.1 Añadir a `Rasterizer.composeInto` un estado de revelado opcional y un color neutro: las zonas no reveladas se pintan con el neutro; verificar con tests de que una zona revelada usa su color de paleta y una no revelada usa el neutro
- [ ] 2.2 Verificar con tests que sin estado de revelado la composición es idéntica a la actual, y que el interior se pinta con su color solo cuando el revelado está completo

## 3. Dominio: estado de la sección en la sesión

- [ ] 3.1 Añadir a `FractalSession` el estado de la sección (`enterStepMode`, `exitStepMode`, `isStepMode`, `nextStep`, `resetSteps`, `reveal`) y sincronizar el máximo del revelado en `scene()`; verificar con tests de que activar entra en profundidad 0, que `nextStep` avanza y que `resetSteps` reinicia
- [ ] 3.2 Verificar con tests de que la profundidad se conserva al cambiar de fórmula y al hacer zoom, y de que se recorta si el máximo baja

## 4. Interfaz: render y controles

- [ ] 4.1 Pasar el estado de revelado a través de `CanvasRenderer.render` y `renderRows`; verificar que el render sin revelado no cambia (tests de `Rasterizer` siguen pasando)
- [ ] 4.2 Añadir en `index.html`/`styles.css` el botón de activar/desactivar la sección y la barra con `next`, `reiniciar` e indicador de profundidad; verificar manualmente que aparecen y desaparecen con la sección
- [ ] 4.3 Conectar los controles en `main.ts`: activar/desactivar, `next`, `reiniciar`, actualizar el indicador y re-rasterizar el mapa actual con el revelado (sin recalcular); verificar manualmente que "next" revela una iteración más y que "reiniciar" vuelve al inicio
- [ ] 4.4 Bloquear el pintado en `FractalApp.onClick` cuando la sección está activa; verificar manualmente que un click no cambia ningún color con la sección activa

## 5. Verificación final

- [ ] 5.1 Ejecutar `npm test` y `npm run typecheck` completos y confirmar que pasan
- [ ] 5.2 Recorrer el flujo en el navegador con `npm run serve`: activar la sección, avanzar con "next" hasta el final, reiniciar, hacer zoom con la sección activa y comprobar que el revelado se conserva y que el pintado está deshabilitado
