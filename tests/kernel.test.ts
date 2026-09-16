import { test } from "node:test";
import assert from "node:assert/strict";
import { Complex } from "../src/domain/Complex.ts";
import { ComplexBuffer } from "../src/domain/ComplexBuffer.ts";
import { Square } from "../src/domain/formulas/Square.ts";
import { Cubic } from "../src/domain/formulas/Cubic.ts";
import { Quartic } from "../src/domain/formulas/Quartic.ts";
import { BurningShip } from "../src/domain/formulas/BurningShip.ts";
import { Tricorn } from "../src/domain/formulas/Tricorn.ts";
import type { Formula } from "../src/domain/Formula.ts";

const MAX_ITERATIONS = 60;
const ESCAPE_RADIUS_SQUARED = 4;

const operaciones: Array<[string, (buffer: ComplexBuffer) => void, (value: Complex) => Complex]> = [
  ["square", (b) => b.square(), (v) => v.square()],
  ["multiply", (b) => b.multiply(new ComplexBuffer().set(3, -2)), (v) => v.multiply(new Complex(3, -2))],
  ["cube", (b) => b.cube(), (v) => v.cube()],
  ["fourth", (b) => b.fourth(), (v) => v.fourth()],
  ["absolute", (b) => b.absolute(), (v) => v.absolute()],
  ["conjugate", (b) => b.conjugate(), (v) => v.conjugate()],
];

const muestras: Array<[number, number]> = [
  [0, 0],
  [1, 2],
  [-3, 4],
  [0.5, -1.25],
  [-1, -1],
];

for (const [nombre, enSitio, inmutable] of operaciones) {
  test(`ComplexBuffer.${nombre} coincide con Complex`, () => {
    for (const [re, im] of muestras) {
      const buffer = new ComplexBuffer().set(re, im);
      enSitio(buffer);
      const esperado = inmutable(new Complex(re, im));
      assert.equal(buffer.re, esperado.re, `${nombre} re en (${re}, ${im})`);
      assert.equal(buffer.im, esperado.im, `${nombre} im en (${re}, ${im})`);
    }
  });
}

test("ComplexBuffer.add y magnitudeSquared coinciden con Complex", () => {
  const buffer = new ComplexBuffer().set(1, 2).add(new ComplexBuffer().set(-4, 3));
  const esperado = new Complex(1, 2).add(new Complex(-4, 3));
  assert.equal(buffer.re, esperado.re);
  assert.equal(buffer.im, esperado.im);
  assert.equal(buffer.magnitudeSquared(), esperado.magnitudeSquared());
});

const formas: Array<[string, Formula]> = [
  ["z^2", new Square()],
  ["z^3", new Cubic()],
  ["z^4", new Quartic()],
  ["|z|^2", new BurningShip()],
  ["conj(z^2)", new Tricorn()],
];

for (const [nombre, formula] of formas) {
  test(`escapeStepBuffers coincide con escapeStep para ${nombre}`, () => {
    const z = new ComplexBuffer();
    const c = new ComplexBuffer();
    for (let re = -1.5; re <= 1.5; re += 0.5) {
      for (let im = -1; im <= 1; im += 0.5) {
        const z0 = new Complex(0, 0);
        const cPoint = new Complex(re, im);
        const inmutable = formula.escapeStep(z0, cPoint, MAX_ITERATIONS, ESCAPE_RADIUS_SQUARED);
        z.set(z0.re, z0.im);
        c.set(cPoint.re, cPoint.im);
        const enSitio = formula.escapeStepBuffers(z, c, MAX_ITERATIONS, ESCAPE_RADIUS_SQUARED);
        assert.equal(enSitio, inmutable, `${nombre} en (${re}, ${im})`);
      }
    }
  });
}
