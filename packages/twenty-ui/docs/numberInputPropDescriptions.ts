import { type ComponentProps } from 'react';

import { type NumberInput } from '../src/primitives/input/NumberInput/NumberInput';

export const NUMBER_INPUT_PROP_DESCRIPTIONS = {
  value: 'Controlled numeric value. Use null for an empty field.',
  defaultValue: 'Initial number when the field owns its value.',
  onValueChange:
    'Called with the next number or null and event details when the numeric value changes. Clearing reports null; incomplete text does not report a number.',
  min: 'Inclusive minimum for numeric changes.',
  max: 'Inclusive maximum for numeric changes.',
  step: 'Amount added or subtracted by the buttons and arrow keys.',
  showButtons: 'Shows the decrement and increment buttons.',
  decrementLabel: 'Accessible name for the decrement button.',
  incrementLabel: 'Accessible name for the increment button.',
  disabled: 'Disables the input and both buttons, and omits the form value.',
  readOnly: 'Prevents numeric changes while keeping the input focusable.',
  required: 'Requires a numeric value for native form submission.',
  name: 'Name of the numeric value submitted with a form.',
  form: 'ID of the form that owns the submitted numeric value.',
  id: 'ID of the visible input. Generated when omitted.',
  ref: 'Ref to the visible input element.',
  className: 'Class applied to the visible input.',
  style: 'Inline styles applied to the visible input.',
} satisfies Partial<Record<keyof ComponentProps<typeof NumberInput>, string>>;
