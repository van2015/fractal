import { Complex } from "./Complex.ts";
import { ComplexBuffer } from "./ComplexBuffer.ts";

export const INTERIOR_ZONE = -1;

export abstract class Formula {
  abstract readonly label: string;

  abstract applyInto(z: ComplexBuffer): void;

  apply(z: Complex): Complex {
    const buffer = new ComplexBuffer().set(z.re, z.im);
    this.applyInto(buffer);
    return new Complex(buffer.re, buffer.im);
  }

  step(z: Complex, c: Complex): Complex {
    return this.apply(z).add(c);
  }

  escapeStepBuffers(
    z: ComplexBuffer,
    c: ComplexBuffer,
    maxIterations: number,
    escapeRadiusSquared: number,
  ): number {
    for (let i = 0; i < maxIterations; i += 1) {
      if (z.magnitudeSquared() > escapeRadiusSquared) {
        return i;
      }
      this.applyInto(z);
      z.add(c);
    }
    return INTERIOR_ZONE;
  }

  escapeStep(
    z0: Complex,
    c: Complex,
    maxIterations: number,
    escapeRadiusSquared: number,
  ): number {
    const z = new ComplexBuffer().set(z0.re, z0.im);
    const cb = new ComplexBuffer().set(c.re, c.im);
    return this.escapeStepBuffers(z, cb, maxIterations, escapeRadiusSquared);
  }
}
