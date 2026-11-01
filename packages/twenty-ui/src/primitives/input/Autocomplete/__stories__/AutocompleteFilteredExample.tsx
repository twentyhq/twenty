import { useState } from 'react';

import { Autocomplete } from '../Autocomplete';

const CITIES = ['Paris', 'London', 'Lisbon'];

export const AutocompleteFilteredExample = () => {
  const [value, setValue] = useState('');
  const { startsWith } = Autocomplete.useFilter();
  const filteredItems = CITIES.filter((city) => startsWith(city, value));

  return (
    <Autocomplete.Root
      items={CITIES}
      filteredItems={filteredItems}
      value={value}
      onValueChange={setValue}
      autoHighlight="always"
    >
      <Autocomplete.Input aria-label="City prefix" />
      <Autocomplete.Portal>
        <Autocomplete.Positioner>
          <Autocomplete.Popup>
            <Autocomplete.Empty>
              No city starts with this query
            </Autocomplete.Empty>
            <Autocomplete.List aria-label="City suggestions">
              {(city: string) => (
                <Autocomplete.Item key={city} value={city}>
                  {city}
                </Autocomplete.Item>
              )}
            </Autocomplete.List>
          </Autocomplete.Popup>
        </Autocomplete.Positioner>
      </Autocomplete.Portal>
    </Autocomplete.Root>
  );
};
