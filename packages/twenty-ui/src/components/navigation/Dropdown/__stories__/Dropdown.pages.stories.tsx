import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Input } from '@ui/primitives/input/Input/Input';
import { ComponentDecorator } from '@ui/testing';

import { Dropdown } from '../Dropdown';
import { useDropdownPage } from '../hooks/useDropdownPage';
import { type DropdownType } from '../types/DropdownType';
import { createStoryState } from './createStoryState';
import { DROPDOWN_STORY_A11Y_PARAMETERS } from './dropdownStoryA11yParameters';

type FilterAction = { label: string; page?: string };

const DEFAULT_FILTER_ACTIONS: FilterAction[] = [
  { label: 'People', page: 'people' },
  { label: 'Recent people', page: 'people' },
  { label: 'Clear filters' },
];

const filterActions = createStoryState(DEFAULT_FILTER_ACTIONS);
const editPageLoaded = createStoryState(false);
const editPageRevision = createStoryState(0);
const editPageType = createStoryState<DropdownType>('panel');

const onStatusChange = fn();

const FilterPages = ({ keepMounted }: { keepMounted?: boolean }) => {
  const [search, setSearch] = useState('');

  return (
    <Dropdown.Root type="menu">
      <Dropdown.Trigger>Filters</Dropdown.Trigger>
      <Dropdown.Content aria-label="Filters" keepMounted={keepMounted}>
        <Dropdown.Page id="root">
          {filterActions.useValue().map(({ label, page }) => (
            <Dropdown.ActionItem key={label} page={page}>
              {label}
            </Dropdown.ActionItem>
          ))}
        </Dropdown.Page>
        <Dropdown.Page id="people" type="picker">
          <Dropdown.Back>Back to filters</Dropdown.Back>
          <Dropdown.Search
            aria-label="Search people"
            value={search}
            onValueChange={setSearch}
          />
          <Dropdown.OptionItem selected={false}>
            Ada Lovelace
          </Dropdown.OptionItem>
        </Dropdown.Page>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

const StatusOptions = () => {
  const { goBack } = useDropdownPage();

  return ['Active', 'Archived'].map((status) => (
    <Dropdown.OptionItem
      key={status}
      selected={false}
      closeOnSelect={false}
      onSelect={() => {
        onStatusChange(status);
        goBack();
      }}
    >
      {status}
    </Dropdown.OptionItem>
  ));
};

const CurrentPage = () => {
  const { page, canGoBack } = useDropdownPage();

  return <p>{canGoBack ? `${page} page with history` : `${page} page`}</p>;
};

const OpenDetailsAction = () => {
  const { goToPage } = useDropdownPage();

  return (
    <Dropdown.ActionItem
      closeOnClick={false}
      onClick={() => goToPage('details')}
    >
      Open details
    </Dropdown.ActionItem>
  );
};

const DeferredEditPage = () => (
  <Dropdown.Root type="menu">
    <Dropdown.Trigger>Record actions</Dropdown.Trigger>
    <Dropdown.Content aria-label="Record actions">
      <Dropdown.Page id="root">
        <Dropdown.ActionItem page="edit">Edit</Dropdown.ActionItem>
      </Dropdown.Page>
      {editPageLoaded.useValue() && (
        <Dropdown.Page id="edit" type="panel">
          <Input aria-label="Name" />
          <Dropdown.Back>Back to actions</Dropdown.Back>
        </Dropdown.Page>
      )}
    </Dropdown.Content>
  </Dropdown.Root>
);

const RemountingEditPage = () => (
  <Dropdown.Root type="menu">
    <Dropdown.Trigger>Record actions</Dropdown.Trigger>
    <Dropdown.Content aria-label="Record actions">
      <Dropdown.Page id="root">
        <Dropdown.ActionItem page="edit">Edit</Dropdown.ActionItem>
      </Dropdown.Page>
      <Dropdown.Page key={editPageRevision.useValue()} id="edit" type="panel">
        <Input aria-label="Name" />
      </Dropdown.Page>
      <Input aria-label="Notes" />
    </Dropdown.Content>
  </Dropdown.Root>
);

const RetypedEditPage = () => {
  const [name, setName] = useState('Acme');
  const [website, setWebsite] = useState('acme.example');

  return (
    <Dropdown.Root type="menu">
      <Dropdown.Trigger>Record actions</Dropdown.Trigger>
      <Dropdown.Content aria-label="Record actions">
        <Dropdown.Page id="root">
          <Dropdown.ActionItem page="edit">Edit</Dropdown.ActionItem>
        </Dropdown.Page>
        <Dropdown.Page id="edit" type={editPageType.useValue()}>
          <Input aria-label="Name" value={name} onValueChange={setName} />
          <Input
            aria-label="Website"
            value={website}
            onValueChange={setWebsite}
          />
          <Dropdown.Back>Back to actions</Dropdown.Back>
        </Dropdown.Page>
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

const openFilters = async (canvasElement: HTMLElement) => {
  const trigger = within(canvasElement).getByRole('button', {
    name: 'Filters',
  });

  await userEvent.click(trigger);

  return trigger;
};

const openRecordActions = (canvasElement: HTMLElement) =>
  userEvent.click(
    within(canvasElement).getByRole('button', { name: 'Record actions' }),
  );

const playResetsToRootPageAfterDismissal = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const body = within(canvasElement.ownerDocument.body);
  const trigger = await openFilters(canvasElement);

  await userEvent.click(await body.findByRole('menuitem', { name: 'People' }));
  await body.findByRole('searchbox', { name: 'Search people' });
  await userEvent.keyboard('{Escape}');
  await waitFor(() =>
    expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
  );
  await waitFor(() => expect(trigger).toHaveFocus());
  await userEvent.click(trigger);
  await waitFor(() =>
    expect(body.getByRole('menuitem', { name: 'People' })).toBeVisible(),
  );
  expect(body.queryByRole('searchbox')).not.toBeInTheDocument();
};

const meta: Meta = {
  title: 'UI/Components/Dropdown/Interactions/Pages',
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: { a11y: DROPDOWN_STORY_A11Y_PARAMETERS },
  beforeEach: () => {
    filterActions.set(DEFAULT_FILTER_ACTIONS);
    editPageLoaded.set(false);
    editPageRevision.set(0);
    editPageType.set('panel');
    onStatusChange.mockClear();
  },
};

export default meta;
type Story = StoryObj;

export const SelectionReturnsToPreviousPage: Story = {
  render: () => (
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>Filters</Dropdown.Trigger>
      <Dropdown.Content aria-label="Filters">
        <Dropdown.Page id="root">
          <Dropdown.ActionItem>Clear filters</Dropdown.ActionItem>
          <Dropdown.ActionItem page="status">Status</Dropdown.ActionItem>
        </Dropdown.Page>
        <Dropdown.Page id="status">
          <Dropdown.Back>Back to filters</Dropdown.Back>
          <StatusOptions />
        </Dropdown.Page>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await openFilters(canvasElement);
    await userEvent.click(await body.findByRole('button', { name: 'Status' }));
    await userEvent.click(
      await body.findByRole('button', { name: 'Archived' }),
    );

    expect(onStatusChange).toHaveBeenCalledWith('Archived');
    expect(body.getByRole('dialog', { name: 'Filters' })).toBeVisible();
    expect(
      body.queryByRole('button', { name: 'Archived' }),
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(body.getByRole('button', { name: 'Status' })).toHaveFocus(),
    );
  },
};

export const ProgrammaticNavigation: Story = {
  render: () => (
    <Dropdown.Root type="menu">
      <Dropdown.Trigger>Record actions</Dropdown.Trigger>
      <Dropdown.Content aria-label="Record actions">
        <Dropdown.Page id="root">
          <CurrentPage />
          <OpenDetailsAction />
        </Dropdown.Page>
        <Dropdown.Page id="details">
          <CurrentPage />
          <Dropdown.Back>Back to actions</Dropdown.Back>
        </Dropdown.Page>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await openRecordActions(canvasElement);
    await waitFor(() => expect(body.getByText('root page')).toBeVisible());
    await userEvent.click(body.getByRole('menuitem', { name: 'Open details' }));
    expect(body.getByText('details page with history')).toBeVisible();
    expect(body.getByRole('menu', { name: 'Record actions' })).toBeVisible();
    await userEvent.click(
      body.getByRole('menuitem', { name: 'Back to actions' }),
    );
    expect(body.getByText('root page')).toBeVisible();
    await waitFor(() =>
      expect(
        body.getByRole('menuitem', { name: 'Open details' }),
      ).toHaveFocus(),
    );
  },
};

export const PreventedNavigation: Story = {
  render: () => (
    <Dropdown.Root type="menu">
      <Dropdown.Trigger>Record actions</Dropdown.Trigger>
      <Dropdown.Content aria-label="Record actions">
        <Dropdown.Page id="root">
          <Dropdown.ActionItem
            page="edit"
            onClick={(event) => event.preventDefault()}
          >
            Edit
          </Dropdown.ActionItem>
        </Dropdown.Page>
        <Dropdown.Page id="edit" type="panel">
          <Input aria-label="Name" />
        </Dropdown.Page>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await openRecordActions(canvasElement);
    const edit = await body.findByRole('menuitem', { name: 'Edit' });

    await userEvent.click(edit);

    expect(edit).toHaveFocus();
    expect(
      body.queryByRole('textbox', { name: 'Name' }),
    ).not.toBeInTheDocument();
  },
};

export const DestinationPageArrivesLater: Story = {
  render: () => <DeferredEditPage />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await openRecordActions(canvasElement);
    await userEvent.click(await body.findByRole('menuitem', { name: 'Edit' }));

    const content = body.getByRole('menu', { name: 'Record actions' });

    await waitFor(() => expect(content).toHaveFocus());

    editPageLoaded.set(true);

    await waitFor(() =>
      expect(body.getByRole('textbox', { name: 'Name' })).toBeVisible(),
    );
    expect(content).toHaveFocus();
  },
};

export const ActivePageRemount: Story = {
  render: () => <RemountingEditPage />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await openRecordActions(canvasElement);
    await userEvent.click(await body.findByRole('menuitem', { name: 'Edit' }));
    await waitFor(() =>
      expect(body.getByRole('textbox', { name: 'Name' })).toHaveFocus(),
    );
    await userEvent.tab();
    const notes = body.getByRole('textbox', { name: 'Notes' });

    expect(notes).toHaveFocus();

    editPageRevision.set(1);

    await waitFor(() =>
      expect(body.getByRole('textbox', { name: 'Name' })).toBeVisible(),
    );
    expect(notes).toHaveFocus();
  },
};

export const DefaultPageType: Story = {
  render: () => (
    <Dropdown.Root type="picker" defaultPage="actions">
      <Dropdown.Trigger>Record actions</Dropdown.Trigger>
      <Dropdown.Content aria-label="Record actions">
        <Dropdown.Page id="actions" type="menu">
          <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
          <Dropdown.ActionItem>Export</Dropdown.ActionItem>
        </Dropdown.Page>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.tab();
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() =>
      expect(body.getByRole('menu', { name: 'Record actions' })).toBeVisible(),
    );
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'Export' })).toHaveFocus(),
    );
  },
};

