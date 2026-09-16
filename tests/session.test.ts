import { test } from "node:test";
import assert from "node:assert/strict";
import { Complex } from "../src/domain/Complex.ts";
import { JuliaSeed } from "../src/domain/JuliaSeed.ts";
import { FractalSession } from "../src/domain/FractalSession.ts";
import { UNCOMPUTED_ZONE } from "../src/domain/ZoneMap.ts";

const WIDTH = 40;
const HEIGHT = 30;

test("la semilla Julia mapea posicion y semilla de ida y vuelta", () => {
  const map = new JuliaSeed();
  for (const [nx, ny] of [
    [0, 0],
    [0.5, 0.5],
    [1, 1],
    [0.25, 0.75],
  ]) {
    const seed = map.seedAt(nx as number, ny as number);
    const back = map.normalized(seed);
    assert.ok(Math.abs(back.nx - (nx as number)) < 1e-12);
    assert.ok(Math.abs(back.ny - (ny as number)) < 1e-12);
  }
});

test("la sesion arranca en Mandelbrot con z^2", () => {
  const session = new FractalSession();
  assert.equal(session.isJulia(), false);
  assert.equal(session.formula().label, "z^2");
  assert.equal(session.zoomFactor(), 1);
});

test("pintar cambia la paleta sin recalcular el mapa", () => {
  const session = new FractalSession();
  const map = session.render(WIDTH, HEIGHT, 1);
  const dataBefore = [...map.data];
  const color = session.paintAt(0, 0);
  assert.ok(color);
  const zone = map.zoneAt(0, 0);
  assert.equal(session.paletteRef().isPainted(zone), true);
  assert.deepEqual([...session.currentZoneMap()!.data], dataBefore);
});

test("los colores persisten al cambiar de formula", () => {
  const session = new FractalSession();
  const map = session.render(WIDTH, HEIGHT, 1);
  session.paintAt(0, 0);
  const zone = map.zoneAt(0, 0);
  const colorBefore = session.paletteRef().colorFor(zone).toCss();
  session.setFormula("cubic");
  assert.equal(session.formula().label, "z^3");
  assert.equal(session.paletteRef().isPainted(zone), true);
  assert.equal(session.paletteRef().colorFor(zone).toCss(), colorBefore);
});

test("borrar colores descarta los overrides", () => {
  const session = new FractalSession();
  const map = session.render(WIDTH, HEIGHT, 1);
  session.paintAt(0, 0);
  const zone = map.zoneAt(0, 0);
  session.clearColors();
  assert.equal(session.paletteRef().isPainted(zone), false);
});

test("bucear a Julia cambia de modo, fija la semilla y usa la vista Julia", () => {
  const session = new FractalSession();
  const point = new Complex(-0.8, 0.156);
  session.diveToJulia(point);
  assert.equal(session.isJulia(), true);
  assert.equal(session.seedValue().re, -0.8);
  assert.equal(session.seedValue().im, 0.156);
  assert.equal(session.zoomFactor(), 1);
  const center = session.viewport().getCenter();
  assert.equal(center.re, 0);
  assert.equal(center.im, 0);
});

test("el mapa de Julia difiere del de Mandelbrot para el mismo punto", () => {
  const session = new FractalSession();
  const mandelbrot = [...session.render(WIDTH, HEIGHT, 1).data];
  session.diveToJulia(new Complex(-0.8, 0.156));
  const julia = [...session.render(WIDTH, HEIGHT, 1).data];
  assert.notDeepEqual(mandelbrot, julia);
});

test("volver al Mandelbrot conserva su vista", () => {
  const session = new FractalSession();
  session.zoomAt(4, WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT);
  const factor = session.zoomFactor();
  session.diveToJulia(new Complex(-0.4, 0.6));
  session.backToMandelbrot();
  assert.equal(session.isJulia(), false);
  assert.equal(session.zoomFactor(), factor);
});

test("las zonas visibles excluyen los pixeles sin calcular", () => {
  const session = new FractalSession();
  const map = session.render(WIDTH, HEIGHT, 4);
  assert.equal(session.visibleZones(map).includes(UNCOMPUTED_ZONE), false);
});

test("activar la seccion de paso a paso entra en profundidad 0", () => {
  const session = new FractalSession();
  assert.equal(session.isStepMode(), false);
  session.enterStepMode();
  assert.equal(session.isStepMode(), true);
  assert.equal(session.revealState()!.currentDepth(), 0);
});

test("nextStep avanza y resetSteps reinicia", () => {
  const session = new FractalSession();
  session.enterStepMode();
  session.nextStep();
  session.nextStep();
  assert.equal(session.revealState()!.currentDepth(), 2);
  session.resetSteps();
  assert.equal(session.revealState()!.currentDepth(), 0);
});

test("salir de la seccion descarta el revelado", () => {
  const session = new FractalSession();
  session.enterStepMode();
  session.exitStepMode();
  assert.equal(session.isStepMode(), false);
  assert.equal(session.revealState(), null);
});

test("la profundidad se conserva al cambiar de formula", () => {
  const session = new FractalSession();
  session.enterStepMode();
  session.nextStep();
  session.nextStep();
  session.nextStep();
  session.setFormula("cubic");
  session.scene(WIDTH, HEIGHT);
  assert.equal(session.revealState()!.currentDepth(), 3);
});

test("la profundidad se recorta si el maximo baja al alejar el zoom", () => {
  const session = new FractalSession();
  session.zoomAt(2 ** 20, WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT);
  session.enterStepMode();
  assert.equal(session.revealState()!.maximum(), 1100);
  for (let i = 0; i < 600; i += 1) {
    session.nextStep();
  }
  assert.equal(session.revealState()!.currentDepth(), 600);
  session.resetView();
  session.scene(WIDTH, HEIGHT);
  assert.equal(session.revealState()!.maximum(), 100);
  assert.equal(session.revealState()!.currentDepth(), 100);
});
