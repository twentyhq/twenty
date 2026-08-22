import { type CollectedTokenLeaf } from '../../types/CollectedTokenLeaf';
import { buildThemeCommon } from '../buildThemeCommon';
import { pathToVarName } from '../pathToVarName';

const leaf = (
  path: string[],
  light: string,
  dark = light,
): CollectedTokenLeaf => ({
  path,
  varName: pathToVarName(path),
  light,
  dark,
});

const spacingLeaf = leaf(['spacing', '1'], '4px');

describe('buildThemeCommon', () => {
  it('emits only the pinned root keys', () => {
    const output = buildThemeCommon({
      leaves: [
        leaf(['icon', 'size', 'sm'], '14px'),
        spacingLeaf,
        leaf(['background', 'primary'], '#fff', '#000'),
      ],
      rootKeys: ['icon', 'spacing'],
    });
    expect(output).toContain("sm: '14px'");
    expect(output).toContain('spacing: themeSpacing');
    expect(output).not.toContain('background');
  });

  it('throws when a pinned root key has no token', () => {
    expect(() =>
      buildThemeCommon({
        leaves: [spacingLeaf],
        rootKeys: ['spacing', 'modal'],
      }),
    ).toThrow('Missing the "modal" tokens for THEME_COMMON.');
  });

  it('throws when a pinned root key has a scheme-variant token', () => {
    expect(() =>
      buildThemeCommon({
        leaves: [leaf(['icon', 'size', 'sm'], '14px', '16px'), spacingLeaf],
        rootKeys: ['icon', 'spacing'],
      }),
    ).toThrow(
      'THEME_COMMON token "icon.size.sm" must be scheme-invariant, got light "14px" / dark "16px".',
    );
  });
});
