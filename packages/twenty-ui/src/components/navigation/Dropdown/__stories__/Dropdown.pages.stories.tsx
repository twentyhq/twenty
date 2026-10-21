import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Input } from '@ui/primitives/input/Input/Input';
import { ComponentDecorator } from '@ui/testing';

import { Dropdown } from '../Dropdown';
import { useDropdownPage } from '../hooks/useDropdownPage';
import { type DropdownType } from '../types/DropdownType';
import { createStoryState } from './createStoryState';
import { DropdownPageSessionExample } from './DropdownPageSessionExample';
import { DropdownPickerPageSessionExample } from './DropdownPickerPageSessionExample';
import { DropdownNestedPageSessionExample } from './DropdownNestedPageSessionExample';
import { DropdownControlledPageSessionExample } from './DropdownControlledPageSessionExample';
import { DropdownPageActivityExample } from './DropdownPageActivityExample';
import { DROPDOWN_STORY_A11Y_PARAMETERS } from './dropdownStoryA11yParameters';

type FilterAction = { label: string; page?: string; id?: string };

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
const onNestedOpenChange = fn();
const onSessionOpenChange = fn();
const callerSessionOpen = createStoryState(false);

const FilterPages = ({ keepMounted }: { keepMounted?: boolean }) => {
  const [search, setSearch] = useState('');

  return (
    <Dropdown.Root type="menu">
      <Dropdown.Trigger>Filters</Dropdown.Trigger>
      <Dropdown.Content aria-label="Filters" keepMounted={keepMounted}>
        <Dropdown.Page id="root">
          {filterActions.useValue().map(({ label, page, id }) => (
            <Dropdown.ActionItem key={label} id={id} page={page}>
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
          <Dropdown.OptionItem selected={false}>
            Grace Hopper
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

const openRecordActions = (canvasElement: HTMLElement) => {
  return userEvent.click(
    within(canvasElement).getByRole('button', { name: 'Record actions' }),
  );
};

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
  id: 'ui-components-dropdown-interactions-pages',
  title: 'UI/Components/Navigation/Dropdown/Interactions/Pages',
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: { a11y: DROPDOWN_STORY_A11Y_PARAMETERS },
  beforeEach: () => {
    filterActions.set(DEFAULT_FILTER_ACTIONS);
    editPageLoaded.set(false);
    editPageRevision.set(0);
    editPageType.set('panel');
    onStatusChange.mockClear();
    onNestedOpenChange.mockClear();
    onSessionOpenChange.mockClear();
    callerSessionOpen.set(false);
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
    await waitFor(() =>
      expect(body.getByRole('dialog', { name: 'Filters' })).toBeVisible(),
    );
    expect(
      body.queryByRole('button', { name: 'Archived' }),
    ).not.toBeInTheDocument();
    await waitFor(() =>
      expect(body.getByRole('button', { name: 'Status' })).toHaveFocus(),
    );
  },
};

export const BackKeepsItsTabStopBesideSearch: Story = {
  render: () => <FilterPages />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await openFilters(canvasElement);
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'People' }),
    );
    const search = await body.findByRole('searchbox', {
      name: 'Search people',
    });

    const ada = body.getByRole('button', { name: 'Ada Lovelace' });
    const grace = body.getByRole('button', { name: 'Grace Hopper' });

    await waitFor(() => expect(search).toHaveFocus());
    await userEvent.tab();
    expect(ada).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    expect(grace).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(search).toHaveFocus();
    await userEvent.tab({ shift: true });
    expect(body.getByRole('button', { name: 'Back to filters' })).toHaveFocus();
    await userEvent.tab();
    expect(search).toHaveFocus();
    await userEvent.tab();
    expect(grace).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    expect(search).toHaveFocus();
  },
};

export const PageWithoutSearchFocusesFirstOption: Story = {
  render: () => (
    <Dropdown.Root type="picker">
      <Dropdown.Trigger>Filters</Dropdown.Trigger>
      <Dropdown.Content aria-label="Filters">
        <Dropdown.Page id="root">
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
    await waitFor(() =>
      expect(body.getByRole('button', { name: 'Active' })).toHaveFocus(),
    );
    await userEvent.keyboard('{Enter}');

    expect(onStatusChange).toHaveBeenCalledWith('Active');
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
    await waitFor(() =>
      expect(body.getByRole('paragraph')).toHaveTextContent('root page'),
    );
    await userEvent.click(body.getByRole('menuitem', { name: 'Open details' }));
    expect(body.getByRole('paragraph')).toHaveTextContent(
      'details page with history',
    );
    expect(body.getByRole('menu', { name: 'Record actions' })).toBeVisible();
    await userEvent.click(
      body.getByRole('menuitem', { name: 'Back to actions' }),
    );
    expect(body.getByRole('paragraph')).toHaveTextContent('root page');
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

export const KeepsPageWhileClosing: Story = {
  render: () => <FilterPages />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = await openFilters(canvasElement);

    await userEvent.click(
      await body.findByRole('menuitem', { name: 'People' }),
    );
    const popup = await body.findByRole('dialog', { name: 'Filters' });

    await within(popup).findByRole('searchbox', { name: 'Search people' });
    await userEvent.keyboard('{Escape}');
    expect(
      within(popup).getByRole('searchbox', {
        name: 'Search people',
        hidden: true,
      }),
    ).toBeInTheDocument();
    await waitFor(() => expect(popup).not.toBeInTheDocument());
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    await userEvent.click(trigger);
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'People' })).toBeVisible(),
    );
    expect(body.queryByRole('searchbox')).not.toBeInTheDocument();
  },
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

