import { type DropdownContentProps } from '@ui/components/navigation/Dropdown/types/DropdownContentProps';
import { type DropdownTriggerProps } from '@ui/components/navigation/Dropdown/types/DropdownTriggerProps';

import { type CountryChoice } from './CountryChoice';

export type CountrySelectProps = Omit<
  DropdownTriggerProps,
  | 'children'
  | 'value'
  | 'defaultValue'
  | 'onChange'
  | 'openOnHover'
  | 'delay'
  | 'closeDelay'
> & {
  countries: readonly CountryChoice[];
  value: string;
  onValueChange: (value: string) => void;
  label?: string;
  searchLabel?: string;
  noCountryLabel?: string;
  noResultsLabel?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  popupProps?: Omit<
    DropdownContentProps,
    'children' | 'aria-label' | 'aria-labelledby' | 'keepMounted'
  >;
};
