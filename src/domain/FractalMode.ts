import { Complex } from "./Complex.ts";
import { ComplexBuffer } from "./ComplexBuffer.ts";

export type FractalModeId = "mandelbrot" | "julia";

export abstract class FractalMode {
  abstract readonly id: FractalModeId;

  abstract initialZ(point: Complex): Complex;

  abstract cFor(point: Complex, seed: Complex): Complex;

  abstract prepare(
    z0: ComplexBuffer,
    c: ComplexBuffer,
    cr: number,
    ci: number,
    seed: Complex,
  ): void;
}

export class MandelbrotMode extends FractalMode {
  readonly id = "mandelbrot" as const;

  initialZ(): Complex {
    return new Complex(0, 0);
  }

  cFor(point: Complex): Complex {
    return point;
  }

  prepare(z0: ComplexBuffer, c: ComplexBuffer, cr: number, ci: number): void {
    z0.set(0, 0);
    c.set(cr, ci);
  }
}

export class JuliaMode extends FractalMode {
  readonly id = "julia" as const;

  initialZ(point: Complex): Complex {
    return point;
  }

  cFor(_point: Complex, seed: Complex): Complex {
    return seed;
  }

  prepare(z0: ComplexBuffer, c: ComplexBuffer, cr: number, ci: number, seed: Complex): void {
    z0.set(cr, ci);
    c.set(seed.re, seed.im);
  }
}
