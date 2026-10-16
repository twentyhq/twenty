import { useRender } from '@base-ui/react/use-render';
import { isNonEmptyArray } from '@sniptt/guards';
import { clsx } from 'clsx';
import { useId, useState } from 'react';

import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';
import { OverflowingTextWithTooltip } from '@ui/primitives/typography/OverflowingTextWithTooltip/OverflowingTextWithTooltip';
import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';
import { isDefined } from '@ui/utilities/utils/isDefined';
import { normalizeSearchText } from '@ui/utilities/utils/normalizeSearchText';

import styles from '../PhoneCountryPicker.module.scss';
import { type PhoneCountryPickerOptionsProps } from '../types/PhoneCountryPickerOptionsProps';
import { getPhoneCountryOptionLabel } from './getPhoneCountryOptionLabel';
import { getPhoneCountryOptionTooltipLabel } from './getPhoneCountryOptionTooltipLabel';
import { matchesPhoneCountrySearch } from './matchesPhoneCountrySearch';
import { usePhoneCountryPickerContextOrThrow } from './usePhoneCountryPickerContextOrThrow';

export const PhoneCountryPickerOptions = ({
  searchLabel = doNotTranslate('Search'),
  listLabel = doNotTranslate('Countries'),
  emptyLabel = doNotTranslate('No results'),
  disabled: optionsDisabled = false,
  className,
  render,
  ref,
  ...props
}: PhoneCountryPickerOptionsProps) => {
  const {
    countries,
    value,
    onValueChange,
    disabled: rootDisabled,
    closeOnSelect,
  } = usePhoneCountryPickerContextOrThrow();
  const disabled = rootDisabled || optionsDisabled;
  const selectionId = useId();
  const [search, setSearch] = useState('');
  const normalizedSearch = normalizeSearchText(search).trim();
  const callingCodeSearch = normalizedSearch.startsWith('+')
    ? normalizedSearch.slice(1)
    : normalizedSearch;
  const matchingCountries = countries.filter((country) =>
    matchesPhoneCountrySearch({
      country,
      normalizedSearch,
      callingCodeSearch,
    }),
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

  return useRender({
    render,
    ref,
    props: {
      ...props,
      className: clsx(styles.options, className),
      children: (
        <>
          <Dropdown.Search
            value={search}
            onValueChange={setSearch}
            placeholder={searchLabel}
            aria-label={searchLabel}
            disabled={disabled}
          />
          <Dropdown.Separator />
          <Dropdown.Section scrollable>
            <Dropdown.SelectionGroup
              id={selectionId}
              aria-label={listLabel}
              value={value}
              onValueChange={onValueChange}
              closeOnSelect={closeOnSelect}
            >
              {orderedCountries.map((country) => {
                const optionLabel = getPhoneCountryOptionLabel(country);

                return (
                  <Dropdown.OptionItem
                    key={country.value}
                    value={country.value}
                    aria-label={optionLabel}
                    disabled={disabled || country.disabled}
                    startIcon={
                      <span className={styles.optionFlag} aria-hidden>
                        {country.flag}
                      </span>
                    }
                  >
                    <OverflowingTextWithTooltip
                      text={
                        <>
                          {country.label} (
                          <bdi dir="ltr">+{country.callingCode}</bdi>)
                        </>
                      }
                      tooltipContent={getPhoneCountryOptionTooltipLabel(
                        country,
                      )}
                    />
                  </Dropdown.OptionItem>
                );
              })}
            </Dropdown.SelectionGroup>
          </Dropdown.Section>
          <Dropdown.Empty className={styles.emptyStatus}>
            {isNonEmptyArray(orderedCountries) ? null : emptyLabel}
          </Dropdown.Empty>
        </>
      ),
    },
  });
};
