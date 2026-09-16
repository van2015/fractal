import type { FractalScene } from "./FractalScene.ts";
import type { ZoneMap } from "./ZoneMap.ts";

export abstract class FractalGenerator {
  abstract generate(scene: FractalScene, width: number, height: number, step: number): ZoneMap;
}
