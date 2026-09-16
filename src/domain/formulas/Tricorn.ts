import { Complex } from "../Complex.ts";
import { Formula } from "../Formula.ts";

export class Tricorn extends Formula {
  readonly label = "conj(z^2)";

  apply(z: Complex): Complex {
    return z.conjugate().square();
  }
}
