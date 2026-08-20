import { THEME_DARK } from '@ui/theme/constants/ThemeDark';
import { THEME_LIGHT } from '@ui/theme/constants/ThemeLight';

import { DESIGN_TOKENS } from '../designTokens';
import { collectLeaves } from '../pipeline/collectLeaves';
import { type CollectedTokenLeaf } from '../types/CollectedTokenLeaf';
import { flattenTree } from './flattenTree';

const leaves = collectLeaves(DESIGN_TOKENS);
const constantsByScheme = { light: THEME_LIGHT, dark: THEME_DARK };

const spacingLeaves = leaves.filter((leaf) => leaf.path[0] === 'spacing');
const nonSpacingLeaves = leaves.filter((leaf) => leaf.path[0] !== 'spacing');

const flattenConstants = (scheme: 'light' | 'dark') => {
  const flattened = flattenTree(constantsByScheme[scheme]);
  flattened.delete('spacing');
  return flattened;
};

const expectedConstantValue = (
  leaf: CollectedTokenLeaf,
  scheme: 'light' | 'dark',
) => {
  if (leaf.jsValue === 'cssVariable') {
    return `var(${leaf.varName})`;
  }
  const rawValue = scheme === 'light' ? leaf.light : leaf.dark;
  return leaf.unit === 'number' ? Number(rawValue) : rawValue;
};

describe.each(['light', 'dark'] as const)(
  'design tokens match THEME_%s',
  (scheme) => {
    const flattenedConstants = flattenConstants(scheme);

    it('resolves every token to the same value in the hand-written constants', () => {
      const mismatches = nonSpacingLeaves
        .map((leaf) => ({
          path: leaf.path.join('.'),
          expected: expectedConstantValue(leaf, scheme),
          actual: flattenedConstants.get(leaf.path.join('.')),
        }))
        .filter((entry) => entry.actual !== entry.expected);
      expect(mismatches).toEqual([]);
    });

    it('does not carry values the design tokens no longer define', () => {
      const tokenPaths = new Set(
        nonSpacingLeaves.map((leaf) => leaf.path.join('.')),
      );
      expect(
        [...flattenedConstants.keys()].filter((path) => !tokenPaths.has(path)),
      ).toEqual([]);
    });

    it('matches the spacing scale the spacing() helper produces', () => {
      const mismatches = spacingLeaves
        .map((leaf) => ({
          path: leaf.path.join('.'),
          expected: expectedConstantValue(leaf, scheme),
          actual: constantsByScheme[scheme].spacing(Number(leaf.path[1])),
        }))
        .filter((entry) => entry.actual !== entry.expected);
      expect(mismatches).toEqual([]);
    });
  },
);
