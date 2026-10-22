import {
  isFunction,
  isNonEmptyArray,
  isNonEmptyString,
  isNull,
} from '@sniptt/guards';
import { useState } from 'react';

import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';
import { useDropdownContext } from '@ui/components/navigation/Dropdown/internal/useDropdownContext';
import { IconCircleOff } from '@ui/icon';
import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';
import { normalizeSearchText } from '@ui/utilities/utils/normalizeSearchText';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../CountrySelect.module.scss';
import { type CountrySelectOptionsProps } from '../types/CountrySelectOptionsProps';
import { getCountrySelectionValue } from './getCountrySelectionValue';
import { NO_COUNTRY_SELECTION_VALUE } from './NO_COUNTRY_SELECTION_VALUE';
import { useCountrySelectContextOrThrow } from './useCountrySelectContextOrThrow';

export const CountrySelectOptionsContent = ({
  searchLabel = doNotTranslate('Search'),
  noResultsLabel = doNotTranslate('No results'),
  searchProps,
  render,
  ...props
}: CountrySelectOptionsProps) => {
  const {
    countries,
    value,
    changeValue,
    disabled,
    noCountryLabel,
    selectionGroupId,
  } = useCountrySelectContextOrThrow();
  const { titleId, triggerId } = useDropdownContext();
  const hasAccessibleName =
    isDefined(props['aria-label']) || isDefined(props['aria-labelledby']);
  const defaultAriaLabelledBy = hasAccessibleName
    ? undefined
    : (titleId ?? triggerId);
  const [search, setSearch] = useState('');
  const normalizedSearch = normalizeSearchText(search.trim());
  const isSearching = isNonEmptyString(normalizedSearch);
  const filteredCountries = countries.filter((country) =>
    country.searchText.includes(normalizedSearch),
  );
  const showNoCountry =
    normalizeSearchText(noCountryLabel).includes(normalizedSearch);
  const hasResults = showNoCountry || isNonEmptyArray(filteredCountries);
  const noCountryOption = showNoCountry && (
    <Dropdown.OptionItem
      value={NO_COUNTRY_SELECTION_VALUE}
      disabled={disabled}
      startIcon={
        <span className={styles.flag} aria-hidden="true">
          <IconCircleOff />
        </span>
      }
    >
      {noCountryLabel}
    </Dropdown.OptionItem>
  );

  return (
    <>
      <Dropdown.Search
        placeholder={searchLabel}
        aria-label={searchLabel}
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...searchProps}
        value={search}
        onValueChange={setSearch}
        disabled={disabled || searchProps?.disabled}
      />
      {hasResults && <Dropdown.Separator />}
      <Dropdown.SelectionGroup
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...props}
        aria-labelledby={props['aria-labelledby'] ?? defaultAriaLabelledBy}
        render={
          isFunction(render)
            ? (renderProps) => render(renderProps, { value, multiple: false })
            : render
        }
        id={selectionGroupId}
        value={
          isNull(value)
            ? NO_COUNTRY_SELECTION_VALUE
            : getCountrySelectionValue(value)
        }
        onValueChange={(nextValue, eventDetails) => {
          const country = countries.find(
            (choice) => choice.selectionValue === nextValue,
          );
          changeValue(country?.value ?? null, eventDetails);
        }}
      >
        {hasResults && (
          <Dropdown.Section scrollable>
            {!isSearching && noCountryOption}
            {filteredCountries.map((country) => (
              <Dropdown.OptionItem
                key={country.value}
                value={country.selectionValue}
                disabled={disabled || country.disabled}
                startIcon={
                  <span className={styles.flag} aria-hidden="true">
                    {country.flag}
                  </span>
                }
              >
                {country.label}
              </Dropdown.OptionItem>
            ))}
            {isSearching && noCountryOption}
          </Dropdown.Section>
        )}
        {!hasResults && <Dropdown.Empty>{noResultsLabel}</Dropdown.Empty>}
      </Dropdown.SelectionGroup>
    </>
  );
};
