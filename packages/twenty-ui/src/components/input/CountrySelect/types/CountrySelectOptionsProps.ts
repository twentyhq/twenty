import { type useRender } from '@base-ui/react/use-render';

import { type DropdownSearchProps } from '@ui/components/navigation/Dropdown/types/DropdownSearchProps';
import { type DropdownSelectionGroupProps } from '@ui/components/navigation/Dropdown/types/DropdownSelectionGroupProps';

import { type CountrySelectOptionsState } from './CountrySelectOptionsState';

export type CountrySelectOptionsProps = Omit<
  DropdownSelectionGroupProps,
  | 'id'
  | 'children'
  | 'multiple'
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'render'
> & {
  render?: useRender.ComponentProps<'div', CountrySelectOptionsState>['render'];
  searchLabel?: string;
  noResultsLabel?: string;
  searchProps?: Omit<
    DropdownSearchProps,
    'value' | 'defaultValue' | 'onValueChange'
  >;
};
