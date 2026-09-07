import { DESIGN_TOKENS } from '../designTokens';
import { collectLeaves } from '../pipeline/collectLeaves';

const leaves = collectLeaves(DESIGN_TOKENS);

describe('design token source', () => {
  it('marks exactly the leaves that resolve to numbers as unit number', () => {
    for (const leaf of leaves) {
      const parsesAsNumber =
        !Number.isNaN(Number(leaf.light)) && !Number.isNaN(Number(leaf.dark));
      expect(leaf.unit === 'number').toBe(parsesAsNumber);
    }
  });
});
