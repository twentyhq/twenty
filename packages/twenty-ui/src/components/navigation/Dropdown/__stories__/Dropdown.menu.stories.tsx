import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ReactNode } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { TextDirectionProvider } from '@ui/primitives/layout/TextDirectionProvider/TextDirectionProvider';
import { ComponentDecorator } from '@ui/testing';

import { Dropdown } from '../Dropdown';
import { DROPDOWN_STORY_A11Y_PARAMETERS } from './dropdownStoryA11yParameters';

const TYPEAHEAD_PAUSE_IN_MS = 600;

const onArchive = fn();
const onDuplicate = fn();
const onContactSupport = fn();
const onExportRecords = fn();
const onActivateRow = fn();
const onOutsideClick = fn();
const onDocumentKeyDown = fn();

const RecordActionsMenu = ({ children }: { children: ReactNode }) => (
  <Dropdown.Root type="menu">
    <Dropdown.Trigger>Record actions</Dropdown.Trigger>
    <Dropdown.Content aria-label="Record actions">{children}</Dropdown.Content>
  </Dropdown.Root>
);

const openRecordActions = async (canvasElement: HTMLElement) => {
  await userEvent.click(
    within(canvasElement).getByRole('button', { name: 'Record actions' }),
  );

  return within(canvasElement.ownerDocument.body).findByRole('menu', {
    name: 'Record actions',
  });
};

const SubmenuTextEditing = ({ direction }: { direction: 'ltr' | 'rtl' }) => (
  <TextDirectionProvider direction={direction}>
    <Dropdown.Root type="menu">
      <Dropdown.Trigger>Filters</Dropdown.Trigger>
      <Dropdown.Content aria-label="Filters">
        <Dropdown.Submenu type="picker">
          <Dropdown.SubmenuTrigger>People</Dropdown.SubmenuTrigger>
          <Dropdown.Content aria-label="Choose person">
            <Dropdown.Search aria-label="Search people" defaultValue="Ada" />
            <Dropdown.OptionItem selected={false}>
              Ada Lovelace
            </Dropdown.OptionItem>
          </Dropdown.Content>
        </Dropdown.Submenu>
      </Dropdown.Content>
    </Dropdown.Root>
  </TextDirectionProvider>
);

const playSubmenuTextEditing =
  ({ forwardKey, backwardKey }: { forwardKey: string; backwardKey: string }) =>
  async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    const people = await body.findByRole('menuitem', { name: 'People' });

    await waitFor(() => expect(people).toHaveFocus());
    await userEvent.keyboard(forwardKey);
    const search = await body.findByRole('searchbox', {
      name: 'Search people',
    });

    await waitFor(() => expect(search).toHaveFocus());
    await userEvent.keyboard(backwardKey);
    expect(body.getByRole('dialog', { name: 'Choose person' })).toBeVisible();
    expect(search).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(body.getByRole('button', { name: 'Ada Lovelace' })).toHaveFocus(),
    );
    await userEvent.keyboard(backwardKey);
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(body.getByRole('menu', { name: 'Filters' })).toBeVisible();
    await waitFor(() => expect(people).toHaveFocus());
  };

const meta: Meta = {
  title: 'UI/Components/Dropdown/Interactions/Menu',
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: { a11y: DROPDOWN_STORY_A11Y_PARAMETERS },
  beforeEach: () => {
    for (const spy of [
      onArchive,
      onDuplicate,
      onContactSupport,
      onExportRecords,
      onActivateRow,
      onOutsideClick,
      onDocumentKeyDown,
    ]) {
      spy.mockClear();
    }
  },
};

export default meta;
type Story = StoryObj;

export const KeyboardNavigation: Story = {
  render: () => (
    <Dropdown.Root type="menu">
      <Dropdown.Trigger render={<Button>Record actions</Button>} />
      <Dropdown.Content aria-label="Record actions">
        <Dropdown.Section label="Actions">
          <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
          <Dropdown.ActionItem>Export</Dropdown.ActionItem>
        </Dropdown.Section>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Record actions',
    });

    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    const actions = await body.findByRole('group', { name: 'Actions' });

    await waitFor(() =>
      expect(
        within(actions).getByRole('menuitem', { name: 'Duplicate' }),
      ).toHaveFocus(),
    );
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'Export' })).toHaveFocus(),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const InitialFocusEdge: Story = {
  render: () => (
    <RecordActionsMenu>
      <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
      <Dropdown.ActionItem>Export</Dropdown.ActionItem>
    </RecordActionsMenu>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const trigger = within(canvasElement).getByRole('button', {
      name: 'Record actions',
    });

    await userEvent.tab();
    await userEvent.keyboard('{ArrowUp}');
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'Export' })).toHaveFocus(),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
    await userEvent.click(trigger);
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus(),
    );
  },
};

