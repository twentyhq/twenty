import { type CountrySelectProps } from '../src/components/input/CountrySelect/types/CountrySelectProps';

export const COUNTRY_SELECT_PROP_DESCRIPTIONS = {
  countries:
    'Prepared country choices with unique non-empty values, display labels, and optional decorative flags.',
  value: 'Selected choice value. An empty string selects no country.',
  onValueChange:
    'Reports the selected choice value, or an empty string when no country is selected.',
  label: 'Optional visible label that names the trigger and the popup.',
  searchLabel: 'Placeholder and accessible name of the search input.',
  noCountryLabel:
    'Text of the no-country choice, also displayed when no country is selected.',
  noResultsLabel: 'Text displayed when no choice matches the search.',
  open: 'Controls whether the country popup is open.',
  onOpenChange: 'Reports popup opening and closing.',
  popupProps:
    'Dropdown popup positioning, portal, focus, and event options for host integration.',
  id: 'ID of the trigger. Generated when omitted.',
  className: 'Class applied to the trigger.',
  disabled:
    'Prevents opening and selection while the trigger stays focusable. An empty country list is also disabled.',
  render:
    'Replaces the trigger element while preserving its behavior and props.',
  ref: 'Ref to the trigger element.',
} satisfies Partial<Record<keyof CountrySelectProps, string>>;