export const DefaultPanelPage: Story = {
  render: () => (
    <Dropdown.Root type="menu" defaultPage="edit">
      <Dropdown.Trigger>Edit details</Dropdown.Trigger>
      <Dropdown.Content aria-label="Edit details">
        <Dropdown.Page id="edit" type="panel">
          <Input aria-label="Name" />
          <Dropdown.ActionItem>Save</Dropdown.ActionItem>
        </Dropdown.Page>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.tab();
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() =>
      expect(body.getByRole('dialog', { name: 'Edit details' })).toBeVisible(),
    );
    await waitFor(() =>
      expect(body.getByRole('textbox', { name: 'Name' })).toHaveFocus(),
    );
  },
};

export const ActivePageTypeChange: Story = {
  render: () => <RetypedEditPage />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await openRecordActions(canvasElement);
    await userEvent.click(await body.findByRole('menuitem', { name: 'Edit' }));

    const name = body.getByRole('textbox', { name: 'Name' });
    const website = body.getByRole('textbox', { name: 'Website' });

    await waitFor(() => expect(name).toHaveFocus());
    await userEvent.keyboard(' company');
    expect(name).toHaveValue('Acme company');
    await userEvent.tab();
    expect(website).toHaveFocus();
    await userEvent.keyboard('{End}/contact');
    expect(website).toHaveValue('acme.example/contact');
    expect(website).toHaveFocus();

    editPageType.set('menu');

    await waitFor(() =>
      expect(body.getByRole('menu', { name: 'Record actions' })).toBeVisible(),
    );
    expect(website).toHaveFocus();
    await userEvent.click(
      body.getByRole('menuitem', { name: 'Back to actions' }),
    );
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'Edit' })).toHaveFocus(),
    );
  },
};

