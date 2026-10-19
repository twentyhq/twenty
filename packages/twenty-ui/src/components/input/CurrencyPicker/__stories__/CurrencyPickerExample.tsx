import { type ComponentProps } from 'react';

import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';

import { CurrencyPicker } from '../CurrencyPicker';
import { CURRENCY_PICKER_STORY_OPTIONS } from './currencyPickerStoryOptions';

type CurrencyPickerExampleProps = Pick<
  ComponentProps<typeof CurrencyPicker>,
  | 'currencies'
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'disabled'
  | 'closeOnSelect'
  | 'selectedFirst'
  | 'getOptionLabel'
  | 'getSearchText'
  | 'renderValue'
> &
  Pick<
    ComponentProps<typeof CurrencyPicker.Options>,
    'searchLabel' | 'emptyLabel' | 'searchable' | 'searchProps' | 'dir'
  > & {
    composition?: 'shorthand' | 'compound';
    optionsDisabled?: boolean;
    defaultOpen?: boolean;
    triggerLabel?: string;
  };

export const CurrencyPickerExample = ({
  currencies = CURRENCY_PICKER_STORY_OPTIONS,
  value,
  defaultValue = 'USD',
  disabled = false,
  optionsDisabled = false,
  defaultOpen = false,
  triggerLabel = 'Currency',
  composition = 'shorthand',
  selectedFirst,
  closeOnSelect,
  getOptionLabel,
  getSearchText,
  renderValue,
  searchLabel,
  searchProps,
  emptyLabel,
  searchable,
  onValueChange,
  dir,
}: Partial<CurrencyPickerExampleProps>) => {
  if (composition === 'compound') {
    return (
      <Dropdown.Root type="picker" defaultOpen={defaultOpen}>
        <CurrencyPicker.Root
          currencies={currencies}
          value={value}
          defaultValue={defaultValue}
          onValueChange={onValueChange}
          disabled={disabled}
          closeOnSelect={closeOnSelect}
          selectedFirst={selectedFirst}
          getOptionLabel={getOptionLabel}
          getSearchText={getSearchText}
          renderValue={renderValue}
        >
          <CurrencyPicker.Trigger aria-label={triggerLabel} dir={dir} />
          <Dropdown.Content aria-label={triggerLabel} width={280} dir={dir}>
            <CurrencyPicker.Options
              searchLabel={searchLabel}
              searchProps={searchProps}
              emptyLabel={emptyLabel}
              searchable={searchable}
              disabled={optionsDisabled}
              dir={dir}
            />
          </Dropdown.Content>
        </CurrencyPicker.Root>
      </Dropdown.Root>
    );
  }

  return (
    <CurrencyPicker
      currencies={currencies}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      disabled={disabled}
      closeOnSelect={closeOnSelect}
      selectedFirst={selectedFirst}
      getOptionLabel={getOptionLabel}
      getSearchText={getSearchText}
      renderValue={renderValue}
      defaultOpen={defaultOpen}
      triggerProps={{ 'aria-label': triggerLabel, dir }}
      optionsProps={{
        searchLabel,
        searchProps,
        emptyLabel,
        searchable,
        disabled: optionsDisabled,
        dir,
      }}
      contentProps={{ 'aria-label': triggerLabel, width: 280, dir }}
    />
  );
};
