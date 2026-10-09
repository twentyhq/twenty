import { type DropdownActionItemProps } from './DropdownActionItemProps';

export type DropdownSubmenuTriggerProps = Omit<
  DropdownActionItemProps,
  'page' | 'closeOnClick' | 'actions' | 'actionsVisibility'
> & {
  openOnHover?: boolean;
  delay?: number;
  closeDelay?: number;
};
