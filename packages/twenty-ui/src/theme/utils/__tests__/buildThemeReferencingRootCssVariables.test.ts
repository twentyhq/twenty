import { buildThemeReferencingRootCssVariables } from '../buildThemeReferencingRootCssVariables';

describe('buildThemeReferencingRootCssVariables', () => {
  it('replaces primitive leaves with var() references', () => {
    const result = buildThemeReferencingRootCssVariables({
      themeNode: {
        // eslint-disable-next-line twenty/no-hardcoded-colors
        primary: '#333',
        // eslint-disable-next-line twenty/no-hardcoded-colors
        secondary: '#666',
      },
      prefix: 't',
    });

    expect(result).toEqual({
      primary: 'var(--t-primary)',
      secondary: 'var(--t-secondary)',
    });
  });

  it('converts camelCase keys to kebab-case in var names but preserves object keys', () => {
    const result = buildThemeReferencingRootCssVariables({
      themeNode: { fontColor: 'red' },
      prefix: 't',
    });

    expect(result).toEqual({
      fontColor: 'var(--t-font-color)',
    });
  });

  it('recurses into nested objects preserving the original structure', () => {
    const result = buildThemeReferencingRootCssVariables({
      themeNode: {
        font: {
          color: {
            // eslint-disable-next-line twenty/no-hardcoded-colors
            primary: '#333',
            // eslint-disable-next-line twenty/no-hardcoded-colors
            secondary: '#666',
          },
        },
      },
      prefix: 't',
    });

    expect(result).toEqual({
      font: {
        color: {
          primary: 'var(--t-font-color-primary)',
          secondary: 'var(--t-font-color-secondary)',
        },
      },
    });
  });

  it('replaces a spacing function with a map of var() refs keyed by spacing values', () => {
    const spacingFn = (n: number) => `${n * 4}px`;

    const result = buildThemeReferencingRootCssVariables({
      themeNode: { spacing: spacingFn },
      prefix: 't',
    });

    const spacingRefs = result.spacing as Record<string | number, string>;

    expect(spacingRefs[0]).toBe('var(--t-spacing-0)');
    expect(spacingRefs[4]).toBe('var(--t-spacing-4)');
    expect(spacingRefs[0.5]).toBe('var(--t-spacing-0_5)');
    expect(spacingRefs[1.5]).toBe('var(--t-spacing-1_5)');
    expect(Object.keys(spacingRefs)).toHaveLength(35);
  });

  it('produces var names that match prepareThemeForRootCssVariableInjection output', async () => {
    const { prepareThemeForRootCssVariableInjection } = await import(
      '../prepareThemeForRootCssVariableInjection'
    );

    const theme = {
      font: {
        color: {
          // eslint-disable-next-line twenty/no-hardcoded-colors
          primary: '#333',
          // eslint-disable-next-line twenty/no-hardcoded-colors
          secondary: '#666',
        },
      },
      spacing: (n: number) => `${n * 4}px`,
      border: { radius: '4px' },
    };

    const varNames = prepareThemeForRootCssVariableInjection({
      themeNode: theme,
      prefix: 't',
    }).map(([name]: [string, string]) => name);

    const collectVarNames = (obj: Record<string, unknown>): string[] =>
      Object.values(obj).flatMap((v) =>
        typeof v === 'object' && v !== null
          ? collectVarNames(v as Record<string, unknown>)
          : [String(v).replace(/^var\((.+)\)$/, '$1')],
      );

    const refs = buildThemeReferencingRootCssVariables({
      themeNode: theme,
      prefix: 't',
    });

    const refNames = collectVarNames(refs);

    expect(refNames).toEqual(varNames);
  });
});
