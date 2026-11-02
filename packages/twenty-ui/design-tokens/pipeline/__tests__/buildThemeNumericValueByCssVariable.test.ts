import { type CollectedTokenLeaf } from '../../types/CollectedTokenLeaf';
import { buildThemeNumericValueByCssVariable } from '../buildThemeNumericValueByCssVariable';
import { pathToVarName } from '../pathToVarName';

const leaf = (
  path: string[],
  light: string,
  dark = light,
  unit?: 'number',
): CollectedTokenLeaf => ({
  path,
  varName: pathToVarName(path),
  light,
  dark,
  unit,
});

describe('buildThemeNumericValueByCssVariable', () => {
  it('maps each numeric token to its literal value by CSS variable', () => {
    const output = buildThemeNumericValueByCssVariable([
      leaf(['icon', 'size', 'md'], '16', '16', 'number'),
      leaf(['animation', 'duration', 'fast'], '0.15', '0.15', 'number'),
      leaf(['background', 'primary'], '#fff', '#000'),
      leaf(['border', 'radius', 'md'], '8px'),
    ]);

    expect(output).toContain("'--t-icon-size-md': 16,");
    expect(output).toContain("'--t-animation-duration-fast': 0.15,");
    expect(output).not.toContain('--t-background-primary');
    expect(output).not.toContain('--t-border-radius-md');
  });

  it('throws when a numeric token differs between schemes', () => {
    expect(() =>
      buildThemeNumericValueByCssVariable([
        leaf(['icon', 'size', 'md'], '16', '20', 'number'),
      ]),
    ).toThrow(
      'Numeric token "icon.size.md" must be scheme-invariant, got light "16" / dark "20".',
    );
  });
});
