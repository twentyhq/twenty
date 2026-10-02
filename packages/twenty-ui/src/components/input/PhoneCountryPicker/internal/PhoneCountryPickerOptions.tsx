import { isNonEmptyArray } from '@sniptt/guards';
import { useState } from 'react';

import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';
import { OverflowingTextWithTooltip } from '@ui/primitives/typography/OverflowingTextWithTooltip/OverflowingTextWithTooltip';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../PhoneCountryPicker.module.scss';
import { type PhoneCountryPickerOptionsProps } from '../types/PhoneCountryPickerOptionsProps';

export const PhoneCountryPickerOptions = ({
  countries,
  value,
  onValueChange,
  searchLabel = 'Search',
  emptyLabel = 'No results',
}: PhoneCountryPickerOptionsProps) => {
  const [search, setSearch] = useState('');
  const matchingCountries = countries.filter(({ label }) =>
    label.toLocaleLowerCase().includes(search.toLocaleLowerCase()),
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
        {orderedCountries.map((country) => (
          <Dropdown.OptionItem
            key={country.value}
            selected={country.value === value}
            onSelect={() => onValueChange(country.value)}
            startIcon={
              <span className={styles.optionFlag} aria-hidden>
                {country.flag}
              </span>
            }
          >
            <OverflowingTextWithTooltip
              text={`${country.label} (+${country.callingCode})`}
            />
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Section>
    </>
  );
};
