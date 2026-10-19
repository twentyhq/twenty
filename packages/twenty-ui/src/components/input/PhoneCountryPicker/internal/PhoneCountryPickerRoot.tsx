import { isUndefined } from '@sniptt/guards';
import { useState } from 'react';

import { normalizeSearchText } from '@ui/utilities/utils/normalizeSearchText';

import { type PhoneCountryPickerRootProps } from '../types/PhoneCountryPickerRootProps';
import { PhoneCountryPickerContext } from './PhoneCountryPickerContext';

export const PhoneCountryPickerRoot = ({
  children,
  countries,
  value: controlledValue,
  defaultValue = null,
  onValueChange,
  disabled = false,
  closeOnSelect = true,
}: PhoneCountryPickerRootProps) => {
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const value = isUndefined(controlledValue)
    ? uncontrolledValue
    : controlledValue;
  const preparedCountries = countries.map((country) => ({
    ...country,
    searchLabel: normalizeSearchText(country.label),
    searchValue: normalizeSearchText(country.value),
  }));

  return (
    <PhoneCountryPickerContext.Provider
      value={{
        countries: preparedCountries,
        value,
        disabled,
        closeOnSelect,
        onValueChange: (nextValue, eventDetails) => {
          onValueChange?.(nextValue, eventDetails);

          if (!eventDetails.isCanceled && isUndefined(controlledValue)) {
            setUncontrolledValue(nextValue);
          }
        },
      }}
    >
      {children}
    </PhoneCountryPickerContext.Provider>
  );
};
