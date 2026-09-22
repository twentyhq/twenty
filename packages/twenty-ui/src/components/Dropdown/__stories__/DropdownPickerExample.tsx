import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';

import { IconPlus } from '@ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';

import { Dropdown } from '../Dropdown';

const PEOPLE = ['Ada Lovelace', 'Grace Hopper', 'Margaret Hamilton'];

export const DropdownPickerExample = ({
  multiple = false,
  loading = false,
}: {
  multiple?: boolean;
  loading?: boolean;
}) => {
  const [search, setSearch] = useState('');
  const [people, setPeople] = useState(PEOPLE);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const results = people.filter((person) =>
    person.toLowerCase().includes(search.toLowerCase()),
  );
  const hasSearch = isNonEmptyString(search.trim());

  return (
    <Dropdown.Root kind="picker" multiple={multiple}>
      <Dropdown.Trigger render={<Button>Choose people</Button>} />
      <Dropdown.Content aria-label="Choose people" width={280}>
        <Dropdown.Search
          aria-label="Search people"
          placeholder="Search people"
          value={search}
          onValueChange={setSearch}
        />
        <Dropdown.Section>
          <Dropdown.ActionItem
            startIcon={<IconPlus />}
            disabled={!hasSearch || people.includes(search)}
            closeOnClick={false}
            onClick={() => {
              setPeople((current) => [search, ...current]);
              setSearch('');
            }}
          >
            {hasSearch ? `Create ${search}` : 'Create person'}
          </Dropdown.ActionItem>
          {loading ? (
            <Dropdown.Loading>Loading people</Dropdown.Loading>
          ) : (
            results.map((person) => (
              <Dropdown.OptionItem
                key={person}
                selected={selectedPeople.includes(person)}
                onSelect={() =>
                  setSelectedPeople((current) => {
                    if (!multiple) {
                      return [person];
                    }

                    return current.includes(person)
                      ? current.filter(
                          (selectedPerson) => selectedPerson !== person,
                        )
                      : [...current, person];
                  })
                }
              >
                {person}
              </Dropdown.OptionItem>
            ))
          )}
          {!loading && !isNonEmptyArray(results) && (
            <Dropdown.Empty>No people found</Dropdown.Empty>
          )}
        </Dropdown.Section>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