export const InitialFocusDisabled: Story = {
  render: () => (
    <Dropdown.Root type="menu">
      <Dropdown.Trigger>Filters</Dropdown.Trigger>
      <Dropdown.Content aria-label="Filters" initialFocus={false}>
        <Dropdown.Page id="root" type="picker">
          <Dropdown.Search aria-label="Search people" />
        </Dropdown.Page>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await openFilters(canvasElement);

    await waitFor(() =>
      expect(body.getByRole('dialog', { name: 'Filters' })).toBeVisible(),
    );
    expect(trigger).toHaveFocus();
  },
};

export const InteractionTypeChange: Story = {
  render: () => <FilterPages />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await openFilters(canvasElement);
    await waitFor(() =>
      expect(body.getByRole('menu', { name: 'Filters' })).toBeVisible(),
    );
    await userEvent.click(body.getByRole('menuitem', { name: 'People' }));
    expect(body.queryByRole('menu')).not.toBeInTheDocument();
    expect(body.getByRole('dialog', { name: 'Filters' })).toBeVisible();
    await waitFor(() =>
      expect(
        body.getByRole('searchbox', { name: 'Search people' }),
      ).toHaveFocus(),
    );
    await userEvent.click(
      body.getByRole('button', { name: 'Back to filters' }),
    );
    expect(body.getByRole('menu', { name: 'Filters' })).toBeVisible();
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'People' })).toHaveFocus(),
    );
  },
};

