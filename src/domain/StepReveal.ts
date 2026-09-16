import { INTERIOR_ZONE } from "./Formula.ts";

export class StepReveal {
  private depth = 0;
  private maxIterations: number;

  constructor(maxIterations: number) {
    this.maxIterations = maxIterations;
  }

  currentDepth(): number {
    return this.depth;
  }

  maximum(): number {
    return this.maxIterations;
  }

  setMaxIterations(maxIterations: number): void {
    this.maxIterations = maxIterations;
    if (this.depth > maxIterations) {
      this.depth = maxIterations;
    }
  }

  advance(): boolean {
    if (this.depth >= this.maxIterations) {
      return false;
    }
    this.depth += 1;
    return true;
  }

  reset(): void {
    this.depth = 0;
  }

  isComplete(): boolean {
    return this.depth >= this.maxIterations;
  }

  isRevealed(zone: number): boolean {
    if (zone === INTERIOR_ZONE) {
      return this.isComplete();
    }
    return zone <= this.depth;
  }
}
