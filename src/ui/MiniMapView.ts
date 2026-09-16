import { Complex } from "../domain/Complex.ts";
import { JuliaSeed } from "../domain/JuliaSeed.ts";
import { Palette } from "../domain/Palette.ts";
import { FractalScene } from "../domain/FractalScene.ts";
import { Square } from "../domain/formulas/Square.ts";
import { MandelbrotMode } from "../domain/FractalMode.ts";
import { Viewport } from "../domain/Viewport.ts";
import { EscapeTimeGenerator } from "../domain/EscapeTimeGenerator.ts";
import { CanvasRenderer } from "./CanvasRenderer.ts";
import { Dom } from "./Dom.ts";

export class MiniMapView {
  private readonly element: HTMLElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly renderer: CanvasRenderer;
  private readonly generator: EscapeTimeGenerator;
  private readonly seedMap: JuliaSeed;
  private readonly palette: Palette;
  private readonly onSeedChange: (seed: Complex) => void;

  constructor(root: ParentNode, onSeedChange: (seed: Complex) => void) {
    this.element = Dom.require<HTMLElement>(root, "#minimap");
    this.canvas = Dom.require<HTMLCanvasElement>(root, "#minimap-canvas");
    const context = this.canvas.getContext("2d");
    if (!context) {
      throw new Error("No se pudo obtener el contexto del mini-mapa");
    }
    this.context = context;
    this.renderer = new CanvasRenderer(this.canvas);
    this.generator = new EscapeTimeGenerator();
    this.seedMap = new JuliaSeed();
    this.palette = new Palette();
    this.onSeedChange = onSeedChange;
    this.attach();
  }

  setVisible(visible: boolean): void {
    this.element.hidden = !visible;
  }

  draw(seed: Complex): void {
    const viewport = new Viewport(new Complex(-0.75, 0), 1.25);
    const scene = new FractalScene(
      new Square(),
      new MandelbrotMode(),
      new Complex(0, 0),
      80,
      4,
      viewport,
    );
    const map = this.generator.generate(scene, this.canvas.width, this.canvas.height, 1);
    this.renderer.render(map, this.palette);

    const { nx, ny } = this.seedMap.normalized(seed);
    this.context.beginPath();
    this.context.arc(nx * this.canvas.width, ny * this.canvas.height, 5, 0, Math.PI * 2);
    this.context.fillStyle = "rgba(255, 255, 255, 0.6)";
    this.context.fill();
    this.context.lineWidth = 2;
    this.context.strokeStyle = "#ffffff";
    this.context.stroke();
  }

  private attach(): void {
    this.canvas.addEventListener("pointerdown", this.handlePointer);
    this.canvas.addEventListener("pointermove", this.handlePointer);
  }

  private handlePointer = (event: PointerEvent): void => {
    if (event.type === "pointermove" && event.buttons === 0) {
      return;
    }
    const rect = this.canvas.getBoundingClientRect();
    const nx = (event.clientX - rect.left) / rect.width;
    const ny = (event.clientY - rect.top) / rect.height;
    this.onSeedChange(this.seedMap.seedAt(nx, ny));
  };
}
