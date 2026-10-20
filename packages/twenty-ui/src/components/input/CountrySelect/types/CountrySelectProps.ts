import { type DropdownContentProps } from '@ui/components/navigation/Dropdown/types/DropdownContentProps';
import { type DropdownRootProps } from '@ui/components/navigation/Dropdown/types/DropdownRootProps';

import { type CountrySelectRootProps } from './CountrySelectRootProps';
import { type CountrySelectTriggerProps } from './CountrySelectTriggerProps';
import { type CountrySelectOptionsProps } from './CountrySelectOptionsProps';

export type CountrySelectProps = Omit<CountrySelectRootProps, 'children'> &
  CountrySelectTriggerProps &
  Omit<DropdownRootProps, 'children' | 'type' | 'multiple'> &
  Pick<
    CountrySelectOptionsProps,
    'searchLabel' | 'noResultsLabel' | 'searchProps' | 'closeOnSelect'
  > & {
    popupProps?: Omit<DropdownContentProps, 'children'>;
    optionsProps?: Omit<
      CountrySelectOptionsProps,
      'searchLabel' | 'noResultsLabel' | 'searchProps' | 'closeOnSelect'
    >;
  };
