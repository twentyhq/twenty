import { useState } from 'react';

import { Button } from '@ui/primitives/input/Button/Button';

import { Dropdown } from '../Dropdown';

export const DropdownNestedExample = () => {
  const [open, setOpen] = useState(false);
  const [direction, setDirection] = useState('Ascending');
  const [search, setSearch] = useState('');
  const fields = ['Name', 'Created at', 'Company'].filter((field) =>
    field.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Dropdown.Root type="picker" open={open} onOpenChange={setOpen}>
      <Dropdown.Trigger render={<Button>Sort</Button>} />
      <Dropdown.Content aria-label="Sort fields" width={240}>
        <Dropdown.Header
          action={{
            icon: 'close',
            label: 'Close sort',
            onClick: () => setOpen(false),
          }}
        >
          Sort
        </Dropdown.Header>
        <Dropdown.Section>
          <Dropdown.Root type="picker">
            <Dropdown.Trigger render={<Button>{direction}</Button>} />
            <Dropdown.Content aria-label="Sort direction">
              <Dropdown.Section>
                {['Ascending', 'Descending'].map((option) => (
                  <Dropdown.OptionItem
                    key={option}
                    selected={option === direction}
                    onSelect={() => setDirection(option)}
                  >
                    {option}
                  </Dropdown.OptionItem>
                ))}
              </Dropdown.Section>
            </Dropdown.Content>
          </Dropdown.Root>
        </Dropdown.Section>
        <Dropdown.Separator />
        <Dropdown.Search
          aria-label="Search fields"
          placeholder="Search fields"
          value={search}
          onValueChange={setSearch}
          enterSelects="first-match"
        />
        <Dropdown.Section label="Fields">
          {fields.map((field) => (
            <Dropdown.OptionItem key={field} selected={false}>
              {field}
            </Dropdown.OptionItem>
          ))}
        </Dropdown.Section>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
