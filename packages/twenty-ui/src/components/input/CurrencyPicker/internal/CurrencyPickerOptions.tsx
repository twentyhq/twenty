import { useRender } from '@base-ui/react/use-render';
import { isNonEmptyArray, isString, isUndefined } from '@sniptt/guards';
import { clsx } from 'clsx';
import { useState } from 'react';

import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';
import { useDropdownContext } from '@ui/components/navigation/Dropdown/internal/useDropdownContext';
import { OverflowingTextWithTooltip } from '@ui/primitives/typography/OverflowingTextWithTooltip/OverflowingTextWithTooltip';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';

import styles from '../CurrencyPicker.module.scss';
import { type CurrencyPickerOptionsProps } from '../types/CurrencyPickerOptionsProps';
import { useCurrencyPickerContextOrThrow } from './useCurrencyPickerContextOrThrow';

export const CurrencyPickerOptions = ({
  disabled = false,
  searchable = true,
  searchLabel = doNotTranslate('Search'),
  listLabel,
  emptyLabel = doNotTranslate('No results'),
  searchProps,
  className,
  render,
  ref,
  ...props
}: CurrencyPickerOptionsProps) => {
  const { state, groupId, options, selectionProps } =
    useCurrencyPickerContextOrThrow();
  const { titleId, triggerId } = useDropdownContext();
  const {
    value: controlledSearch,
    defaultValue: defaultSearch = '',
    onValueChange: onSearchChange,
    ...searchElementProps
  } = searchProps ?? {};
  const [uncontrolledSearch, setUncontrolledSearch] = useState(defaultSearch);
  const search = controlledSearch ?? uncontrolledSearch;
  const normalizedSearch = searchable
    ? String(search).trim().toLowerCase()
    : '';
  const matchingCurrencies = options.filter(({ searchText }) =>
    searchText.includes(normalizedSearch),
  );
  const hasMatchingCurrencies = isNonEmptyArray(matchingCurrencies);
  const isDisabled = state.disabled || disabled;
  const defaultAriaLabelledBy = isDefined(listLabel)
    ? undefined
    : (titleId ?? triggerId);

  return useRender({
    render,
    ref,
    props: {
      ...props,
      className: clsx(styles.options, className),
      children: (
        <>
          {searchable && (
            <>
              <Dropdown.Search
                placeholder={searchLabel}
                aria-label={searchLabel}
                // oxlint-disable-next-line react/jsx-props-no-spreading
                {...searchElementProps}
                value={search}
                onValueChange={(nextSearch) => {
                  onSearchChange?.(nextSearch);

                  if (isUndefined(controlledSearch)) {
                    setUncontrolledSearch(nextSearch);
                  }
                }}
                disabled={isDisabled || searchProps?.disabled}
              />
              <Dropdown.Separator />
            </>
          )}
          <Dropdown.SelectionGroup
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...selectionProps}
            id={groupId}
            aria-label={listLabel}
            aria-labelledby={defaultAriaLabelledBy}
          >
            {hasMatchingCurrencies && (
              <Dropdown.Section scrollable>
                {matchingCurrencies.map(({ currency, label }) => (
                  <Dropdown.OptionItem
                    key={currency.code}
                    value={currency.code}
                    disabled={isDisabled || currency.disabled}
                  >
                    {isString(label) ? (
                      <OverflowingTextWithTooltip text={label} />
                    ) : (
                      label
                    )}
                  </Dropdown.OptionItem>
                ))}
              </Dropdown.Section>
            )}
          </Dropdown.SelectionGroup>
          <Dropdown.Empty className={styles.emptyStatus}>
            {hasMatchingCurrencies ? null : emptyLabel}
          </Dropdown.Empty>
        </>
      ),
    },
  });
};