export const DisabledCommand: Story = {
  render: () => (
    <RecordActionsMenu>
      <Dropdown.ActionItem disabled onClick={onArchive}>
        Archive
      </Dropdown.ActionItem>
      <Dropdown.ActionItem onClick={onDuplicate}>Duplicate</Dropdown.ActionItem>
    </RecordActionsMenu>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const menu = await openRecordActions(canvasElement);

    await userEvent.click(body.getByRole('menuitem', { name: 'Archive' }));
    expect(onArchive).not.toHaveBeenCalled();
    expect(menu).toBeVisible();
    await userEvent.click(body.getByRole('menuitem', { name: 'Duplicate' }));
    expect(onDuplicate).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
  },
};

export const TypeaheadAndHomeEnd: Story = {
  render: () => (
    <RecordActionsMenu>
      <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
      <Dropdown.ActionItem>Export</Dropdown.ActionItem>
      <Dropdown.ActionItem>Email</Dropdown.ActionItem>
      <Dropdown.ActionItem>Share</Dropdown.ActionItem>
    </RecordActionsMenu>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await openRecordActions(canvasElement);
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus(),
    );
    await userEvent.keyboard('em');
    expect(body.getByRole('menuitem', { name: 'Email' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(body.getByRole('menuitem', { name: 'Share' })).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(body.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus();
  },
};

export const TypeaheadRepeatsAndResets: Story = {
  render: () => (
    <RecordActionsMenu>
      <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
      <Dropdown.ActionItem>Export</Dropdown.ActionItem>
      <Dropdown.ActionItem>Email</Dropdown.ActionItem>
      <Dropdown.ActionItem>Share</Dropdown.ActionItem>
    </RecordActionsMenu>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await openRecordActions(canvasElement);
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus(),
    );
    await userEvent.keyboard('e');
    expect(body.getByRole('menuitem', { name: 'Export' })).toHaveFocus();
    await userEvent.keyboard('e');
    expect(body.getByRole('menuitem', { name: 'Email' })).toHaveFocus();
    await userEvent.keyboard('e');
    expect(body.getByRole('menuitem', { name: 'Export' })).toHaveFocus();

    await new Promise((resolve) => setTimeout(resolve, TYPEAHEAD_PAUSE_IN_MS));

    await userEvent.keyboard('s');
    expect(body.getByRole('menuitem', { name: 'Share' })).toHaveFocus();
  },
};

export const RepeatedActionStaysOpen: Story = {
  render: () => (
    <>
      <RecordActionsMenu>
        <Dropdown.ActionItem closeOnClick={false} onClick={onDuplicate}>
          Duplicate
        </Dropdown.ActionItem>
      </RecordActionsMenu>
      <Button>Outside</Button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const menu = await openRecordActions(canvasElement);
    const action = body.getByRole('menuitem', { name: 'Duplicate' });

    await userEvent.click(action);
    await userEvent.click(action);
    expect(onDuplicate).toHaveBeenCalledTimes(2);
    expect(menu).toBeVisible();
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Outside' }),
    );
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
  },
};

export const LinkItem: Story = {
  render: () => (
    <Dropdown.Root type="menu">
      <Dropdown.Trigger>Help</Dropdown.Trigger>
      <Dropdown.Content aria-label="Help">
        <Dropdown.ActionItem
          render={
            <a href="mailto:support@example.com" aria-label="Contact support" />
          }
          onClick={onContactSupport}
        >
          Contact support
        </Dropdown.ActionItem>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    const link = await body.findByRole('menuitem', { name: 'Contact support' });

    expect(link).toHaveAttribute('href', 'mailto:support@example.com');
    await waitFor(() => expect(link).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    expect(onContactSupport).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
  },
};

export const SideSubmenuSelection: Story = {
  render: () => (
    <RecordActionsMenu>
      <Dropdown.Submenu>
        <Dropdown.SubmenuTrigger>Export</Dropdown.SubmenuTrigger>
        <Dropdown.Content aria-label="Export formats">
          <Dropdown.ActionItem onClick={onExportRecords}>
            CSV
          </Dropdown.ActionItem>
          <Dropdown.ActionItem>Excel</Dropdown.ActionItem>
        </Dropdown.Content>
      </Dropdown.Submenu>
    </RecordActionsMenu>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'Export' })).toHaveFocus(),
    );
    await userEvent.keyboard('{ArrowRight}');
    const csv = await body.findByRole('menuitem', { name: 'CSV' });

    await waitFor(() => expect(csv).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    expect(onExportRecords).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        within(canvasElement).getByRole('button', { name: 'Record actions' }),
      ).toHaveFocus(),
    );
  },
};

