import { Field, Group } from 'o1js';

function mod(x: Group, p: Field): Group {
  // For elliptic curve groups, mod isn't needed as operations are already in the field
  return x;
}

function power(a: Group, n: Field, p: Field): Group {
  return a.scale(n);
}

function fieldModPow(base: Group, exponent: Field): Group {
  return base.scale(exponent);
}

function calculateFifthRootExponent(): Field {
  const p = Field.ORDER;
  const five = Field(5);
  const two = Field(2);
  const three = Field(3);
  const fiveGroup = Group.generator.scale(five);
  const pMinusTwo = Field(p - 2n);
  const pMinusThree = Field(p - 3n);
  const fiveInv = fiveGroup.scale(pMinusTwo);
  return Field(fiveInv.x).mul(pMinusThree);
}

function minRootIteration(x: Group, y: Group): [Group, Group] {
  const fifthRootExponent = calculateFifthRootExponent();
  const sum = x.add(y); 
  const xNext = fieldModPow(sum, fifthRootExponent);
  const yNext = x;
  return [xNext, yNext];
}

function minRoot(numIterations: number, x0: Group, y0: Group): [Group, Group] {
  let x = x0;
  let y = y0;
  for (let i = 0; i < numIterations; i++) {
    [x, y] = minRootIteration(x, y);
  }
  return [x, y];
}

// Helper function to create a Group from a Field
function createGroup(field: Field): Group {
  return new Group({
    x: field,
    y: Group.generator.y 
  });
}

export { minRoot, minRootIteration, fieldModPow, calculateFifthRootExponent, createGroup };