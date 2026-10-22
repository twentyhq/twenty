import { type ReactionButtonProps } from '../src/components/input/ReactionButton/types/ReactionButtonProps';

export const REACTION_BUTTON_PROP_DESCRIPTIONS = {
  emoji: 'Emoji displayed beside the count. Hidden from assistive technology.',
  count:
    'Displayed count. Pass a string for localized or abbreviated formatting. Hidden from assistive technology.',
  pressed:
    'Controlled selection state. Sets the selected appearance and `aria-pressed`.',
  onPressedChange:
    'Requests the next pressed state after activation. The caller updates `pressed` and `count`.',
  loading:
    'Shows a loading indicator, sets `aria-busy`, and prevents activation without changing the supplied pressed state.',
  disabled: 'Disables the native button and prevents activation.',
  onClick:
    'Native click handler called before `onPressedChange`. Calling `preventDefault()` cancels the change request.',
  'aria-label':
    'Accessible name describing the reaction. Required unless `aria-labelledby` supplies the name.',
  'aria-labelledby':
    'ID of the element supplying the accessible name. Can be used instead of `aria-label`.',
  title: 'Optional native tooltip text supplied by the caller.',
} satisfies Partial<Record<keyof ReactionButtonProps, string>>;
