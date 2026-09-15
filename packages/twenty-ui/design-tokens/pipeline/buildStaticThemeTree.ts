import { type CollectedTokenLeaf } from '../types/CollectedTokenLeaf';
import { buildLeafTree } from './buildLeafTree';
import { renderStaticTokenValue } from './renderStaticTokenValue';
import { serializeTree } from './serializeTree';

const SPACING_TOKEN_KEY = 'spacing';
const SPACING_BINDING = 'themeSpacing';

const collapseSpacingScale = (
  leaves: CollectedTokenLeaf[],
): CollectedTokenLeaf[] => {
  const firstSpacingIndex = leaves.findIndex(
    (leaf) => leaf.path[0] === SPACING_TOKEN_KEY,
  );
  if (firstSpacingIndex === -1) {
    throw new Error('Missing the spacing scale tokens.');
  }
  return leaves.flatMap((leaf, index) => {
    if (leaf.path[0] !== SPACING_TOKEN_KEY) {
      return [leaf];
    }
    return index === firstSpacingIndex
      ? [{ ...leaf, path: [SPACING_TOKEN_KEY] }]
      : [];
  });
};

export const buildStaticThemeTree = ({
  leaves,
  scheme,
}: {
  leaves: CollectedTokenLeaf[];
  scheme: 'light' | 'dark';
}): string =>
  serializeTree({
    node: buildLeafTree({
      leaves: collapseSpacingScale(leaves),
      leafValue: (leaf) =>
        leaf.path[0] === SPACING_TOKEN_KEY
          ? SPACING_BINDING
          : renderStaticTokenValue({ leaf, scheme }),
    }),
    separator: ',',
  });
