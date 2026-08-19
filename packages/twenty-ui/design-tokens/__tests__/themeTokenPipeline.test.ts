import * as fs from 'fs';
import * as path from 'path';

import { themeCssVariables } from '@ui/theme-constants/themeCssVariables';
import { tokensDark } from '@ui/tokens/tokensDark';
import { tokensLight } from '@ui/tokens/tokensLight';

import { DESIGN_TOKENS } from '../designTokens';
import { collectLeaves } from '../pipeline/collectLeaves';
import { parseThemeCssDeclarations } from '../pipeline/parseThemeCssDeclarations';
import { SQUIRCLE_DOUBLED_RADIUS_TOKENS } from '../squircleDoubledRadiusTokens';

const THEME_CONSTANTS_DIR = path.resolve(
  __dirname,
  '../../src/theme-constants',
);
const DIST_DIR = path.resolve(__dirname, '../../dist');

const NUMERIC_RUNTIME_STRING_TYPED_PATHS = [
  'font.weight.regular',
  'font.weight.medium',
  'font.weight.semiBold',
];

const leaves = collectLeaves(DESIGN_TOKENS);
const lightCss = fs.readFileSync(
  path.join(THEME_CONSTANTS_DIR, 'theme-light.css'),
  'utf-8',
);
const darkCss = fs.readFileSync(
  path.join(THEME_CONSTANTS_DIR, 'theme-dark.css'),
  'utf-8',
);
const lightDeclarations = parseThemeCssDeclarations(lightCss, 'light');
const darkDeclarations = parseThemeCssDeclarations(darkCss, 'dark');
const lightValues = new Map(
  lightDeclarations.map((declaration) => [declaration.name, declaration.value]),
);
const darkValues = new Map(
  darkDeclarations.map((declaration) => [declaration.name, declaration.value]),
);

const readAtPath = (tree: unknown, leafPath: string[]): unknown =>
  leafPath.reduce(
    (node, segment) => (node as Record<string, unknown>)[segment],
    tree,
  );

describe('theme token pipeline', () => {
  it('declares every design token in both committed CSS files, and nothing else', () => {
    expect(lightDeclarations).toHaveLength(leaves.length);
    expect(darkDeclarations).toHaveLength(leaves.length);
    for (const leaf of leaves) {
      expect(lightValues.get(leaf.varName)).toBe(leaf.light);
      expect(darkValues.get(leaf.varName)).toBe(leaf.dark);
    }
  });

  it('exposes every design token in themeCssVariables as exactly var(<name>)', () => {
    for (const leaf of leaves) {
      expect(readAtPath(themeCssVariables, leaf.path)).toBe(
        `var(${leaf.varName})`,
      );
    }
  });

  it('mirrors static token values from the CSS in both schemes', () => {
    for (const leaf of leaves) {
      const expectedLight =
        leaf.unit === 'number' ? Number(leaf.light) : leaf.light;
      const expectedDark =
        leaf.unit === 'number' ? Number(leaf.dark) : leaf.dark;
      expect(readAtPath(tokensLight, leaf.path)).toBe(expectedLight);
      expect(readAtPath(tokensDark, leaf.path)).toBe(expectedDark);
    }
  });

  it('marks exactly the numeric leaves as unit number', () => {
    for (const leaf of leaves) {
      const parsesAsNumber =
        !Number.isNaN(Number(leaf.light)) && !Number.isNaN(Number(leaf.dark));
      if (leaf.unit === 'number') {
        expect(parsesAsNumber).toBe(true);
        continue;
      }
      if (parsesAsNumber) {
        expect(NUMERIC_RUNTIME_STRING_TYPED_PATHS).toContain(
          leaf.path.join('.'),
        );
      }
    }
  });

  describe.each(['theme-light.css', 'theme-dark.css'])(
    'squircle corner overrides in %s',
    (fileName) => {
      const css = fs.readFileSync(
        path.join(THEME_CONSTANTS_DIR, fileName),
        'utf-8',
      );
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

      it('is mirrored byte-for-byte into the committed dist copy', () => {
        expect(fs.readFileSync(path.join(DIST_DIR, fileName), 'utf-8')).toBe(
          css,
        );
      });
    },
  );
});
