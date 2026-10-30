import { type DropdownActionItemProps } from './DropdownActionItemProps';
import { type useRender } from '@base-ui/react/use-render';
import { type DropdownOptionItemState } from './DropdownOptionItemState';
import { type DropdownOptionItemSelectEventDetails } from './DropdownOptionItemSelectEventDetails';

export type DropdownOptionItemProps = Omit<
  DropdownActionItemProps,
  'page' | 'closeOnClick' | 'onSelect' | 'render' | 'value'
> & {
  value?: string;
  render?: useRender.ComponentProps<
    'button',
    DropdownOptionItemState
  >['render'];
  selected?: boolean;
  indicator?: 'check' | 'checkbox' | 'none';
  onSelect?: (eventDetails: DropdownOptionItemSelectEventDetails) => void;
  closeOnSelect?: boolean;
};
