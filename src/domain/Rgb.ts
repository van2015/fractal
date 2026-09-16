export class Rgb {
  readonly r: number;
  readonly g: number;
  readonly b: number;

  constructor(r: number, g: number, b: number) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  static fromHsl(hueDegrees: number, saturation: number, lightness: number): Rgb {
    const hue = ((hueDegrees % 360) + 360) % 360;
    const c = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
    const m = lightness - c / 2;

    let r = 0;
    let g = 0;
    let b = 0;
    if (hue < 60) {
      [r, g, b] = [c, x, 0];
    } else if (hue < 120) {
      [r, g, b] = [x, c, 0];
    } else if (hue < 180) {
      [r, g, b] = [0, c, x];
    } else if (hue < 240) {
      [r, g, b] = [0, x, c];
    } else if (hue < 300) {
      [r, g, b] = [x, 0, c];
    } else {
      [r, g, b] = [c, 0, x];
    }

    return new Rgb(
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255),
    );
  }

  distanceTo(other: Rgb): number {
    const dr = this.r - other.r;
    const dg = this.g - other.g;
    const db = this.b - other.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  }

  equals(other: Rgb): boolean {
    return this.r === other.r && this.g === other.g && this.b === other.b;
  }

  toCss(): string {
    return `rgb(${this.r}, ${this.g}, ${this.b})`;
  }
}
