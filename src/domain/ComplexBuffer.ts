export class ComplexBuffer {
  re = 0;
  im = 0;

  set(re: number, im: number): this {
    this.re = re;
    this.im = im;
    return this;
  }

  setFrom(other: ComplexBuffer): this {
    this.re = other.re;
    this.im = other.im;
    return this;
  }

  square(): this {
    const re = this.re;
    const im = this.im;
    this.re = re * re - im * im;
    this.im = 2 * re * im;
    return this;
  }

  multiply(other: ComplexBuffer): this {
    const re = this.re;
    const im = this.im;
    this.re = re * other.re - im * other.im;
    this.im = re * other.im + im * other.re;
    return this;
  }

  cube(): this {
    const re = this.re;
    const im = this.im;
    const squareRe = re * re - im * im;
    const squareIm = 2 * re * im;
    this.re = squareRe * re - squareIm * im;
    this.im = squareRe * im + squareIm * re;
    return this;
  }

  fourth(): this {
    const re = this.re;
    const im = this.im;
    const squareRe = re * re - im * im;
    const squareIm = 2 * re * im;
    this.re = squareRe * squareRe - squareIm * squareIm;
    this.im = 2 * squareRe * squareIm;
    return this;
  }

  absolute(): this {
    this.re = Math.abs(this.re);
    this.im = Math.abs(this.im);
    return this;
  }

  conjugate(): this {
    this.im = -this.im;
    return this;
  }

  add(other: ComplexBuffer): this {
    this.re += other.re;
    this.im += other.im;
    return this;
  }

  magnitudeSquared(): number {
    return this.re * this.re + this.im * this.im;
  }
}
