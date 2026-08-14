import * as fs from 'fs';
import * as path from 'path';

import { SCALED_THEME_PROPERTIES } from '../scaledThemeProperties';

// getComputedStyle only evaluates calc() on registered custom properties, so
// a token that gains a calc() without a registration silently degrades the JS
// theme to raw calc strings. These tests pin the registration manifest to the
// declarations in the theme CSS.

const THEME_CONSTANTS_DIR = path.resolve(__dirname, '..');

const readScaledTokenNames = (fileName: string) => {
  const css = fs.readFileSync(
    path.join(THEME_CONSTANTS_DIR, fileName),
    'utf-8',
  );

  return new Set(
    [...css.matchAll(/(--t-[a-z0-9_-]+): calc\([^;]*var\(--t-scale\)\)/g)].map(
      (match) => match[1],
    ),
  );
};

const SCALE_FACTOR_NAMES = ['--t-scale-user', '--t-scale-base', '--t-scale'];

const registeredNames = new Set(
  SCALED_THEME_PROPERTIES.map((property) => property.name),
);

describe.each(['theme-light.css', 'theme-dark.css'])(
  'scaled token registration for %s',
  (fileName) => {
    const scaledTokenNames = readScaledTokenNames(fileName);

    it('registers every token that multiplies by --t-scale', () => {
      const unregistered = [...scaledTokenNames].filter(
        (name) => !registeredNames.has(name),
      );

      expect(unregistered).toEqual([]);
    });

    it('does not register tokens the CSS no longer scales', () => {
      const stale = [...registeredNames].filter(
        (name) =>
          !scaledTokenNames.has(name) && !SCALE_FACTOR_NAMES.includes(name),
      );

      expect(stale).toEqual([]);
    });
  },
);

describe('scale factors', () => {
  it('registers the scale factors themselves', () => {
    for (const name of SCALE_FACTOR_NAMES) {
      expect(registeredNames.has(name)).toBe(true);
    }
  });
});
