import { ComplexBuffer } from "../ComplexBuffer.ts";
import { Formula } from "../Formula.ts";

export class Tricorn extends Formula {
  readonly label = "conj(z^2)";

  applyInto(z: ComplexBuffer): void {
    z.conjugate().square();
  }
}
