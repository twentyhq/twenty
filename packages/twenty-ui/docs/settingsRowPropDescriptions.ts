import { type SettingsRowProps } from '../src/components/settings/SettingsRow/types/SettingsRowProps';

export const SETTINGS_ROW_PROP_DESCRIPTIONS = {
  children:
    'Visible label and default accessible name of the switch. Use non-interactive node content.',
  startElement: 'Non-interactive node content before the label.',
  description:
    'Non-interactive supporting node content, used as the default accessible description of the switch.',
  focused: 'Applies the highlighted row style without moving keyboard focus.',
  switchProps:
    'Complete Switch configuration, including checked state, event details, native form integration, control ref, inputRef and render composition. Size defaults to sm.',
  render:
    'Customizes the outer native label. Preserve a label element and forward its props to retain control association.',
  ref: 'Targets the outer label. Use switchProps.ref for the switch root and switchProps.inputRef for its hidden checkbox.',
} satisfies Partial<Record<keyof SettingsRowProps, string>>;
