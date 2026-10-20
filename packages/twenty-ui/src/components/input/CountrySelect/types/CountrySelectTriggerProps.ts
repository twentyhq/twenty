import { type ComponentPropsWithRef } from 'react';

import { type DropdownTriggerProps } from '@ui/components/navigation/Dropdown/types/DropdownTriggerProps';

export type CountrySelectTriggerProps = Omit<
  DropdownTriggerProps,
  'value' | 'defaultValue' | 'onChange' | 'disabled'
> & {
  label?: string;
  wrapperProps?: Omit<ComponentPropsWithRef<'div'>, 'children'>;
};
