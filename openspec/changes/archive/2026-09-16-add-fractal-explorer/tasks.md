## 1. Setup del proyecto

- [x] 1.1 Inicializar el proyecto con `package.json` y `tsconfig.json` para compilar TypeScript a JavaScript de navegador; verificar con `tsc --noEmit` sin errores
- [x] 1.2 Configurar el runner de tests nativo de Node sobre TypeScript (type-stripping); verificar ejecutando un test trivial con `node --test`
- [x] 1.3 Crear `index.html` y el punto de entrada que monta el canvas a pantalla completa; verificar abriéndolo en el navegador y viendo el canvas ocupar la ventana

## 2. Dominio: aritmética compleja

- [x] 2.1 Implementar la clase `Complex` (suma, producto, módulo al cuadrado, conjugado); verificar con tests de cada operación, incluidos valores negativos y cero
- [x] 2.2 Implementar las operaciones específicas de las formas (`z^2`, `z^3`, `z^4`, `|z|^2`, conjugado); verificar con tests que comparan contra resultados calculados a mano

## 3. Dominio: la fórmula

- [x] 3.1 Definir la clase abstracta `Formula` con la iteración `z <- f(z) + c`; verificar con un test sobre una subclase de prueba
- [x] 3.2 Implementar las subclases `Square`, `Cubic`, `Quartic`, `BurningShip` y `Tricorn`; verificar con tests de un punto conocido por forma (interior y exterior)
- [x] 3.3 Implementar la configuración Mandelbrot/Julia (rol de `c` y punto de arranque) reutilizando la misma `Formula`; verificar con tests de que un mismo punto da resultados distintos según el modo

## 4. Dominio: mapa de zonas

- [x] 4.1 Implementar `FractalGenerator` (abstracta) y `EscapeTimeGenerator` produciendo un `ZoneMap` (`Int32Array`); verificar con tests que el interior recibe un id reservado y que cada punto exterior recibe su paso de escape
- [x] 4.2 Implementar el auto-escalado del máximo de iteraciones en función del zoom; verificar con tests de que un zoom mayor produce un máximo mayor
- [x] 4.3 Implementar el render progresivo del `ZoneMap` (baja resolución durante interacción, refinado al detenerse); verificar con tests de que la versión de baja resolución es coherente con la completa y que el refinado termina

## 5. Dominio: vista y navegación

- [x] 5.1 Implementar la clase `Viewport` con la transformada pantalla <-> plano complejo; verificar con tests de ida y vuelta sobre varios puntos
- [x] 5.2 Implementar el zoom hacia un punto de pantalla; verificar con tests de que el punto bajo el cursor conserva su coordenada compleja tras el zoom
- [x] 5.3 Implementar el desplazamiento (pan) sin alterar el zoom; verificar con tests de que el factor de zoom no cambia y el centro se desplaza lo esperado
- [x] 5.4 Exponer el factor de zoom actual respecto a la vista inicial; verificar con un test del factor en la vista inicial y tras varios zooms

## 6. Dominio: color y pintado

- [x] 6.1 Implementar `Palette` (id de zona -> color) con degradado por defecto y extensión al aparecer ids nuevos; verificar con tests de color por defecto y de crecimiento de la paleta
- [x] 6.2 Implementar los overrides de color indexados por id de zona; verificar con tests de que persisten ante cambios de zoom y de fórmula y de que "borrar colores" los descarta
- [x] 6.3 Implementar `ColorChooser` (contraste con vecinas, evita colores en uso entre las visibles, fallback a máximo contraste); verificar con tests de cada regla y del caso de paleta agotada
- [x] 6.4 Implementar el click repetido que cicla candidatos sobre la misma zona; verificar con un test de que clicks sucesivos devuelven colores distintos

## 7. Dominio: semilla Julia y sesión

- [x] 7.1 Implementar `JuliaSeed` que mapea la posición del mini-mapa a la semilla `c` y viceversa; verificar con tests de ida y vuelta
- [x] 7.2 Implementar `FractalSession` que orquesta formula, viewport, zonemap y palette, incluyendo el cambio de forma, el buceo Mandelbrot -> Julia y el pintado instantáneo; verificar con tests de integración del dominio (sin DOM)

## 8. Interfaz: render e interacción

- [x] 8.1 Implementar `CanvasRenderer` que convierte `ZoneMap` + `Palette` en `ImageData` y lo pinta; verificar visualmente en el navegador que el Mandelbrot se ve con el degradado
- [x] 8.2 Implementar `InputController` con rueda (zoom al cursor), arrastre (pan) y click (pintar), distinguiendo arrastre de click por umbral; verificar manualmente que arrastrar no pinta y que un click pinta la banda
- [x] 8.3 Conectar el render progresivo a la interacción; verificar manualmente que al mover/hacer zoom se ve fluido y se refina al soltar

## 9. Interfaz: controles y HUD

- [x] 9.1 Implementar el selector de forma con las cinco formas y el estado inicial en `z^2`; verificar manualmente que cada forma cambia la imagen
- [x] 9.2 Implementar el HUD de fórmula y nivel de zoom; verificar manualmente que se actualiza al cambiar de forma y al hacer zoom
- [x] 9.3 Implementar el botón `?` que activa la inspección del paso de escape bajo el cursor (desactivada por defecto); verificar manualmente que sin activar no muestra número y activado sí
- [x] 9.4 Implementar el botón "borrar colores"; verificar manualmente que restaura el degradado
- [x] 9.5 Implementar el acceso al modo Julia desde el Mandelbrot (buceo) y la vuelta; verificar manualmente que se alterna conservando una vista válida
- [x] 9.6 Implementar el mini-mapa del Mandelbrot en modo Julia con la semilla arrastrable y actualización en vivo; verificar manualmente que mover la semilla cambia el Julia

## 10. Verificación final

- [x] 10.1 Ejecutar la suite de tests del dominio completa y confirmar que pasa sin errores ni tests de UI
- [x] 10.2 Recorrer el flujo completo en el navegador (elegir forma, zoom, pintar bandas finas tras zoom, borrar colores, bucear a Julia, mover la semilla) y confirmar que se cumple lo descrito en las specs
