import { Complex } from "./Complex.ts";

export class Viewport {
  private center: Complex;
  private halfHeight: number;
  private readonly initialCenter: Complex;
  private readonly initialHalfHeight: number;

  constructor(center: Complex, halfHeight: number) {
    this.center = center;
    this.halfHeight = halfHeight;
    this.initialCenter = center;
    this.initialHalfHeight = halfHeight;
  }

  static default(): Viewport {
    return new Viewport(new Complex(-0.5, 0), 1.25);
  }

  static juliaDefault(): Viewport {
    return new Viewport(new Complex(0, 0), 1.5);
  }

  unitsPerPixel(height: number): number {
    return (2 * this.halfHeight) / height;
  }

  toComplex(px: number, py: number, width: number, height: number): Complex {
    const units = this.unitsPerPixel(height);
    const dx = px - width / 2;
    const dy = py - height / 2;
    return new Complex(this.center.re + dx * units, this.center.im - dy * units);
  }

  toPixel(point: Complex, width: number, height: number): { x: number; y: number } {
    const units = this.unitsPerPixel(height);
    return {
      x: (point.re - this.center.re) / units + width / 2,
      y: height / 2 - (point.im - this.center.im) / units,
    };
  }

  zoomAt(factor: number, px: number, py: number, width: number, height: number): void {
    const before = this.toComplex(px, py, width, height);
    this.halfHeight /= factor;
    const units = this.unitsPerPixel(height);
    const dx = px - width / 2;
    const dy = py - height / 2;
    this.center = new Complex(before.re - dx * units, before.im + dy * units);
  }

  pan(dxPixels: number, dyPixels: number, height: number): void {
    const units = this.unitsPerPixel(height);
    this.center = new Complex(
      this.center.re - dxPixels * units,
      this.center.im + dyPixels * units,
    );
  }

  zoomFactor(): number {
    return this.initialHalfHeight / this.halfHeight;
  }

  reset(): void {
    this.center = this.initialCenter;
    this.halfHeight = this.initialHalfHeight;
  }

  getCenter(): Complex {
    return this.center;
  }

  getHalfHeight(): number {
    return this.halfHeight;
  }
}
