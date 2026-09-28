import { type DropdownActionItemProps } from './DropdownActionItemProps';

export type DropdownOptionItemProps = Omit<
  DropdownActionItemProps,
  'page' | 'closeOnClick' | 'onSelect'
> & {
  selected: boolean;
  indicator?: 'check' | 'checkbox' | 'none';
  onSelect?: () => void;
  closeOnSelect?: boolean;
};
