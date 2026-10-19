import { useState } from 'react';

import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';
import { Button } from '@ui/primitives/input/Button/Button';

import { CurrencyPicker } from '../CurrencyPicker';
import { CURRENCY_PICKER_STORY_OPTIONS } from './currencyPickerStoryOptions';

export const CurrencyPickerListLabelExample = () => {
  const [showTitle, setShowTitle] = useState(true);

  return (
    <Dropdown.Root type="picker">
      <CurrencyPicker.Root
        currencies={CURRENCY_PICKER_STORY_OPTIONS}
        defaultValue="USD"
      >
        <CurrencyPicker.Trigger aria-label="Billing currency" />
        <Dropdown.Content aria-label="Currency options">
          <Dropdown.Header>
            {showTitle && <Dropdown.Title>Billing currencies</Dropdown.Title>}
            <Button onClick={() => setShowTitle(false)}>Hide title</Button>
          </Dropdown.Header>
          <CurrencyPicker.Options aria-label="Currency options wrapper" />
        </Dropdown.Content>
      </CurrencyPicker.Root>
    </Dropdown.Root>
  );
};
