import { Complex } from "../Complex.ts";
import { Formula } from "../Formula.ts";

export class BurningShip extends Formula {
  readonly label = "|z|^2";

  apply(z: Complex): Complex {
    return z.absolute().square();
  }
}
