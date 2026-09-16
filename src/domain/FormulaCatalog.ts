import type { Formula } from "./Formula.ts";
import { Square } from "./formulas/Square.ts";
import { Cubic } from "./formulas/Cubic.ts";
import { Quartic } from "./formulas/Quartic.ts";
import { BurningShip } from "./formulas/BurningShip.ts";
import { Tricorn } from "./formulas/Tricorn.ts";

export type FormulaId = "square" | "cubic" | "quartic" | "burningShip" | "tricorn";

export const DEFAULT_FORMULA_ID: FormulaId = "square";

export class FormulaCatalog {
  private readonly formulas: Map<FormulaId, Formula>;

  constructor() {
    this.formulas = new Map<FormulaId, Formula>([
      ["square", new Square()],
      ["cubic", new Cubic()],
      ["quartic", new Quartic()],
      ["burningShip", new BurningShip()],
      ["tricorn", new Tricorn()],
    ]);
  }

  get(id: FormulaId): Formula {
    const formula = this.formulas.get(id);
    if (!formula) {
      throw new Error(`Forma desconocida: ${id}`);
    }
    return formula;
  }

  ids(): FormulaId[] {
    return [...this.formulas.keys()];
  }

  entries(): Array<{ id: FormulaId; formula: Formula }> {
    return [...this.formulas.entries()].map(([id, formula]) => ({ id, formula }));
  }
}
