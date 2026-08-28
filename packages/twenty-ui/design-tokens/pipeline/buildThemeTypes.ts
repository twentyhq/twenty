import { type CollectedTokenLeaf } from '../types/CollectedTokenLeaf';
import { buildLeafTree } from './buildLeafTree';
import { GENERATED_TYPESCRIPT_HEADER } from './generatedTypeScriptHeader';
import { serializeTree } from './serializeTree';

export const buildThemeTypes = (leaves: CollectedTokenLeaf[]): string => {
  const tree = buildLeafTree({
    leaves,
    leafValue: (leaf) => (leaf.unit === 'number' ? 'number' : 'string'),
  });
  return `${GENERATED_TYPESCRIPT_HEADER}
export type ThemeType = ${serializeTree({ node: tree, separator: ';' })};
`;
};
