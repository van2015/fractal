import type { Palette } from "./Palette.ts";
import { Rgb } from "./Rgb.ts";

export class ColorChooser {
  private readonly candidates: Rgb[];
  private readonly cycles: Map<number, number>;

  constructor(candidates: Rgb[]) {
    this.candidates = candidates;
    this.cycles = new Map<number, number>();
  }

  static defaultCandidates(): Rgb[] {
    return [
      new Rgb(230, 60, 60),
      new Rgb(245, 150, 40),
      new Rgb(245, 220, 60),
      new Rgb(80, 200, 90),
      new Rgb(60, 170, 240),
      new Rgb(70, 80, 220),
      new Rgb(180, 90, 230),
      new Rgb(245, 120, 200),
      new Rgb(240, 240, 240),
    ];
  }

  pick(zone: number, palette: Palette, visibleZones: number[]): Rgb {
    const ranked = this.rank(zone, palette, visibleZones);
    const current = this.cycles.get(zone) ?? -1;
    const next = (current + 1) % ranked.length;
    this.cycles.set(zone, next);
    return ranked[next] as Rgb;
  }

  reset(): void {
    this.cycles.clear();
  }

  private rank(zone: number, palette: Palette, visibleZones: number[]): Rgb[] {
    const used = new Set<string>();
    for (const visible of visibleZones) {
      if (visible === zone) {
        continue;
      }
      used.add(this.key(palette.colorFor(visible)));
    }

    const neighborColors = [zone - 1, zone + 1]
      .filter((neighbor) => neighbor !== zone)
      .map((neighbor) => palette.colorFor(neighbor));

    const available = this.candidates.filter((candidate) => !used.has(this.key(candidate)));
    const pool = available.length > 0 ? available : [...this.candidates];

    return pool.sort(
      (a, b) => this.neighborContrast(b, neighborColors) - this.neighborContrast(a, neighborColors),
    );
  }

  private neighborContrast(color: Rgb, neighbors: Rgb[]): number {
    if (neighbors.length === 0) {
      return 0;
    }
    return Math.min(...neighbors.map((neighbor) => color.distanceTo(neighbor)));
  }

  private key(color: Rgb): string {
    return `${color.r},${color.g},${color.b}`;
  }
}
