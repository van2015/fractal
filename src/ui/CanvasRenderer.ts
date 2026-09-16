import type { Palette } from "../domain/Palette.ts";
import { Rasterizer } from "../domain/Rasterizer.ts";
import type { ZoneMap } from "../domain/ZoneMap.ts";

export class CanvasRenderer {
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly buffer: HTMLCanvasElement;
  private readonly bufferContext: CanvasRenderingContext2D;
  private image: ImageData | null = null;

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
    const image = this.ensureBuffer(map);
    Rasterizer.composeInto(map, palette, image.data, 0, map.height);
    this.bufferContext.putImageData(image, 0, 0);
    this.blit();
  }

  renderRows(map: ZoneMap, palette: Palette, yStart: number, yEnd: number): void {
    const end = Math.min(yEnd, map.height);
    if (end <= yStart) {
      return;
    }
    const image = this.ensureBuffer(map);
    Rasterizer.composeInto(map, palette, image.data, yStart, end);
    this.bufferContext.putImageData(image, 0, 0, 0, yStart, map.width, end - yStart);
    this.blit();
  }

  private ensureBuffer(map: ZoneMap): ImageData {
    if (this.buffer.width !== map.width || this.buffer.height !== map.height || !this.image) {
      this.buffer.width = map.width;
      this.buffer.height = map.height;
      this.image = this.bufferContext.createImageData(map.width, map.height);
    }
    return this.image;
  }

  private blit(): void {
    this.context.imageSmoothingEnabled = false;
    this.context.drawImage(this.buffer, 0, 0, this.canvas.width, this.canvas.height);
  }
}
