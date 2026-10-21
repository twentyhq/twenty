import { type DropdownTriggerProps } from '@ui/components/navigation/Dropdown/types/DropdownTriggerProps';

export type PhoneCountryPickerTriggerProps = Omit<
  DropdownTriggerProps,
  'aria-label'
> & {
  'aria-label': string;
};
