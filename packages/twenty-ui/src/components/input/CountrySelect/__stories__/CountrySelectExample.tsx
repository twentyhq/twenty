import { useState } from 'react';

import { CountrySelect } from '../CountrySelect';
import { type CountrySelectProps } from '../types/CountrySelectProps';
import { COUNTRY_CHOICES } from './COUNTRY_CHOICES';

const StatefulCountrySelectExample = ({
  value: initialValue = 'FR',
  onValueChange,
  ...props
}: Partial<CountrySelectProps>) => {
  const [value, setValue] = useState(initialValue);

  return (
    <CountrySelect
      countries={COUNTRY_CHOICES}
      label="Country"
      searchLabel="Search countries"
      noCountryLabel="No country"
      noResultsLabel="No countries found"
      {...props}
      value={value}
      onValueChange={(nextValue, eventDetails) => {
        onValueChange?.(nextValue, eventDetails);
        if (!eventDetails.isCanceled) {
          setValue(nextValue);
        }
      }}
    />
  );
};

export const CountrySelectExample = (props: Partial<CountrySelectProps>) => (
  <StatefulCountrySelectExample key={props.value ?? 'empty'} {...props} />
);
