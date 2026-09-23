import { type ButtonProps } from '@ui/primitives/input/Button/types/ButtonProps';
import { type TabsTabProps } from '@ui/primitives/navigation/Tabs/types/TabsTabProps';

export type TabButtonProps = Omit<
  ButtonProps,
  | 'variant'
  | 'color'
  | 'fullWidth'
  | 'loading'
  | 'elevated'
  | 'hotkeys'
  | 'soon'
  | 'soonLabel'
> &
  Pick<TabsTabProps, 'badge'> & {
    active?: boolean;
  };
