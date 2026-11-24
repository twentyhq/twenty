import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';

import { EmojiPickerOptions } from './internal/EmojiPickerOptions';
import { EmojiPickerRoot } from './internal/EmojiPickerRoot';
import { EmojiPickerShorthand } from './internal/EmojiPickerShorthand';

export const EmojiPicker = Object.assign(EmojiPickerShorthand, {
  Root: EmojiPickerRoot,
  Trigger: Dropdown.Trigger,
  Options: EmojiPickerOptions,
});