export const ConsumerIdRestoresTrigger: Story = {
  render: () => <FilterPages />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    filterActions.set([
      { label: 'People', page: 'people', id: 'people-filter' },
      { label: 'Clear filters' },
    ]);
    await openFilters(canvasElement);
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'People' }),
    );
    await body.findByRole('searchbox', { name: 'Search people' });

    filterActions.set([
      { label: 'Clear filters' },
      { label: 'Recent people', page: 'people' },
      { label: 'Everyone', page: 'people', id: 'people-filter' },
    ]);
    await userEvent.click(
      body.getByRole('button', { name: 'Back to filters' }),
    );

    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'Everyone' })).toHaveFocus(),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
  },
};

export const KeepsVisitedPageDrafts: Story = {
  render: () => <DropdownPageSessionExample />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Session actions' }),
    );
    const edit = await body.findByRole('menuitem', { name: 'Edit details' });

    expect(body.queryByLabelText('Draft name')).not.toBeInTheDocument();
    expect(body.queryByLabelText('Find person')).not.toBeInTheDocument();
    await userEvent.click(edit);
    const draft = await body.findByRole('textbox', { name: 'Draft name' });

    await userEvent.type(draft, ' company');
    await userEvent.click(
      body.getByRole('button', { name: 'Back to actions' }),
    );
    await waitFor(() => expect(edit).toHaveFocus());
    expect(draft).toBeInTheDocument();
    expect(draft).not.toBeVisible();
    expect(draft.closest('[inert]')).not.toBeNull();
    expect(body.queryByRole('textbox')).not.toBeInTheDocument();
    await userEvent.keyboard('{ArrowDown}');
    expect(body.getByRole('menuitem', { name: 'Choose person' })).toHaveFocus();
    await userEvent.click(edit);
    expect(body.getByRole('textbox', { name: 'Draft name' })).toBe(draft);
    expect(draft).toHaveValue('Acme company');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

