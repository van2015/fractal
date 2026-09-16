import { Complex } from "./domain/Complex.ts";
import { FractalSession } from "./domain/FractalSession.ts";
import { FormulaCatalog } from "./domain/FormulaCatalog.ts";
import type { FormulaId } from "./domain/FormulaCatalog.ts";
import { CanvasRenderer } from "./ui/CanvasRenderer.ts";
import { InputController, InputListener } from "./ui/InputController.ts";
import { Hud } from "./ui/Hud.ts";
import { FormSelector } from "./ui/FormSelector.ts";
import { MiniMapView } from "./ui/MiniMapView.ts";
import { RenderScheduler } from "./ui/RenderScheduler.ts";
import { Dom } from "./ui/Dom.ts";

const MAX_RENDER_DIMENSION = 1400;
const JULIA_BUTTON_LABEL = "ir a Julia";
const JULIA_PICK_LABEL = "haz click en un punto";

class FractalApp extends InputListener {
  private readonly session: FractalSession;
  private readonly catalog: FormulaCatalog;
  private readonly canvas: HTMLCanvasElement;
  private readonly renderer: CanvasRenderer;
  private readonly scheduler: RenderScheduler;
  private readonly input: InputController;
  private readonly hud: Hud;
  private readonly forms: FormSelector;
  private readonly miniMap: MiniMapView;
  private readonly juliaButton: HTMLButtonElement;
  private readonly backButton: HTMLButtonElement;
  private readonly inspectButton: HTMLButtonElement;
  private readonly stepButton: HTMLButtonElement;
  private readonly stepControls: HTMLElement;
  private readonly stepNextButton: HTMLButtonElement;
  private readonly stepResetButton: HTMLButtonElement;
  private readonly stepDepthElement: HTMLElement;
  private imageWidth = 1;
  private imageHeight = 1;
  private inspection = false;
  private pickingJulia = false;

  constructor() {
    super();
    this.session = new FractalSession();
    this.catalog = new FormulaCatalog();
    this.canvas = Dom.require<HTMLCanvasElement>(document, "#fractal");
    this.renderer = new CanvasRenderer(this.canvas);
    this.scheduler = new RenderScheduler(this.session, this.renderer);
    this.input = new InputController(this.canvas, this);
    this.hud = new Hud(document);
    this.forms = new FormSelector(document, this.catalog, this.session.getFormulaId(), (id) =>
      this.selectFormula(id),
    );
    this.miniMap = new MiniMapView(document, (seed) => this.changeSeed(seed));
    this.juliaButton = Dom.require<HTMLButtonElement>(document, "#julia");
    this.backButton = Dom.require<HTMLButtonElement>(document, "#back");
    this.inspectButton = Dom.require<HTMLButtonElement>(document, "#inspect-toggle");
    this.stepButton = Dom.require<HTMLButtonElement>(document, "#step");
    this.stepControls = Dom.require<HTMLElement>(document, "#step-controls");
    this.stepNextButton = Dom.require<HTMLButtonElement>(document, "#step-next");
    this.stepResetButton = Dom.require<HTMLButtonElement>(document, "#step-reset");
    this.stepDepthElement = Dom.require<HTMLElement>(document, "#step-depth");

    this.juliaButton.addEventListener("click", () => this.beginJuliaPick());
    this.backButton.addEventListener("click", () => this.returnToMandelbrot());
    this.inspectButton.addEventListener("click", () => this.toggleInspection());
    this.stepButton.addEventListener("click", () => this.toggleStepMode());
    this.stepNextButton.addEventListener("click", () => this.advanceStep());
    this.stepResetButton.addEventListener("click", () => this.resetStep());
    Dom.require<HTMLButtonElement>(document, "#clear").addEventListener("click", () =>
      this.clearColors(),
    );
    window.addEventListener("resize", () => this.resize());

    this.resize();
  }

  onZoom(factor: number, x: number, y: number): void {
    if (this.pickingJulia) {
      return;
    }
    this.session.zoomAt(factor, x, y, this.imageWidth, this.imageHeight);
    this.requestRender();
  }

  onPan(dxPixels: number, dyPixels: number): void {
    if (this.pickingJulia) {
      return;
    }
    this.session.pan(dxPixels, dyPixels, this.imageHeight);
    this.requestRender();
  }

