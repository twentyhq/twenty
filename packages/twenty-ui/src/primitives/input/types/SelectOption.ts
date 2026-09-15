import { type IconComponent } from '@ui/icon';
import { type ThemeColor } from '@ui/theme';
import { type ReactNode } from 'react';

export type SelectOption<
  Value extends string | number | boolean | null = string,
> = {
  Icon?: IconComponent | null;
  LeftComponent?: ReactNode;
  iconThemeColor?: ThemeColor | null;
  label: string;
  fullLabel?: string;
  value: Value;
  disabled?: boolean;
  color?: ThemeColor | 'transparent';
  contextualText?: string;
  searchKeywords?: string;
};
