import { type CollectedTokenLeaf } from '../types/CollectedTokenLeaf';
import { buildLeafTree } from './buildLeafTree';
import { GENERATED_TYPESCRIPT_HEADER } from './generatedTypeScriptHeader';
import { quoteSingle } from './quoteSingle';
import { serializeTree } from './serializeTree';

export const buildThemeCssVariables = (
  leaves: CollectedTokenLeaf[],
): string => {
  const tree = buildLeafTree({
    leaves,
    leafValue: (leaf) => quoteSingle(`var(${leaf.varName})`),
  });
  return `${GENERATED_TYPESCRIPT_HEADER}
export const themeCssVariables = ${serializeTree({ node: tree, separator: ',' })};
`;
};
