import { type ComponentProps, useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';

import { CurrencyPickerExample } from './CurrencyPickerExample';

type CurrencyPickerControlledSearchExampleProps = Pick<
  ComponentProps<typeof CurrencyPickerExample>,
  'onValueChange' | 'composition'
>;

export const CurrencyPickerControlledSearchExample = ({
  onValueChange,
  composition,
}: CurrencyPickerControlledSearchExampleProps) => {
  const [search, setSearch] = useState('USD');

  return (
    <>
      <CurrencyPickerExample
        composition={composition}
        onValueChange={onValueChange}
        closeOnSelect={false}
        searchProps={{ value: search, onValueChange: setSearch }}
      />
      <Button onClick={() => setSearch('EUR')}>Find Euro</Button>
    </>
  );
};
