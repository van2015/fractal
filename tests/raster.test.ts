import { test } from "node:test";
import assert from "node:assert/strict";
import { ZoneMap } from "../src/domain/ZoneMap.ts";
import { Palette } from "../src/domain/Palette.ts";
import { Rasterizer, NEUTRAL_COLOR } from "../src/domain/Rasterizer.ts";
import { StepReveal } from "../src/domain/StepReveal.ts";
import { INTERIOR_ZONE } from "../src/domain/Formula.ts";

const WIDTH = 16;
const HEIGHT = 12;

function buildMap(step: number): ZoneMap {
  const map = new ZoneMap(WIDTH, HEIGHT, step);
  for (let y = 0; y < HEIGHT; y += step) {
    for (let x = 0; x < WIDTH; x += step) {
      map.setZone(x, y, ((x * 7 + y * 13) % 11) - 3);
    }
  }
  return map;
}

for (const step of [1, 2, 4]) {
  test(`el render por bloques coincide con el pixel a pixel (step ${step})`, () => {
    const map = buildMap(step);
    const palette = new Palette();
    const target = new Uint8ClampedArray(WIDTH * HEIGHT * 4);
    Rasterizer.composeInto(map, palette, target);

    for (let y = 0; y < HEIGHT; y += 1) {
      for (let x = 0; x < WIDTH; x += 1) {
        const color = palette.colorFor(map.zoneAt(x, y));
        const index = (y * WIDTH + x) * 4;
        assert.equal(target[index], color.r, `r en (${x}, ${y})`);
        assert.equal(target[index + 1], color.g, `g en (${x}, ${y})`);
        assert.equal(target[index + 2], color.b, `b en (${x}, ${y})`);
        assert.equal(target[index + 3], 255, `a en (${x}, ${y})`);
      }
    }
  });
}

test("componer por filas coincide con componer todo", () => {
  const map = buildMap(1);
  const palette = new Palette();
  const full = new Uint8ClampedArray(WIDTH * HEIGHT * 4);
  Rasterizer.composeInto(map, palette, full);

  const partial = new Uint8ClampedArray(WIDTH * HEIGHT * 4);
  Rasterizer.composeInto(map, palette, partial, 0, 5);
  Rasterizer.composeInto(map, palette, partial, 5, HEIGHT);
  assert.deepEqual([...partial], [...full]);
});

test("copyUpsampledFrom prellena el mapa fino con los valores del grueso", () => {
  const coarse = buildMap(4);
  const fine = new ZoneMap(WIDTH, HEIGHT, 1);
  fine.copyUpsampledFrom(coarse);
  for (let y = 0; y < HEIGHT; y += 1) {
    for (let x = 0; x < WIDTH; x += 1) {
      assert.equal(fine.data[fine.index(x, y)], coarse.zoneAt(x, y), `(${x}, ${y})`);
    }
  }
});

function revealMap(): ZoneMap {
  const map = new ZoneMap(4, 1, 1);
  map.setZone(0, 0, 0);
  map.setZone(1, 0, 1);
  map.setZone(2, 0, 2);
  map.setZone(3, 0, INTERIOR_ZONE);
  return map;
}

function pixelColor(target: Uint8ClampedArray, x: number): string {
  const index = x * 4;
  return `rgb(${target[index]}, ${target[index + 1]}, ${target[index + 2]})`;
}

test("las zonas no reveladas usan el color neutro y las reveladas su color de paleta", () => {
  const map = revealMap();
  const palette = new Palette();
  const reveal = new StepReveal(2);
  const target = new Uint8ClampedArray(4 * 4);
  Rasterizer.composeInto(map, palette, target, 0, 1, reveal);

  assert.equal(pixelColor(target, 0), palette.colorFor(0).toCss());
  assert.equal(pixelColor(target, 1), NEUTRAL_COLOR.toCss());
  assert.equal(pixelColor(target, 2), NEUTRAL_COLOR.toCss());
  assert.equal(pixelColor(target, 3), NEUTRAL_COLOR.toCss());
});

test("el interior se revela solo al completar", () => {
  const map = revealMap();
  const palette = new Palette();
  const reveal = new StepReveal(2);
  const target = new Uint8ClampedArray(4 * 4);

  reveal.advance();
  reveal.advance();
  Rasterizer.composeInto(map, palette, target, 0, 1, reveal);

  assert.equal(pixelColor(target, 0), palette.colorFor(0).toCss());
  assert.equal(pixelColor(target, 1), palette.colorFor(1).toCss());
  assert.equal(pixelColor(target, 2), palette.colorFor(2).toCss());
  assert.equal(pixelColor(target, 3), palette.colorFor(INTERIOR_ZONE).toCss());
});

test("sin revelado la composicion no cambia", () => {
  const map = revealMap();
  const palette = new Palette();
  const target = new Uint8ClampedArray(4 * 4);
  Rasterizer.composeInto(map, palette, target, 0, 1);
  assert.equal(pixelColor(target, 0), palette.colorFor(0).toCss());
  assert.equal(pixelColor(target, 3), palette.colorFor(INTERIOR_ZONE).toCss());
});
