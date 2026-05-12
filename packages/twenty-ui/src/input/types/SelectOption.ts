import { type IconComponent } from '@ui/display';
import { type ThemeColor } from '@ui/theme';

export type SelectOption<
  Value extends string | number | boolean | null = string,
> = {
  Icon?: IconComponent | null;
  iconThemeColor?: ThemeColor | null;
  label: string;
  fullLabel?: string;
  value: Value;
  disabled?: boolean;
  color?: ThemeColor | 'transparent';
  contextualText?: string;
};
