import { type DropdownContentProps } from '@ui/components/navigation/Dropdown/types/DropdownContentProps';
import { type DropdownRootProps } from '@ui/components/navigation/Dropdown/types/DropdownRootProps';

import { type CurrencyPickerOptionsProps } from './CurrencyPickerOptionsProps';
import { type CurrencyPickerRootProps } from './CurrencyPickerRootProps';
import { type CurrencyPickerTriggerProps } from './CurrencyPickerTriggerProps';

export type CurrencyPickerProps = Omit<CurrencyPickerRootProps, 'children'> &
  CurrencyPickerTriggerProps &
  Pick<
    DropdownRootProps,
    | 'open'
    | 'defaultOpen'
    | 'onOpenChange'
    | 'onEscapeKeyDown'
    | 'onInteractOutside'
  > & {
    triggerProps?: CurrencyPickerTriggerProps;
    contentProps?: Omit<DropdownContentProps, 'children'>;
    optionsProps?: CurrencyPickerOptionsProps;
  };
