import { type CollectedTokenLeaf } from '../types/CollectedTokenLeaf';
import { buildLeafTree } from './buildLeafTree';
import { quoteSingle } from './quoteSingle';
import { serializeTree } from './serializeTree';

const GENERATED_HEADER = `// Generated from design-tokens by scripts/generateThemeTokens.ts.
// Do not edit manually. Regenerate with: npx nx generateTokens twenty-ui.`;

export const buildThemeCssVariables = (
  leaves: CollectedTokenLeaf[],
): string => {
  const tree = buildLeafTree(leaves, (leaf) =>
    quoteSingle(`var(${leaf.varName})`),
  );
  return `${GENERATED_HEADER}
export const themeCssVariables = ${serializeTree(tree, 2, ',')};
`;
};
