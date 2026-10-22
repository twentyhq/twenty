import { type EmojiPickerProps } from '../src/components/input/EmojiPicker/types/EmojiPickerProps';

export const EMOJI_PICKER_PROP_DESCRIPTIONS = {
  emojibaseUrl:
    'Base URL for caller-hosted Emojibase data. The picker loads data.json and messages.json from the selected locale directory.',
  locale:
    'Emoji catalogue locale. The caller must host its data and message files. Interface labels are supplied separately.',
  searchLabel:
    'Accessible name for the search input. Also supplies its placeholder unless searchPlaceholder is set.',
  searchPlaceholder: 'Optional placeholder overriding the search label.',
  loadingLabel: 'Caller-supplied message displayed while emoji data loads.',
  emptyLabel:
    'Caller-supplied message displayed when no emoji matches the search.',
  onEmojiSelect:
    'Called with the selected Unicode emoji string. The application owns the selected value, persistence, and popup visibility.',
  autoFocus: 'Focuses the search input when the picker mounts.',
  className: 'Additional class name applied to the picker root div.',
  style: 'Native inline styles applied to the picker root div.',
  ref: 'Ref for the picker root div.',
} satisfies Partial<Record<keyof EmojiPickerProps, string>>;
