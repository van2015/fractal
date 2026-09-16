import { test } from "node:test";
import assert from "node:assert/strict";
import { Complex } from "../src/domain/Complex.ts";
import { ComplexBuffer } from "../src/domain/ComplexBuffer.ts";
import { Formula, INTERIOR_ZONE } from "../src/domain/Formula.ts";
import { Square } from "../src/domain/formulas/Square.ts";
import { Cubic } from "../src/domain/formulas/Cubic.ts";
import { Quartic } from "../src/domain/formulas/Quartic.ts";
import { BurningShip } from "../src/domain/formulas/BurningShip.ts";
import { Tricorn } from "../src/domain/formulas/Tricorn.ts";
import { MandelbrotMode, JuliaMode } from "../src/domain/FractalMode.ts";
import type { FractalMode } from "../src/domain/FractalMode.ts";
import { FormulaCatalog, DEFAULT_FORMULA_ID } from "../src/domain/FormulaCatalog.ts";

const MAX_ITERATIONS = 50;
const ESCAPE_RADIUS_SQUARED = 4;

class Doubling extends Formula {
  readonly label = "2z";

  applyInto(z: ComplexBuffer): void {
    z.re *= 2;
    z.im *= 2;
  }
}

test("la formula abstracta define step como f(z) + c", () => {
  const formula = new Doubling();
  const result = formula.step(new Complex(1, 1), new Complex(1, 0));
  assert.equal(result.re, 3);
  assert.equal(result.im, 2);
});

test("la formula abstracta detecta escape e interior", () => {
  const formula = new Doubling();
  assert.equal(formula.escapeStep(new Complex(0, 0), new Complex(10, 0), MAX_ITERATIONS, ESCAPE_RADIUS_SQUARED), 1);
  assert.equal(formula.escapeStep(new Complex(0, 0), new Complex(0, 0), MAX_ITERATIONS, ESCAPE_RADIUS_SQUARED), INTERIOR_ZONE);
});

test("la forma z^2 coincide con el cuadrado complejo", () => {
  const result = new Square().apply(new Complex(1, 2));
  assert.equal(result.re, -3);
  assert.equal(result.im, 4);
});

test("la forma z^3 coincide con el cubo complejo", () => {
  const result = new Cubic().apply(new Complex(1, 1));
  assert.equal(result.re, -2);
  assert.equal(result.im, 2);
});

test("la forma z^4 coincide con la cuarta potencia", () => {
  const result = new Quartic().apply(new Complex(1, 1));
  assert.equal(result.re, -4);
  assert.equal(result.im, 0);
});

test("la forma |z|^2 aplica valor absoluto a las partes", () => {
  const result = new BurningShip().apply(new Complex(-3, 4));
  assert.equal(result.re, -7);
  assert.equal(result.im, 24);
});

test("la forma conj(z^2) conjuga antes de elevar", () => {
  const result = new Tricorn().apply(new Complex(1, 2));
  assert.equal(result.re, -3);
  assert.equal(result.im, -4);
});

const formas: Array<[string, Formula]> = [
  ["z^2", new Square()],
  ["z^3", new Cubic()],
  ["z^4", new Quartic()],
  ["|z|^2", new BurningShip()],
  ["conj(z^2)", new Tricorn()],
];

for (const [nombre, formula] of formas) {
  test(`la forma ${nombre} tiene interior en c=0`, () => {
    const step = formula.escapeStep(new Complex(0, 0), new Complex(0, 0), MAX_ITERATIONS, ESCAPE_RADIUS_SQUARED);
    assert.equal(step, INTERIOR_ZONE);
  });

  test(`la forma ${nombre} tiene exterior en c=2`, () => {
    const step = formula.escapeStep(new Complex(0, 0), new Complex(2, 0), MAX_ITERATIONS, ESCAPE_RADIUS_SQUARED);
    assert.ok(step >= 0);
  });
}

test("Mandelbrot y Julia usan el mismo punto de forma distinta", () => {
  const formula = new Square();
  const point = new Complex(1, 0);
  const seed = new Complex(0, 0);

  const mandelbrot: FractalMode = new MandelbrotMode();
  const julia: FractalMode = new JuliaMode();

  const mandelbrotStep = formula.escapeStep(
    mandelbrot.initialZ(point),
    mandelbrot.cFor(point, seed),
    MAX_ITERATIONS,
    ESCAPE_RADIUS_SQUARED,
  );
  const juliaStep = formula.escapeStep(
    julia.initialZ(point),
    julia.cFor(point, seed),
    MAX_ITERATIONS,
    ESCAPE_RADIUS_SQUARED,
  );

  assert.equal(mandelbrotStep, 3);
  assert.equal(juliaStep, INTERIOR_ZONE);
});

test("el catalogo expone las cinco formas y la forma por defecto es z^2", () => {
  const catalog = new FormulaCatalog();
  assert.equal(catalog.ids().length, 5);
  assert.equal(catalog.get(DEFAULT_FORMULA_ID).label, "z^2");
});

test("el catalogo rechaza una forma desconocida", () => {
  const catalog = new FormulaCatalog();
  assert.throws(() => catalog.get("inexistente" as never));
});
