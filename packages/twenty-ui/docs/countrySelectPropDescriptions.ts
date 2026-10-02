import { type CountrySelectProps } from '../src/components/input/CountrySelect/types/CountrySelectProps';

export const COUNTRY_SELECT_PROP_DESCRIPTIONS = {
  countries:
    'Prepared country choices with unique non-empty values, display labels, and optional decorative flags.',
  value: 'Selected choice value. An empty string selects no country.',
  onValueChange:
    'Reports the selected choice value, or an empty string when no country is selected.',
  label: 'Optional visible label associated with the trigger.',
  labels: 'Host-provided search, no-country, and empty-result text.',
  open: 'Controls whether the country popup is open.',
  onOpenChange: 'Reports popup opening and closing.',
  popupProps:
    'Dropdown popup positioning, portal, focus, and event options for host integration.',
  className: 'Class applied to the trigger.',
  disabled:
    'Disables opening and selection. An empty country list is also disabled.',
  render:
    'Replaces the trigger element while preserving its behavior and props.',
  ref: 'Ref to the trigger element.',
} satisfies Partial<Record<keyof CountrySelectProps, string>>;
