import { type TextareaProps } from '../src/primitives/input/Textarea/types/TextareaProps';

export const TEXTAREA_PROP_DESCRIPTIONS = {
  ref: 'Ref to the native textarea element.',
  render:
    'Composes the native textarea with a custom element or callback receiving textarea props and Field state. Forward the supplied props and ref to a textarea.',
  onValueChange:
    'Receives the next string value and Base UI details, including the native event, reason and cancellation methods.',
  autoResize:
    'Measures committed controlled values or uncontrolled edits, form resets, row and size changes, and width changes. Overrides blockSize while enabled.',
  maxRows:
    'Caps automatic height growth. Content beyond this row limit scrolls.',
} satisfies Partial<Record<keyof TextareaProps, string>>;
