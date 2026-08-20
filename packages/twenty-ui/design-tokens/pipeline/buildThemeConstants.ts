import { type CollectedTokenLeaf } from '../types/CollectedTokenLeaf';
import { buildLeafTree } from './buildLeafTree';
import { GENERATED_TYPESCRIPT_HEADER } from './generatedTypeScriptHeader';
import { renderStaticTokenValue } from './renderStaticTokenValue';
import { serializeTree } from './serializeTree';

const SPACING_TOKEN_KEY = 'spacing';
const SPACING_BINDING = 'themeSpacing';

const collapseSpacingScale = (
  leaves: CollectedTokenLeaf[],
): CollectedTokenLeaf[] => {
  const collapsed: CollectedTokenLeaf[] = [];
  let spacingEmitted = false;
  for (const leaf of leaves) {
    if (leaf.path[0] !== SPACING_TOKEN_KEY) {
      collapsed.push(leaf);
      continue;
    }
    if (spacingEmitted) {
      continue;
    }
    spacingEmitted = true;
    collapsed.push({ ...leaf, path: [SPACING_TOKEN_KEY] });
  }
  if (!spacingEmitted) {
    throw new Error('Missing the spacing scale tokens.');
  }
  return collapsed;
};

export const buildThemeConstants = ({
  leaves,
  scheme,
}: {
  leaves: CollectedTokenLeaf[];
  scheme: 'light' | 'dark';
}): string => {
  const tree = buildLeafTree({
    leaves: collapseSpacingScale(leaves),
    leafValue: (leaf) =>
      leaf.path.length === 1 && leaf.path[0] === SPACING_TOKEN_KEY
        ? SPACING_BINDING
        : renderStaticTokenValue({ leaf, scheme }),
  });
  const body = serializeTree({ node: tree, indent: 2, separator: ',' });
  if (scheme === 'light') {
    return `${GENERATED_TYPESCRIPT_HEADER}
import { themeSpacing } from '../internal/themeSpacing';

export const THEME_LIGHT = ${body};
`;
  }
  return `${GENERATED_TYPESCRIPT_HEADER}
import { themeSpacing } from '../internal/themeSpacing';
import { type THEME_LIGHT } from './ThemeLight';

export const THEME_DARK: typeof THEME_LIGHT = ${body};
`;
};
