import { isNonEmptyArray } from '@sniptt/guards';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { isDefined } from '@ui/utilities/utils/isDefined';

import { ComponentDecorator } from '@ui/testing';

import { Dropdown } from '../Dropdown';
import { createStoryState } from './createStoryState';
import { DROPDOWN_STORY_A11Y_PARAMETERS } from './dropdownStoryA11yParameters';

const PEOPLE = ['Ada Lovelace', 'Grace Hopper', 'Margaret Hamilton'];
const WORKSPACES = ['Acme', 'Globex', 'Initech'];

const onCreatePerson = fn();
const onEditItem = fn();
const onItemRef = fn<(element: HTMLElement | null) => void>();
const onSelectPerson = fn();
const onSelectOption = fn();
const onSelectDisabledOption = fn();
const onOpenChange = fn();
const onSearchChange = fn();

const reviewerIdRevision = createStoryState(0);
const disabledReviewerIndex = createStoryState<number | undefined>(undefined);
const rankedPeople = createStoryState(PEOPLE);

const SearchablePicker = ({
  multiple = false,
  initialSearch = '',
}: {
  multiple?: boolean;
  initialSearch?: string;
}) => {
  const [search, setSearch] = useState(initialSearch);
  const results = PEOPLE.filter((person) =>
    person.toLowerCase().includes(search.toLowerCase()),
  );
  const options = results.map((person) => (
    <Dropdown.OptionItem
      key={person}
      value={person}
      onSelect={() => onSelectPerson(person)}
    >
      {person}
    </Dropdown.OptionItem>
  ));

  return (
    <Dropdown.Root type="picker">
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
        {multiple ? (
          <Dropdown.SelectionGroup id="people" aria-label="People" multiple>
            {options}
          </Dropdown.SelectionGroup>
        ) : (
          <Dropdown.SelectionGroup id="people" aria-label="People">
            {options}
          </Dropdown.SelectionGroup>
        )}
        {!isNonEmptyArray(results) && (
          <Dropdown.Empty>No people found</Dropdown.Empty>
        )}
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

const OwnerPicker = () => {
  const [search, setSearch] = useState('');
  const results = PEOPLE.filter((person) =>
    person.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>Owner</Dropdown.Trigger>
      <Dropdown.Content aria-label="Choose owner">
        <Dropdown.Search
          aria-label="Search people"
          value={search}
          onValueChange={setSearch}
        />
        <Dropdown.Section label="Actions">
          <Dropdown.ActionItem onClick={onCreatePerson}>
            Create person
          </Dropdown.ActionItem>
        </Dropdown.Section>
        <Dropdown.Section label="People">
          <Dropdown.SelectionGroup id="owner" aria-label="Owner">
            {results.map((person) => (
              <Dropdown.OptionItem
                key={person}
                value={person}
                onSelect={() => onSelectPerson(person)}
              >
                {person}
              </Dropdown.OptionItem>
            ))}
          </Dropdown.SelectionGroup>
        </Dropdown.Section>
        <Button>Manage people</Button>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

const ReviewerPicker = () => {
  const revision = reviewerIdRevision.useValue();
  const disabledIndex = disabledReviewerIndex.useValue();

  return (
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>Reviewers</Dropdown.Trigger>
      <Dropdown.Content aria-label="Choose reviewers">
        {PEOPLE.map((person, index) => (
          <Dropdown.OptionItem
            key={person}
            id={`reviewer-${index}-${revision}`}
            selected={false}
            disabled={index === disabledIndex}
          >
            {person}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

const RankedPicker = () => {
  const [search, setSearch] = useState('');
  const results = rankedPeople
    .useValue()
    .filter((person) => person.toLowerCase().includes(search.toLowerCase()));

  return (
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>Ranked people</Dropdown.Trigger>
      <Dropdown.Content aria-label="Choose a ranked person">
        <Dropdown.Search
          aria-label="Search people"
          value={search}
          onValueChange={setSearch}
        />
        {results.map((person) => (
          <Dropdown.OptionItem key={person} selected={false}>
            {person}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

const WorkspaceLinkPicker = () => {
  const [search, setSearch] = useState('');
  const results = WORKSPACES.filter((workspace) =>
    workspace.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>Workspaces</Dropdown.Trigger>
      <Dropdown.Content aria-label="Switch workspace">
        <Dropdown.Search
          aria-label="Search workspaces"
          value={search}
          onValueChange={setSearch}
        />
        {results.map((workspace) => (
          <Dropdown.OptionItem
            key={workspace}
            render={
              <a
                id={`workspace-${workspace.toLowerCase()}`}
                href={`mailto:${workspace.toLowerCase()}@example.com`}
                aria-label={workspace}
              />
            }
          >
            {workspace}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

const openPicker = async ({
  canvasElement,
  triggerName,
}: {
  canvasElement: HTMLElement;
  triggerName: string;
}) => {
  const body = within(canvasElement.ownerDocument.body);

  await userEvent.click(
    within(canvasElement).getByRole('button', { name: triggerName }),
  );
  const search = await body.findByRole('searchbox');

  await waitFor(() => expect(search).toHaveFocus());
  await waitFor(() => expect(body.getByRole('dialog')).toBeVisible());

  return search;
};

const meta: Meta = {
  id: 'ui-components-dropdown-interactions-picker',
  title: 'UI/Components/Navigation/Dropdown/Interactions/Picker',
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: { a11y: DROPDOWN_STORY_A11Y_PARAMETERS },
  beforeEach: () => {
    for (const spy of [
      onCreatePerson,
      onEditItem,
      onItemRef,
      onSelectPerson,
      onSelectOption,
      onSelectDisabledOption,
      onOpenChange,
      onSearchChange,
    ]) {
      spy.mockClear();
    }

    reviewerIdRevision.set(0);
    disabledReviewerIndex.set(undefined);
    rankedPeople.set(PEOPLE);
  },
};

export default meta;
type Story = StoryObj;

export const EnterWithEmptySearch: Story = {
  render: () => <SearchablePicker />,
  play: async ({ canvasElement }) => {
    await openPicker({ canvasElement, triggerName: 'Assignees' });
    await userEvent.keyboard('{Enter}');

    expect(onCreatePerson).not.toHaveBeenCalled();
    expect(onSelectPerson).not.toHaveBeenCalled();
  },
};

export const EnterWithMatchingSearch: Story = {
  render: () => <SearchablePicker />,
  play: async ({ canvasElement }) => {
    const search = await openPicker({
      canvasElement,
      triggerName: 'Assignees',
    });

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
    const search = await openPicker({
      canvasElement,
      triggerName: 'Assignees',
    });

    expect(search).not.toHaveAttribute('aria-activedescendant');

    await userEvent.type(search, 'a');
    const ada = body.getByRole('option', { name: 'Ada Lovelace' });

    await waitFor(() => expect(ada).toHaveAttribute('data-highlighted'));
    expect(search).toHaveAttribute('aria-activedescendant', ada.id);
    expect(
      body.getByRole('button', { name: 'Create person' }),
    ).not.toHaveAttribute('data-highlighted');

    await userEvent.type(search, 'r');
    const margaret = body.getByRole('option', { name: 'Margaret Hamilton' });

    await waitFor(() => expect(margaret).toHaveAttribute('data-highlighted'));
    expect(search).toHaveAttribute('aria-activedescendant', margaret.id);

    await userEvent.clear(search);
    await waitFor(() =>
      expect(search).not.toHaveAttribute('aria-activedescendant'),
    );
    expect(
      body.getByRole('option', { name: 'Ada Lovelace' }),
    ).not.toHaveAttribute('data-highlighted');
  },
};

export const TypingRightAfterOpening: Story = {
  tags: ['!dev'],
  render: () => <SearchablePicker />,
  play: async ({ canvasElement }) => {
    const { userEvent: trustedUserEvent } = await import('vitest/browser');
    const body = within(canvasElement.ownerDocument.body);
    const search = await openPicker({
      canvasElement,
      triggerName: 'Assignees',
    });

    await trustedUserEvent.keyboard('gra');

    expect(search).toHaveValue('gra');
    expect(
      body.queryByRole('option', { name: 'Ada Lovelace' }),
    ).not.toBeInTheDocument();
    const grace = body.getByRole('option', { name: 'Grace Hopper' });

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
    const search = await openPicker({
      canvasElement,
      triggerName: 'Assignees',
    });
    const margaret = body.getByRole('option', { name: 'Margaret Hamilton' });

    await waitFor(() => expect(margaret).toHaveAttribute('data-highlighted'));

    await trustedUserEvent.keyboard('{Backspace}');

    expect(search).toHaveValue('');
    expect(body.getByRole('option', { name: 'Ada Lovelace' })).toBeVisible();
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
    const search = await openPicker({
      canvasElement,
      triggerName: 'Assignees',
    });
    const ada = body.getByRole('option', { name: 'Ada Lovelace' });

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
    const search = await openPicker({ canvasElement, triggerName: 'Fields' });

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
    const search = await openPicker({ canvasElement, triggerName: 'Fields' });

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
      body.queryByRole('option', { name: 'Ada Lovelace' }),
    ).not.toBeInTheDocument();
    await userEvent.keyboard('{ArrowDown}');
    expect(body.getByRole('button', { name: 'Create person' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(body.getByRole('option', { name: 'Grace Hopper' })).toHaveFocus();
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

    await openPicker({ canvasElement, triggerName: 'Assignees' });
    const ada = body.getByRole('option', { name: 'Ada Lovelace' });
    const grace = body.getByRole('option', { name: 'Grace Hopper' });

    await userEvent.click(ada);
    await userEvent.click(grace);
    expect(ada).toHaveAttribute('aria-selected', 'true');
    expect(grace).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(ada);
    expect(ada).toHaveAttribute('aria-selected', 'false');
    expect(body.getByRole('dialog')).toBeVisible();
  },
};

export const InlineActionClosesMultiplePicker: Story = {
  render: () => <SearchablePicker multiple />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await openPicker({ canvasElement, triggerName: 'Assignees' });
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
    const search = await openPicker({
      canvasElement,
      triggerName: 'Assignees',
    });

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

    await openPicker({ canvasElement, triggerName: 'Fields' });
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

export const DisabledLinkOption: Story = {
  render: () => (
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>Workspaces</Dropdown.Trigger>
      <Dropdown.Content aria-label="Switch workspace">
        <Dropdown.OptionItem
          ref={onItemRef}
          disabled
          selected={false}
          render={
            <a
              href="#unavailable-workspace"
              aria-label="Unavailable workspace"
            />
          }
          onSelect={onSelectDisabledOption}
        >
          Unavailable workspace
        </Dropdown.OptionItem>
        <Dropdown.OptionItem selected={false}>
          Current workspace
        </Dropdown.OptionItem>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const document = canvasElement.ownerDocument;
    const body = within(document.body);
    const initialLocation = document.URL;

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Workspaces' }),
    );
    const link = await body.findByRole('link', {
      name: 'Unavailable workspace',
    });
    const currentWorkspace = body.getByRole('button', {
      name: 'Current workspace',
    });

    await expect(link).toHaveAttribute('aria-disabled', 'true');
    await expect(link).not.toHaveAttribute('disabled');
    await expect(link).toHaveAttribute('tabindex', '-1');
    await expect(onItemRef).toHaveBeenCalledWith(link);
    await waitFor(() => expect(currentWorkspace).toHaveFocus());
    await waitFor(() => expect(body.getByRole('dialog')).toBeVisible());
    await userEvent.click(link);
    await expect(onSelectDisabledOption).not.toHaveBeenCalled();
    await expect(document.URL).toBe(initialLocation);
    await waitFor(() => expect(body.getByRole('dialog')).toBeVisible());
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

export const OptionWithTrailingAction: Story = {
  render: () => (
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>Tabs</Dropdown.Trigger>
      <Dropdown.Content>
        <Dropdown.OptionItem
          ref={onItemRef}
          render={<div />}
          role="button"
          data-dnd-sortable-handle
          selected
          aria-label="Overview"
          onSelect={onSelectOption}
          actionsVisibility="always"
          actions={
            <Button
              size="sm"
              tabIndex={-1}
              onClick={(event) => {
                event.stopPropagation();
                onEditItem();
              }}
            >
              Edit overview
            </Button>
          }
        >
          Overview
        </Dropdown.OptionItem>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Tabs' }),
    );
    const option = await body.findByRole('button', {
      name: 'Overview',
    });
    await waitFor(() => expect(body.getByRole('dialog')).toBeVisible());
    const action = body.getByRole('button', { name: 'Edit overview' });

    expect(option.tagName).toBe('DIV');
    expect(option).toHaveAttribute('aria-pressed', 'true');
    expect(option).not.toHaveAttribute('aria-current');
    expect(option).toHaveAttribute('data-dnd-sortable-handle');
    expect(onItemRef).toHaveBeenCalledWith(option);
    expect(option.contains(action)).toBe(false);
    expect(action.closest('[data-dropdown-item]')).toBeNull();
    expect(option).toHaveAttribute('data-actions-visibility', 'always');
    expect(action).toHaveAttribute('tabindex', '-1');
    await userEvent.click(action);
    expect(onEditItem).toHaveBeenCalledOnce();
    expect(onSelectOption).not.toHaveBeenCalled();
    expect(body.getByRole('dialog')).toBeVisible();
    option.focus();
    await userEvent.keyboard('{Enter}');
    expect(onSelectOption).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const DisabledOptionsLeaveTabOrder: Story = {
  render: () => (
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>Tabs</Dropdown.Trigger>
      <Dropdown.Content>
        <Dropdown.OptionItem render={<div />} role="button" selected={false}>
          Overview
        </Dropdown.OptionItem>
        <Dropdown.OptionItem
          render={<div />}
          role="button"
          selected={false}
          disabled
        >
          Archive
        </Dropdown.OptionItem>
        <Dropdown.OptionItem
          render={<div />}
          role="button"
          selected={false}
          disabled
          actionsVisibility="always"
          actions={
            <Button size="sm" tabIndex={-1}>
              Edit timeline
            </Button>
          }
        >
          Timeline
        </Dropdown.OptionItem>
        <Dropdown.OptionItem render={<div />} role="button" selected={false}>
          Notes
        </Dropdown.OptionItem>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Tabs' }),
    );
    const overview = await body.findByRole('button', { name: 'Overview' });

    await waitFor(() => expect(overview).toHaveFocus());
    expect(body.getByRole('button', { name: 'Archive' })).toHaveAttribute(
      'tabindex',
      '-1',
    );
    expect(body.getByRole('button', { name: 'Timeline' })).toHaveAttribute(
      'tabindex',
      '-1',
    );
    await userEvent.keyboard('{ArrowDown}');
    const notes = body.getByRole('button', { name: 'Notes' });

    expect(notes).toHaveFocus();
    expect(notes).toHaveAttribute('tabindex', '0');
    expect(overview).toHaveAttribute('tabindex', '-1');
  },
};

export const CommandWithTrailingAction: Story = {
  render: () => (
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>Views</Dropdown.Trigger>
      <Dropdown.Content>
        <Dropdown.ActionItem
          aria-label="Open overview"
          onClick={onSelectOption}
          actions={
            <Button
              size="sm"
              tabIndex={-1}
              onClick={(event) => {
                event.stopPropagation();
                onEditItem();
              }}
            >
              Edit view
            </Button>
          }
        >
          Open overview
        </Dropdown.ActionItem>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Views' }),
    );
    const item = await body.findByRole('button', { name: 'Open overview' });
    await waitFor(() => expect(body.getByRole('dialog')).toBeVisible());

    const action = body.getByRole('button', { name: 'Edit view' });

    expect(item.tagName).toBe('BUTTON');
    expect(item.contains(action)).toBe(false);
    expect(action.closest('[data-dropdown-item]')).toBeNull();
    await userEvent.click(action);
    expect(onEditItem).toHaveBeenCalledOnce();
    expect(onSelectOption).not.toHaveBeenCalled();
    expect(body.getByRole('dialog')).toBeVisible();
    item.focus();
    await userEvent.keyboard(' ');
    expect(onSelectOption).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Views' }),
    );
    const reopenedItem = await body.findByRole('button', {
      name: 'Open overview',
    });
    await waitFor(() => expect(body.getByRole('dialog')).toBeVisible());
    const row = reopenedItem.parentElement;

    expect(row).toHaveAttribute('role', 'none');

    if (!isDefined(row)) {
      return;
    }

    await userEvent.click(row);
    expect(onSelectOption).toHaveBeenCalledTimes(2);
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const RowsShareOneTabStop: Story = {
  render: () => <OwnerPicker />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const search = await openPicker({ canvasElement, triggerName: 'Owner' });
    const create = body.getByRole('button', { name: 'Create person' });
    const ada = body.getByRole('option', { name: 'Ada Lovelace' });
    const grace = body.getByRole('option', { name: 'Grace Hopper' });
    const manage = body.getByRole('button', { name: 'Manage people' });

    await waitFor(() => expect(create).toHaveAttribute('tabindex', '0'));
    expect(ada).toHaveAttribute('tabindex', '-1');
    expect(grace).toHaveAttribute('tabindex', '-1');

    await userEvent.tab();
    expect(create).toHaveFocus();
    await userEvent.tab();
    expect(manage).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(create).toHaveFocus();

    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(grace).toHaveFocus();
    expect(onSelectPerson).not.toHaveBeenCalled();
    expect(onCreatePerson).not.toHaveBeenCalled();

    await userEvent.tab({ shift: true });
    expect(search).toHaveFocus();
    await waitFor(() => expect(grace).toHaveAttribute('tabindex', '0'));
    expect(create).toHaveAttribute('tabindex', '-1');
    await userEvent.tab();
    expect(grace).toHaveFocus();
    expect(body.getByRole('dialog', { name: 'Choose owner' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const TabStopReturnsToFirstRow: Story = {
  render: () => <OwnerPicker />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const search = await openPicker({ canvasElement, triggerName: 'Owner' });

    await userEvent.keyboard('{ArrowDown}{ArrowDown}{ArrowDown}{ArrowDown}');
    expect(
      body.getByRole('option', { name: 'Margaret Hamilton' }),
    ).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(search).toHaveFocus();
    await userEvent.type(search, 'gr');
    const grace = body.getByRole('option', { name: 'Grace Hopper' });

    await waitFor(() => expect(grace).toHaveAttribute('data-highlighted'));
    await userEvent.tab();
    expect(body.getByRole('button', { name: 'Create person' })).toHaveFocus();
    expect(onSelectPerson).not.toHaveBeenCalled();
    expect(onCreatePerson).not.toHaveBeenCalled();
    expect(body.getByRole('dialog', { name: 'Choose owner' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const TabLeavesPicker: Story = {
  render: () => (
    <>
      <SearchablePicker />
      <Button>Next control</Button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await openPicker({ canvasElement, triggerName: 'Assignees' });
    await userEvent.tab();
    expect(body.getByRole('button', { name: 'Create person' })).toHaveFocus();
    await userEvent.tab();
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        within(canvasElement).getByRole('button', { name: 'Next control' }),
      ).toHaveFocus(),
    );
    expect(onSelectPerson).not.toHaveBeenCalled();
    expect(onCreatePerson).not.toHaveBeenCalled();
  },
};

export const RowIdChangeKeepsOneTabStop: Story = {
  render: () => <ReviewerPicker />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Reviewers' }),
    );
    const dialog = await body.findByRole('dialog', {
      name: 'Choose reviewers',
    });
    const ada = within(dialog).getByRole('button', { name: 'Ada Lovelace' });
    const grace = within(dialog).getByRole('button', { name: 'Grace Hopper' });
    const getTabStops = () =>
      within(dialog)
        .getAllByRole('button')
        .filter((row) => row.getAttribute('tabindex') === '0');

    await waitFor(() => expect(ada).toHaveFocus());
    await waitFor(() => expect(getTabStops()).toEqual([ada]));

    reviewerIdRevision.set(1);

    await waitFor(() => expect(grace).toHaveAttribute('id', 'reviewer-1-1'));
    await waitFor(() => expect(getTabStops()).toEqual([ada]));
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const RenderElementIdsKeepOneTabStop: Story = {
  render: () => <WorkspaceLinkPicker />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const search = await openPicker({
      canvasElement,
      triggerName: 'Workspaces',
    });
    const dialog = body.getByRole('dialog', { name: 'Switch workspace' });
    const acme = within(dialog).getByRole('link', { name: 'Acme' });
    const getTabStops = () =>
      within(dialog)
        .getAllByRole('link')
        .filter((link) => link.getAttribute('tabindex') === '0');

    expect(acme).toHaveAttribute('id', 'workspace-acme');
    await waitFor(() => expect(getTabStops()).toEqual([acme]));

    await userEvent.type(search, 'glo');
    const globex = within(dialog).getByRole('link', { name: 'Globex' });

    await waitFor(() => expect(globex).toHaveAttribute('data-highlighted'));
    expect(search).toHaveAttribute('aria-activedescendant', 'workspace-globex');
    expect(getTabStops()).toEqual([globex]);
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const HighlightAndTabStopFollowReorder: Story = {
  render: () => <RankedPicker />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const search = await openPicker({
      canvasElement,
      triggerName: 'Ranked people',
    });

    await userEvent.type(search, 'a');
    const ada = body.getByRole('button', { name: 'Ada Lovelace' });
    const margaret = body.getByRole('button', { name: 'Margaret Hamilton' });

    await waitFor(() => expect(ada).toHaveAttribute('data-highlighted'));
    expect(ada).toHaveAttribute('tabindex', '0');

    rankedPeople.set(['Margaret Hamilton', 'Ada Lovelace', 'Grace Hopper']);

    await waitFor(() => expect(margaret).toHaveAttribute('data-highlighted'));
    expect(body.getByRole('button', { name: 'Margaret Hamilton' })).toBe(
      margaret,
    );
    expect(search).toHaveAttribute('aria-activedescendant', margaret.id);
    expect(margaret).toHaveAttribute('tabindex', '0');
    expect(ada).toHaveAttribute('tabindex', '-1');
    await userEvent.keyboard('{ArrowDown}');
    expect(margaret).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(ada).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const DisabledRowLeavesNavigationWhileOpen: Story = {
  render: () => <ReviewerPicker />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Reviewers' }),
    );
    const dialog = await body.findByRole('dialog', {
      name: 'Choose reviewers',
    });
    const ada = within(dialog).getByRole('button', { name: 'Ada Lovelace' });
    const grace = within(dialog).getByRole('button', { name: 'Grace Hopper' });
    const margaret = within(dialog).getByRole('button', {
      name: 'Margaret Hamilton',
    });

    await waitFor(() => expect(ada).toHaveFocus());

    disabledReviewerIndex.set(1);

    await waitFor(() => expect(grace).toBeDisabled());
    expect(grace).toHaveAttribute('tabindex', '-1');
    await userEvent.keyboard('{ArrowDown}');
    expect(margaret).toHaveFocus();

    disabledReviewerIndex.set(undefined);

    await waitFor(() => expect(grace).toBeEnabled());
    await userEvent.keyboard('{ArrowUp}');
    expect(grace).toHaveFocus();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};
