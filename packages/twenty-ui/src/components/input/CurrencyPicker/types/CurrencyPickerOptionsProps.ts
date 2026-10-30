import { type useRender } from '@base-ui/react/use-render';
import { type ReactNode } from 'react';

import { type DropdownSearchProps } from '@ui/components/navigation/Dropdown/types/DropdownSearchProps';

export type CurrencyPickerOptionsProps = Omit<
  useRender.ComponentProps<'div'>,
  'children'
> & {
  disabled?: boolean;
  searchable?: boolean;
  searchLabel?: string;
  listLabel?: string;
  emptyLabel?: ReactNode;
  searchProps?: DropdownSearchProps;
};
