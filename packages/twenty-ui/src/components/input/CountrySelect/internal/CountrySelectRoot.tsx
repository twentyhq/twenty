import { useControlled } from '@base-ui/utils/useControlled';
import { isNonEmptyArray, isNull } from '@sniptt/guards';
import { useId, useMemo } from 'react';

import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';
import { normalizeSearchText } from '@ui/utilities/utils/normalizeSearchText';

import { type CountrySelectRootProps } from '../types/CountrySelectRootProps';
import { type PreparedCountryChoice } from './PreparedCountryChoice';
import { CountrySelectContext } from './CountrySelectContext';
import { getCountrySelectionValue } from './getCountrySelectionValue';

export const CountrySelectRoot = ({
  countries,
  value: controlledValue,
  defaultValue = null,
  onValueChange,
  disabled = false,
  noCountryLabel = doNotTranslate('No country'),
  children,
}: CountrySelectRootProps) => {
  const selectionGroupId = useId();
  const [value, setValue] = useControlled({
    controlled: controlledValue,
    default: defaultValue,
    name: doNotTranslate('CountrySelect'),
    state: 'value',
  });
  const preparedCountries = useMemo<PreparedCountryChoice[]>(
    () =>
      countries.map((country) => ({
        ...country,
        selectionValue: getCountrySelectionValue(country.value),
        searchText: normalizeSearchText(country.label),
      })),
    [countries],
  );
  const countriesByValue = useMemo(
    () => new Map(preparedCountries.map((country) => [country.value, country])),
    [preparedCountries],
  );
  const isDisabled = disabled || !isNonEmptyArray(preparedCountries);

  return (
    <CountrySelectContext.Provider
      value={{
        countries: preparedCountries,
        selectedCountry: isNull(value)
          ? undefined
          : countriesByValue.get(value),
        value,
        disabled: isDisabled,
        noCountryLabel,
        selectionGroupId,
        changeValue: (nextValue, eventDetails) => {
          if (isDisabled) {
            eventDetails.cancel();
            return;
          }

          onValueChange?.(nextValue, eventDetails);

          if (!eventDetails.isCanceled) {
            setValue(nextValue);
          }
        },
      }}
    >
      {children}
    </CountrySelectContext.Provider>
  );
};
