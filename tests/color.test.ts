import { test } from "node:test";
import assert from "node:assert/strict";
import { INTERIOR_ZONE } from "../src/domain/Formula.ts";
import { Rgb } from "../src/domain/Rgb.ts";
import { Palette } from "../src/domain/Palette.ts";
import { ColorChooser } from "../src/domain/ColorChooser.ts";

test("el interior y las bandas tienen colores por defecto distintos", () => {
  const palette = new Palette();
  assert.notEqual(
    palette.colorFor(INTERIOR_ZONE).toCss(),
    palette.colorFor(0).toCss(),
  );
});

test("una zona nueva recibe un color por defecto valido", () => {
  const palette = new Palette();
  const color = palette.colorFor(9999);
  assert.ok(color instanceof Rgb);
  assert.ok(color.r >= 0 && color.r <= 255);
});

test("pintar una zona guarda su color y borrar lo descarta", () => {
  const palette = new Palette();
  const rojo = new Rgb(255, 0, 0);
  const antes = palette.colorFor(3);
  palette.paint(3, rojo);
  assert.equal(palette.isPainted(3), true);
  assert.equal(palette.colorFor(3).toCss(), rojo.toCss());
  assert.notEqual(antes.toCss(), rojo.toCss());
  palette.clear();
  assert.equal(palette.isPainted(3), false);
  assert.equal(palette.colorFor(3).toCss(), antes.toCss());
});

test("el elegidor evita los colores ya usados entre las zonas visibles", () => {
  const palette = new Palette();
  const rojo = new Rgb(230, 60, 60);
  const azul = new Rgb(60, 170, 240);
  palette.paint(0, rojo);
  palette.paint(2, rojo);

  const chooser = new ColorChooser([rojo, azul]);
  const elegido = chooser.pick(1, palette, [0, 1, 2]);
  assert.equal(elegido.toCss(), azul.toCss());
});

test("el elegidor prefiere el color de mayor contraste con las vecinas", () => {
  const palette = new Palette();
  const rojo = new Rgb(230, 60, 60);
  const casiRojo = new Rgb(235, 60, 60);
  const azul = new Rgb(60, 170, 240);
  palette.paint(0, rojo);
  palette.paint(2, rojo);

  const chooser = new ColorChooser([rojo, casiRojo, azul]);
  const elegido = chooser.pick(1, palette, [0, 1, 2]);
  assert.equal(elegido.toCss(), azul.toCss());
});

test("el elegidor recurre a toda la paleta si no quedan colores libres", () => {
  const palette = new Palette();
  const candidatos = [new Rgb(1, 2, 3), new Rgb(4, 5, 6)];
  palette.paint(0, candidatos[0] as Rgb);
  palette.paint(2, candidatos[1] as Rgb);

  const chooser = new ColorChooser(candidatos);
  const elegido = chooser.pick(1, palette, [0, 1, 2]);
  assert.ok(candidatos.some((candidato) => candidato.equals(elegido)));
});

test("clicks repetidos sobre la misma zona devuelven colores distintos", () => {
  const palette = new Palette();
  const chooser = new ColorChooser(ColorChooser.defaultCandidates());
  const primero = chooser.pick(5, palette, []);
  const segundo = chooser.pick(5, palette, []);
  const tercero = chooser.pick(5, palette, []);
  assert.equal(new Set([primero.toCss(), segundo.toCss(), tercero.toCss()]).size, 3);
});
