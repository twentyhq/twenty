import { type ComponentProps, useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';

import { CurrencyPickerExample } from './CurrencyPickerExample';

type CurrencyPickerChangingDefaultExampleProps = Pick<
  ComponentProps<typeof CurrencyPickerExample>,
  'onValueChange' | 'composition'
>;

export const CurrencyPickerChangingDefaultExample = ({
  onValueChange,
  composition,
}: CurrencyPickerChangingDefaultExampleProps) => {
  const [defaultValue, setDefaultValue] = useState('USD');

  return (
    <>
      <CurrencyPickerExample
        composition={composition}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
      />
      <Button onClick={() => setDefaultValue('EUR')}>
        Change default to Euro
      </Button>
      <Button onClick={() => setDefaultValue('JPY')}>
        Change default to Yen
      </Button>
    </>
  );
};
