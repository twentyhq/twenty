import { type ColorScheme } from '@ui/primitives/input/types/ColorScheme';

export type ColorSchemePickerProps = {
  value: ColorScheme;
  className?: string;
  onChange: (value: ColorScheme) => void;
  lightLabel: string;
  darkLabel: string;
  systemLabel: string;
};
