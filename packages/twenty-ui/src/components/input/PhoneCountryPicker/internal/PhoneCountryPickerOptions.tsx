import { isNonEmptyArray } from '@sniptt/guards';
import { useState } from 'react';

import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';
import { OverflowingTextWithTooltip } from '@ui/primitives/typography/OverflowingTextWithTooltip/OverflowingTextWithTooltip';
import { normalizeSearchText } from '@ui/utilities/utils/normalizeSearchText';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../PhoneCountryPicker.module.scss';
import { type PhoneCountryPickerOptionsProps } from '../types/PhoneCountryPickerOptionsProps';
import { getPhoneCountryOptionLabel } from './getPhoneCountryOptionLabel';

export const PhoneCountryPickerOptions = ({
  countries,
  value,
  onValueChange,
  searchLabel = 'Search',
  emptyLabel = 'No results',
}: PhoneCountryPickerOptionsProps) => {
  const [search, setSearch] = useState('');
  const normalizedSearch = normalizeSearchText(search);
  const matchingCountries = countries.filter(({ label }) =>
    normalizeSearchText(label).includes(normalizedSearch),
  );
  const selectedCountry = matchingCountries.find(
    (country) => country.value === value,
  );
  const orderedCountries = isDefined(selectedCountry)
    ? [
        selectedCountry,
        ...matchingCountries.filter((country) => country.value !== value),
      ]
    : matchingCountries;

  return (
    <>
      <Dropdown.Search
        value={search}
        onValueChange={setSearch}
        placeholder={searchLabel}
        aria-label={searchLabel}
      />
      <Dropdown.Separator />
      <Dropdown.Section scrollable>
        {!isNonEmptyArray(orderedCountries) && (
          <Dropdown.Empty>{emptyLabel}</Dropdown.Empty>
        )}
        {orderedCountries.map((country) => {
          const optionLabel = getPhoneCountryOptionLabel(country);

          return (
            <Dropdown.OptionItem
              key={country.value}
              aria-label={optionLabel}
              selected={country.value === value}
              onSelect={() => onValueChange(country.value)}
              startIcon={
                <span className={styles.optionFlag} aria-hidden>
                  {country.flag}
                </span>
              }
            >
              <OverflowingTextWithTooltip
                text={
                  <>
                    {country.label} (<bdi dir="ltr">+{country.callingCode}</bdi>
                    )
                  </>
                }
                tooltipContent={optionLabel}
              />
            </Dropdown.OptionItem>
          );
        })}
      </Dropdown.Section>
    </>
  );
};
