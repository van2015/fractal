import { ComplexBuffer } from "../ComplexBuffer.ts";
import { Formula } from "../Formula.ts";

export class Cubic extends Formula {
  readonly label = "z^3";

  applyInto(z: ComplexBuffer): void {
    z.cube();
  }
}
