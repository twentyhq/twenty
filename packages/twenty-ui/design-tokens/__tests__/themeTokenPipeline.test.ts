import { DESIGN_TOKENS } from '../designTokens';
import { collectLeaves } from '../pipeline/collectLeaves';
import { SQUIRCLE_DOUBLED_RADIUS_TOKENS } from '../squircleDoubledRadiusTokens';

const leaves = collectLeaves(DESIGN_TOKENS);

// Drift between the design tokens and the committed artifacts is caught by the
// generate:check target, which reruns the generators and diffs. What cannot be
// caught that way are invariants of the hand-authored token source itself.
describe('design token source', () => {
  it('marks exactly the leaves that resolve to numbers as unit number', () => {
    for (const leaf of leaves) {
      const parsesAsNumber =
        !Number.isNaN(Number(leaf.light)) && !Number.isNaN(Number(leaf.dark));
      expect(leaf.unit === 'number').toBe(parsesAsNumber);
    }
  });

  it('never doubles the radii of elements that keep round corners', () => {
    const roundRadiusTokens: readonly string[] = [
      'pill',
      'rounded',
      'smRound',
      'mdRound',
    ];
    expect(
      SQUIRCLE_DOUBLED_RADIUS_TOKENS.filter((radiusToken) =>
        roundRadiusTokens.includes(radiusToken),
      ),
    ).toEqual([]);
  });
});
