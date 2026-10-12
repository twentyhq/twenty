import { type ComponentProps, useState } from 'react';

import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';

import { CurrencyPicker } from '../CurrencyPicker';
import { CURRENCY_PICKER_STORY_OPTIONS } from './currencyPickerStoryOptions';

type CurrencyPickerExampleProps = Pick<
  ComponentProps<typeof CurrencyPicker.Options>,
  'currencies' | 'searchLabel' | 'emptyLabel' | 'onValueChange' | 'dir'
> & {
  defaultValue?: string;
  disabled?: boolean;
  optionsDisabled?: boolean;
  defaultOpen?: boolean;
  triggerLabel?: string;
};

export const CurrencyPickerExample = ({
  currencies = CURRENCY_PICKER_STORY_OPTIONS,
  defaultValue = 'USD',
  disabled = false,
  optionsDisabled = false,
  defaultOpen = false,
  triggerLabel = 'Currency',
  searchLabel,
  emptyLabel,
  onValueChange,
  dir,
}: Partial<CurrencyPickerExampleProps>) => {
  const [value, setValue] = useState(defaultValue);

  return (
    <Dropdown.Root type="picker" defaultOpen={defaultOpen}>
      <CurrencyPicker.Trigger
        aria-label={triggerLabel}
        value={value}
        disabled={disabled}
        dir={dir}
      />
      <Dropdown.Content aria-label={triggerLabel} width={280} dir={dir}>
        <CurrencyPicker.Options
          currencies={currencies}
          value={value}
          onValueChange={(currencyCode) => {
            setValue(currencyCode);
            onValueChange?.(currencyCode);
          }}
          searchLabel={searchLabel}
          emptyLabel={emptyLabel}
          disabled={optionsDisabled}
          dir={dir}
        />
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
