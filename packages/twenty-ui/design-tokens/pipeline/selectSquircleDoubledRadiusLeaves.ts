import { ROUND_RADIUS_TOKENS } from '../roundRadiusTokens';
import { type CollectedTokenLeaf } from '../types/CollectedTokenLeaf';

const isRadiusLeaf = (leaf: CollectedTokenLeaf): boolean =>
  leaf.path.length === 3 &&
  leaf.path[0] === 'border' &&
  leaf.path[1] === 'radius';

export const selectSquircleDoubledRadiusLeaves = (
  leaves: CollectedTokenLeaf[],
): CollectedTokenLeaf[] => {
  const radiusLeaves = leaves.filter(isRadiusLeaf);
  const missingRoundRadiusToken = ROUND_RADIUS_TOKENS.find(
    (roundRadiusToken) =>
      !radiusLeaves.some((leaf) => leaf.path[2] === roundRadiusToken),
  );
  if (missingRoundRadiusToken !== undefined) {
    throw new Error(
      `Missing round radius token "${missingRoundRadiusToken}" for the squircle block.`,
    );
  }
  const doubledRadiusLeaves = radiusLeaves.filter(
    (leaf) => !ROUND_RADIUS_TOKENS.includes(leaf.path[2]),
  );
  if (doubledRadiusLeaves.length === 0) {
    throw new Error('Missing the border radius tokens for the squircle block.');
  }
  return doubledRadiusLeaves;
};
