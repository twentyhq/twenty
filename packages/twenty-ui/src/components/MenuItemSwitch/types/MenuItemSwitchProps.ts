import { type IconComponent } from '@ui/icon';
import { type SwitchSize } from '@ui/primitives/input/Switch/types/SwitchSize';

export type MenuItemSwitchProps = {
  focused?: boolean;
  LeftIcon?: IconComponent;
  withIconContainer?: boolean;
  checked: boolean;
  text: string;
  className?: string;
  onCheckedChange?: (checked: boolean) => void;
  size?: SwitchSize;
  disabled?: boolean;
};
