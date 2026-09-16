import { Complex } from "../Complex.ts";
import { Formula } from "../Formula.ts";

export class Quartic extends Formula {
  readonly label = "z^4";

  apply(z: Complex): Complex {
    return z.fourth();
  }
}
