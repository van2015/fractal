export class Complex {
  readonly re: number;
  readonly im: number;

  constructor(re: number, im: number) {
    this.re = re;
    this.im = im;
  }

  add(other: Complex): Complex {
    return new Complex(this.re + other.re, this.im + other.im);
  }

  multiply(other: Complex): Complex {
    return new Complex(
      this.re * other.re - this.im * other.im,
      this.re * other.im + this.im * other.re,
    );
  }

  magnitudeSquared(): number {
    return this.re * this.re + this.im * this.im;
  }

  conjugate(): Complex {
    return new Complex(this.re, -this.im);
  }

  square(): Complex {
    return this.multiply(this);
  }

  cube(): Complex {
    return this.square().multiply(this);
  }

  fourth(): Complex {
    return this.square().square();
  }

  absolute(): Complex {
    return new Complex(Math.abs(this.re), Math.abs(this.im));
  }
}