  onClick(x: number, y: number): void {
    if (this.pickingJulia) {
      const point = this.session
        .viewport()
        .toComplex(x, y, this.imageWidth, this.imageHeight);
      this.session.diveToJulia(point);
      this.pickingJulia = false;
      this.updateChrome();
      this.requestRender();
      return;
    }
    if (this.session.isStepMode()) {
      return;
    }
    this.session.paintAt(x, y);
    this.redraw();
  }

  onHover(x: number, y: number): void {
    if (!this.inspection) {
      return;
    }
    const map = this.session.currentZoneMap();
    if (!map) {
      return;
    }
    this.hud.showInspection(map.zoneAt(Math.floor(x), Math.floor(y)));
  }

  onLeave(): void {
    this.hud.hideInspection();
  }

  private resize(): void {
    const ratio = window.devicePixelRatio || 1;
    this.canvas.width = Math.floor(window.innerWidth * ratio);
    this.canvas.height = Math.floor(window.innerHeight * ratio);

    const scale = Math.min(
      1,
      MAX_RENDER_DIMENSION / Math.max(window.innerWidth, window.innerHeight),
    );
    this.imageWidth = Math.max(1, Math.floor(window.innerWidth * scale));
    this.imageHeight = Math.max(1, Math.floor(window.innerHeight * scale));
    this.input.setImageSize(this.imageWidth, this.imageHeight);
    this.scheduler.setSize(this.imageWidth, this.imageHeight);
    this.requestRender();
  }

  private requestRender(): void {
    this.scheduler.request();
    this.updateChrome();
  }

  private redraw(): void {
    const map = this.session.currentZoneMap();
    if (map) {
      this.renderer.render(map, this.session.paletteRef(), this.session.revealState());
    }
  }

  private updateChrome(): void {
    this.hud.updateFormula(this.session.formula().label);
    this.hud.updateZoom(this.session.zoomFactor());
    this.forms.select(this.session.getFormulaId());

    const julia = this.session.isJulia();
    this.miniMap.setVisible(julia);
    this.backButton.hidden = !julia;
    this.juliaButton.hidden = julia;
    this.juliaButton.textContent = JULIA_BUTTON_LABEL;
    this.juliaButton.classList.toggle("active", this.pickingJulia);
    if (julia) {
      this.miniMap.draw(this.session.seedValue());
    }

    const stepping = this.session.isStepMode();
    this.stepButton.classList.toggle("active", stepping);
    this.stepButton.setAttribute("aria-pressed", String(stepping));
    this.stepControls.hidden = !stepping;
    this.updateStepIndicator();
  }

  private updateStepIndicator(): void {
    const reveal = this.session.revealState();
    this.stepDepthElement.textContent = reveal ? `iteracion ${reveal.currentDepth()}` : "";
  }

  private toggleStepMode(): void {
    if (this.session.isStepMode()) {
      this.session.exitStepMode();
    } else {
      this.session.enterStepMode();
    }
    this.updateChrome();
    this.redraw();
  }

  private advanceStep(): void {
    if (this.session.nextStep()) {
      this.updateStepIndicator();
      this.redraw();
    }
  }

  private resetStep(): void {
    this.session.resetSteps();
    this.updateStepIndicator();
    this.redraw();
  }

  private selectFormula(id: FormulaId): void {
    this.session.setFormula(id);
    this.forms.select(id);
    this.requestRender();
  }

  private changeSeed(seed: Complex): void {
    this.session.setSeed(seed);
    this.requestRender();
  }

  private clearColors(): void {
    this.session.clearColors();
    this.redraw();
  }

  private beginJuliaPick(): void {
    this.pickingJulia = true;
    this.juliaButton.textContent = JULIA_PICK_LABEL;
    this.juliaButton.classList.add("active");
  }

  private returnToMandelbrot(): void {
    this.session.backToMandelbrot();
    this.pickingJulia = false;
    this.updateChrome();
    this.requestRender();
  }

  private toggleInspection(): void {
    this.inspection = !this.inspection;
    this.inspectButton.classList.toggle("active", this.inspection);
    this.inspectButton.setAttribute("aria-pressed", String(this.inspection));
    if (!this.inspection) {
      this.hud.hideInspection();
    }
  }
}

new FractalApp();
