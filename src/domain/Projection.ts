import type { Viewport } from "./Viewport.ts";

export class Projection {
  private readonly centerRe: number;
  private readonly centerIm: number;
  private readonly units: number;
  private readonly halfWidth: number;
  private readonly halfHeight: number;

  constructor(
    centerRe: number,
    centerIm: number,
    units: number,
    halfWidth: number,
    halfHeight: number,
  ) {
    this.centerRe = centerRe;
    this.centerIm = centerIm;
    this.units = units;
    this.halfWidth = halfWidth;
    this.halfHeight = halfHeight;
  }

  static fromViewport(viewport: Viewport, width: number, height: number): Projection {
    const center = viewport.getCenter();
    return new Projection(
      center.re,
      center.im,
      viewport.unitsPerPixel(height),
      width / 2,
      height / 2,
    );
  }

  reAt(x: number): number {
    return this.centerRe + (x - this.halfWidth) * this.units;
  }

  imAt(y: number): number {
    return this.centerIm - (y - this.halfHeight) * this.units;
  }
}