const playResetsPageSession = async ({
  canvasElement,
}: {
  canvasElement: HTMLElement;
}) => {
  const body = within(canvasElement.ownerDocument.body);
  const trigger = within(canvasElement).getByRole('button', {
    name: 'Session actions',
  });

  await userEvent.click(trigger);
  await userEvent.click(
    await body.findByRole('menuitem', { name: 'Choose person' }),
  );
  const search = await body.findByRole('searchbox', { name: 'Find person' });

  await userEvent.type(search, 'Grace');
  await userEvent.click(body.getByRole('option', { name: 'Grace Hopper' }));
  await userEvent.click(body.getByRole('button', { name: 'Back to actions' }));
  await userEvent.click(
    await body.findByRole('menuitem', { name: 'Choose person' }),
  );
  expect(body.getByRole('searchbox', { name: 'Find person' })).toBe(search);
  expect(search).toHaveValue('Grace');
  expect(body.getByRole('option', { name: 'Grace Hopper' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await userEvent.click(body.getByRole('button', { name: 'Back to actions' }));
  await userEvent.click(
    await body.findByRole('menuitem', { name: 'Edit details' }),
  );
  const draft = await body.findByRole('textbox', { name: 'Draft name' });

  await userEvent.type(draft, ' company');
  await userEvent.keyboard('{Escape}');
  await waitFor(() =>
    expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
  );
  await waitFor(() => expect(trigger).toHaveFocus());
  await userEvent.click(trigger);
  await waitFor(() =>
    expect(body.getByRole('menuitem', { name: 'Edit details' })).toBeVisible(),
  );
  expect(body.queryByLabelText('Find person')).not.toBeInTheDocument();
  expect(body.queryByLabelText('Draft name')).not.toBeInTheDocument();
  await userEvent.click(body.getByRole('menuitem', { name: 'Edit details' }));
  expect(await body.findByRole('textbox', { name: 'Draft name' })).toHaveValue(
    'Acme',
  );
  await userEvent.click(body.getByRole('button', { name: 'Back to actions' }));
  await userEvent.click(
    await body.findByRole('menuitem', { name: 'Choose person' }),
  );
  expect(
    await body.findByRole('searchbox', { name: 'Find person' }),
  ).toHaveValue('');
  expect(body.getByRole('option', { name: 'Grace Hopper' })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  expect(body.getByRole('option', { name: 'Ada Lovelace' })).toHaveAttribute(
    'aria-selected',
    'false',
  );
  await userEvent.keyboard('{Escape}');
  await waitFor(() =>
    expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
  );
};

export const ResetsSearchAndDraftsPreservingSelection: Story = {
  render: () => <DropdownPageSessionExample />,
  play: playResetsPageSession,
};

export const ResetsKeptMountedSearchAndDraftsPreservingSelection: Story = {
  render: () => <DropdownPageSessionExample keepMounted />,
  play: playResetsPageSession,
};

export const KeepsCallerOwnedSearchAndDrafts: Story = {
  render: () => <DropdownControlledPageSessionExample />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Controlled session',
    });

    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Edit details' }),
    );
    await userEvent.type(
      await body.findByRole('textbox', { name: 'Owned draft' }),
      ' company',
    );
    await userEvent.click(
      body.getByRole('button', { name: 'Back to actions' }),
    );
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Choose person' }),
    );
    await userEvent.type(
      await body.findByRole('searchbox', { name: 'Owned search' }),
      'Grace',
    );
    await userEvent.click(body.getByRole('option', { name: 'Grace Hopper' }));
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await userEvent.click(trigger);
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Choose person' }),
    );
    expect(
      await body.findByRole('searchbox', { name: 'Owned search' }),
    ).toHaveValue('Grace');
    expect(body.getByRole('option', { name: 'Grace Hopper' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    await userEvent.click(
      body.getByRole('button', { name: 'Back to actions' }),
    );
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Edit details' }),
    );
    expect(
      await body.findByRole('textbox', { name: 'Owned draft' }),
    ).toHaveValue('Acme company');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const InactivePageClosesPortaledSubmenu: Story = {
  render: () => <DropdownNestedPageSessionExample />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Page actions' }),
    );
    const submenuTrigger = await body.findByRole('menuitem', {
      name: 'Nested actions',
    });

    await userEvent.click(submenuTrigger);
    const submenu = await body.findByRole('menu', { name: 'Nested actions' });

    await userEvent.click(
      within(submenu).getByRole('menuitem', { name: 'Continue to editor' }),
    );
    await waitFor(() =>
      expect(
        body.getByRole('textbox', { name: 'Nested page draft' }),
      ).toHaveFocus(),
    );
    await waitFor(() => expect(submenu).not.toBeVisible());
    expect(
      body.queryByRole('menu', { name: 'Nested actions' }),
    ).not.toBeInTheDocument();
    await userEvent.click(
      body.getByRole('button', { name: 'Back to actions' }),
    );
    expect(body.getByRole('menuitem', { name: 'Nested actions' })).toBe(
      submenuTrigger,
    );
    expect(submenuTrigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        body.queryByRole('menu', { name: 'Page actions' }),
      ).not.toBeInTheDocument(),
    );
  },
};

export const InactivePageSuspendsCallerOwnedNestedPopup: Story = {
  render: () => (
    <DropdownNestedPageSessionExample
      isNestedControlled
      onNestedOpenChange={onNestedOpenChange}
    />
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Page actions',
    });

    await userEvent.click(trigger);
    const nestedPopup = await body.findByRole('menu', {
      name: 'Nested actions',
    });

    await userEvent.click(
      within(nestedPopup).getByRole('menuitem', { name: 'Continue to editor' }),
    );
    await waitFor(() =>
      expect(
        body.getByRole('textbox', { name: 'Nested page draft' }),
      ).toHaveFocus(),
    );
    await waitFor(() => expect(nestedPopup).not.toBeVisible());
    expect(
      body.queryByRole('menu', { name: 'Nested actions' }),
    ).not.toBeInTheDocument();
    expect(onNestedOpenChange).not.toHaveBeenCalled();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(
        body.queryByRole('dialog', { name: 'Page actions' }),
      ).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(onNestedOpenChange).not.toHaveBeenCalled();
  },
};

