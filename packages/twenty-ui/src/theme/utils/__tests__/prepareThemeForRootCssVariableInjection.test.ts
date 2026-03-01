import { prepareThemeForRootCssVariableInjection } from '../prepareThemeForRootCssVariableInjection';

describe('prepareThemeForRootCssVariableInjection', () => {
  it('collects flat entries from primitive leaves', () => {
    const entries = prepareThemeForRootCssVariableInjection({
      themeNode: { fontSize: '14px' },
      prefix: 't',
    });

    expect(entries).toEqual([['--t-font-size', '14px']]);
  });

  it('recurses into nested objects', () => {
    const entries = prepareThemeForRootCssVariableInjection({
      themeNode: { font: { color: { primary: 'someValue' } } },
      prefix: 't',
    });

    expect(entries).toEqual([['--t-font-color-primary', 'someValue']]);
  });

  it('expands spacing functions into entries', () => {
    const entries = prepareThemeForRootCssVariableInjection({
      themeNode: { spacing: (n: number) => `${n * 4}px` },
      prefix: 't',
    });

    expect(entries).toContainEqual(['--t-spacing-0', '0px']);
    expect(entries).toContainEqual(['--t-spacing-4', '16px']);
    expect(entries).toContainEqual(['--t-spacing-0_5', '2px']);
  });

  it('stringifies numeric values', () => {
    const entries = prepareThemeForRootCssVariableInjection({
      themeNode: { opacity: 0.5 },
      prefix: 't',
    });

    expect(entries).toEqual([['--t-opacity', '0.5']]);
  });
});
