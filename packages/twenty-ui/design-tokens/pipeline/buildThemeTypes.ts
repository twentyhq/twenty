import { type CollectedTokenLeaf } from '../types/CollectedTokenLeaf';
import { buildLeafTree } from './buildLeafTree';
import { serializeTree } from './serializeTree';

const GENERATED_HEADER = `// Generated from design-tokens by scripts/generateThemeTokens.ts.
// Do not edit manually. Regenerate with: npx nx generateTokens twenty-ui.`;

export const buildThemeTypes = (leaves: CollectedTokenLeaf[]): string => {
  const tree = buildLeafTree(leaves, (leaf) =>
    leaf.unit === 'number' ? 'number' : 'string',
  );
  return `${GENERATED_HEADER}
export type ThemeType = ${serializeTree(tree, 2, ';')};
`;
};
