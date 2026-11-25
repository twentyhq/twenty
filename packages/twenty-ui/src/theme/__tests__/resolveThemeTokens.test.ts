import { THEME_LIGHT } from '../constants/ThemeLight';
import { resolveThemeTokens } from '../internal/resolveThemeTokens';
import { themeCssVariables } from '../themeCssVariables';

it('uses static numeric values while keeping unresolved colors on the host', () => {
  const theme = resolveThemeTokens();

  expect(theme.icon).toEqual(THEME_LIGHT.icon);
  expect(theme.font.weight).toEqual(THEME_LIGHT.font.weight);
  expect(theme.animation).toEqual(THEME_LIGHT.animation);
  expect(theme.spacingMultiplicator).toBe(THEME_LIGHT.spacingMultiplicator);
  expect(theme.font.color).toEqual(themeCssVariables.font.color);
  expect(theme.spacing).toEqual(themeCssVariables.spacing);
});

it('uses readable CSS overrides before numeric fallbacks', () => {
  const cssValues: Record<string, string> = {
    '--t-icon-size-md': '20',
    '--t-icon-stroke-sm': '0',
    '--t-font-color-primary': '#123456',
  };
  const theme = resolveThemeTokens((name) => cssValues[name] ?? '');

  expect(theme.icon.size.md).toBe(20);
  expect(theme.icon.size.sm).toBe(THEME_LIGHT.icon.size.sm);
  expect(theme.icon.stroke.sm).toBe(0);
  expect(theme.font.color.primary).toBe('#123456');
  expect(theme.font.color.secondary).toBe(
    themeCssVariables.font.color.secondary,
  );
});

it('keeps resolved themes independent from each other and the static theme', () => {
  const originalSize = THEME_LIGHT.icon.size.md;
  const theme = resolveThemeTokens();

  theme.icon.size.md = originalSize + 1;

  expect(THEME_LIGHT.icon.size.md).toBe(originalSize);
  expect(resolveThemeTokens().icon.size.md).toBe(originalSize);
});
