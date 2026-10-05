import { isNonEmptyArray } from '@sniptt/guards';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { ComponentDecorator } from '@ui/testing';

import { Dropdown } from '../Dropdown';
import { DROPDOWN_STORY_A11Y_PARAMETERS } from './dropdownStoryA11yParameters';

const PEOPLE = ['Ada Lovelace', 'Grace Hopper', 'Margaret Hamilton'];

const onCreatePerson = fn();
const onSelectPerson = fn();
const onSelectOption = fn();
const onSelectDisabledOption = fn();
const onOpenChange = fn();
const onSearchChange = fn();

const SearchablePicker = ({
  multiple = false,
  initialSearch = '',
}: {
  multiple?: boolean;
  initialSearch?: string;
}) => {
  const [search, setSearch] = useState(initialSearch);
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
        <Dropdown.ActionItem onClick={onCreatePerson}>
          Create person
        </Dropdown.ActionItem>
        {results.map((person) => (
          <Dropdown.OptionItem
            key={person}
            selected={selectedPeople.includes(person)}
            onSelect={() => {
              onSelectPerson(person);
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

const openAssignees = async (canvasElement: HTMLElement) => {
  await userEvent.click(
    within(canvasElement).getByRole('button', { name: 'Assignees' }),
  );
  const search = await within(canvasElement.ownerDocument.body).findByRole(
    'searchbox',
    { name: 'Search people' },
  );

  await waitFor(() => expect(search).toHaveFocus());
  await waitFor(() =>
    expect(
      within(canvasElement.ownerDocument.body).getByRole('dialog'),
    ).toBeVisible(),
  );

  return search;
};

const openFields = async (canvasElement: HTMLElement) => {
  await userEvent.click(
    within(canvasElement).getByRole('button', { name: 'Fields' }),
  );
  const search = await within(canvasElement.ownerDocument.body).findByRole(
    'searchbox',
  );

  await waitFor(() => expect(search).toHaveFocus());
  await waitFor(() =>
    expect(
      within(canvasElement.ownerDocument.body).getByRole('dialog'),
    ).toBeVisible(),
  );

  return search;
};

const meta: Meta = {
  title: 'UI/Components/Dropdown/Interactions/Picker',
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: { a11y: DROPDOWN_STORY_A11Y_PARAMETERS },
  beforeEach: () => {
    for (const spy of [
      onCreatePerson,
      onSelectPerson,
      onSelectOption,
      onSelectDisabledOption,
      onOpenChange,
      onSearchChange,
    ]) {
      spy.mockClear();
    }
  },
};

export default meta;
type Story = StoryObj;

export const EnterWithEmptySearch: Story = {
  render: () => <SearchablePicker />,
  play: async ({ canvasElement }) => {
    await openAssignees(canvasElement);
    await userEvent.keyboard('{Enter}');

    expect(onCreatePerson).not.toHaveBeenCalled();
    expect(onSelectPerson).not.toHaveBeenCalled();
  },
};

export const EnterWithMatchingSearch: Story = {
  render: () => <SearchablePicker />,
  play: async ({ canvasElement }) => {
    const search = await openAssignees(canvasElement);

    await userEvent.type(search, 'grace');
    await userEvent.keyboard('{Enter}');

    expect(onCreatePerson).not.toHaveBeenCalled();
    expect(onSelectPerson).toHaveBeenCalledOnce();
    expect(onSelectPerson).toHaveBeenCalledWith('Grace Hopper');
  },
};

export const HighlightFollowsSearch: Story = {
  render: () => <SearchablePicker />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const search = await openAssignees(canvasElement);

    expect(search).not.toHaveAttribute('aria-activedescendant');

    await userEvent.type(search, 'a');
    const ada = body.getByRole('button', { name: 'Ada Lovelace' });

    await waitFor(() => expect(ada).toHaveAttribute('data-highlighted'));
    expect(search).toHaveAttribute('aria-activedescendant', ada.id);
    expect(
      body.getByRole('button', { name: 'Create person' }),
    ).not.toHaveAttribute('data-highlighted');

    await userEvent.type(search, 'r');
    const margaret = body.getByRole('button', { name: 'Margaret Hamilton' });

    await waitFor(() => expect(margaret).toHaveAttribute('data-highlighted'));
    expect(search).toHaveAttribute('aria-activedescendant', margaret.id);

    await userEvent.clear(search);
    await waitFor(() =>
      expect(search).not.toHaveAttribute('aria-activedescendant'),
    );
    expect(
      body.getByRole('button', { name: 'Ada Lovelace' }),
    ).not.toHaveAttribute('data-highlighted');
  },
};

export const TypingRightAfterOpening: Story = {
  tags: ['!dev'],
  render: () => <SearchablePicker />,
  play: async ({ canvasElement }) => {
    const { userEvent: trustedUserEvent } = await import('vitest/browser');
    const body = within(canvasElement.ownerDocument.body);
    const search = await openAssignees(canvasElement);

    await trustedUserEvent.keyboard('gra');

    expect(search).toHaveValue('gra');
    expect(
      body.queryByRole('button', { name: 'Ada Lovelace' }),
    ).not.toBeInTheDocument();
    const grace = body.getByRole('button', { name: 'Grace Hopper' });

    await waitFor(() => expect(grace).toHaveAttribute('data-highlighted'));
    expect(search).toHaveAttribute('aria-activedescendant', grace.id);

    await trustedUserEvent.keyboard('{Enter}');
    expect(onSelectPerson).toHaveBeenCalledOnce();
    expect(onSelectPerson).toHaveBeenCalledWith('Grace Hopper');
  },
};

export const BackspaceClearingSearch: Story = {
  tags: ['!dev'],
  render: () => <SearchablePicker initialSearch="m" />,
  play: async ({ canvasElement }) => {
    const { userEvent: trustedUserEvent } = await import('vitest/browser');
    const body = within(canvasElement.ownerDocument.body);
    const search = await openAssignees(canvasElement);
    const margaret = body.getByRole('button', { name: 'Margaret Hamilton' });

    await waitFor(() => expect(margaret).toHaveAttribute('data-highlighted'));

    await trustedUserEvent.keyboard('{Backspace}');

    expect(search).toHaveValue('');
    expect(body.getByRole('button', { name: 'Ada Lovelace' })).toBeVisible();
    await waitFor(() =>
      expect(search).not.toHaveAttribute('aria-activedescendant'),
    );
    expect(margaret).not.toHaveAttribute('data-highlighted');
  },
};

export const HighlightFollowsTypedSearch: Story = {
  tags: ['!dev'],
  render: () => <SearchablePicker />,
  play: async ({ canvasElement }) => {
    const { userEvent: trustedUserEvent } = await import('vitest/browser');
    const body = within(canvasElement.ownerDocument.body);
    const search = await openAssignees(canvasElement);
    const ada = body.getByRole('button', { name: 'Ada Lovelace' });

    await trustedUserEvent.keyboard('a');

    expect(search).toHaveValue('a');
    await waitFor(() => expect(ada).toHaveAttribute('data-highlighted'));
    expect(search).toHaveAttribute('aria-activedescendant', ada.id);

    await trustedUserEvent.keyboard('{Backspace}');

    expect(search).toHaveValue('');
    await waitFor(() =>
      expect(search).not.toHaveAttribute('aria-activedescendant'),
    );
    expect(ada).not.toHaveAttribute('data-highlighted');

    await trustedUserEvent.keyboard('x');

    expect(search).toHaveValue('x');
    expect(body.getByRole('status')).toHaveTextContent('No people found');
    await waitFor(() =>
      expect(search).not.toHaveAttribute('aria-activedescendant'),
    );

    await trustedUserEvent.keyboard('{Enter}');
    expect(onSelectPerson).not.toHaveBeenCalled();
    expect(body.getByRole('dialog')).toBeVisible();
  },
};

export const FirstEnabledResult: Story = {
  render: () => (
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>Fields</Dropdown.Trigger>
      <Dropdown.Content aria-label="Fields">
        <Dropdown.Search aria-label="Search fields" />
        <Dropdown.OptionItem selected={false} disabled>
          Disabled
        </Dropdown.OptionItem>
        <Dropdown.OptionItem selected={false} onSelect={onSelectOption}>
          Name
        </Dropdown.OptionItem>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const search = await openFields(canvasElement);

    await userEvent.type(search, 'n');
    await userEvent.keyboard('{Enter}');
    expect(onSelectOption).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const EmptyResultsStayOpen: Story = {
  render: () => (
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>Fields</Dropdown.Trigger>
      <Dropdown.Content aria-label="Fields">
        <Dropdown.Search aria-label="Search fields" />
        <Dropdown.Empty>No fields found</Dropdown.Empty>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const search = await openFields(canvasElement);

    await userEvent.type(search, 'x');
    await userEvent.keyboard('{Enter}');
    expect(body.getByRole('dialog')).toBeVisible();
    expect(search).toHaveFocus();
  },
};

export const TitleAndClose: Story = {
  render: () => (
    <Dropdown.Root type="picker" onOpenChange={onOpenChange}>
      <Dropdown.Trigger>Sort</Dropdown.Trigger>
      <Dropdown.Content>
        <Dropdown.Header>
          <Dropdown.Close aria-label="Close sort" />
          <Dropdown.Title>Sort by</Dropdown.Title>
        </Dropdown.Header>
        <Dropdown.OptionItem selected={false}>Name</Dropdown.OptionItem>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Sort' }),
    );
    await waitFor(() =>
      expect(body.getByRole('dialog', { name: 'Sort by' })).toBeVisible(),
    );
    await userEvent.click(body.getByRole('button', { name: 'Close sort' }));
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  },
};

export const MixedNavigationFromSearch: Story = {
  render: () => <SearchablePicker />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Assignees',
    });

    await userEvent.click(trigger);
    const dialog = await body.findByRole('dialog', {
      name: 'Choose assignees',
    });
    const search = within(dialog).getByRole('searchbox', {
      name: 'Search people',
    });

    await waitFor(() => expect(search).toHaveFocus());
    await userEvent.type(search, 'grace');
    expect(
      body.queryByRole('button', { name: 'Ada Lovelace' }),
    ).not.toBeInTheDocument();
    await userEvent.keyboard('{ArrowDown}');
    expect(body.getByRole('button', { name: 'Create person' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(body.getByRole('button', { name: 'Grace Hopper' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const MultipleSelectionStaysOpen: Story = {
  render: () => <SearchablePicker multiple />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await openAssignees(canvasElement);
    const ada = body.getByRole('button', { name: 'Ada Lovelace' });
    const grace = body.getByRole('button', { name: 'Grace Hopper' });

    await userEvent.click(ada);
    await userEvent.click(grace);
    expect(ada).toHaveAttribute('aria-pressed', 'true');
    expect(grace).toHaveAttribute('aria-pressed', 'true');
    await userEvent.click(ada);
    expect(ada).toHaveAttribute('aria-pressed', 'false');
    expect(body.getByRole('dialog')).toBeVisible();
  },
};

export const InlineActionClosesMultiplePicker: Story = {
  render: () => <SearchablePicker multiple />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await openAssignees(canvasElement);
    await userEvent.click(body.getByRole('button', { name: 'Create person' }));
    expect(onCreatePerson).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const EmptyResultsAnnounced: Story = {
  render: () => <SearchablePicker />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const search = await openAssignees(canvasElement);

    await userEvent.type(search, 'unknown');
    expect(body.getByRole('status')).toHaveTextContent('No people found');
    await userEvent.keyboard('{ArrowDown}');
    expect(body.getByRole('button', { name: 'Create person' })).toHaveFocus();
  },
};

export const SelectionOverrides: Story = {
  render: () => (
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>Status</Dropdown.Trigger>
      <Dropdown.Content aria-label="Choose status">
        <Dropdown.OptionItem
          selected={false}
          disabled
          onSelect={onSelectDisabledOption}
        >
          Archived
        </Dropdown.OptionItem>
        <Dropdown.OptionItem
          selected={false}
          closeOnSelect={false}
          onSelect={onSelectOption}
        >
          Active
        </Dropdown.OptionItem>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Status' }),
    );
    await userEvent.click(
      await body.findByRole('button', { name: 'Archived' }),
    );
    expect(onSelectDisabledOption).not.toHaveBeenCalled();
    await userEvent.click(body.getByRole('button', { name: 'Active' }));
    expect(onSelectOption).toHaveBeenCalledOnce();
    await waitFor(() => expect(body.getByRole('dialog')).toBeVisible());
  },
};

export const OptionsWithoutSelectionState: Story = {
  render: () => (
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>Fields</Dropdown.Trigger>
      <Dropdown.Content aria-label="Choose a field">
        <Dropdown.Search
          aria-label="Search fields"
          value="Stage"
          onValueChange={onSearchChange}
        />
        <Dropdown.OptionItem onSelect={() => onSelectOption('Stage')}>
          Stage
        </Dropdown.OptionItem>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await openFields(canvasElement);
    expect(body.getByRole('button', { name: 'Stage' })).not.toHaveAttribute(
      'aria-pressed',
    );
    await userEvent.keyboard('{Enter}');

    expect(onSelectOption).toHaveBeenCalledWith('Stage');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const LinkOptionsMarkCurrent: Story = {
  render: () => (
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>Workspaces</Dropdown.Trigger>
      <Dropdown.Content aria-label="Switch workspace">
        <Dropdown.OptionItem
          selected
          render={<a href="mailto:acme@example.com" aria-label="Acme" />}
        >
          Acme
        </Dropdown.OptionItem>
        <Dropdown.OptionItem
          selected={false}
          render={<a href="mailto:globex@example.com" aria-label="Globex" />}
        >
          Globex
        </Dropdown.OptionItem>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Workspaces' }),
    );
    const currentWorkspace = await body.findByRole('link', { name: 'Acme' });

    expect(currentWorkspace).toHaveAttribute('aria-current', 'true');
    expect(currentWorkspace).not.toHaveAttribute('aria-pressed');
    expect(body.getByRole('link', { name: 'Globex' })).not.toHaveAttribute(
      'aria-current',
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const LoadingStatus: Story = {
  render: () => (
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>People</Dropdown.Trigger>
      <Dropdown.Content aria-label="Choose a person">
        <Dropdown.Search
          aria-label="Search people"
          value="Ada"
          onValueChange={onSearchChange}
        />
        <Dropdown.Loading>Loading people</Dropdown.Loading>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'People' }),
    );
    expect(await body.findByRole('status')).toHaveTextContent('Loading people');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};
