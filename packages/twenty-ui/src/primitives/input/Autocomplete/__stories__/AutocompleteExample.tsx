import { Autocomplete } from '../Autocomplete';
import { type AutocompleteRootProps } from '../types/AutocompleteRootProps';

const FRUITS = ['Apple', 'Banana', 'Cherry'];

export const AutocompleteExample = (
  props: Omit<AutocompleteRootProps<string>, 'items'> & {
    items?: readonly string[];
  },
) => (
  <Autocomplete.Root items={FRUITS} autoHighlight="always" {...props}>
    <Autocomplete.InputGroup>
      <Autocomplete.Input aria-label="Fruit" placeholder="Search fruits" />
    </Autocomplete.InputGroup>
    <Autocomplete.Popup>
      <Autocomplete.Empty>No fruits found</Autocomplete.Empty>
      <Autocomplete.List>
        {(fruit: string) => (
          <Autocomplete.Item key={fruit} value={fruit}>
            {fruit}
          </Autocomplete.Item>
        )}
      </Autocomplete.List>
    </Autocomplete.Popup>
  </Autocomplete.Root>
);
