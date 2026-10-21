import { type ReactNode } from 'react';

import { type DropdownTriggerProps } from '@ui/components/navigation/Dropdown/types/DropdownTriggerProps';

export type CurrencyPickerTriggerProps = Omit<
  DropdownTriggerProps,
  'value' | 'openOnHover' | 'delay' | 'closeDelay'
> & {
  placeholder?: ReactNode;
};
