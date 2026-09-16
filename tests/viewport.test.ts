import { test } from "node:test";
import assert from "node:assert/strict";
import { Complex } from "../src/domain/Complex.ts";
import { Viewport } from "../src/domain/Viewport.ts";

const WIDTH = 800;
const HEIGHT = 600;

function close(a: number, b: number, epsilon = 1e-9): boolean {
  return Math.abs(a - b) < epsilon;
}

test("la transformada pantalla <-> complejo es reversible", () => {
  const viewport = Viewport.default();
  for (const [px, py] of [
    [0, 0],
    [123, 45],
    [799, 599],
    [400, 300],
  ]) {
    const point = viewport.toComplex(px, py, WIDTH, HEIGHT);
    const pixel = viewport.toPixel(point, WIDTH, HEIGHT);
    assert.ok(close(pixel.x, px), `x ${pixel.x} != ${px}`);
    assert.ok(close(pixel.y, py), `y ${pixel.y} != ${py}`);
  }
});

test("el zoom mantiene bajo el cursor el mismo punto complejo", () => {
  const viewport = Viewport.default();
  const px = 250;
  const py = 180;
  const before = viewport.toComplex(px, py, WIDTH, HEIGHT);
  viewport.zoomAt(4, px, py, WIDTH, HEIGHT);
  const after = viewport.toComplex(px, py, WIDTH, HEIGHT);
  assert.ok(close(after.re, before.re, 1e-12));
  assert.ok(close(after.im, before.im, 1e-12));
});

test("el desplazamiento no altera el factor de zoom", () => {
  const viewport = Viewport.default();
  viewport.zoomAt(8, 400, 300, WIDTH, HEIGHT);
  const factorBefore = viewport.zoomFactor();
  viewport.pan(37, -19, HEIGHT);
  assert.equal(viewport.zoomFactor(), factorBefore);
});

test("el desplazamiento mueve el centro en la direccion esperada", () => {
  const viewport = Viewport.default();
  const centerBefore = viewport.getCenter();
  viewport.pan(10, 0, HEIGHT);
  const centerAfter = viewport.getCenter();
  assert.ok(centerAfter.re < centerBefore.re);
});

test("el factor de zoom parte en 1 y crece al acercar", () => {
  const viewport = Viewport.default();
  assert.equal(viewport.zoomFactor(), 1);
  viewport.zoomAt(2, WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT);
  assert.ok(close(viewport.zoomFactor(), 2, 1e-12));
  viewport.zoomAt(3, WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT);
  assert.ok(close(viewport.zoomFactor(), 6, 1e-12));
});

test("reset vuelve a la vista inicial", () => {
  const viewport = Viewport.default();
  viewport.zoomAt(16, 100, 100, WIDTH, HEIGHT);
  viewport.pan(50, 50, HEIGHT);
  viewport.reset();
  assert.equal(viewport.zoomFactor(), 1);
  const center = viewport.getCenter();
  assert.ok(close(center.re, -0.5));
  assert.ok(close(center.im, 0));
});
