import { ComplexBuffer } from "../ComplexBuffer.ts";
import { Formula } from "../Formula.ts";

export class BurningShip extends Formula {
  readonly label = "|z|^2";

  applyInto(z: ComplexBuffer): void {
    z.absolute().square();
  }
}
