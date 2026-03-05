import { type IconComponent } from '@ui/display';
import { type ThemeColor } from '@ui/theme-constants';

export type SelectOption<
  Value extends string | number | boolean | null = string,
> = {
  Icon?: IconComponent | null;
  label: string;
  fullLabel?: string;
  value: Value;
  disabled?: boolean;
  color?: ThemeColor | 'transparent';
};
