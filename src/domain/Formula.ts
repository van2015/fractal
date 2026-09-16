import { Complex } from "./Complex.ts";

export const INTERIOR_ZONE = -1;

export abstract class Formula {
  abstract readonly label: string;

  abstract apply(z: Complex): Complex;

  step(z: Complex, c: Complex): Complex {
    return this.apply(z).add(c);
  }

  escapeStep(
    z0: Complex,
    c: Complex,
    maxIterations: number,
    escapeRadiusSquared: number,
  ): number {
    let z = z0;
    for (let i = 0; i < maxIterations; i += 1) {
      if (z.magnitudeSquared() > escapeRadiusSquared) {
        return i;
      }
      z = this.step(z, c);
    }
    return INTERIOR_ZONE;
  }
}
