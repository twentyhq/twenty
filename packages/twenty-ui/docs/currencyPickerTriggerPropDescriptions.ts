import { type CurrencyPickerTriggerProps } from '../src/components/input/CurrencyPicker/types/CurrencyPickerTriggerProps';

export const CURRENCY_PICKER_TRIGGER_PROP_DESCRIPTIONS = {
  children:
    'Caller-owned trigger content that overrides the selected value display.',
  placeholder: 'Trigger content displayed when the selected value is null.',
  disabled:
    'Additionally disables the native trigger button. Root disabled state always takes precedence.',
  id: 'ID forwarded to the trigger button.',
  className: 'Class applied to the trigger button.',
  style: 'Inline styles applied to the trigger button.',
  ref: 'Ref to the trigger button, or the element composed through render.',
  render:
    'Replaces the native trigger button. Forward the supplied props and ref when rendering a custom component.',
  nativeButton:
    'Whether render composes a native button. Set false for a custom non-button element so Base UI supplies button interaction.',
} satisfies Partial<Record<keyof CurrencyPickerTriggerProps, string>>;
