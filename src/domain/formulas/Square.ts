import { ComplexBuffer } from "../ComplexBuffer.ts";
import { Formula } from "../Formula.ts";

export class Square extends Formula {
  readonly label = "z^2";

  applyInto(z: ComplexBuffer): void {
    z.square();
  }
}
