import { type EmojiPickerProps } from '../src/components/input/EmojiPicker/types/EmojiPickerProps';
import { EMOJI_PICKER_OPTIONS_PROP_DESCRIPTIONS } from './emojiPickerPartPropDescriptions';
import { EMOJI_PICKER_ROOT_PROP_DESCRIPTIONS } from './emojiPickerRootPropDescriptions';

export const EMOJI_PICKER_PROP_DESCRIPTIONS = {
  ...EMOJI_PICKER_ROOT_PROP_DESCRIPTIONS,
  ...EMOJI_PICKER_OPTIONS_PROP_DESCRIPTIONS,
  triggerProps:
    'Props for Dropdown.Trigger, including render for the button that opens the picker.',
  contentProps:
    'Dropdown popup props, including placement, width, and accessible attributes.',
  open: 'Whether the popup is open. Use with onOpenChange to control it.',
  defaultOpen: 'Whether the popup is initially open when uncontrolled.',
  onOpenChange:
    'Called with the next open state when the popup opens or closes.',
} satisfies Partial<Record<keyof EmojiPickerProps, string>>;
