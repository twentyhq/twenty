import { useState } from 'react';

import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';
import { Text } from '@ui/primitives/typography/Text/Text';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { PhoneCountryPicker } from '../PhoneCountryPicker';
import { type PhoneCountryOption } from '../types/PhoneCountryOption';
import { PHONE_COUNTRY_OPTIONS } from './phoneCountryOptions';

type PhoneCountryPickerExampleProps = {
  initialValue?: string;
  disabled?: boolean;
  label?: string;
  countries?: readonly PhoneCountryOption[];
  searchLabel?: string;
  emptyLabel?: string;
  onValueChange?: (value: string) => void;
};

export const PhoneCountryPickerExample = ({
  initialValue = 'FR',
  disabled = false,
  label = 'Phone country',
  countries = PHONE_COUNTRY_OPTIONS,
  searchLabel,
  emptyLabel,
  onValueChange,
}: PhoneCountryPickerExampleProps) => {
  const [value, setValue] = useState(initialValue);
  const country = countries.find((choice) => choice.value === value);

  return (
    <Text style={{ display: 'grid', gap: 8, justifyItems: 'start' }}>
      <Text>{label}</Text>
      <Dropdown.Root type="picker">
        <PhoneCountryPicker.Trigger
          aria-label={label}
          country={country}
          disabled={disabled}
        />
        <Dropdown.Content aria-label={`${label} choices`} width={280}>
          <PhoneCountryPicker.Options
            countries={countries}
            value={value}
            onValueChange={(nextValue) => {
              setValue(nextValue);
              onValueChange?.(nextValue);
            }}
            searchLabel={searchLabel}
            emptyLabel={emptyLabel}
          />
        </Dropdown.Content>
      </Dropdown.Root>
      <Text role="status" aria-label={`${label} selection`}>
        {isDefined(country)
          ? `${country.label} (+${country.callingCode})`
          : 'International'}
      </Text>
    </Text>
  );
};
