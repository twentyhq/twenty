import * as fs from 'fs';
import * as path from 'path';

import { themeCssVariables } from '@ui/theme-constants/themeCssVariables';

import { DESIGN_TOKENS } from '../designTokens';
import { collectLeaves } from '../pipeline/collectLeaves';
import { parseThemeCssDeclarations } from '../pipeline/parseThemeCssDeclarations';
import { SQUIRCLE_DOUBLED_RADIUS_TOKENS } from '../squircleDoubledRadiusTokens';
import { THEME_CSS_FILE_NAME_BY_SCHEME } from '../themeCssFileNameByScheme';
import { flattenTree } from './flattenTree';

const THEME_CONSTANTS_DIR = path.resolve(
  __dirname,
  '../../src/theme-constants',
);
const readThemeCss = (fileName: string) =>
  fs.readFileSync(path.join(THEME_CONSTANTS_DIR, fileName), 'utf-8');

const cssByScheme = {
  light: readThemeCss(THEME_CSS_FILE_NAME_BY_SCHEME.light),
  dark: readThemeCss(THEME_CSS_FILE_NAME_BY_SCHEME.dark),
};

const leaves = collectLeaves(DESIGN_TOKENS);
const declarationsByScheme = {
  light: parseThemeCssDeclarations({ css: cssByScheme.light, scheme: 'light' }),
  dark: parseThemeCssDeclarations({ css: cssByScheme.dark, scheme: 'dark' }),
};
const valuesByScheme = {
  light: new Map(
    declarationsByScheme.light.map((declaration) => [
      declaration.name,
      declaration.value,
    ]),
  ),
  dark: new Map(
    declarationsByScheme.dark.map((declaration) => [
      declaration.name,
      declaration.value,
    ]),
  ),
};
const cssVariablesByPath = flattenTree(themeCssVariables);

describe('theme token pipeline', () => {
  it('declares every design token in both committed CSS files, and nothing else', () => {
    expect(declarationsByScheme.light).toHaveLength(leaves.length);
    expect(declarationsByScheme.dark).toHaveLength(leaves.length);
    for (const leaf of leaves) {
      expect(valuesByScheme.light.get(leaf.varName)).toBe(leaf.light);
      expect(valuesByScheme.dark.get(leaf.varName)).toBe(leaf.dark);
    }
  });

  it('exposes every design token in themeCssVariables as exactly var(<name>)', () => {
    expect(cssVariablesByPath.size).toBe(leaves.length);
    for (const leaf of leaves) {
      expect(cssVariablesByPath.get(leaf.path.join('.'))).toBe(
        `var(${leaf.varName})`,
      );
    }
  });

  it('marks exactly the leaves that resolve to numbers as unit number', () => {
    for (const leaf of leaves) {
      const parsesAsNumber =
        !Number.isNaN(Number(leaf.light)) && !Number.isNaN(Number(leaf.dark));
      expect(leaf.unit === 'number').toBe(parsesAsNumber);
    }
  });

  describe.each(['light', 'dark'] as const)(
    'squircle corner overrides in %s',
    (scheme) => {
      const css = cssByScheme[scheme];
      const supportsIndex = css.indexOf('@supports (corner-shape: squircle)');
      const squircleBlock = css.slice(supportsIndex);

      it('places the squircle block after the base block', () => {
        expect(supportsIndex).toBeGreaterThan(css.indexOf('--t-color-'));
      });

      it.each(SQUIRCLE_DOUBLED_RADIUS_TOKENS)(
        'doubles the %s radius',
        (radiusToken) => {
          const varName = `--t-border-radius-${radiusToken}`;
          const baseMatch = css
            .slice(0, supportsIndex)
            .match(new RegExp(`${varName}: (\\d+)px;`));
          expect(baseMatch).not.toBeNull();
          expect(squircleBlock).toContain(
            `${varName}: ${Number(baseMatch?.[1]) * 2}px;`,
          );
        },
      );

      it.each(['pill', 'rounded', 'sm-round', 'md-round'])(
        'does not redefine the %s radius',
        (radiusToken) => {
          expect(squircleBlock).not.toContain(
            `--t-border-radius-${radiusToken}:`,
          );
        },
      );

      it('applies the overridable corner-shape rule', () => {
        expect(squircleBlock).toContain(
          'corner-shape: var(--t-corner-shape, squircle);',
        );
      });
    },
  );
});
