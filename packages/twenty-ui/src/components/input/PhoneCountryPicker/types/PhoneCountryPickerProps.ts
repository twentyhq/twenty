import { type DropdownContentProps } from '@ui/components/navigation/Dropdown/types/DropdownContentProps';
import { type DropdownRootProps } from '@ui/components/navigation/Dropdown/types/DropdownRootProps';

import { type PhoneCountryPickerOptionsProps } from './PhoneCountryPickerOptionsProps';
import { type PhoneCountryPickerRootProps } from './PhoneCountryPickerRootProps';
import { type PhoneCountryPickerTriggerProps } from './PhoneCountryPickerTriggerProps';

export type PhoneCountryPickerProps = Omit<
  PhoneCountryPickerRootProps,
  'children'
> &
  Omit<PhoneCountryPickerTriggerProps, 'value' | 'defaultValue'> & {
    dropdownProps?: Omit<DropdownRootProps, 'children' | 'type' | 'multiple'>;
    contentProps?: Omit<DropdownContentProps, 'children'>;
    optionsProps?: PhoneCountryPickerOptionsProps;
  };
