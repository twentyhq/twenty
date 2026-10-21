import { useState } from 'react';

import { Input } from '@ui/primitives/input/Input/Input';

import { Dropdown } from '../Dropdown';

export const DropdownControlledPageSessionExample = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [draft, setDraft] = useState('Acme');
  const [person, setPerson] = useState<string | null>('Ada Lovelace');

  return (
    <Dropdown.Root type="menu" open={open} onOpenChange={setOpen}>
      <Dropdown.Trigger>Controlled session</Dropdown.Trigger>
      <Dropdown.Content aria-label="Controlled session" keepMounted>
        <Dropdown.Page id="root">
          <Dropdown.ActionItem page="edit">Edit details</Dropdown.ActionItem>
          <Dropdown.ActionItem page="people">Choose person</Dropdown.ActionItem>
        </Dropdown.Page>
        <Dropdown.Page id="edit" type="panel">
          <Input
            aria-label="Owned draft"
            value={draft}
            onValueChange={setDraft}
          />
          <Dropdown.Back>Back to actions</Dropdown.Back>
        </Dropdown.Page>
        <Dropdown.Page id="people" type="picker">
          <Dropdown.Back>Back to actions</Dropdown.Back>
          <Dropdown.Search
            aria-label="Owned search"
            value={query}
            onValueChange={setQuery}
          />
          <Dropdown.SelectionGroup
            id="owned-person"
            aria-label="Person"
            value={person}
            onValueChange={setPerson}
            closeOnSelect={false}
          >
            {['Ada Lovelace', 'Grace Hopper']
              .filter((name) =>
                name.toLowerCase().includes(query.toLowerCase()),
              )
              .map((name) => (
                <Dropdown.OptionItem key={name} value={name}>
                  {name}
                </Dropdown.OptionItem>
              ))}
          </Dropdown.SelectionGroup>
        </Dropdown.Page>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};
