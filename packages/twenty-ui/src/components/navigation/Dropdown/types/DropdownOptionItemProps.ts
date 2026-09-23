import { type DropdownActionItemProps } from './DropdownActionItemProps';

export type DropdownOptionItemProps = Omit<
  DropdownActionItemProps,
  'page' | 'closeOnClick' | 'onSelect'
> & {
  selected: boolean;
  onSelect?: () => void;
  closeOnSelect?: boolean;
};
