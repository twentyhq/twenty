import { type CollectedTokenLeaf } from '../types/CollectedTokenLeaf';
import { GENERATED_TYPESCRIPT_HEADER } from './generatedTypeScriptHeader';

export const buildThemeSpacing = (leaves: CollectedTokenLeaf[]): string => {
  const multiplicatorLeaf = leaves.find(
    (leaf) => leaf.path.join('.') === 'spacingMultiplicator',
  );
  if (multiplicatorLeaf === undefined) {
    throw new Error('Missing the spacingMultiplicator token.');
  }
  if (multiplicatorLeaf.light !== multiplicatorLeaf.dark) {
    throw new Error(
      `spacingMultiplicator must be scheme-invariant, got light "${multiplicatorLeaf.light}" / dark "${multiplicatorLeaf.dark}".`,
    );
  }
  return `${GENERATED_TYPESCRIPT_HEADER}
export const themeSpacing = (...multiplicators: number[]): string =>
  multiplicators
    .map((multiplicator) => \`\${multiplicator * ${Number(multiplicatorLeaf.light)}}px\`)
    .join(' ');
`;
};
