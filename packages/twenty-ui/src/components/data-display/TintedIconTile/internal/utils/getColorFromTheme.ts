import { type ThemeColor, themeCssVariables } from '@ui/theme';

export const getColorFromTheme = (
  themeColor: ThemeColor,
  shade: number,
): string => {
  const colorMap = themeCssVariables.color as unknown as Record<string, string>;
  const tagText = themeCssVariables.tag.text as unknown as Record<
    ThemeColor,
    string
  >;
  const key = `${themeColor}${shade}`;
  return colorMap[key] ?? tagText[themeColor];
};
