import { type CollectedTokenLeaf } from '../types/CollectedTokenLeaf';

export const buildDocsJson = (leaves: CollectedTokenLeaf[]): string => {
  const tokens = leaves.map((leaf) => ({
    path: leaf.path.join('.'),
    cssVariable: leaf.varName,
    light: leaf.light,
    dark: leaf.dark,
    ...(leaf.unit === 'number' ? { unit: 'number' } : {}),
  }));
  const unresolvedReferences = leaves
    .filter((leaf) => leaf.light.includes('var(') || leaf.dark.includes('var('))
    .map((leaf) => leaf.path.join('.'));
  return `${JSON.stringify({ tokens, unresolvedReferences }, null, 2)}\n`;
};
