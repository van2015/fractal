import { test } from "node:test";
import assert from "node:assert/strict";
import { INTERIOR_ZONE } from "../src/domain/Formula.ts";
import { StepReveal } from "../src/domain/StepReveal.ts";

test("la profundidad empieza en 0", () => {
  const reveal = new StepReveal(50);
  assert.equal(reveal.currentDepth(), 0);
  assert.equal(reveal.isComplete(), false);
});

test("advance sube de a uno y no pasa del maximo", () => {
  const reveal = new StepReveal(3);
  assert.equal(reveal.advance(), true);
  assert.equal(reveal.currentDepth(), 1);
  assert.equal(reveal.advance(), true);
  assert.equal(reveal.advance(), true);
  assert.equal(reveal.currentDepth(), 3);
  assert.equal(reveal.isComplete(), true);
  assert.equal(reveal.advance(), false);
  assert.equal(reveal.currentDepth(), 3);
});

test("reset vuelve a 0", () => {
  const reveal = new StepReveal(10);
  reveal.advance();
  reveal.advance();
  reveal.reset();
  assert.equal(reveal.currentDepth(), 0);
});

test("una zona exterior se revela cuando la profundidad alcanza su paso", () => {
  const reveal = new StepReveal(10);
  assert.equal(reveal.isRevealed(0), true);
  assert.equal(reveal.isRevealed(1), false);
  reveal.advance();
  assert.equal(reveal.isRevealed(1), true);
  assert.equal(reveal.isRevealed(2), false);
});

test("el interior solo se revela al completar", () => {
  const reveal = new StepReveal(2);
  assert.equal(reveal.isRevealed(INTERIOR_ZONE), false);
  reveal.advance();
  assert.equal(reveal.isRevealed(INTERIOR_ZONE), false);
  reveal.advance();
  assert.equal(reveal.isComplete(), true);
  assert.equal(reveal.isRevealed(INTERIOR_ZONE), true);
});

test("setMaxIterations recorta la profundidad si baja el maximo", () => {
  const reveal = new StepReveal(100);
  for (let i = 0; i < 40; i += 1) {
    reveal.advance();
  }
  reveal.setMaxIterations(20);
  assert.equal(reveal.currentDepth(), 20);
  assert.equal(reveal.maximum(), 20);
});

test("setMaxIterations no sube la profundidad si sube el maximo", () => {
  const reveal = new StepReveal(10);
  reveal.advance();
  reveal.setMaxIterations(500);
  assert.equal(reveal.currentDepth(), 1);
});
