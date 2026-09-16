import type { Palette } from "./Palette.ts";
import { Rgb } from "./Rgb.ts";
import type { StepReveal } from "./StepReveal.ts";
import type { ZoneMap } from "./ZoneMap.ts";

export const NEUTRAL_COLOR = new Rgb(24, 24, 28);

export class Rasterizer {
  static composeInto(
    map: ZoneMap,
    palette: Palette,
    target: Uint8ClampedArray,
    yStart = 0,
    yEnd = map.height,
    reveal: StepReveal | null = null,
    neutral: Rgb = NEUTRAL_COLOR,
  ): void {
    const width = map.width;
    const step = map.step;
    const start = yStart - (yStart % step);
    const end = Math.min(yEnd, map.height);

    for (let y = start; y < end; y += step) {
      const maxY = Math.min(y + step, map.height);
      for (let x = 0; x < width; x += step) {
        const zone = map.data[map.index(x, y)];
        const color = reveal && !reveal.isRevealed(zone) ? neutral : palette.colorFor(zone);
        const maxX = Math.min(x + step, width);
        for (let blockY = y; blockY < maxY; blockY += 1) {
          let index = (blockY * width + x) * 4;
          for (let blockX = x; blockX < maxX; blockX += 1) {
            target[index] = color.r;
            target[index + 1] = color.g;
            target[index + 2] = color.b;
            target[index + 3] = 255;
            index += 4;
          }
        }
      }
    }
  }
}
