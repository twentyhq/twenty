import { type InputProps } from '../src/primitives/input/Input/types/InputProps';

export const INPUT_PROP_DESCRIPTIONS = {
  size: 'Visual size. Explicit input size takes precedence over the InputGroup default, then md applies. Group layout still sets the surrounding height.',
  ref: 'Ref to the native input element.',
  render:
    'Composes the native input with a custom element or render callback. Forward the supplied props and ref to an input.',
  onValueChange:
    'Receives the next string value and Base UI details, including the native event, reason and cancellation methods.',
} satisfies Partial<Record<keyof InputProps, string>>;
