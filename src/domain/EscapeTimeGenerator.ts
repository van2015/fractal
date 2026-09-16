import { FractalGenerator } from "./FractalGenerator.ts";
import type { FractalScene } from "./FractalScene.ts";
import { Projection } from "./Projection.ts";
import { ZoneMap } from "./ZoneMap.ts";

export class EscapeTimeGenerator extends FractalGenerator {
  generate(scene: FractalScene, width: number, height: number, step = 1): ZoneMap {
    const map = new ZoneMap(width, height, step);
    this.generateRows(scene, width, height, 0, height, step, map);
    return map;
  }

  generateRows(
    scene: FractalScene,
    width: number,
    height: number,
    yStart: number,
    yEnd: number,
    step: number,
    map: ZoneMap,
  ): void {
    const projection = Projection.fromViewport(scene.viewport, width, height);
    const start = yStart - (yStart % step);
    const end = Math.min(yEnd, height);
    for (let y = start; y < end; y += step) {
      const im = projection.imAt(y);
      for (let x = 0; x < width; x += step) {
        map.setZone(x, y, scene.zoneAtScalar(projection.reAt(x), im));
      }
    }
  }
}
