import { type DropdownTriggerProps } from '@ui/components/navigation/Dropdown/types/DropdownTriggerProps';

import { type PhoneCountryOption } from './PhoneCountryOption';

export type PhoneCountryPickerTriggerProps = Omit<
  DropdownTriggerProps,
  'children' | 'render' | 'nativeButton' | 'aria-label'
> & {
  country?: PhoneCountryOption;
  'aria-label': string;
};
