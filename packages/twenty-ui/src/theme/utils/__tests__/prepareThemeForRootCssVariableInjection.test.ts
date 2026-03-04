import { prepareThemeForRootCssVariableInjection } from '../prepareThemeForRootCssVariableInjection';

describe('prepareThemeForRootCssVariableInjection', () => {
  it('converts a flat theme object into CSS variable tuples', () => {
    const result = prepareThemeForRootCssVariableInjection({
      // eslint-disable-next-line twenty/no-hardcoded-colors
      themeNode: { primary: '#333', secondary: '#666' },
      prefix: 't',
    });

    expect(result).toEqual([
      // eslint-disable-next-line twenty/no-hardcoded-colors
      ['--t-primary', '#333'],
      // eslint-disable-next-line twenty/no-hardcoded-colors
      ['--t-secondary', '#666'],
    ]);
  });

  it('converts camelCase keys to kebab-case', () => {
    const result = prepareThemeForRootCssVariableInjection({
      themeNode: { fontColor: 'red', backgroundColor: 'blue' },
      prefix: 't',
    });

    expect(result).toEqual([
      ['--t-font-color', 'red'],
      ['--t-background-color', 'blue'],
    ]);
  });

  it('recurses into nested objects', () => {
    const result = prepareThemeForRootCssVariableInjection({
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

    expect(result).toEqual([
      // eslint-disable-next-line twenty/no-hardcoded-colors
      ['--t-font-color-primary', '#333'],
      // eslint-disable-next-line twenty/no-hardcoded-colors
      ['--t-font-color-secondary', '#666'],
    ]);
  });

  it('expands a spacing function into one entry per SPACING_VALUES element', () => {
    const spacingFn = (n: number) => `${n * 4}px`;

    const result = prepareThemeForRootCssVariableInjection({
      themeNode: { spacing: spacingFn },
      prefix: 't',
    });

    expect(result).toContainEqual(['--t-spacing-0', '0px']);
    expect(result).toContainEqual(['--t-spacing-4', '16px']);
    expect(result).toContainEqual(['--t-spacing-0_5', '2px']);
    expect(result).toContainEqual(['--t-spacing-1_5', '6px']);
    // 0..32 plus 0.5 and 1.5 = 35 entries
    expect(result).toHaveLength(35);
  });

  it('stringifies non-string primitives', () => {
    const result = prepareThemeForRootCssVariableInjection({
      themeNode: { size: 16, enabled: true },
      prefix: 't',
    });

    expect(result).toEqual([
      ['--t-size', '16'],
      ['--t-enabled', 'true'],
    ]);
  });

  it('ignores non-spacing functions and treats them as leaves', () => {
    const fn = () => 'result';

    const result = prepareThemeForRootCssVariableInjection({
      themeNode: { notSpacing: fn },
      prefix: 't',
    });

    expect(result).toEqual([['--t-not-spacing', String(fn)]]);
  });
});
