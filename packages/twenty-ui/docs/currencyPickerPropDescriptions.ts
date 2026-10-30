import { type CurrencyPickerProps } from '../src/components/input/CurrencyPicker/types/CurrencyPickerProps';
import { CURRENCY_PICKER_ROOT_PROP_DESCRIPTIONS } from './currencyPickerRootPropDescriptions';
import { CURRENCY_PICKER_TRIGGER_PROP_DESCRIPTIONS } from './currencyPickerTriggerPropDescriptions';

export const CURRENCY_PICKER_PROP_DESCRIPTIONS = {
  ...CURRENCY_PICKER_ROOT_PROP_DESCRIPTIONS,
  ...CURRENCY_PICKER_TRIGGER_PROP_DESCRIPTIONS,
  disabled: 'Disables opening, search, and every currency option.',
  triggerProps:
    'Props for the trigger button, including native attributes, ref, render, placeholder, and caller-owned children. These override shorthand trigger props.',
  optionsProps:
    'Props for the options wrapper div, listLabel, and search behavior. Native input customization belongs in optionsProps.searchProps.',
  contentProps:
    'Dropdown popup props, including placement, width, and accessible attributes.',
  open: 'Whether the popup is open. Use with onOpenChange to control it.',
  defaultOpen: 'Whether the popup is initially open when uncontrolled.',
  onOpenChange:
    'Called with the next open state when the popup opens or closes.',
  onEscapeKeyDown:
    'Called before Escape closes the popup. Call event.preventDefault() to keep it open.',
  onInteractOutside:
    'Called before an outside press or Tab out closes the popup. Call event.preventDefault() to keep it open.',
} satisfies Partial<Record<keyof CurrencyPickerProps, string>>;
