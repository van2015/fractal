import type { Palette } from "../domain/Palette.ts";
import type { ZoneMap } from "../domain/ZoneMap.ts";

export class CanvasRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly buffer: HTMLCanvasElement;
  private readonly bufferContext: CanvasRenderingContext2D;

  constructor(canvas: HTMLCanvasElement) {
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("No se pudo obtener el contexto 2D del lienzo");
    }
    const buffer = document.createElement("canvas");
    const bufferContext = buffer.getContext("2d");
    if (!bufferContext) {
      throw new Error("No se pudo obtener el contexto 2D del buffer");
    }
    this.canvas = canvas;
    this.context = context;
    this.buffer = buffer;
    this.bufferContext = bufferContext;
  }

  render(map: ZoneMap, palette: Palette): void {
    if (this.buffer.width !== map.width || this.buffer.height !== map.height) {
      this.buffer.width = map.width;
      this.buffer.height = map.height;
    }

    const image = this.bufferContext.createImageData(map.width, map.height);
    const data = image.data;
    for (let y = 0; y < map.height; y += 1) {
      for (let x = 0; x < map.width; x += 1) {
        const color = palette.colorFor(map.zoneAt(x, y));
        const index = (y * map.width + x) * 4;
        data[index] = color.r;
        data[index + 1] = color.g;
        data[index + 2] = color.b;
        data[index + 3] = 255;
      }
    }

    this.bufferContext.putImageData(image, 0, 0);
    this.context.imageSmoothingEnabled = false;
    this.context.drawImage(this.buffer, 0, 0, this.canvas.width, this.canvas.height);
  }
}
