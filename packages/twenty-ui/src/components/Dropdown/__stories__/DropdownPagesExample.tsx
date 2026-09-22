import { useState } from 'react';

import { IconFilter, IconUser } from '@ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';

import { Dropdown } from '../Dropdown';

export const DropdownPagesExample = () => {
  const [search, setSearch] = useState('');
  const [selectedPerson, setSelectedPerson] = useState('');

  return (
    <Dropdown.Root kind="menu">
      <Dropdown.Trigger
        render={<Button startIcon={<IconFilter />}>Filters</Button>}
      />
      <Dropdown.Content aria-label="Filters" width={260}>
        <Dropdown.Page id="root">
          <Dropdown.Section>
            <Dropdown.ActionItem startIcon={<IconUser />} page="people">
              Person
            </Dropdown.ActionItem>
            <Dropdown.ActionItem onClick={() => setSelectedPerson('')}>
              Clear filters
            </Dropdown.ActionItem>
          </Dropdown.Section>
        </Dropdown.Page>
        <Dropdown.Page id="people" kind="picker">
          <Dropdown.Back>Filters</Dropdown.Back>
          <Dropdown.Search
            aria-label="Search people"
            placeholder="Search people"
            value={search}
            onValueChange={setSearch}
          />
          <Dropdown.Section>
            {['Ada Lovelace', 'Grace Hopper']
              .filter((person) =>
                person.toLowerCase().includes(search.toLowerCase()),
              )
              .map((person) => (
                <Dropdown.OptionItem
                  key={person}
                  selected={selectedPerson === person}
                  onSelect={() => setSelectedPerson(person)}
                >
                  {person}
                </Dropdown.OptionItem>
              ))}
          </Dropdown.Section>
        </Dropdown.Page>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
