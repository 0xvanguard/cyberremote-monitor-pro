# ⚡ Rendimiento del Mapa 2D — Medición y Decisiones

> Medición posterior a la optimización de `app.js` / `map-pro.css`
> (commit `70c76f6` — *perf(map): disable 2D panning and cut render cost*).

## Metodología

Medición instrumentada desde la propia página (equivalente al panel
Performance de DevTools):

- **FPS real**: muestreo de `requestAnimationFrame` durante ventanas de 3 s
  (reposo) y 2 s (zoom animado con `flyTo` zoom 2→5).
- **A/B del patrón antiguo**: se re-inyectan vía CSS los patrones eliminados
  (pulso infinito en los 141 marcadores + `filter: blur()` en los halos),
  se mide, y se retiran para medir el estado optimizado en la misma sesión.
- **Tareas largas**: `PerformanceObserver` con `entryTypes: ['longtask']`
  durante una secuencia de zoom + vuelo a Bogotá.
- **Memoria**: `performance.memory.usedJSHeapSize`.
- **Estructura**: conteo de nodos DOM, nodos de marcadores y nodos SVG/canvas
  dentro de `#map2d`.

Entorno: Chromium headless (preview), dataset completo de 141 países,
mapa visible a viewport completo.

## Resultados

### Estado optimizado (actual)

| Métrica | Valor |
|---|---|
| FPS en reposo | **75** (tope del refresco del monitor) |
| FPS durante zoom animado (`flyTo`) | **39** |
| Heap JS | **7 MB** |
| Nodos DOM totales (página) | 2 960 |
| Nodos de marcadores | 141 |
| Nodos SVG dentro del mapa | **3** (solo controles; coroplético en canvas) |
| Canvas en el mapa | 1 (renderer vectorial) |
| Tareas largas en zoom + vuelo | 1 (53 ms, decodificación de tiles) |

### A/B — coste de los patrones eliminados

| Escenario | FPS | Delta vs optimizado |
|---|---|---|
| Optimizado (actual) | 75 | — |
| Pulso infinito en 141 marcadores + `blur(7px)` (patrón viejo) | 59 | **−21 %** |
| Zoom animado con patrón viejo | **25** | **−36 %** |
| Zoom animado optimizado | 39 | — |

## Decisiones de optimización y su justificación

1. **`preferCanvas: true`** — el GeoJSON de 141 países se pinta en un solo
   `<canvas>` en lugar de ~180 nodos SVG con listeners individuales.
   Evidencia: solo 3 nodos SVG permanecen en el mapa (controles Leaflet).
   Es el mayor win: menos nodos, menos hit-testing, menos repaint.

2. **Halo con `radial-gradient` en lugar de `filter: blur()`** — el blur es
   un filtro por-elemento que fuerza recomposición costosa; el gradiente se
   rasteriza una vez. Contribuye al delta de 16 FPS en reposo del A/B.

3. **Pulso animado solo en hover/seleccionado** — antes había 141 animaciones
   CSS infinitas simultáneas; ahora `animation: none` en reposo y `crPing`
   únicamente en el marcador activo. Es la causa principal del desplome a
   25 FPS durante zoom con el patrón viejo.

4. **Zoom puro con centro fijo (`scrollWheelZoom: 'center'`)** — además del
   requisito de UX (sin arrastre), reduce los estados intermedios de
   re-proyección al eliminar el paneo inercial.

## Recomendaciones si se necesita escalar

- Si el dataset crece a >500 marcadores: agrupar con `Leaflet.markercluster`
  o mover los dots al canvas junto al coroplético.
- Para zoom animado más fluido: precargar tiles del siguiente nivel de zoom
  (`keepBuffer: 3`) — el cuello actual es decodificación de tiles, no JS.
- `PerformanceObserver('longtask')` en producción como canary: alertar si
  aparecen tareas >100 ms durante la interacción con el mapa.
