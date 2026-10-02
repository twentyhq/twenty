import { useState } from 'react';

import { CountrySelect } from '../CountrySelect';
import { type CountrySelectProps } from '../types/CountrySelectProps';
import { COUNTRY_CHOICES } from './COUNTRY_CHOICES';

export const CountrySelectExample = ({
  value: initialValue = 'France',
  onValueChange,
  ...props
}: Partial<CountrySelectProps>) => {
  const [value, setValue] = useState(initialValue);

  return (
    <CountrySelect
      countries={COUNTRY_CHOICES}
      label="Country"
      labels={{
        search: 'Search countries',
        noCountry: 'No country',
        noResults: 'No countries found',
      }}
      {...props}
      value={value}
      onValueChange={(nextValue) => {
        setValue(nextValue);
        onValueChange?.(nextValue);
      }}
    />
  );
};
