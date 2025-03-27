import { IconComponent } from '@ui/display';
import { ThemeColor } from '@ui/theme';

export type SelectOption<
  Value extends string | number | boolean | null = string,
> = {
  Icon?: IconComponent | null;
  label: string;
  value: Value;
  disabled?: boolean;
  color?: ThemeColor | 'transparent';
};
