import { Complex } from "./Complex.ts";

export type FractalModeId = "mandelbrot" | "julia";

export abstract class FractalMode {
  abstract readonly id: FractalModeId;

  abstract initialZ(point: Complex): Complex;

  abstract cFor(point: Complex, seed: Complex): Complex;
}

export class MandelbrotMode extends FractalMode {
  readonly id = "mandelbrot" as const;

  initialZ(): Complex {
    return new Complex(0, 0);
  }

  cFor(point: Complex): Complex {
    return point;
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
}
