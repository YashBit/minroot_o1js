import {
  ZkProgram,
  Field,
  Group,
  Proof,
  Struct
} from 'o1js';
import {
  minRoot,
  minRootIteration,
  fieldModPow,
  calculateFifthRootExponent,
  createGroup
} from './lib/minroot';

class MinRootState extends Struct({
  x: Group,
  y: Group,
}) {}

const MinRootProgram = ZkProgram({
  name: 'minroot',
  publicInput: Group,
  publicOutput: MinRootState,
  methods: {
    init: {
      privateInputs: [Group],
      async method(publicInput: Group, y0: Group) {
        return {
          publicOutput: new MinRootState({
            x: publicInput,
            y: y0,
          }),
        };
      },
    },
    step: {
      privateInputs: [],
      async method(publicInput: Group) {
        const [nextX, nextY] = minRootIteration(publicInput, publicInput);
        return {
          publicOutput: new MinRootState({
            x: nextX,
            y: nextY,
          }),
        };
      },
    },
  },
});

const MinRootProof = ZkProgram.Proof(MinRootProgram);

export { MinRootProgram, MinRootProof, MinRootState };