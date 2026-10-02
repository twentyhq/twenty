import { type ComponentProps } from 'react';

import { type PhoneCountryPicker } from '../src/components/input/PhoneCountryPicker/PhoneCountryPicker';

export const PHONE_COUNTRY_PICKER_PART_PROP_DESCRIPTIONS = {
  Trigger: {
    country:
      'Prepared country whose flag is displayed. Omit it to show a world icon.',
    'aria-label': 'Required accessible name for the country selector button.',
    disabled: 'Disables the native trigger button.',
  } satisfies Partial<
    Record<keyof ComponentProps<typeof PhoneCountryPicker.Trigger>, string>
  >,
  Options: {
    countries:
      'Prepared choices with a unique value, localized label, calling code without a plus sign, and flag node. The supplied order is preserved after the matching selected country.',
    value:
      'Selected country value. Its row appears first only while it matches the search.',
    onValueChange:
      'Called with the chosen country value. The host owns the selected country and phone number.',
    searchLabel:
      'Accessible name and placeholder of the country search field. Defaults to Search.',
    emptyLabel:
      'Status message shown when no country names match. Defaults to No results.',
  } satisfies Partial<
    Record<keyof ComponentProps<typeof PhoneCountryPicker.Options>, string>
  >,
};
