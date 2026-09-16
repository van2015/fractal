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
import { ProgressiveRenderer } from "../src/domain/ProgressiveRenderer.ts";

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

test("el render progresivo refina hasta completarse", () => {
  const renderer = new ProgressiveRenderer(new EscapeTimeGenerator(), scene(), WIDTH, HEIGHT, 4);
  assert.equal(renderer.map().step, 4);
  assert.equal(renderer.isComplete(), false);
  assert.equal(renderer.refine(), true);
  assert.equal(renderer.map().step, 2);
  assert.equal(renderer.refine(), true);
  assert.equal(renderer.map().step, 1);
  assert.equal(renderer.isComplete(), true);
  assert.equal(renderer.refine(), false);
});
