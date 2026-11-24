import { type EmojiPickerOptionsProps } from '../src/components/input/EmojiPicker/types/EmojiPickerOptionsProps';
import { EMOJI_PICKER_ROOT_PROP_DESCRIPTIONS } from './emojiPickerRootPropDescriptions';

export const EMOJI_PICKER_OPTIONS_PROP_DESCRIPTIONS = {
  searchLabel:
    'Accessible name for the Dropdown.Search input. Also supplies its placeholder unless searchPlaceholder is set.',
  searchPlaceholder: 'Optional placeholder overriding the search label.',
  loadingLabel:
    'Caller-supplied message displayed while emoji data or more emojis load.',
  emptyLabel:
    'Caller-supplied message displayed when no emoji matches the search.',
  autoFocus: 'Focuses the search input when the options mount.',
} satisfies Partial<Record<keyof EmojiPickerOptionsProps, string>>;

export const EMOJI_PICKER_PART_PROP_DESCRIPTIONS = {
  Root: EMOJI_PICKER_ROOT_PROP_DESCRIPTIONS,
  Options: EMOJI_PICKER_OPTIONS_PROP_DESCRIPTIONS,
};
