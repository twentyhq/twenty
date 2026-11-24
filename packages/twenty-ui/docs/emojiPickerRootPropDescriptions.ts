import { type EmojiPickerRootProps } from '../src/components/input/EmojiPicker/types/EmojiPickerRootProps';

export const EMOJI_PICKER_ROOT_PROP_DESCRIPTIONS = {
  emojibaseUrl:
    'Base URL for caller-hosted Emojibase data. The picker loads data.json and messages.json from the selected locale directory.',
  locale:
    'Emoji catalogue locale. The caller must host its data and message files. Interface labels are supplied separately.',
  onEmojiSelect:
    'Called with the selected Unicode emoji string. The application owns the selected value and persistence.',
  children:
    'EmojiPicker parts, rendered inside a Dropdown.Root of type picker.',
} satisfies Partial<Record<keyof EmojiPickerRootProps, string>>;
