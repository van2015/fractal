import { ComplexBuffer } from "../ComplexBuffer.ts";
import { Formula } from "../Formula.ts";

export class Quartic extends Formula {
  readonly label = "z^4";

  applyInto(z: ComplexBuffer): void {
    z.fourth();
  }
}
