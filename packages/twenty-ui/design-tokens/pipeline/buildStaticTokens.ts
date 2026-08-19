import { type CollectedTokenLeaf } from '../types/CollectedTokenLeaf';
import { buildLeafTree } from './buildLeafTree';
import { quoteSingle } from './quoteSingle';
import { serializeTree } from './serializeTree';

const GENERATED_HEADER = `// Generated from design-tokens by scripts/generateThemeTokens.ts.
// Do not edit manually. Regenerate with: npx nx generateTokens twenty-ui.`;

const renderStaticValue = (value: string, unit?: 'number'): string => {
  if (unit !== 'number') {
    return quoteSingle(value);
  }
  const parsed = Number(value);
  if (Number.isNaN(parsed)) {
    throw new Error(
      `Token value "${value}" is marked unit: 'number' but does not parse as a number.`,
    );
  }
  return String(parsed);
};

export const buildStaticTokens = (
  leaves: CollectedTokenLeaf[],
  scheme: 'light' | 'dark',
): string => {
  const exportName = scheme === 'light' ? 'tokensLight' : 'tokensDark';
  const tree = buildLeafTree(leaves, (leaf) =>
    renderStaticValue(scheme === 'light' ? leaf.light : leaf.dark, leaf.unit),
  );
  return `${GENERATED_HEADER}
import { type ThemeType } from '@ui/theme-constants/themeTypes.generated';

export const ${exportName}: ThemeType = ${serializeTree(tree, 2, ',')};
`;
};