export const ResetsToRootPageAfterDismissal: Story = {
  render: () => <FilterPages />,
  play: playResetsToRootPageAfterDismissal,
};

export const ResetsToRootPageAfterDismissalWhenKeptMounted: Story = {
  render: () => <FilterPages keepMounted />,
  play: playResetsToRootPageAfterDismissal,
};

export const SharedDestination: Story = {
  render: () => <FilterPages />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await openFilters(canvasElement);
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Recent people' }),
    );
    await userEvent.click(
      await body.findByRole('button', { name: 'Back to filters' }),
    );
    await waitFor(() =>
      expect(
        body.getByRole('menuitem', { name: 'Recent people' }),
      ).toHaveFocus(),
    );
  },
};

export const ReorderedEntrypoints: Story = {
  render: () => <FilterPages />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await openFilters(canvasElement);
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Recent people' }),
    );

    filterActions.set([
      { label: 'Recent people', page: 'people' },
      { label: 'People', page: 'people' },
    ]);

    await userEvent.click(
      await body.findByRole('button', { name: 'Back to filters' }),
    );
    await waitFor(() =>
      expect(
        body.getByRole('menuitem', { name: 'Recent people' }),
      ).toHaveFocus(),
    );
  },
};

export const MovedAndRenamedDestination: Story = {
  beforeEach: () => {
    filterActions.set([
      { label: 'People', page: 'people' },
      { label: 'Clear filters' },
    ]);
  },
  render: () => <FilterPages />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await openFilters(canvasElement);
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'People' }),
    );

    filterActions.set([
      { label: 'Clear filters' },
      { label: 'All people', page: 'people' },
    ]);

    await userEvent.click(
      await body.findByRole('button', { name: 'Back to filters' }),
    );
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'All people' })).toHaveFocus(),
    );
  },
};
