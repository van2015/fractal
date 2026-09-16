export const UNCOMPUTED_ZONE = -2;

export class ZoneMap {
  readonly width: number;
  readonly height: number;
  readonly step: number;
  readonly data: Int32Array;

  constructor(width: number, height: number, step: number, data?: Int32Array) {
    this.width = width;
    this.height = height;
    this.step = step;
    this.data = data ?? new Int32Array(width * height).fill(UNCOMPUTED_ZONE);
  }

  index(x: number, y: number): number {
    return y * this.width + x;
  }

  zoneAt(x: number, y: number): number {
    const sampleX = this.step > 1 ? x - (x % this.step) : x;
    const sampleY = this.step > 1 ? y - (y % this.step) : y;
    return this.data[this.index(sampleX, sampleY)];
  }

  setZone(x: number, y: number, zone: number): void {
    this.data[this.index(x, y)] = zone;
  }

  copyUpsampledFrom(source: ZoneMap): void {
    for (let y = 0; y < this.height; y += 1) {
      for (let x = 0; x < this.width; x += 1) {
        this.data[this.index(x, y)] = source.zoneAt(x, y);
      }
    }
  }
}
