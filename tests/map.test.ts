import { test } from "node:test";
import assert from "node:assert/strict";
import { Complex } from "../src/domain/Complex.ts";
import { INTERIOR_ZONE } from "../src/domain/Formula.ts";
import { Square } from "../src/domain/formulas/Square.ts";
import { MandelbrotMode } from "../src/domain/FractalMode.ts";
import { Viewport } from "../src/domain/Viewport.ts";
import { FractalScene } from "../src/domain/FractalScene.ts";
import { EscapeTimeGenerator } from "../src/domain/EscapeTimeGenerator.ts";
import { UNCOMPUTED_ZONE } from "../src/domain/ZoneMap.ts";
import { IterationSchedule } from "../src/domain/IterationSchedule.ts";
import { ZoneMap } from "../src/domain/ZoneMap.ts";

const WIDTH = 40;
const HEIGHT = 30;

function scene(maxIterations = 50): FractalScene {
  return new FractalScene(
    new Square(),
    new MandelbrotMode(),
    new Complex(0, 0),
    maxIterations,
    4,
    Viewport.default(),
  );
}

test("el generador marca interior y exterior", () => {
  const generator = new EscapeTimeGenerator();
  const map = generator.generate(scene(), WIDTH, HEIGHT, 1);
  const values = [...map.data];
  assert.ok(values.includes(INTERIOR_ZONE));
  assert.ok(values.some((value) => value >= 0));
});

test("el generador deja sin calcular los pixeles fuera de la grilla", () => {
  const generator = new EscapeTimeGenerator();
  const map = generator.generate(scene(), WIDTH, HEIGHT, 4);
  assert.equal(map.data[map.index(1, 0)], UNCOMPUTED_ZONE);
  assert.equal(map.zoneAt(1, 0), map.zoneAt(0, 0));
});

test("el maximo de iteraciones crece con el zoom", () => {
  const schedule = new IterationSchedule();
  assert.ok(schedule.maxIterations(1024) > schedule.maxIterations(1));
  assert.equal(schedule.maxIterations(1), 100);
});

test("el render progresivo es coherente con el completo", () => {
  const generator = new EscapeTimeGenerator();
  const coarse = generator.generate(scene(), WIDTH, HEIGHT, 4);
  const full = generator.generate(scene(), WIDTH, HEIGHT, 1);
  for (let y = 0; y < HEIGHT; y += 4) {
    for (let x = 0; x < WIDTH; x += 4) {
      assert.equal(coarse.data[coarse.index(x, y)], full.data[full.index(x, y)]);
    }
  }
});

test("generar por filas produce el mismo mapa que generate", () => {
  const generator = new EscapeTimeGenerator();
  for (const step of [1, 2, 4]) {
    const reference = generator.generate(scene(), WIDTH, HEIGHT, step);
    const chunked = new ZoneMap(WIDTH, HEIGHT, step);
    for (let y = 0; y < HEIGHT; y += 7) {
      generator.generateRows(scene(), WIDTH, HEIGHT, y, y + 7, step, chunked);
    }
    assert.deepEqual([...chunked.data], [...reference.data], `step ${step}`);
  }
});

test("el mapa escalar es identico al calculado con Complex", () => {
  const generator = new EscapeTimeGenerator();
  const viewport = Viewport.default();
  const reference = new FractalScene(
    new Square(),
    new MandelbrotMode(),
    new Complex(0, 0),
    50,
    4,
    viewport,
  );
  const map = generator.generate(reference, WIDTH, HEIGHT, 1);
  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      const point = viewport.toComplex(x, y, WIDTH, HEIGHT);
      assert.equal(map.data[map.index(x, y)], reference.zoneAt(point), `pixel (${x}, ${y})`);
    }
  }
});
