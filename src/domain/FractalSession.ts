import { Complex } from "./Complex.ts";
import { FormulaCatalog, DEFAULT_FORMULA_ID } from "./FormulaCatalog.ts";
import type { FormulaId } from "./FormulaCatalog.ts";
import type { Formula } from "./Formula.ts";
import { MandelbrotMode, JuliaMode } from "./FractalMode.ts";
import type { FractalMode, FractalModeId } from "./FractalMode.ts";
import { Viewport } from "./Viewport.ts";
import { FractalScene } from "./FractalScene.ts";
import { EscapeTimeGenerator } from "./EscapeTimeGenerator.ts";
import type { FractalGenerator } from "./FractalGenerator.ts";
import { ZoneMap, UNCOMPUTED_ZONE } from "./ZoneMap.ts";
import { Palette } from "./Palette.ts";
import { ColorChooser } from "./ColorChooser.ts";
import { IterationSchedule } from "./IterationSchedule.ts";
import { StepReveal } from "./StepReveal.ts";
import type { Rgb } from "./Rgb.ts";

const ESCAPE_RADIUS_SQUARED = 4;

export class FractalSession {
  private readonly catalog: FormulaCatalog;
  private readonly generator: FractalGenerator;
  private readonly palette: Palette;
  private readonly chooser: ColorChooser;
  private readonly schedule: IterationSchedule;
  private readonly escapeRadiusSquared: number;
  private formulaId: FormulaId;
  private mode: FractalMode;
  private seed: Complex;
  private readonly mandelbrotViewport: Viewport;
  private readonly juliaViewport: Viewport;
  private currentMap: ZoneMap | null;
  private reveal: StepReveal | null = null;

  constructor() {
    this.catalog = new FormulaCatalog();
    this.generator = new EscapeTimeGenerator();
    this.palette = new Palette();
    this.chooser = new ColorChooser(ColorChooser.defaultCandidates());
    this.schedule = new IterationSchedule();
    this.escapeRadiusSquared = ESCAPE_RADIUS_SQUARED;
    this.formulaId = DEFAULT_FORMULA_ID;
    this.mode = new MandelbrotMode();
    this.seed = new Complex(-0.8, 0.156);
    this.mandelbrotViewport = Viewport.default();
    this.juliaViewport = Viewport.juliaDefault();
    this.currentMap = null;
  }

  formula(): Formula {
    return this.catalog.get(this.formulaId);
  }

  getFormulaId(): FormulaId {
    return this.formulaId;
  }

  setFormula(id: FormulaId): void {
    this.formulaId = id;
  }

  modeId(): FractalModeId {
    return this.mode.id;
  }

  isJulia(): boolean {
    return this.mode.id === "julia";
  }

  seedValue(): Complex {
    return this.seed;
  }

  setSeed(seed: Complex): void {
    this.seed = seed;
  }

  paletteRef(): Palette {
    return this.palette;
  }

  viewport(): Viewport {
    return this.isJulia() ? this.juliaViewport : this.mandelbrotViewport;
  }

  zoomFactor(): number {
    return this.viewport().zoomFactor();
  }

  zoomAt(factor: number, px: number, py: number, width: number, height: number): void {
    this.viewport().zoomAt(factor, px, py, width, height);
  }

  pan(dxPixels: number, dyPixels: number, height: number): void {
    this.viewport().pan(dxPixels, dyPixels, height);
  }

  resetView(): void {
    this.viewport().reset();
  }

  clearColors(): void {
    this.palette.clear();
    this.chooser.reset();
  }

  enterStepMode(): void {
    this.reveal = new StepReveal(this.schedule.maxIterations(this.zoomFactor()));
  }

  exitStepMode(): void {
    this.reveal = null;
  }

  isStepMode(): boolean {
    return this.reveal !== null;
  }

  revealState(): StepReveal | null {
    return this.reveal;
  }

  nextStep(): boolean {
    return this.reveal ? this.reveal.advance() : false;
  }

  resetSteps(): void {
    this.reveal?.reset();
  }

  scene(width: number, height: number): FractalScene {
    const maxIterations = this.schedule.maxIterations(this.zoomFactor());
    this.reveal?.setMaxIterations(maxIterations);
    return new FractalScene(
      this.formula(),
      this.mode,
      this.seed,
      maxIterations,
      this.escapeRadiusSquared,
      this.viewport(),
    );
  }

  render(width: number, height: number, step = 1): ZoneMap {
    this.currentMap = this.generator.generate(this.scene(width, height), width, height, step);
    return this.currentMap;
  }

  currentZoneMap(): ZoneMap | null {
    return this.currentMap;
  }

  setCurrentMap(map: ZoneMap): void {
    this.currentMap = map;
  }

  visibleZones(map: ZoneMap): number[] {
    const zones = new Set<number>();
    for (const zone of map.data) {
      if (zone !== UNCOMPUTED_ZONE) {
        zones.add(zone);
      }
    }
    return [...zones];
  }

  paintAt(x: number, y: number): Rgb | null {
    if (!this.currentMap) {
      return null;
    }
    const zone = this.currentMap.zoneAt(x, y);
    const color = this.chooser.pick(zone, this.palette, this.visibleZones(this.currentMap));
    this.palette.paint(zone, color);
    return color;
  }

  diveToJulia(point: Complex): void {
    this.mode = new JuliaMode();
    this.seed = point;
    this.juliaViewport.reset();
    this.currentMap = null;
  }

  backToMandelbrot(): void {
    this.mode = new MandelbrotMode();
    this.currentMap = null;
  }
}
