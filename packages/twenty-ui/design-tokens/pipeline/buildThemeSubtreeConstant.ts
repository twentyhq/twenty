import { type CollectedTokenLeaf } from '../types/CollectedTokenLeaf';
import { buildLeafTree } from './buildLeafTree';
import { GENERATED_TYPESCRIPT_HEADER } from './generatedTypeScriptHeader';
import { renderStaticTokenValue } from './renderStaticTokenValue';
import { serializeTree } from './serializeTree';

// Bundlers cannot drop unused properties of a referenced object literal, so
// slicing these out of THEME_LIGHT would retain all 994 tokens.
export const buildThemeSubtreeConstant = ({
  leaves,
  rootKey,
  scheme,
  exportName,
}: {
  leaves: CollectedTokenLeaf[];
  rootKey: string;
  scheme: 'light' | 'dark';
  exportName: string;
}): string => {
  const subtreeLeaves = leaves.filter((leaf) => leaf.path[0] === rootKey);
  if (subtreeLeaves.length === 0) {
    throw new Error(`Missing the "${rootKey}" tokens.`);
  }
  const tree = buildLeafTree({
    leaves: subtreeLeaves.map((leaf) => ({
      ...leaf,
      path: leaf.path.slice(1),
    })),
    leafValue: (leaf) => renderStaticTokenValue({ leaf, scheme }),
  });
  return `${GENERATED_TYPESCRIPT_HEADER}
export const ${exportName} = ${serializeTree({ node: tree, separator: ',' })};
`;
};
