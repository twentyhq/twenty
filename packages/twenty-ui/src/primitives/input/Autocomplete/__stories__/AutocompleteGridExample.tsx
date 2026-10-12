import { useState } from 'react';

import { Autocomplete } from '../Autocomplete';
import { AutocompleteFilteredCount } from './AutocompleteFilteredCount';

const FRUITS = ['Apple', 'Banana', 'Cherry', 'Date'];

export const AutocompleteGridExample = () => {
  const [value, setValue] = useState('');

  return (
    <Autocomplete.Root
      items={FRUITS}
      value={value}
      onValueChange={setValue}
      grid
      inline
      open
      mode="none"
      autoHighlight="always"
    >
      <Autocomplete.Input aria-label="Fruit grid" />
      <Autocomplete.List>
        <Autocomplete.Row style={{ display: 'flex' }}>
          <Autocomplete.Item value="Apple" onClick={() => setValue('Apple')}>
            Apple
          </Autocomplete.Item>
          <Autocomplete.Item value="Banana" onClick={() => setValue('Banana')}>
            Banana
          </Autocomplete.Item>
        </Autocomplete.Row>
        <Autocomplete.Row style={{ display: 'flex' }}>
          <Autocomplete.Item value="Cherry" onClick={() => setValue('Cherry')}>
            Cherry
          </Autocomplete.Item>
          <Autocomplete.Item value="Date" onClick={() => setValue('Date')}>
            Date
          </Autocomplete.Item>
        </Autocomplete.Row>
      </Autocomplete.List>
      <AutocompleteFilteredCount />
    </Autocomplete.Root>
  );
};
