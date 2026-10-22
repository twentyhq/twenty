import { type ComponentProps, useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';

import { CurrencyPickerExample } from './CurrencyPickerExample';

type CurrencyPickerControlledExampleProps = Pick<
  ComponentProps<typeof CurrencyPickerExample>,
  'onValueChange' | 'composition'
>;

export const CurrencyPickerControlledExample = ({
  onValueChange,
  composition,
}: CurrencyPickerControlledExampleProps) => {
  const [value, setValue] = useState<string | null>('USD');

  return (
    <>
      <CurrencyPickerExample
        composition={composition}
        value={value}
        onValueChange={(nextValue, eventDetails) => {
          onValueChange?.(nextValue, eventDetails);

          if (!eventDetails.isCanceled) {
            setValue(nextValue);
          }
        }}
      />
      <Button onClick={() => setValue('EUR')}>Set Euro</Button>
      <Button onClick={() => setValue(null)}>Clear currency</Button>
      <Button onClick={() => setValue('ZZZ')}>Set unknown currency</Button>
      <Button onClick={() => setValue('')}>Set empty identifier</Button>
    </>
  );
};
