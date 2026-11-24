import { type DropdownContentProps } from '@ui/components/navigation/Dropdown/types/DropdownContentProps';
import { type DropdownRootProps } from '@ui/components/navigation/Dropdown/types/DropdownRootProps';
import { type DropdownTriggerProps } from '@ui/components/navigation/Dropdown/types/DropdownTriggerProps';

import { type EmojiPickerOptionsProps } from './EmojiPickerOptionsProps';
import { type EmojiPickerRootProps } from './EmojiPickerRootProps';

export type EmojiPickerProps = Omit<EmojiPickerRootProps, 'children'> &
  EmojiPickerOptionsProps &
  Pick<DropdownRootProps, 'open' | 'defaultOpen' | 'onOpenChange'> & {
    triggerProps?: DropdownTriggerProps;
    contentProps?: Omit<DropdownContentProps, 'children'>;
  };
