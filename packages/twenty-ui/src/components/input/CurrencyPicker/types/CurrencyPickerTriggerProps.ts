import { type DropdownTriggerProps } from '@ui/components/navigation/Dropdown/types/DropdownTriggerProps';

export type CurrencyPickerTriggerProps = Omit<
  DropdownTriggerProps,
  | 'children'
  | 'value'
  | 'openOnHover'
  | 'delay'
  | 'closeDelay'
  | 'handle'
  | 'payload'
> & {
  value: string;
};
