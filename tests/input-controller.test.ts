import { test } from "node:test";
import assert from "node:assert/strict";
import { InputController, InputListener } from "../src/ui/InputController.ts";

const WIDTH = 800;
const HEIGHT = 600;

type FakeHandler = (event: Record<string, unknown>) => void;

class FakeDocument {
  pointerLockElement: unknown = null;
  private readonly handlers = new Map<string, () => void>();

  addEventListener(type: string, handler: () => void): void {
    this.handlers.set(type, handler);
  }

  exitPointerLock(): void {
    this.pointerLockElement = null;
    this.handlers.get("pointerlockchange")?.();
  }

  lock(element: unknown): void {
    this.pointerLockElement = element;
    this.handlers.get("pointerlockchange")?.();
  }
}

class FakeCanvas {
  private readonly handlers = new Map<string, FakeHandler>();

  addEventListener(type: string, handler: FakeHandler): void {
    this.handlers.set(type, handler);
  }

  getBoundingClientRect(): DOMRect {
    return {
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: WIDTH,
      bottom: HEIGHT,
      width: WIDTH,
      height: HEIGHT,
      toJSON: () => ({}),
    } as DOMRect;
  }

  requestPointerLock(): void {}

  setPointerCapture(): void {}

  hasPointerCapture(): boolean {
    return false;
  }

  releasePointerCapture(): void {}

  dispatch(type: string, event: Record<string, unknown>): void {
    this.handlers.get(type)?.(event);
  }
}

class RecordingListener extends InputListener {
  readonly pans: Array<{ dx: number; dy: number }> = [];

  onZoom(): void {}

  onPan(dx: number, dy: number): void {
    this.pans.push({ dx, dy });
  }

  onClick(): void {}

  onHover(): void {}

  onLeave(): void {}
}

function setup(): { canvas: FakeCanvas; listener: RecordingListener; doc: FakeDocument } {
  const doc = new FakeDocument();
  (globalThis as { document?: unknown }).document = doc;
  const canvas = new FakeCanvas();
  const listener = new RecordingListener();
  const controller = new InputController(canvas as unknown as HTMLCanvasElement, listener);
  controller.setImageSize(WIDTH, HEIGHT);
  canvas.dispatch("pointerdown", { clientX: 400, clientY: 300, pointerId: 1 });
  return { canvas, listener, doc };
}

test("el pan dentro del canvas no se altera", () => {
  const { canvas, listener } = setup();
  canvas.dispatch("pointermove", { clientX: 500, clientY: 340, pointerId: 1 });
  assert.deepEqual(listener.pans, [{ dx: 100, dy: 40 }]);
});

test("el pan se detiene en el borde derecho", () => {
  const { canvas, listener } = setup();
  canvas.dispatch("pointermove", { clientX: 2000, clientY: 300, pointerId: 1 });
  assert.deepEqual(listener.pans, [{ dx: 400, dy: 0 }]);
  canvas.dispatch("pointermove", { clientX: 3000, clientY: 300, pointerId: 1 });
  assert.deepEqual(listener.pans.at(-1), { dx: 0, dy: 0 });
});

test("el pan se detiene en el borde izquierdo", () => {
  const { canvas, listener } = setup();
  canvas.dispatch("pointermove", { clientX: -500, clientY: 300, pointerId: 1 });
  assert.deepEqual(listener.pans, [{ dx: -400, dy: 0 }]);
  canvas.dispatch("pointermove", { clientX: -900, clientY: 300, pointerId: 1 });
  assert.deepEqual(listener.pans.at(-1), { dx: 0, dy: 0 });
});

test("el pan se detiene en los bordes superior e inferior", () => {
  const { canvas, listener } = setup();
  canvas.dispatch("pointermove", { clientX: 400, clientY: 2000, pointerId: 1 });
  assert.deepEqual(listener.pans, [{ dx: 0, dy: 300 }]);
  canvas.dispatch("pointermove", { clientX: 400, clientY: -2000, pointerId: 1 });
  assert.deepEqual(listener.pans.at(-1), { dx: 0, dy: -600 });
});

test("el pan se reanuda al volver dentro del canvas", () => {
  const { canvas, listener } = setup();
  canvas.dispatch("pointermove", { clientX: 2000, clientY: 300, pointerId: 1 });
  canvas.dispatch("pointermove", { clientX: 600, clientY: 300, pointerId: 1 });
  assert.deepEqual(listener.pans.at(-1), { dx: -200, dy: 0 });
});

test("un click sin arrastre no bloquea el puntero", () => {
  const { canvas, doc } = setup();
  canvas.dispatch("pointermove", { clientX: 401, clientY: 300, pointerId: 1 });
  assert.equal(doc.pointerLockElement, null);
});

test("al arrastrar se bloquea el puntero y se usa el movimiento relativo", () => {
  const { canvas, listener, doc } = setup();
  canvas.dispatch("pointermove", { clientX: 500, clientY: 300, pointerId: 1, movementX: 100 });
  doc.lock(canvas);
  canvas.dispatch("pointermove", {
    clientX: 500,
    clientY: 300,
    pointerId: 1,
    movementX: 30,
    movementY: 15,
  });
  assert.deepEqual(listener.pans.at(-1), { dx: 30, dy: 15 });
});

test("al soltar el boton se libera el bloqueo del puntero", () => {
  const { canvas, doc } = setup();
  canvas.dispatch("pointermove", { clientX: 500, clientY: 300, pointerId: 1 });
  doc.lock(canvas);
  canvas.dispatch("pointerup", { clientX: 500, clientY: 300, pointerId: 1 });
  assert.equal(doc.pointerLockElement, null);
});

test("salir del bloqueo a mitad de arrastre detiene el pan", () => {
  const { canvas, listener, doc } = setup();
  canvas.dispatch("pointermove", { clientX: 500, clientY: 300, pointerId: 1 });
  doc.lock(canvas);
  doc.exitPointerLock();
  canvas.dispatch("pointermove", { clientX: 700, clientY: 300, pointerId: 1, movementX: 50 });
  assert.equal(listener.pans.length, 1);
});
