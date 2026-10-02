import { clsx } from 'clsx';
import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { useId, useState } from 'react';

import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';
import { IconChevronDown, IconCircleOff } from '@ui/icon';
import inputStyles from '@ui/primitives/input/Input/Input.module.scss';
import selectStyles from '@ui/primitives/input/Select/Select.module.scss';
import { mergeClassNames } from '@ui/utilities/internal/mergeClassNames';
import { isDefined } from '@ui/utilities/utils/isDefined';
import { normalizeSearchText } from '@ui/utilities/utils/normalizeSearchText';

import styles from './CountrySelect.module.scss';
import { CountrySelectAvailabilityEffect } from './internal/CountrySelectAvailabilityEffect';
import { type CountrySelectProps } from './types/CountrySelectProps';

export const CountrySelect = ({
  countries,
  value,
  onValueChange,
  label,
  labels,
  open: controlledOpen,
  onOpenChange,
  popupProps,
  disabled = false,
  className,
  id,
  'aria-label': ariaLabel,
  ...props
}: CountrySelectProps) => {
  const generatedId = useId();
  const triggerId = id ?? generatedId;
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const isDisabled = disabled || !isNonEmptyArray(countries);
  const requestedOpen = controlledOpen ?? uncontrolledOpen;
  const open = !isDisabled && requestedOpen;
  const [previousOpen, setPreviousOpen] = useState(open);
  const [search, setSearch] = useState('');

  if (previousOpen !== open) {
    setPreviousOpen(open);
    setSearch('');
  }

  const selectedCountry = countries.find((country) => country.value === value);
  const selectedLabel = selectedCountry?.label ?? labels.noCountry;
  const selectedFlag = isDefined(selectedCountry) ? (
    selectedCountry.flag
  ) : (
    <IconCircleOff />
  );
  const normalizedSearch = normalizeSearchText(search);
  const filteredCountries = countries.filter((country) =>
    normalizeSearchText(country.label).includes(normalizedSearch),
  );
  const showNoCountry = normalizeSearchText(labels.noCountry).includes(
    normalizedSearch,
  );
  const hasResults = showNoCountry || isNonEmptyArray(filteredCountries);

  const handleOpenChange = (nextOpen: boolean) => {
    setUncontrolledOpen(nextOpen);
    onOpenChange?.(nextOpen);
  };

  return (
    <div className={styles.root}>
      <CountrySelectAvailabilityEffect
        disabled={isDisabled}
        open={requestedOpen}
        onOpenChange={handleOpenChange}
      />
      {isNonEmptyString(label) && (
        <label className={styles.label} htmlFor={triggerId}>
          {label}
        </label>
      )}
      <Dropdown.Root type="picker" open={open} onOpenChange={handleOpenChange}>
        <Dropdown.Trigger
          {...props}
          id={triggerId}
          disabled={isDisabled}
          aria-label={ariaLabel}
          className={mergeClassNames(
            clsx(inputStyles.input, inputStyles.md, selectStyles.trigger),
            className,
          )}
        >
          <span className={styles.flag} aria-hidden="true">
            {selectedFlag}
          </span>
          <span className={selectStyles.value}>{selectedLabel}</span>
          <span className={selectStyles.icon} aria-hidden="true">
            <IconChevronDown />
          </span>
        </Dropdown.Trigger>
        <Dropdown.Content {...popupProps} aria-label={label ?? ariaLabel}>
          <Dropdown.Search
            value={search}
            onValueChange={setSearch}
            placeholder={labels.search}
            aria-label={labels.search}
          />
          {hasResults && <Dropdown.Separator />}
          {hasResults && (
            <Dropdown.Section scrollable>
              {showNoCountry && (
                <Dropdown.OptionItem
                  selected={!isNonEmptyString(value)}
                  startIcon={<IconCircleOff className={styles.flag} />}
                  onSelect={() => onValueChange('')}
                >
                  {labels.noCountry}
                </Dropdown.OptionItem>
              )}
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
            </Dropdown.Section>
          )}
          {!hasResults && <Dropdown.Empty>{labels.noResults}</Dropdown.Empty>}
        </Dropdown.Content>
      </Dropdown.Root>
    </div>
  );
};
