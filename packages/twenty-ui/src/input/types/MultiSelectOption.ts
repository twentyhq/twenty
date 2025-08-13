import { type IconComponent } from '@ui/display';
import { type ThemeColor } from '@ui/theme';

export type MultiSelectOption<T> = {
  Icon?: IconComponent | null;
  label: string;
  value: T;
  disabled?: boolean;
  color?: ThemeColor | 'transparent';
};
