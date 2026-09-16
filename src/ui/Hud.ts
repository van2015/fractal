import { INTERIOR_ZONE } from "../domain/Formula.ts";
import { Dom } from "./Dom.ts";

export class Hud {
  private readonly formulaElement: HTMLElement;
  private readonly zoomElement: HTMLElement;
  private readonly inspectElement: HTMLElement;

  constructor(root: ParentNode) {
    this.formulaElement = Dom.require<HTMLElement>(root, "#hud-formula");
    this.zoomElement = Dom.require<HTMLElement>(root, "#hud-zoom");
    this.inspectElement = Dom.require<HTMLElement>(root, "#inspect");
  }

  updateFormula(label: string): void {
    this.formulaElement.textContent = `z <- ${label} + c`;
  }

  updateZoom(factor: number): void {
    this.zoomElement.textContent = `x${factor.toFixed(1)}`;
  }

  showInspection(zone: number): void {
    this.inspectElement.hidden = false;
    this.inspectElement.textContent = zone === INTERIOR_ZONE ? "interior" : `paso ${zone}`;
  }

  hideInspection(): void {
    this.inspectElement.hidden = true;
  }
}
