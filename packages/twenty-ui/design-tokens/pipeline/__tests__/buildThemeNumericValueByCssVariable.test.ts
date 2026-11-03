import { type CollectedTokenLeaf } from '../../types/CollectedTokenLeaf';
import { buildThemeNumericValueByCssVariable } from '../buildThemeNumericValueByCssVariable';
import { pathToVarName } from '../pathToVarName';

const leaf = ({
  path,
  light,
  dark = light,
  unit,
}: {
  path: string[];
  light: string;
  dark?: string;
  unit?: 'number';
}): CollectedTokenLeaf => ({
  path,
  varName: pathToVarName(path),
  light,
  dark,
  unit,
});

describe('buildThemeNumericValueByCssVariable', () => {
  it('maps each numeric token to its literal value by CSS variable', () => {
    const output = buildThemeNumericValueByCssVariable([
      leaf({ path: ['icon', 'size', 'md'], light: '16', unit: 'number' }),
      leaf({
        path: ['animation', 'duration', 'fast'],
        light: '0.15',
        unit: 'number',
      }),
      leaf({ path: ['background', 'primary'], light: '#fff', dark: '#000' }),
      leaf({ path: ['border', 'radius', 'md'], light: '8px' }),
    ]);

    expect(output).toContain("'--t-icon-size-md': 16,");
    expect(output).toContain("'--t-animation-duration-fast': 0.15,");
    expect(output).not.toContain('--t-background-primary');
    expect(output).not.toContain('--t-border-radius-md');
  });

  it('accepts equivalent numeric spellings across schemes', () => {
    const output = buildThemeNumericValueByCssVariable([
      leaf({
        path: ['icon', 'stroke', 'sm'],
        light: '1',
        dark: '1.0',
        unit: 'number',
      }),
    ]);

    expect(output).toContain("'--t-icon-stroke-sm': 1,");
  });

  it('throws when a numeric token differs between schemes', () => {
    expect(() =>
      buildThemeNumericValueByCssVariable([
        leaf({
          path: ['icon', 'size', 'md'],
          light: '16',
          dark: '20',
          unit: 'number',
        }),
      ]),
    ).toThrow(
      'Numeric token "icon.size.md" must be scheme-invariant, got light "16" / dark "20".',
    );
  });
});
