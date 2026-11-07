import { type ThemeType } from '@ui/theme';

export type TypographyColor = keyof Pick<
  ThemeType['font']['color'],
  'primary' | 'secondary' | 'tertiary' | 'light'
>;
