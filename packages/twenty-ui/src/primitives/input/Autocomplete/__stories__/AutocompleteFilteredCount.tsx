import { Text } from '@ui/primitives/typography/Text/Text';

import { Autocomplete } from '../Autocomplete';

export const AutocompleteFilteredCount = () => {
  const items = Autocomplete.useFilteredItems<string>();

  return (
    <Autocomplete.Status
      render={<Text />}
    >{`Suggestions: ${items.length}`}</Autocomplete.Status>
  );
};
