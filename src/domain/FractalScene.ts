import { ComplexBuffer } from "./ComplexBuffer.ts";
import type { Complex } from "./Complex.ts";
import type { Formula } from "./Formula.ts";
import type { FractalMode } from "./FractalMode.ts";
import type { Viewport } from "./Viewport.ts";

export class FractalScene {
  readonly formula: Formula;
  readonly mode: FractalMode;
  readonly seed: Complex;
  readonly maxIterations: number;
  readonly escapeRadiusSquared: number;
  readonly viewport: Viewport;

  private readonly zBuffer = new ComplexBuffer();
  private readonly cBuffer = new ComplexBuffer();

  constructor(
    formula: Formula,
    mode: FractalMode,
    seed: Complex,
    maxIterations: number,
    escapeRadiusSquared: number,
    viewport: Viewport,
  ) {
    this.formula = formula;
    this.mode = mode;
    this.seed = seed;
    this.maxIterations = maxIterations;
    this.escapeRadiusSquared = escapeRadiusSquared;
    this.viewport = viewport;
  }

  zoneAt(point: Complex): number {
    return this.formula.escapeStep(
      this.mode.initialZ(point),
      this.mode.cFor(point, this.seed),
      this.maxIterations,
      this.escapeRadiusSquared,
    );
  }

  zoneAtScalar(cr: number, ci: number): number {
    this.mode.prepare(this.zBuffer, this.cBuffer, cr, ci, this.seed);
    return this.formula.escapeStepBuffers(
      this.zBuffer,
      this.cBuffer,
      this.maxIterations,
      this.escapeRadiusSquared,
    );
  }
}
