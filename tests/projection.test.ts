import { test } from "node:test";
import assert from "node:assert/strict";
import { Complex } from "../src/domain/Complex.ts";
import { ComplexBuffer } from "../src/domain/ComplexBuffer.ts";
import { Viewport } from "../src/domain/Viewport.ts";
import { Projection } from "../src/domain/Projection.ts";
import { MandelbrotMode, JuliaMode } from "../src/domain/FractalMode.ts";
import type { FractalMode } from "../src/domain/FractalMode.ts";

const WIDTH = 800;
const HEIGHT = 600;

test("la proyeccion coincide con Viewport.toComplex", () => {
  const viewport = Viewport.default();
  const projection = Projection.fromViewport(viewport, WIDTH, HEIGHT);
  for (const [x, y] of [
    [0, 0],
    [123, 45],
    [799, 599],
    [400, 300],
  ]) {
    const point = viewport.toComplex(x as number, y as number, WIDTH, HEIGHT);
    assert.ok(Math.abs(projection.reAt(x as number) - point.re) < 1e-12);
    assert.ok(Math.abs(projection.imAt(y as number) - point.im) < 1e-12);
  }
});

test("Mandelbrot prepara z0 en el origen y c en el punto", () => {
  const z0 = new ComplexBuffer();
  const c = new ComplexBuffer();
  const mode: FractalMode = new MandelbrotMode();
  mode.prepare(z0, c, 0.3, 0.5, new Complex(0, 0));
  assert.equal(z0.re, 0);
  assert.equal(z0.im, 0);
  assert.equal(c.re, 0.3);
  assert.equal(c.im, 0.5);
});

test("Julia prepara z0 en el punto y c en la semilla", () => {
  const z0 = new ComplexBuffer();
  const c = new ComplexBuffer();
  const mode: FractalMode = new JuliaMode();
  mode.prepare(z0, c, 0.3, 0.5, new Complex(-0.8, 0.156));
  assert.equal(z0.re, 0.3);
  assert.equal(z0.im, 0.5);
  assert.equal(c.re, -0.8);
  assert.equal(c.im, 0.156);
});