export const PickerSelectionsOutlivePageSessions: Story = {
  render: () => <DropdownPickerPageSessionExample />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Picker pages',
    });

    for (const { pageName, searchName, query, optionName } of [
      {
        pageName: 'Country',
        searchName: 'Find country',
        query: 'Japon',
        optionName: 'Japon',
      },
      {
        pageName: 'Currency',
        searchName: 'Find currency',
        query: 'Euro',
        optionName: 'Euro (EUR)',
      },
      {
        pageName: 'Phone country',
        searchName: 'Find phone country',
        query: 'Canada',
        optionName: 'Canada (+1)',
      },
    ]) {
      await userEvent.click(trigger);
      await userEvent.click(
        await body.findByRole('menuitem', { name: pageName }),
      );
      const search = await body.findByRole('searchbox', { name: searchName });

      await userEvent.type(search, query);
      await userEvent.click(body.getByRole('option', { name: optionName }));
      await userEvent.click(
        body.getByRole('button', { name: 'Back to picker pages' }),
      );
      await userEvent.click(
        await body.findByRole('menuitem', { name: pageName }),
      );
      expect(body.getByRole('searchbox', { name: searchName })).toBe(search);
      expect(search).toHaveValue(query);
      expect(body.getByRole('option', { name: optionName })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await userEvent.keyboard('{Escape}');
      await waitFor(() =>
        expect(
          body.queryByRole('dialog', { name: 'Picker pages' }),
        ).not.toBeInTheDocument(),
      );
      await userEvent.click(trigger);
      await userEvent.click(
        await body.findByRole('menuitem', { name: pageName }),
      );
      expect(
        await body.findByRole('searchbox', { name: searchName }),
      ).toHaveValue('');
      expect(body.getByRole('option', { name: optionName })).toHaveAttribute(
        'aria-selected',
        'true',
      );
      await userEvent.keyboard('{Escape}');
      await waitFor(() =>
        expect(
          body.queryByRole('dialog', { name: 'Picker pages' }),
        ).not.toBeInTheDocument(),
      );
    }
  },
};

const RefusingClosePageSession = () => (
  <DropdownPageSessionExample
    keepMounted
    open={callerSessionOpen.useValue()}
    onOpenChange={(nextOpen) => {
      onSessionOpenChange(nextOpen);

      if (nextOpen) {
        callerSessionOpen.set(true);
      }
    }}
  />
);

export const RejectedCloseKeepsPageSession: Story = {
  render: () => <RefusingClosePageSession />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Session actions' }),
    );
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Edit details' }),
    );
    const draft = await body.findByRole('textbox', { name: 'Draft name' });

    await userEvent.type(draft, ' company');
    await userEvent.keyboard('{Escape}');
    expect(onSessionOpenChange).toHaveBeenLastCalledWith(false);
    expect(body.getByRole('textbox', { name: 'Draft name' })).toBe(draft);
    expect(draft).toHaveValue('Acme company');
    await userEvent.click(
      body.getByRole('button', { name: 'Back to actions' }),
    );
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Edit details' }),
    );
    expect(body.getByRole('textbox', { name: 'Draft name' })).toBe(draft);
    expect(draft).toHaveValue('Acme company');
    callerSessionOpen.set(false);
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const UnpagedContentResetsWithEachSession: Story = {
  render: () => <DropdownPageSessionExample keepMounted hasPages={false} />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Session actions',
    });

    await userEvent.click(trigger);
    const search = await body.findByRole('searchbox', { name: 'Find person' });
    const draft = body.getByRole('textbox', { name: 'Draft name' });

    await userEvent.type(search, 'Grace');
    await userEvent.type(draft, ' company');
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    await userEvent.click(trigger);
    expect(
      await body.findByRole('searchbox', { name: 'Find person' }),
    ).toHaveValue('');
    expect(body.getByRole('textbox', { name: 'Draft name' })).toHaveValue(
      'Acme',
    );
    expect(search).not.toBeInTheDocument();
    expect(draft).not.toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const PageActivityTracksNavigationAndClosing: Story = {
  render: () => <DropdownPageActivityExample />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Page activity',
    });

    await userEvent.click(trigger);
    const rootActivity = await body.findByRole('status', {
      name: 'Root page activity',
    });

    expect(rootActivity).toHaveTextContent(/^Active$/);
    await userEvent.click(body.getByRole('button', { name: 'Open details' }));
    const detailsActivity = await body.findByRole('status', {
      name: 'Details page activity',
    });

    expect(detailsActivity).toHaveTextContent(/^Active$/);
    expect(rootActivity).toBeInTheDocument();
    expect(rootActivity).not.toBeVisible();
    expect(rootActivity).toHaveTextContent(/^Inactive$/);
    await userEvent.click(
      body.getByRole('button', { name: 'Back to activity' }),
    );
    expect(rootActivity).toHaveTextContent(/^Active$/);
    expect(detailsActivity).toBeInTheDocument();
    expect(detailsActivity).not.toBeVisible();
    expect(detailsActivity).toHaveTextContent(/^Inactive$/);
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(trigger).toHaveAttribute('aria-expanded', 'false'),
    );
    expect(rootActivity).toBeInTheDocument();
    expect(rootActivity).toHaveTextContent(/^Inactive$/);
    expect(detailsActivity).toHaveTextContent(/^Inactive$/);
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};
