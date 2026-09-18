import { type SettingsRowProps } from '../src/components/SettingsRow/types/SettingsRowProps';

export const SETTINGS_ROW_PROP_DESCRIPTIONS = {
  children:
    'Visible label and accessible name of the switch. Use non-interactive content.',
  startIcon: 'Decorative content before the label.',
  description:
    'Non-interactive supporting content, associated with the switch as its accessible description.',
  focused: 'Applies the highlighted row style without moving keyboard focus.',
  checked: 'Controlled checked state of the switch.',
  defaultChecked: 'Initial checked state when uncontrolled.',
  onCheckedChange:
    'Called when the switch value changes, with the next checked state and Base UI event details.',
  disabled: 'Disables both the row and its switch.',
  readOnly: 'Keeps the switch focusable while preventing changes.',
  size: 'Visual size of the switch. The row height stays the same.',
  name: 'Name of the hidden checkbox used in form submission.',
  value: 'Value submitted when the switch is checked.',
  required: 'Requires the switch to be checked for form submission.',
} satisfies Partial<Record<keyof SettingsRowProps, string>>;
