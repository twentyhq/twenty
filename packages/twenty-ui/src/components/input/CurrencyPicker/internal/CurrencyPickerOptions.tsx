import { useRender } from '@base-ui/react/use-render';
import { isNonEmptyArray } from '@sniptt/guards';
import { clsx } from 'clsx';
import { useState } from 'react';

import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';
import { OverflowingTextWithTooltip } from '@ui/primitives/typography/OverflowingTextWithTooltip/OverflowingTextWithTooltip';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../CurrencyPicker.module.scss';
import { getCurrencyPickerLabel } from './getCurrencyPickerLabel';
import { type CurrencyPickerOptionsProps } from '../types/CurrencyPickerOptionsProps';

export const CurrencyPickerOptions = ({
  currencies,
  value,
  onValueChange,
  disabled = false,
  searchLabel = 'Search',
  emptyLabel = 'No results',
  className,
  render,
  ref,
  ...props
}: CurrencyPickerOptionsProps) => {
  const [search, setSearch] = useState('');
  const normalizedSearch = search.trim().toLowerCase();
  const matchingCurrencies = currencies.filter((currency) =>
    getCurrencyPickerLabel(currency).toLowerCase().includes(normalizedSearch),
  );
  const hasMatchingCurrencies = isNonEmptyArray(matchingCurrencies);
  const selectedCurrency = matchingCurrencies.find(
    ({ code }) => code === value,
  );
  const orderedCurrencies = isDefined(selectedCurrency)
    ? [
        selectedCurrency,
        ...matchingCurrencies.filter(({ code }) => code !== value),
      ]
    : matchingCurrencies;

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
            placeholder={searchLabel}
            aria-label={searchLabel}
            onValueChange={setSearch}
            disabled={disabled}
          />
          <Dropdown.Separator />
          {hasMatchingCurrencies && (
            <Dropdown.Section scrollable>
              {orderedCurrencies.map((currency) => (
                <Dropdown.OptionItem
                  key={currency.code}
                  selected={currency.code === value}
                  disabled={disabled || currency.disabled}
                  onSelect={() => onValueChange(currency.code)}
                >
                  <OverflowingTextWithTooltip
                    text={getCurrencyPickerLabel(currency)}
                  />
                </Dropdown.OptionItem>
              ))}
            </Dropdown.Section>
          )}
          <Dropdown.Empty className={styles.emptyStatus}>
            {hasMatchingCurrencies ? null : emptyLabel}
          </Dropdown.Empty>
        </>
      ),
    },
  });
};
