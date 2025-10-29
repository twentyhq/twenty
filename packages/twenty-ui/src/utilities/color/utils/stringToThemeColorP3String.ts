import { MAIN_COLOR_NAMES, type ThemeColor, type ThemeType } from '@ui/theme';

export const stringToThemeColor = (string: string): ThemeColor => {
  let hash = 0;
  for (let i = 0; i < string.length; i++) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }

  const colorIndex = Math.abs(hash) % MAIN_COLOR_NAMES.length;
  return MAIN_COLOR_NAMES[colorIndex];
};

export const stringToThemeColorP3String = ({
  string,
  theme,
  variant = 9,
}: {
  string: string;
  theme: ThemeType;
  variant: number;
}): string => {
  if (variant < 1 || variant > 12) {
    throw new Error('Variant must be between 1 and 12');
  }

  const colorName = stringToThemeColor(string);
  const colorNameWithVariant =
    `${colorName}${variant}` as keyof typeof theme.color;

  return theme.color[colorNameWithVariant] as string;
};
