import { type DropdownActionItemProps } from './DropdownActionItemProps';

export type DropdownSubmenuTriggerProps = Omit<
  DropdownActionItemProps,
  'page' | 'closeOnClick'
> & {
  openOnHover?: boolean;
  delay?: number;
  closeDelay?: number;
};
