import { type SettingsRowProps } from '../src/components/settings/SettingsRow/types/SettingsRowProps';

export const SETTINGS_ROW_PROP_DESCRIPTIONS = {
  children:
    'Visible label and default accessible name of the switch. Use non-interactive node content.',
  startElement: 'Non-interactive node content before the label.',
  description:
    'Non-interactive supporting node content, used as the default accessible description of the switch.',
  focused: 'Applies the highlighted row style without moving keyboard focus.',
  labelRender:
    'Customizes the outer native label with its complete composed row children. Preserve a label element and forward its props to retain control association.',
  labelRef: 'Targets the outer native label.',
  id: 'Identifies the associated checkbox, or the visible root with nativeButton. The label association follows this ID.',
  size: 'Visual size of the switch. Defaults to sm.',
  onClick: 'Native click handler for the visible Switch root.',
  onCheckedChange:
    'Receives the next checked value and Base UI event details. Controlled callers own accepted state updates; cancellation prevents a change.',
  className:
    'Customizes the visible Switch root and accepts a Switch state callback.',
  style:
    'Customizes the visible Switch root and accepts a Switch state callback.',
  render:
    'Customizes the visible Switch root with control props and Switch state. Use nativeButton when composing a button.',
  ref: 'Targets the visible Switch root, which defaults to a span.',
  inputRef: 'Targets the underlying native checkbox.',
} satisfies Partial<Record<keyof SettingsRowProps, string>>;
