import type { FractalGenerator } from "./FractalGenerator.ts";
import type { FractalScene } from "./FractalScene.ts";
import type { ZoneMap } from "./ZoneMap.ts";

export class ProgressiveRenderer {
  private readonly generator: FractalGenerator;
  private readonly scene: FractalScene;
  private readonly width: number;
  private readonly height: number;
  private step: number;
  private current: ZoneMap;

  constructor(
    generator: FractalGenerator,
    scene: FractalScene,
    width: number,
    height: number,
    initialStep = 8,
  ) {
    this.generator = generator;
    this.scene = scene;
    this.width = width;
    this.height = height;
    this.step = Math.max(1, initialStep);
    this.current = this.generator.generate(scene, width, height, this.step);
  }

  map(): ZoneMap {
    return this.current;
  }

  isComplete(): boolean {
    return this.step === 1;
  }

  refine(): boolean {
    if (this.step === 1) {
      return false;
    }
    this.step = Math.max(1, Math.floor(this.step / 2));
    this.current = this.generator.generate(this.scene, this.width, this.height, this.step);
    return true;
  }
}
