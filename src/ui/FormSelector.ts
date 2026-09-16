import type { FormulaCatalog, FormulaId } from "../domain/FormulaCatalog.ts";
import { Dom } from "./Dom.ts";

export class FormSelector {
  private readonly buttons = new Map<FormulaId, HTMLButtonElement>();

  constructor(
    root: ParentNode,
    catalog: FormulaCatalog,
    initial: FormulaId,
    onSelect: (id: FormulaId) => void,
  ) {
    const container = Dom.require<HTMLElement>(root, "#forms");
    for (const { id, formula } of catalog.entries()) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = formula.label;
      button.addEventListener("click", () => onSelect(id));
      container.append(button);
      this.buttons.set(id, button);
    }
    this.select(initial);
  }

  select(id: FormulaId): void {
    for (const [buttonId, button] of this.buttons) {
      button.classList.toggle("active", buttonId === id);
    }
  }
}
