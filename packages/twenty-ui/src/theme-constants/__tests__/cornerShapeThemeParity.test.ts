import * as fs from 'fs';
import * as path from 'path';

import { BORDER_COMMON } from '@ui/theme/constants/BorderCommon';

// The squircle block in the theme CSS doubles every corner radius token,
// because a squircle needs ~2x the radius of a round corner to read as the
// same visual size. These tests pin that invariant so the base scale and the
// squircle overrides cannot drift apart, and keep the committed dist copies
// in sync with the source files.

const THEME_CONSTANTS_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.resolve(__dirname, '../../../dist');

const CORNER_RADIUS_TOKENS = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'] as const;
const MAXED_RADIUS_TOKENS = ['pill', 'rounded'] as const;
// Shape-independent radii for elements that keep corner-shape: round
// (checkboxes, chips, tags): same visual size in both modes.
const ROUND_RADIUS_TOKENS = [
  { token: 'sm-round', matchesBaseToken: 'sm' },
  { token: 'md-round', matchesBaseToken: 'md' },
] as const;

const readThemeCss = (fileName: string) =>
  fs.readFileSync(path.join(THEME_CONSTANTS_DIR, fileName), 'utf-8');

const extractSquircleBlock = (css: string) => {
  const match = css.match(
    /@supports \(corner-shape: squircle\) \{([\s\S]*?)\n\}/,
  );

  if (match === null) {
    throw new Error('Missing @supports (corner-shape: squircle) block');
  }

  return match[1];
};

const extractRadiusPx = (css: string, token: string) => {
  const match = css.match(new RegExp(`--t-border-radius-${token}: (\\d+)px;`));

  if (match === null) {
    throw new Error(`Missing --t-border-radius-${token} declaration`);
  }

  return Number(match[1]);
};

describe.each(['theme-light.css', 'theme-dark.css'])(
  'squircle corner overrides in %s',
  (fileName) => {
    const css = readThemeCss(fileName);
    const squircleBlock = extractSquircleBlock(css);
    const baseCss = css.replace(squircleBlock, '');

    it.each(CORNER_RADIUS_TOKENS)(
      'doubles the %s radius token for squircle corners',
      (token) => {
        const baseValue = extractRadiusPx(baseCss, token);
        const squircleValue = extractRadiusPx(squircleBlock, token);

        expect(squircleValue).toBe(baseValue * 2);
      },
    );

    it.each(CORNER_RADIUS_TOKENS)(
      'keeps the base %s radius token aligned with BORDER_COMMON',
      (token) => {
        expect(`${extractRadiusPx(baseCss, token)}px`).toBe(
          BORDER_COMMON.radius[token],
        );
      },
    );

    it.each(MAXED_RADIUS_TOKENS)(
      'does not redefine the %s token, which is already at its geometric maximum',
      (token) => {
        expect(squircleBlock).not.toContain(`--t-border-radius-${token}`);
      },
    );

    it.each(ROUND_RADIUS_TOKENS)(
      'keeps the shape-independent $token token undoubled and equal to the base $matchesBaseToken value',
      ({ token, matchesBaseToken }) => {
        expect(squircleBlock).not.toContain(`--t-border-radius-${token}`);
        expect(extractRadiusPx(baseCss, token)).toBe(
          extractRadiusPx(baseCss, matchesBaseToken),
        );
      },
    );

    it('applies corner-shape universally with the --t-corner-shape opt-out', () => {
      expect(squircleBlock).toContain(
        'corner-shape: var(--t-corner-shape, squircle);',
      );
    });

    it('is mirrored byte-for-byte into the committed dist copy', () => {
      expect(fs.readFileSync(path.join(DIST_DIR, fileName), 'utf-8')).toBe(css);
    });
  },
);
