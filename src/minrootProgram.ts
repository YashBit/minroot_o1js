import {
  ZkProgram,
  Field,
  Group,
  Proof,
  Struct,
  SelfProof
} from 'o1js';
import { MinRootState, power } from './lib/minroot';


const MinRootProgram = ZkProgram({
  name: 'minroot',
  publicInput: MinRootState,
  publicOutput: MinRootState,
  methods: {
    init: {
      privateInputs: [],
      async method(publicInput: MinRootState) {
        // Verify initial state
        publicInput.x.assertEquals(Field(0));
        publicInput.y.assertEquals(Field(1));
        publicInput.step.assertEquals(Field(0));

        return { publicOutput: publicInput };
      },
    },
    step: {
      privateInputs: [SelfProof],
      
      async method(publicInput: MinRootState, previousProof: SelfProof<MinRootState, MinRootState>) {
        // Verify the previous proof
        previousProof.verify();

        // Verify we're continuing from the previous state
        previousProof.publicOutput.x.assertEquals(publicInput.x);
        previousProof.publicOutput.y.assertEquals(publicInput.y);
        previousProof.publicOutput.step.assertEquals(publicInput.step);

        // Calculate (x + y)^(1/5) mod p
        // In the field, this is equivalent to (x + y)^((p-3)/5) mod p
        // where p is the field characteristic
        const sum = publicInput.x.add(publicInput.y);
        
        // Compute the exponent (p-3)/5 using Field operations
        // This is a constant that we can precompute
        const exp = Field((1n << 254n) - 3n).div(Field(5n));
        
        // Calculate the fifth root
        const x_next = power(sum, exp);
        
        // Verify that x_next is indeed the fifth root
        // x_next^5 should equal x + y
        const x_next_squared = x_next.mul(x_next);
        const x_next_fourth = x_next_squared.mul(x_next_squared);
        const x_next_fifth = x_next_fourth.mul(x_next);
        x_next_fifth.assertEquals(sum);

        // Update state
        const newState = new MinRootState({
          x: x_next,
          y: publicInput.x, // y_next = x
          step: publicInput.step.add(1),
        });

        return { publicOutput: newState };
      },
    },
  },
});

const MinRootProof = ZkProgram.Proof(MinRootProgram);

export { MinRootProgram, MinRootProof };