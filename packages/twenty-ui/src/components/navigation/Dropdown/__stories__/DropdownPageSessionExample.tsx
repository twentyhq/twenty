import { useState } from 'react';

import { Input } from '@ui/primitives/input/Input/Input';

import { Dropdown } from '../Dropdown';
import { type DropdownRootProps } from '../types/DropdownRootProps';

const PeoplePageContent = () => {
  const [query, setQuery] = useState('');

  return (
    <>
      <Dropdown.Back>Back to actions</Dropdown.Back>
      <Dropdown.Search
        aria-label="Find person"
        value={query}
        onValueChange={setQuery}
      />
      <Dropdown.SelectionGroup
        id="session-person"
        aria-label="Person"
        defaultValue="Ada Lovelace"
        closeOnSelect={false}
      >
        {['Ada Lovelace', 'Grace Hopper']
          .filter((person) =>
            person.toLowerCase().includes(query.toLowerCase()),
          )
          .map((person) => (
            <Dropdown.OptionItem key={person} value={person}>
              {person}
            </Dropdown.OptionItem>
          ))}
      </Dropdown.SelectionGroup>
    </>
  );
};

export const DropdownPageSessionExample = ({
  keepMounted = false,
  hasPages = true,
  open,
  onOpenChange,
}: Pick<DropdownRootProps, 'open' | 'onOpenChange'> & {
  keepMounted?: boolean;
  hasPages?: boolean;
}) => (
  <Dropdown.Root
    type={hasPages ? 'menu' : 'panel'}
    defaultPage="actions"
    open={open}
    onOpenChange={onOpenChange}
  >
    <Dropdown.Trigger>Session actions</Dropdown.Trigger>
    <Dropdown.Content aria-label="Session actions" keepMounted={keepMounted}>
      {!hasPages && (
        <>
          <Dropdown.Search aria-label="Find person" />
          <Input aria-label="Draft name" defaultValue="Acme" />
        </>
      )}
      {hasPages && (
        <>
          <Dropdown.Page id="actions">
            <Dropdown.ActionItem page="edit">Edit details</Dropdown.ActionItem>
            <Dropdown.ActionItem page="people">
              Choose person
            </Dropdown.ActionItem>
          </Dropdown.Page>
          <Dropdown.Page id="edit" type="panel">
            <Input aria-label="Draft name" defaultValue="Acme" />
            <Dropdown.Back>Back to actions</Dropdown.Back>
          </Dropdown.Page>
          <Dropdown.Page id="people" type="picker">
            <PeoplePageContent />
          </Dropdown.Page>
        </>
      )}
    </Dropdown.Content>
  </Dropdown.Root>
);
