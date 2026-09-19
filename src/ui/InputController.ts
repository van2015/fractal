export abstract class InputListener {
  abstract onZoom(factor: number, x: number, y: number): void;

  abstract onPan(dxPixels: number, dyPixels: number): void;

  abstract onClick(x: number, y: number): void;

  abstract onHover(x: number, y: number): void;

  abstract onLeave(): void;
}

const CLICK_THRESHOLD_PIXELS = 4;

function clampToRange(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export class InputController {
  private readonly canvas: HTMLCanvasElement;
  private readonly listener: InputListener;
  private imageWidth = 1;
  private imageHeight = 1;
  private pressed = false;
  private moved = false;
  private startClientX = 0;
  private startClientY = 0;
  private lastClientX = 0;
  private lastClientY = 0;
  private pointerLocked = false;

  constructor(canvas: HTMLCanvasElement, listener: InputListener) {
    this.canvas = canvas;
    this.listener = listener;
    this.attach();
    if (typeof document !== "undefined") {
      document.addEventListener("pointerlockchange", this.handlePointerLockChange);
      document.addEventListener("pointerlockerror", this.handlePointerLockError);
    }
  }

  setImageSize(width: number, height: number): void {
    this.imageWidth = width;
    this.imageHeight = height;
  }

  private attach(): void {
    this.canvas.addEventListener("wheel", this.handleWheel, { passive: false });
    this.canvas.addEventListener("pointerdown", this.handlePointerDown);
    this.canvas.addEventListener("pointermove", this.handlePointerMove);
    this.canvas.addEventListener("pointerup", this.handlePointerUp);
    this.canvas.addEventListener("pointerleave", this.handlePointerLeave);
  }

  private toImage(clientX: number, clientY: number): { x: number; y: number } {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * this.imageWidth,
      y: ((clientY - rect.top) / rect.height) * this.imageHeight,
    };
  }

  private handleWheel = (event: WheelEvent): void => {
    event.preventDefault();
    const point = this.toImage(event.clientX, event.clientY);
    const factor = event.deltaY < 0 ? 1.2 : 1 / 1.2;
    this.listener.onZoom(factor, point.x, point.y);
  };

  private handlePointerDown = (event: PointerEvent): void => {
    this.pressed = true;
    this.moved = false;
    this.startClientX = event.clientX;
    this.startClientY = event.clientY;
    this.lastClientX = event.clientX;
    this.lastClientY = event.clientY;
    this.canvas.setPointerCapture(event.pointerId);
  };

  private handlePointerMove = (event: PointerEvent): void => {
    const point = this.toImage(event.clientX, event.clientY);
    if (!this.pressed) {
      this.listener.onHover(point.x, point.y);
      return;
    }

    const travelled =
      Math.abs(event.clientX - this.startClientX) + Math.abs(event.clientY - this.startClientY);
    if (travelled > CLICK_THRESHOLD_PIXELS) {
      if (!this.moved) {
        this.lockPointer();
      }
      this.moved = true;
    }

    const rect = this.canvas.getBoundingClientRect();
    if (this.pointerLocked) {
      this.listener.onPan(
        (event.movementX / rect.width) * this.imageWidth,
        (event.movementY / rect.height) * this.imageHeight,
      );
      return;
    }

    const clientX = clampToRange(event.clientX, rect.left, rect.right);
    const clientY = clampToRange(event.clientY, rect.top, rect.bottom);
    const dx = ((clientX - this.lastClientX) / rect.width) * this.imageWidth;
    const dy = ((clientY - this.lastClientY) / rect.height) * this.imageHeight;
    this.lastClientX = clientX;
    this.lastClientY = clientY;
    this.listener.onPan(dx, dy);
  };

  private handlePointerUp = (event: PointerEvent): void => {
    if (this.pressed && !this.moved) {
      const point = this.toImage(event.clientX, event.clientY);
      this.listener.onClick(point.x, point.y);
    }
    this.pressed = false;
    this.releasePointer();
    if (this.canvas.hasPointerCapture(event.pointerId)) {
      this.canvas.releasePointerCapture(event.pointerId);
    }
  };

  private handlePointerLeave = (): void => {
    this.listener.onLeave();
  };

  private handlePointerLockChange = (): void => {
    this.pointerLocked =
      typeof document !== "undefined" && document.pointerLockElement === this.canvas;
    if (!this.pointerLocked && this.pressed) {
      this.pressed = false;
      this.moved = false;
    }
  };

  private handlePointerLockError = (): void => {
    this.pointerLocked = false;
  };

  private lockPointer(): void {
    try {
      const result = this.canvas.requestPointerLock() as unknown;
      if (result instanceof Promise) {
        result.catch(() => {});
      }
    } catch {
      this.pointerLocked = false;
    }
  }

  private releasePointer(): void {
    if (this.pointerLocked && typeof document !== "undefined") {
      document.exitPointerLock();
      this.pointerLocked = false;
    }
  }
}
