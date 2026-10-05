import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';

import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';
import { IconCircleOff } from '@ui/icon';
import { normalizeSearchText } from '@ui/utilities/utils/normalizeSearchText';

import styles from '../CountrySelect.module.scss';
import { type CountryChoice } from '../types/CountryChoice';

type CountrySelectOptionsProps = {
  countries: readonly CountryChoice[];
  value: string;
  onValueChange: (value: string) => void;
  searchLabel: string;
  noCountryLabel: string;
  noResultsLabel: string;
};

export const CountrySelectOptions = ({
  countries,
  value,
  onValueChange,
  searchLabel,
  noCountryLabel,
  noResultsLabel,
}: CountrySelectOptionsProps) => {
  const [search, setSearch] = useState('');
  const normalizedSearch = normalizeSearchText(search.trim());
  const isSearching = isNonEmptyString(normalizedSearch);
  const filteredCountries = countries.filter((country) =>
    normalizeSearchText(country.label).includes(normalizedSearch),
  );
  const showNoCountry =
    normalizeSearchText(noCountryLabel).includes(normalizedSearch);
  const hasResults = showNoCountry || isNonEmptyArray(filteredCountries);
  const noCountryOption = showNoCountry && (
    <Dropdown.OptionItem
      selected={!isNonEmptyString(value)}
      startIcon={
        <span className={styles.flag} aria-hidden="true">
          <IconCircleOff />
        </span>
      }
      onSelect={() => onValueChange('')}
    >
      {noCountryLabel}
    </Dropdown.OptionItem>
  );

  return (
    <>
      <Dropdown.Search
        value={search}
        onValueChange={setSearch}
        placeholder={searchLabel}
        aria-label={searchLabel}
      />
      {hasResults && <Dropdown.Separator />}
      {hasResults && (
        <Dropdown.Section scrollable>
          {!isSearching && noCountryOption}
          {filteredCountries.map((country) => (
            <Dropdown.OptionItem
              key={country.value}
              selected={country.value === value}
              startIcon={
                <span className={styles.flag} aria-hidden="true">
                  {country.flag}
                </span>
              }
              onSelect={() => onValueChange(country.value)}
            >
              {country.label}
            </Dropdown.OptionItem>
          ))}
          {isSearching && noCountryOption}
        </Dropdown.Section>
      )}
      {!hasResults && <Dropdown.Empty>{noResultsLabel}</Dropdown.Empty>}
    </>
  );
};
