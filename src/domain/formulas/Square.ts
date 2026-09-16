import { Complex } from "../Complex.ts";
import { Formula } from "../Formula.ts";

export class Square extends Formula {
  readonly label = "z^2";

  apply(z: Complex): Complex {
    return z.square();
  }
}
