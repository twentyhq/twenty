import { type CollectedTokenLeaf } from '../../types/CollectedTokenLeaf';
import { buildThemeCss } from '../buildThemeCss';
import { pathToVarName } from '../pathToVarName';

const radiusLeaf = (
  name: string,
  value: string,
  darkValue = value,
): CollectedTokenLeaf => {
  const path = ['border', 'radius', name];
  return { path, varName: pathToVarName(path), light: value, dark: darkValue };
};

const roundRadiusLeaves = [
  radiusLeaf('smRound', '4px'),
  radiusLeaf('mdRound', '8px'),
  radiusLeaf('pill', '999px'),
  radiusLeaf('rounded', '100%'),
];

const radiusLeaves = [
  radiusLeaf('xs', '2px'),
  radiusLeaf('sm', '4px'),
  radiusLeaf('md', '8px'),
  ...roundRadiusLeaves,
  radiusLeaf('lg', '16px'),
  radiusLeaf('xl', '20px'),
  radiusLeaf('xxl', '40px'),
];

const extractSquircleBlock = (css: string): string =>
  css.slice(css.indexOf('@supports (corner-shape: squircle)'));

describe('buildThemeCss', () => {
  it('emits the scheme block with the values of that scheme', () => {
    const css = buildThemeCss({ leaves: radiusLeaves, scheme: 'dark' });
    expect(css).toContain('.dark {');
    expect(css).toContain('  --t-border-radius-md: 8px;');
  });

  it('doubles every radius that is not round inside the @supports block', () => {
    const squircleBlock = extractSquircleBlock(
      buildThemeCss({
        leaves: [...radiusLeaves, radiusLeaf('xxxl', '48px')],
        scheme: 'light',
      }),
    );
    expect(squircleBlock).toContain('--t-border-radius-md: 16px;');
    expect(squircleBlock).toContain('--t-border-radius-xxl: 80px;');
    expect(squircleBlock).toContain('--t-border-radius-xxxl: 96px;');
  });

  it('never doubles the round radius tokens', () => {
    const squircleBlock = extractSquircleBlock(
      buildThemeCss({ leaves: radiusLeaves, scheme: 'light' }),
    );
    expect(squircleBlock).not.toContain('--t-border-radius-sm-round');
    expect(squircleBlock).not.toContain('--t-border-radius-md-round');
    expect(squircleBlock).not.toContain('--t-border-radius-pill');
    expect(squircleBlock).not.toContain('--t-border-radius-rounded');
  });

  it('throws when a round radius token is missing from the source', () => {
    expect(() =>
      buildThemeCss({
        leaves: radiusLeaves.filter((leaf) => leaf.path[2] !== 'pill'),
        scheme: 'light',
      }),
    ).toThrow('Missing round radius token "pill" for the squircle block.');
  });

  it('throws when no radius token is left to double', () => {
    expect(() =>
      buildThemeCss({ leaves: roundRadiusLeaves, scheme: 'light' }),
    ).toThrow('Missing the border radius tokens for the squircle block.');
  });

  it('throws when a squircle radius is not a scheme-invariant integer px value', () => {
    expect(() =>
      buildThemeCss({
        leaves: [radiusLeaf('xs', '2px', '3px'), ...radiusLeaves.slice(1)],
        scheme: 'light',
      }),
    ).toThrow('must be a scheme-invariant integer px value');
  });
});
