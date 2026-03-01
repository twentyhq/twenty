import { buildThemeReferencingRootCssVariables } from '../buildThemeReferencingRootCssVariables';

describe('buildThemeReferencingRootCssVariables', () => {
  it('replaces primitive leaves with var() references', () => {
    const result = buildThemeReferencingRootCssVariables({
      themeNode: { fontSize: '14px', lineHeight: 1.5 },
      prefix: 't',
    });

    expect(result).toEqual({
      fontSize: 'var(--t-font-size)',
      lineHeight: 'var(--t-line-height)',
    });
  });

  it('recurses into nested objects', () => {
    const result = buildThemeReferencingRootCssVariables({
      themeNode: { font: { color: { primary: 'someValue' } } },
      prefix: 't',
    });

    expect(result).toEqual({
      font: {
        color: { primary: 'var(--t-font-color-primary)' },
      },
    });
  });

  it('expands spacing functions into keyed var() refs', () => {
    const result = buildThemeReferencingRootCssVariables({
      themeNode: { spacing: (n: number) => `${n * 4}px` },
      prefix: 't',
    });

    const spacing = result.spacing as Record<string | number, string>;
    expect(spacing[0]).toBe('var(--t-spacing-0)');
    expect(spacing[4]).toBe('var(--t-spacing-4)');
    expect(spacing[0.5]).toBe('var(--t-spacing-0_5)');
    expect(spacing[1.5]).toBe('var(--t-spacing-1_5)');
  });
});
