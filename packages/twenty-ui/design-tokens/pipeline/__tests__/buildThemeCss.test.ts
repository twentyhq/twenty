import { type CollectedTokenLeaf } from '../../types/CollectedTokenLeaf';
import { buildThemeCss } from '../buildThemeCss';

const radiusLeaf = (
  name: string,
  value: string,
  darkValue = value,
): CollectedTokenLeaf => ({
  path: ['border', 'radius', name],
  varName: `--t-border-radius-${name}`,
  light: value,
  dark: darkValue,
});

const squircleRadiusLeaves = [
  radiusLeaf('xs', '2px'),
  radiusLeaf('sm', '4px'),
  radiusLeaf('md', '8px'),
  radiusLeaf('lg', '16px'),
  radiusLeaf('xl', '20px'),
  radiusLeaf('xxl', '40px'),
];

describe('buildThemeCss', () => {
  it('emits the scheme block with the values of that scheme', () => {
    const css = buildThemeCss({ leaves: squircleRadiusLeaves, scheme: 'dark' });
    expect(css).toContain('.dark {');
    expect(css).toContain('  --t-border-radius-md: 8px;');
  });

  it('doubles every squircle radius inside the @supports block', () => {
    const css = buildThemeCss({
      leaves: squircleRadiusLeaves,
      scheme: 'light',
    });
    const squircleBlock = css.slice(
      css.indexOf('@supports (corner-shape: squircle)'),
    );
    expect(squircleBlock).toContain('--t-border-radius-md: 16px;');
    expect(squircleBlock).toContain('--t-border-radius-xxl: 80px;');
  });

  it('throws when a squircle radius token is missing', () => {
    expect(() =>
      buildThemeCss({ leaves: squircleRadiusLeaves.slice(1), scheme: 'light' }),
    ).toThrow('Missing radius token "--t-border-radius-xs"');
  });

  it('throws when a squircle radius is not a scheme-invariant integer px value', () => {
    expect(() =>
      buildThemeCss({
        leaves: [
          radiusLeaf('xs', '2px', '3px'),
          ...squircleRadiusLeaves.slice(1),
        ],
        scheme: 'light',
      }),
    ).toThrow('must be a scheme-invariant integer px value');
  });
});
