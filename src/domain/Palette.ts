import { INTERIOR_ZONE } from "./Formula.ts";
import { Rgb } from "./Rgb.ts";

const INTERIOR_COLOR = new Rgb(12, 12, 18);

export class Palette {
  private readonly overrides: Map<number, Rgb>;

  constructor() {
    this.overrides = new Map<number, Rgb>();
  }

  colorFor(zone: number): Rgb {
    const override = this.overrides.get(zone);
    return override ?? this.defaultColor(zone);
  }

  isPainted(zone: number): boolean {
    return this.overrides.has(zone);
  }

  paint(zone: number, color: Rgb): void {
    this.overrides.set(zone, color);
  }

  clear(): void {
    this.overrides.clear();
  }

  paintedZones(): number[] {
    return [...this.overrides.keys()];
  }

  defaultColor(zone: number): Rgb {
    if (zone === INTERIOR_ZONE) {
      return INTERIOR_COLOR;
    }
    const hue = (zone * 12) % 360;
    const lightness = 0.5 + 0.28 * Math.sin(zone * 0.35);
    return Rgb.fromHsl(hue, 0.65, lightness);
  }
}
