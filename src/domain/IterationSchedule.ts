export class IterationSchedule {
  private readonly base: number;
  private readonly growth: number;

  constructor(base = 100, growth = 50) {
    this.base = base;
    this.growth = growth;
  }

  maxIterations(zoomFactor: number): number {
    const zoom = Math.max(1, zoomFactor);
    return Math.round(this.base + this.growth * Math.log2(zoom));
  }
}
