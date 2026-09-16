import { Complex } from "../Complex.ts";
import { Formula } from "../Formula.ts";

export class Cubic extends Formula {
  readonly label = "z^3";

  apply(z: Complex): Complex {
    return z.cube();
  }
}
