import { readFileSync } from 'fs';
import { resolve } from 'path';

import { themeCssVariables as newThemeCssVariables } from '../themeCssVariables';
import { themeCssVariables as oldThemeCssVariables } from '../../../../twenty-ui-deprecated/src/theme-constants/themeCssVariables';

const NEW_DIR = resolve(__dirname, '..');
const OLD_DIR = resolve(
  __dirname,
  '../../../../twenty-ui-deprecated/src/theme-constants',
);

// Parse a theme CSS file into ordered [name, value] pairs, normalizing
// whitespace so formatting differences (multi-line vs single-line values,
// header comment) don't affect the comparison. Stops each value at the ';'
// that terminates it, skipping ';' embedded in values (e.g. data URIs).
const parseTokens = (dir: string, file: string): [string, string][] => {
  const text = readFileSync(resolve(dir, file), 'utf8');
  const body = text.slice(text.indexOf('{') + 1, text.lastIndexOf('}'));
  const re = /--t-([a-z0-9_-]+):\s*([\s\S]*?);(?=\s*(?:--t-|$))/g;
  const tokens: [string, string][] = [];
  let match: RegExpExecArray | null;
  while ((match = re.exec(body)) !== null) {
    const value = match[2]
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/\(\s+/g, '(')
      .replace(/\s+\)/g, ')');
    tokens.push([match[1], value]);
  }
  return tokens;
};

// twenty-ui must produce the exact same --t-* tokens and values (and order)
// as twenty-ui, so the swap is token-for-token with no visual change.
// Comparison ignores incidental formatting (header, whitespace) but not values.
describe('theme parity with twenty-ui', () => {
  it('theme-light.css tokens match twenty-ui', () => {
    expect(parseTokens(NEW_DIR, 'theme-light.css')).toEqual(
      parseTokens(OLD_DIR, 'theme-light.css'),
    );
  });

  it('theme-dark.css tokens match twenty-ui', () => {
    expect(parseTokens(NEW_DIR, 'theme-dark.css')).toEqual(
      parseTokens(OLD_DIR, 'theme-dark.css'),
    );
  });

  it('themeCssVariables is deeply equal to twenty-ui', () => {
    expect(newThemeCssVariables).toEqual(oldThemeCssVariables);
  });
});
