import { test } from "node:test";
import assert from "node:assert/strict";
import { ZoneMap } from "../src/domain/ZoneMap.ts";
import { Palette } from "../src/domain/Palette.ts";
import { Rasterizer } from "../src/domain/Rasterizer.ts";

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
