import { type InputProps } from '../src/primitives/input/Input/types/InputProps';

export const INPUT_PROP_DESCRIPTIONS = {
  variant:
    'default keeps the field frame. plain removes fill, border, radius and padding and uses natural height. Its outline follows native :focus-visible, including pointer focus or autofocus on text inputs; invalid state uses a danger outline. InputGroup always owns the grouped frame.',
  size: 'Visual size. Explicit input size takes precedence over the InputGroup default, then md applies. Group layout still sets the surrounding height.',
  textAlign:
    'Aligns text to the logical start or end of the input. Follows the text direction.',
  hasFocusRing:
    'Set false to hide the focus border or outline while keeping errors visible. Defaults to true. InputGroup controls grouped focus styling.',
  ref: 'Ref to the native input element.',
  render:
    'Composes the native input with a custom element or render callback. Forward the supplied props and ref to an input.',
  onValueChange:
    'Receives the next string value and Base UI details, including the native event, reason and cancellation methods.',
} satisfies Partial<Record<keyof InputProps, string>>;
