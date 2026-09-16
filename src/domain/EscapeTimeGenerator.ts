import { FractalGenerator } from "./FractalGenerator.ts";
import type { FractalScene } from "./FractalScene.ts";
import { ZoneMap } from "./ZoneMap.ts";

export class EscapeTimeGenerator extends FractalGenerator {
  generate(scene: FractalScene, width: number, height: number, step = 1): ZoneMap {
    const map = new ZoneMap(width, height, step);
    for (let y = 0; y < height; y += step) {
      for (let x = 0; x < width; x += step) {
        const point = scene.viewport.toComplex(x, y, width, height);
        map.setZone(x, y, scene.zoneAt(point));
      }
    }
    return map;
  }
}
