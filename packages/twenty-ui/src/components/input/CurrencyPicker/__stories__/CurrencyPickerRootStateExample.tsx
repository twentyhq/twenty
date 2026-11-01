import { useState } from 'react';

import { Dropdown } from '@ui/components/navigation/Dropdown/Dropdown';
import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';

import { CurrencyPicker } from '../CurrencyPicker';
import { CURRENCY_PICKER_STORY_OPTIONS } from './currencyPickerStoryOptions';

export const CurrencyPickerRootStateExample = () => {
  const [selection, setSelection] = useState({ value: 'USD', disabled: true });

  return (
    <>
      <Text data-testid="root-host">
        <Dropdown.Root type="picker">
          <CurrencyPicker.Root
            currencies={CURRENCY_PICKER_STORY_OPTIONS}
            value={selection.value}
            disabled={selection.disabled}
          >
            {({ value, selectedCurrency, disabled }) => (
              <Text data-testid="root-state">
                {value}:{selectedCurrency?.name}:{String(disabled)}
              </Text>
            )}
          </CurrencyPicker.Root>
        </Dropdown.Root>
      </Text>
      <Button onClick={() => setSelection({ value: 'EUR', disabled: false })}>
        Use Euro
      </Button>
    </>
  );
};
