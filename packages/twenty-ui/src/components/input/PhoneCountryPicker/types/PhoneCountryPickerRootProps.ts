import { type ReactNode } from 'react';

import { type DropdownSelectionGroupChangeEventDetails } from '@ui/components/navigation/Dropdown/types/DropdownSelectionGroupChangeEventDetails';

import { type PhoneCountryOption } from './PhoneCountryOption';

export type PhoneCountryPickerRootProps = {
  children: ReactNode;
  countries: readonly PhoneCountryOption[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (
    value: string | null,
    eventDetails: DropdownSelectionGroupChangeEventDetails,
  ) => void;
  disabled?: boolean;
  closeOnSelect?: boolean;
};
