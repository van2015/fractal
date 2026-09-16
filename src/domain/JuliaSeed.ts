import { Complex } from "./Complex.ts";

export class JuliaSeed {
  private readonly minRe: number;
  private readonly maxRe: number;
  private readonly minIm: number;
  private readonly maxIm: number;

  constructor(minRe = -2.5, maxRe = 1, minIm = -1.25, maxIm = 1.25) {
    this.minRe = minRe;
    this.maxRe = maxRe;
    this.minIm = minIm;
    this.maxIm = maxIm;
  }

  seedAt(nx: number, ny: number): Complex {
    const re = this.minRe + nx * (this.maxRe - this.minRe);
    const im = this.maxIm - ny * (this.maxIm - this.minIm);
    return new Complex(re, im);
  }

  normalized(seed: Complex): { nx: number; ny: number } {
    return {
      nx: (seed.re - this.minRe) / (this.maxRe - this.minRe),
      ny: (this.maxIm - seed.im) / (this.maxIm - this.minIm),
    };
  }
}
