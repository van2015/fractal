import { test } from "node:test";
import assert from "node:assert/strict";
import { Complex } from "../src/domain/Complex.ts";

test("suma dos complejos", () => {
  const result = new Complex(1, 2).add(new Complex(3, -5));
  assert.equal(result.re, 4);
  assert.equal(result.im, -3);
});

test("suma con negativos y cero", () => {
  const result = new Complex(-2, 0).add(new Complex(2, -7));
  assert.equal(result.re, 0);
  assert.equal(result.im, -7);
});

test("multiplica dos complejos", () => {
  const result = new Complex(1, 2).multiply(new Complex(3, 4));
  assert.equal(result.re, -5);
  assert.equal(result.im, 10);
});

test("multiplica con negativos", () => {
  const result = new Complex(-1, -1).multiply(new Complex(-1, 1));
  assert.equal(result.re, 2);
  assert.equal(result.im, 0);
});

test("modulo al cuadrado", () => {
  assert.equal(new Complex(3, 4).magnitudeSquared(), 25);
  assert.equal(new Complex(0, 0).magnitudeSquared(), 0);
  assert.equal(new Complex(-3, -4).magnitudeSquared(), 25);
});

test("conjugado", () => {
  const result = new Complex(2, -5).conjugate();
  assert.equal(result.re, 2);
  assert.equal(result.im, 5);
});

test("z al cuadrado", () => {
  const result = new Complex(1, 2).square();
  assert.equal(result.re, -3);
  assert.equal(result.im, 4);
});

test("z al cubo", () => {
  const result = new Complex(1, 1).cube();
  assert.equal(result.re, -2);
  assert.equal(result.im, 2);
});

test("z a la cuarta", () => {
  const result = new Complex(1, 1).fourth();
  assert.equal(result.re, -4);
  assert.equal(result.im, 0);
});

test("valor absoluto de las partes", () => {
  const result = new Complex(-3, 4).absolute();
  assert.equal(result.re, 3);
  assert.equal(result.im, 4);
});
