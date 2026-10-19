import { type ReactNode } from 'react';

import { type DropdownSelectionGroupChangeEventDetails } from '@ui/components/navigation/Dropdown/types/DropdownSelectionGroupChangeEventDetails';

import { type CountryChoice } from './CountryChoice';

export type CountrySelectRootProps = {
  countries: readonly CountryChoice[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (
    value: string | null,
    eventDetails: DropdownSelectionGroupChangeEventDetails,
  ) => void;
  disabled?: boolean;
  noCountryLabel?: string;
  children: ReactNode;
};