export const SubmenuTextEditingLeftToRight: Story = {
  render: () => <SubmenuTextEditing direction="ltr" />,
  play: playSubmenuTextEditing({
    forwardKey: '{ArrowRight}',
    backwardKey: '{ArrowLeft}',
  }),
};

export const SubmenuTextEditingRightToLeft: Story = {
  render: () => <SubmenuTextEditing direction="rtl" />,
  play: playSubmenuTextEditing({
    forwardKey: '{ArrowLeft}',
    backwardKey: '{ArrowRight}',
  }),
};

export const TabDismisses: Story = {
  render: () => (
    <>
      <RecordActionsMenu>
        <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
        <Dropdown.ActionItem>Export</Dropdown.ActionItem>
      </RecordActionsMenu>
      <Button>Next control</Button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus(),
    );
    await userEvent.tab();
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await waitFor(() =>
      expect(
        within(canvasElement).getByRole('button', { name: 'Next control' }),
      ).toHaveFocus(),
    );
  },
};

export const ParentRowKeyboardActivation: Story = {
  render: () => (
    <div role="grid" aria-label="Records">
      <div role="row" tabIndex={0} onKeyDown={onActivateRow}>
        <div role="gridcell">
          <RecordActionsMenu>
            <Dropdown.ActionItem onClick={onDuplicate}>
              Duplicate
            </Dropdown.ActionItem>
          </RecordActionsMenu>
        </div>
      </div>
    </div>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await openRecordActions(canvasElement);
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus(),
    );
    await userEvent.keyboard('{Enter}');
    expect(onDuplicate).toHaveBeenCalledOnce();
    expect(onActivateRow).not.toHaveBeenCalled();
  },
};

export const TriggerInsideLink: Story = {
  render: () => (
    <a href="#record">
      <RecordActionsMenu>
        <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
      </RecordActionsMenu>
    </a>
  ),
  play: async ({ canvasElement }) => {
    const ownerDocument = canvasElement.ownerDocument;
    const clickEvents: MouseEvent[] = [];
    const recordClick = (event: MouseEvent) => clickEvents.push(event);

    ownerDocument.addEventListener('click', recordClick, true);

    try {
      await openRecordActions(canvasElement);
    } finally {
      ownerDocument.removeEventListener('click', recordClick, true);
    }

    expect(clickEvents).toHaveLength(1);
    expect(clickEvents[0]?.defaultPrevented).toBe(true);
  },
};

export const ModifierShortcutsLeaveMenu: Story = {
  render: () => (
    <RecordActionsMenu>
      <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
      <Dropdown.ActionItem>Delete</Dropdown.ActionItem>
    </RecordActionsMenu>
  ),
  play: async ({ canvasElement }) => {
    const ownerDocument = canvasElement.ownerDocument;
    const body = within(ownerDocument.body);
    const menu = await openRecordActions(canvasElement);

    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus(),
    );

    ownerDocument.addEventListener('keydown', onDocumentKeyDown);

    try {
      await userEvent.keyboard('{ArrowDown}x');
      expect(body.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
      expect(onDocumentKeyDown).not.toHaveBeenCalled();

      await userEvent.keyboard('{Control>}k{/Control}');
    } finally {
      ownerDocument.removeEventListener('keydown', onDocumentKeyDown);
    }

    expect(onDocumentKeyDown).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'k', ctrlKey: true }),
    );
    expect(menu).toBeVisible();
  },
};

export const OutsideClickIsSwallowed: Story = {
  render: () => (
    <>
      <RecordActionsMenu>
        <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
      </RecordActionsMenu>
      <Button onClick={onOutsideClick}>Outside</Button>
    </>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const outside = within(canvasElement).getByRole('button', {
      name: 'Outside',
    });

    await openRecordActions(canvasElement);
    await userEvent.click(outside);
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(onOutsideClick).not.toHaveBeenCalled();

    await userEvent.click(outside);
    expect(onOutsideClick).toHaveBeenCalledOnce();
  },
};

export const OutsideRowClickIsSwallowed: Story = {
  render: () => (
    <>
      <RecordActionsMenu>
        <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
      </RecordActionsMenu>
      <div role="grid" aria-label="Attachments">
        <div role="row" onClick={onActivateRow} onKeyDown={onActivateRow}>
          <div role="gridcell">Attachment row</div>
        </div>
      </div>
    </>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const row = within(canvasElement).getByRole('row');

    await openRecordActions(canvasElement);
    await userEvent.click(row);
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(onActivateRow).not.toHaveBeenCalled();

    await userEvent.click(row);
    expect(onActivateRow).toHaveBeenCalledOnce();
  },
};
