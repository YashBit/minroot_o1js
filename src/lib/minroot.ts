import {
  Field,
  ZkProgram,
  Struct,
  Proof,
  verify,
  Provable,
} from 'o1js';

export function power(base: Field, exponent: Field): Field {
  let result = Field(1);
  let current = base;
  let exp = exponent;
  while (!exp.equals(Field(0))) {
    if (exp.isOdd()) {
      result = result.mul(current);
    }
    current = current.mul(current);
    exp = exp.div(Field(2));
  }
  return result;
}

/**
 * State for MinRoot VDF computation
 * Represents the current state of the VDF computation
 */
export class MinRootState extends Struct({
  x: Field,  // Current x value
  y: Field,  // Current y value
  step: Field, // Current step number
}) {
  static empty() {
    return new MinRootState({
      x: Field(0),
      y: Field(1), // We start with y=1 as per the reference implementation
      step: Field(0),
    });
  }
}