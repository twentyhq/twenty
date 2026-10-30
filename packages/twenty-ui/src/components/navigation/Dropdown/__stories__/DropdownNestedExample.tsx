import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';

import { Dropdown } from '../Dropdown';

export const DropdownNestedExample = () => {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState<string | null>('Ascending');
  const [search, setSearch] = useState('');
  const fields = ['Name', 'Created at', 'Company'].filter((field) =>
    field.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Dropdown.Root type="picker" open={open} onOpenChange={setOpen}>
      <Dropdown.Trigger render={<Button>Sort</Button>} />
      <Dropdown.Content width={240}>
        <Dropdown.Header>
          <Dropdown.Close aria-label="Close sort" />
          <Dropdown.Title>Sort</Dropdown.Title>
        </Dropdown.Header>
        <Dropdown.Section>
          <Dropdown.Root type="picker">
            <Dropdown.Trigger render={<Button>{direction}</Button>} />
            <Dropdown.Content aria-label="Sort direction">
              <Dropdown.SelectionGroup
                id="direction"
                aria-label="Sort direction"
                value={direction}
                onValueChange={setDirection}
              >
                {['Ascending', 'Descending'].map((option) => (
                  <Dropdown.OptionItem key={option} value={option}>
                    {option}
                  </Dropdown.OptionItem>
                ))}
              </Dropdown.SelectionGroup>
            </Dropdown.Content>
          </Dropdown.Root>
        </Dropdown.Section>
        <Dropdown.Separator />
        <Dropdown.Search
          aria-label="Search fields"
          placeholder="Search fields"
          value={search}
          onValueChange={setSearch}
        />
        <Dropdown.SelectionGroup id="field" aria-label="Fields">
          {fields.map((field) => (
            <Dropdown.OptionItem key={field} value={field}>
              {field}
            </Dropdown.OptionItem>
          ))}
        </Dropdown.SelectionGroup>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
