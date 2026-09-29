import { isNonEmptyArray, isNonEmptyString } from '@sniptt/guards';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Dropdown } from '../Dropdown';

const PEOPLE = ['Ada Lovelace', 'Grace Hopper', 'Margaret Hamilton'];

const SearchablePicker = ({
  multiple = false,
  onCreate,
  onSelectPerson,
}: {
  multiple?: boolean;
  onCreate: () => void;
  onSelectPerson?: (person: string) => void;
}) => {
  const [search, setSearch] = useState('');
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const results = PEOPLE.filter((person) =>
    person.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Dropdown.Root type="picker" multiple={multiple}>
      <Dropdown.Trigger>Assignees</Dropdown.Trigger>
      <Dropdown.Content aria-label="Choose assignees">
        <Dropdown.Search
          aria-label="Search people"
          value={search}
          onValueChange={setSearch}
        />
        <Dropdown.ActionItem onClick={onCreate}>
          Create person
        </Dropdown.ActionItem>
        {results.map((person) => (
          <Dropdown.OptionItem
            key={person}
            selected={selectedPeople.includes(person)}
            onSelect={() => {
              onSelectPerson?.(person);
              setSelectedPeople((current) =>
                current.includes(person)
                  ? current.filter(
                      (selectedPerson) => selectedPerson !== person,
                    )
                  : [...current, person],
              );
            }}
          >
            {person}
          </Dropdown.OptionItem>
        ))}
        {!isNonEmptyArray(results) && (
          <Dropdown.Empty>No people found</Dropdown.Empty>
        )}
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

describe('Dropdown picker', () => {
  it.each([
    { query: '', selectedPerson: undefined },
    { query: 'grace', selectedPerson: 'Grace Hopper' },
  ])(
    'handles Enter from search with query "$query"',
    async ({ query, selectedPerson }) => {
      const user = userEvent.setup();
      const onCreate = vi.fn();
      const onSelectPerson = vi.fn();
      render(
        <SearchablePicker
          onCreate={onCreate}
          onSelectPerson={onSelectPerson}
        />,
      );
      await user.click(screen.getByRole('button', { name: 'Assignees' }));
      const search = screen.getByRole('searchbox', { name: 'Search people' });
      await waitFor(() => expect(search).toHaveFocus());
      if (isNonEmptyString(query)) {
        await user.type(search, query);
      }
      await user.keyboard('{Enter}');
      expect(onCreate).not.toHaveBeenCalled();
      if (isNonEmptyString(selectedPerson)) {
        expect(onSelectPerson).toHaveBeenCalledExactlyOnceWith(selectedPerson);
      } else {
        expect(onSelectPerson).not.toHaveBeenCalled();
      }
    },
  );

  it('highlights the option Enter picks while the search has text', async () => {
    const user = userEvent.setup();
    render(<SearchablePicker onCreate={vi.fn()} />);
    await user.click(screen.getByRole('button', { name: 'Assignees' }));
    const search = screen.getByRole('searchbox', { name: 'Search people' });
    await waitFor(() => expect(search).toHaveFocus());
    expect(search).not.toHaveAttribute('aria-activedescendant');

    await user.type(search, 'a');
    const ada = screen.getByRole('button', { name: 'Ada Lovelace' });
    await waitFor(() => expect(ada).toHaveAttribute('data-highlighted'));
    expect(search).toHaveAttribute('aria-activedescendant', ada.id);
    expect(
      screen.getByRole('button', { name: 'Create person' }),
    ).not.toHaveAttribute('data-highlighted');

    await user.type(search, 'r');
    const margaret = screen.getByRole('button', { name: 'Margaret Hamilton' });
    await waitFor(() => expect(margaret).toHaveAttribute('data-highlighted'));
    expect(search).toHaveAttribute('aria-activedescendant', margaret.id);

    await user.clear(search);
    await waitFor(() =>
      expect(search).not.toHaveAttribute('aria-activedescendant'),
    );
    expect(
      screen.getByRole('button', { name: 'Ada Lovelace' }),
    ).not.toHaveAttribute('data-highlighted');
  });

  it('selects the first enabled result', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(
      <Dropdown.Root type="picker">
        <Dropdown.Trigger>Fields</Dropdown.Trigger>
        <Dropdown.Content aria-label="Fields">
          <Dropdown.Search aria-label="Search fields" />
          <Dropdown.OptionItem selected={false} disabled>
            Disabled
          </Dropdown.OptionItem>
          <Dropdown.OptionItem selected={false} onSelect={onSelect}>
            Name
          </Dropdown.OptionItem>
        </Dropdown.Content>
      </Dropdown.Root>,
    );
    await user.click(screen.getByRole('button', { name: 'Fields' }));
    const search = screen.getByRole('searchbox');
    await waitFor(() => expect(search).toHaveFocus());
    await user.type(search, 'n');
    await user.keyboard('{Enter}');
    expect(onSelect).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('leaves an empty result list open when Enter has no option to pick', async () => {
    const user = userEvent.setup();
    render(
      <Dropdown.Root type="picker">
        <Dropdown.Trigger>Fields</Dropdown.Trigger>
        <Dropdown.Content aria-label="Fields">
          <Dropdown.Search aria-label="Search fields" />
          <Dropdown.Empty>No fields found</Dropdown.Empty>
        </Dropdown.Content>
      </Dropdown.Root>,
    );
    await user.click(screen.getByRole('button', { name: 'Fields' }));
    const search = screen.getByRole('searchbox');
    await waitFor(() => expect(search).toHaveFocus());
    await user.type(search, 'x');
    await user.keyboard('{Enter}');
    expect(screen.getByRole('dialog')).toBeVisible();
    expect(search).toHaveFocus();
  });

  it('names the popup after its title and closes from the header', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Dropdown.Root type="picker" onOpenChange={onOpenChange}>
        <Dropdown.Trigger>Sort</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Header>
            <Dropdown.Close aria-label="Close sort" />
            <Dropdown.Title>Sort by</Dropdown.Title>
          </Dropdown.Header>
          <Dropdown.OptionItem selected={false}>Name</Dropdown.OptionItem>
        </Dropdown.Content>
      </Dropdown.Root>,
    );
    await user.click(screen.getByRole('button', { name: 'Sort' }));
    expect(
      await screen.findByRole('dialog', { name: 'Sort by' }),
    ).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Close sort' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('filters caller-owned results and navigates mixed commands and options from search', async () => {
    const user = userEvent.setup();

    render(<SearchablePicker onCreate={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Assignees' }));
    const dialog = await screen.findByRole('dialog', {
      name: 'Choose assignees',
    });
    const search = within(dialog).getByRole('searchbox', {
      name: 'Search people',
    });

    await waitFor(() => expect(search).toHaveFocus());
    await user.type(search, 'grace');
    expect(
      screen.queryByRole('button', { name: 'Ada Lovelace' }),
    ).not.toBeInTheDocument();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Create person' })).toHaveFocus();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Grace Hopper' })).toHaveFocus();
    await user.keyboard('{Enter}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: 'Assignees' })).toHaveFocus();
  });

  it('keeps multiple selections open and exposes their selected state', async () => {
    const user = userEvent.setup();

    render(<SearchablePicker multiple onCreate={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Assignees' }));
    const ada = screen.getByRole('button', { name: 'Ada Lovelace' });
    const grace = screen.getByRole('button', { name: 'Grace Hopper' });

    await user.click(ada);
    await user.click(grace);
    expect(ada).toHaveAttribute('aria-pressed', 'true');
    expect(grace).toHaveAttribute('aria-pressed', 'true');
    await user.click(ada);
    expect(ada).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('dialog')).toBeVisible();
  });

  it('closes a mixed picker after an inline action even with multiple selection enabled', async () => {
    const user = userEvent.setup();
    const createPerson = vi.fn();

    render(<SearchablePicker multiple onCreate={createPerson} />);

    await user.click(screen.getByRole('button', { name: 'Assignees' }));
    await user.click(screen.getByRole('button', { name: 'Create person' }));
    expect(createPerson).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('announces empty results without treating the message as a selectable result', async () => {
    const user = userEvent.setup();

    render(<SearchablePicker onCreate={vi.fn()} />);

    await user.click(screen.getByRole('button', { name: 'Assignees' }));
    await user.type(
      screen.getByRole('searchbox', { name: 'Search people' }),
      'unknown',
    );
    expect(screen.getByRole('status')).toHaveTextContent('No people found');
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('button', { name: 'Create person' })).toHaveFocus();
  });

  it('supports selection close overrides and blocks disabled options', async () => {
    const user = userEvent.setup();
    const selectArchived = vi.fn();
    const selectActive = vi.fn();

    render(
      <Dropdown.Root type="picker">
        <Dropdown.Trigger>Status</Dropdown.Trigger>
        <Dropdown.Content aria-label="Choose status">
          <Dropdown.OptionItem
            selected={false}
            disabled
            onSelect={selectArchived}
          >
            Archived
          </Dropdown.OptionItem>
          <Dropdown.OptionItem
            selected={false}
            closeOnSelect={false}
            onSelect={selectActive}
          >
            Active
          </Dropdown.OptionItem>
        </Dropdown.Content>
      </Dropdown.Root>,
    );

    await user.click(screen.getByRole('button', { name: 'Status' }));
    await user.click(screen.getByRole('button', { name: 'Archived' }));
    expect(selectArchived).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Active' }));
    expect(selectActive).toHaveBeenCalledOnce();
    expect(screen.getByRole('dialog')).toBeVisible();
  });

  it('renders caller-supplied loading status while server results are pending', async () => {
    const user = userEvent.setup();

    render(
      <Dropdown.Root type="picker">
        <Dropdown.Trigger>People</Dropdown.Trigger>
        <Dropdown.Content aria-label="Choose a person">
          <Dropdown.Search
            aria-label="Search people"
            value="Ada"
            onValueChange={vi.fn()}
          />
          <Dropdown.Loading>Loading people</Dropdown.Loading>
        </Dropdown.Content>
      </Dropdown.Root>,
    );

    await user.click(screen.getByRole('button', { name: 'People' }));
    expect(screen.getByRole('status')).toHaveTextContent('Loading people');
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });
});
