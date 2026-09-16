import type { FractalScene } from "../domain/FractalScene.ts";
import type { FractalSession } from "../domain/FractalSession.ts";
import { EscapeTimeGenerator } from "../domain/EscapeTimeGenerator.ts";
import { ZoneMap } from "../domain/ZoneMap.ts";
import type { CanvasRenderer } from "./CanvasRenderer.ts";

const COARSE_STEP = 8;
const ROW_CHUNK = 16;
const BUDGET_MS = 8;

export class RenderScheduler {
  private readonly session: FractalSession;
  private readonly renderer: CanvasRenderer;
  private readonly generator: EscapeTimeGenerator;
  private width = 1;
  private height = 1;
  private handle: number | null = null;
  private cancelled = false;

  constructor(session: FractalSession, renderer: CanvasRenderer) {
    this.session = session;
    this.renderer = renderer;
    this.generator = new EscapeTimeGenerator();
  }

  setSize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  request(): void {
    this.cancel();
    this.cancelled = false;

    const scene = this.session.scene(this.width, this.height);
    const coarse = this.generator.generate(scene, this.width, this.height, COARSE_STEP);
    const map = new ZoneMap(this.width, this.height, 1);
    map.copyUpsampledFrom(coarse);

    this.session.setCurrentMap(map);
    this.renderer.render(map, this.session.paletteRef(), this.session.revealState());

    this.scheduleFine(scene, map);
  }

  cancel(): void {
    this.cancelled = true;
    if (this.handle !== null) {
      window.cancelAnimationFrame(this.handle);
      this.handle = null;
    }
  }

  private scheduleFine(scene: FractalScene, map: ZoneMap): void {
    let y = 0;

    const runChunk = (): void => {
      if (this.cancelled) {
        return;
      }

      const firstRow = y;
      const deadline = performance.now() + BUDGET_MS;
      do {
        this.generator.generateRows(scene, this.width, this.height, y, y + ROW_CHUNK, 1, map);
        y += ROW_CHUNK;
      } while (y < this.height && performance.now() < deadline);

      this.renderer.renderRows(
        map,
        this.session.paletteRef(),
        firstRow,
        Math.min(y, this.height),
        this.session.revealState(),
      );

      if (y < this.height) {
        this.handle = window.requestAnimationFrame(runChunk);
      } else {
        this.handle = null;
      }
    };

    this.handle = window.requestAnimationFrame(runChunk);
  }
}
