import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Button } from '@ui/primitives/input/Button/Button';

import { Dropdown } from '../Dropdown';

const TYPEAHEAD_PAUSE_IN_MS = 600;

describe('Dropdown menu', () => {
  it('opens from the keyboard, navigates commands, and restores focus on Escape', async () => {
    const user = userEvent.setup();

    render(
      <Dropdown.Root type="menu">
        <Dropdown.Trigger render={<Button>Record actions</Button>} />
        <Dropdown.Content aria-label="Record actions">
          <Dropdown.Section label="Actions">
            <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
            <Dropdown.ActionItem>Export</Dropdown.ActionItem>
          </Dropdown.Section>
        </Dropdown.Content>
      </Dropdown.Root>,
    );

    const trigger = screen.getByRole('button', { name: 'Record actions' });

    await user.tab();
    await user.keyboard('{ArrowDown}');
    const actions = screen.getByRole('group', { name: 'Actions' });

    await waitFor(() =>
      expect(
        within(actions).getByRole('menuitem', { name: 'Duplicate' }),
      ).toHaveFocus(),
    );
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Export' })).toHaveFocus();
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
  });

  it('focuses the last item when first opened with ArrowUp and the first item when reopened by pointer', async () => {
    const user = userEvent.setup();

    render(
      <Dropdown.Root type="menu">
        <Dropdown.Trigger>Record actions</Dropdown.Trigger>
        <Dropdown.Content aria-label="Record actions">
          <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
          <Dropdown.ActionItem>Export</Dropdown.ActionItem>
        </Dropdown.Content>
      </Dropdown.Root>,
    );

    const trigger = screen.getByRole('button', { name: 'Record actions' });

    await user.tab();
    await user.keyboard('{ArrowUp}');
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Export' })).toHaveFocus(),
    );
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
    await user.click(trigger);
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus(),
    );
  });

  it('prevents disabled commands and closes after an enabled command', async () => {
    const user = userEvent.setup();
    const archive = vi.fn();
    const duplicate = vi.fn();

    render(
      <Dropdown.Root type="menu">
        <Dropdown.Trigger>Record actions</Dropdown.Trigger>
        <Dropdown.Content aria-label="Record actions">
          <Dropdown.ActionItem disabled onClick={archive}>
            Archive
          </Dropdown.ActionItem>
          <Dropdown.ActionItem onClick={duplicate}>
            Duplicate
          </Dropdown.ActionItem>
        </Dropdown.Content>
      </Dropdown.Root>,
    );

    await user.click(screen.getByRole('button', { name: 'Record actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Archive' }));
    expect(archive).not.toHaveBeenCalled();
    expect(screen.getByRole('menu')).toBeVisible();
    await user.click(screen.getByRole('menuitem', { name: 'Duplicate' }));
    expect(duplicate).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
  });

  it('supports menu typeahead and first or last item navigation', async () => {
    const user = userEvent.setup();

    render(
      <Dropdown.Root type="menu">
        <Dropdown.Trigger>Record actions</Dropdown.Trigger>
        <Dropdown.Content aria-label="Record actions">
          <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
          <Dropdown.ActionItem>Export</Dropdown.ActionItem>
          <Dropdown.ActionItem>Email</Dropdown.ActionItem>
          <Dropdown.ActionItem>Share</Dropdown.ActionItem>
        </Dropdown.Content>
      </Dropdown.Root>,
    );

    await user.click(screen.getByRole('button', { name: 'Record actions' }));
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus(),
    );
    await user.keyboard('em');
    expect(screen.getByRole('menuitem', { name: 'Email' })).toHaveFocus();
    await user.keyboard('{End}');
    expect(screen.getByRole('menuitem', { name: 'Share' })).toHaveFocus();
    await user.keyboard('{Home}');
    expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus();
  });

  it('cycles repeated typeahead letters and starts a fresh query after a pause', async () => {
    const user = userEvent.setup();

    render(
      <Dropdown.Root type="menu">
        <Dropdown.Trigger>Record actions</Dropdown.Trigger>
        <Dropdown.Content aria-label="Record actions">
          <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
          <Dropdown.ActionItem>Export</Dropdown.ActionItem>
          <Dropdown.ActionItem>Email</Dropdown.ActionItem>
          <Dropdown.ActionItem>Share</Dropdown.ActionItem>
        </Dropdown.Content>
      </Dropdown.Root>,
    );

    await user.click(screen.getByRole('button', { name: 'Record actions' }));
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus(),
    );

    const startTimestamp = Date.now();
    const now = vi.spyOn(Date, 'now').mockReturnValue(startTimestamp);

    try {
      await user.keyboard('e');
      expect(screen.getByRole('menuitem', { name: 'Export' })).toHaveFocus();
      await user.keyboard('e');
      expect(screen.getByRole('menuitem', { name: 'Email' })).toHaveFocus();
      await user.keyboard('e');
      expect(screen.getByRole('menuitem', { name: 'Export' })).toHaveFocus();

      now.mockReturnValue(startTimestamp + TYPEAHEAD_PAUSE_IN_MS);

      await user.keyboard('s');
      expect(screen.getByRole('menuitem', { name: 'Share' })).toHaveFocus();
    } finally {
      now.mockRestore();
    }
  });

  it('keeps repeated actions open and dismisses when clicking outside', async () => {
    const user = userEvent.setup();
    const duplicate = vi.fn();

    render(
      <>
        <Dropdown.Root type="menu">
          <Dropdown.Trigger>Record actions</Dropdown.Trigger>
          <Dropdown.Content aria-label="Record actions">
            <Dropdown.ActionItem closeOnClick={false} onClick={duplicate}>
              Duplicate
            </Dropdown.ActionItem>
          </Dropdown.Content>
        </Dropdown.Root>
        <Button>Outside</Button>
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Record actions' }));
    const action = screen.getByRole('menuitem', { name: 'Duplicate' });

    await user.click(action);
    await user.click(action);
    expect(duplicate).toHaveBeenCalledTimes(2);
    expect(screen.getByRole('menu')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Outside' }));
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
  });

  it('preserves link targets and handles their keyboard activation', async () => {
    const user = userEvent.setup();
    const navigate = vi.fn();

    render(
      <Dropdown.Root type="menu">
        <Dropdown.Trigger>Help</Dropdown.Trigger>
        <Dropdown.Content aria-label="Help">
          <Dropdown.ActionItem
            render={<a href="#documentation" aria-label="Documentation" />}
            onClick={navigate}
          >
            Documentation
          </Dropdown.ActionItem>
        </Dropdown.Content>
      </Dropdown.Root>,
    );

    await user.tab();
    await user.keyboard('{ArrowDown}');
    const link = await screen.findByRole('menuitem', { name: 'Documentation' });

    expect(link).toHaveAttribute('href', '#documentation');
    await waitFor(() => expect(link).toHaveFocus());
    await user.keyboard('{Enter}');
    expect(navigate).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
  });

  it('opens a side submenu from the keyboard and closes the full menu on selection', async () => {
    const user = userEvent.setup();
    const exportRecords = vi.fn();

    render(
      <Dropdown.Root type="menu">
        <Dropdown.Trigger>Record actions</Dropdown.Trigger>
        <Dropdown.Content aria-label="Record actions">
          <Dropdown.Submenu>
            <Dropdown.SubmenuTrigger>Export</Dropdown.SubmenuTrigger>
            <Dropdown.Content aria-label="Export formats">
              <Dropdown.ActionItem onClick={exportRecords}>
                CSV
              </Dropdown.ActionItem>
              <Dropdown.ActionItem>Excel</Dropdown.ActionItem>
            </Dropdown.Content>
          </Dropdown.Submenu>
        </Dropdown.Content>
      </Dropdown.Root>,
    );

    await user.tab();
    await user.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Export' })).toHaveFocus(),
    );
    await user.keyboard('{ArrowRight}');
    const csv = await screen.findByRole('menuitem', { name: 'CSV' });

    await waitFor(() => expect(csv).toHaveFocus());
    await user.keyboard('{Enter}');
    expect(exportRecords).toHaveBeenCalledOnce();
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(
      screen.getByRole('button', { name: 'Record actions' }),
    ).toHaveFocus();
  });

  it.each([
    {
      direction: 'ltr',
      forwardKey: '{ArrowRight}',
      backwardKey: '{ArrowLeft}',
    },
    {
      direction: 'rtl',
      forwardKey: '{ArrowLeft}',
      backwardKey: '{ArrowRight}',
    },
  ] as const)(
    'preserves text editing and submenu navigation in $direction layout',
    async ({ direction, forwardKey, backwardKey }) => {
      const user = userEvent.setup();

      render(
        <Dropdown.Root type="menu">
          <Dropdown.Trigger>Filters</Dropdown.Trigger>
          <Dropdown.Content aria-label="Filters" style={{ direction }}>
            <Dropdown.Submenu type="picker">
              <Dropdown.SubmenuTrigger style={{ direction }}>
                People
              </Dropdown.SubmenuTrigger>
              <Dropdown.Content
                aria-label="Choose person"
                style={{ direction }}
              >
                <Dropdown.Search
                  aria-label="Search people"
                  defaultValue="Ada"
                />
                <Dropdown.OptionItem selected={false}>
                  Ada Lovelace
                </Dropdown.OptionItem>
              </Dropdown.Content>
            </Dropdown.Submenu>
          </Dropdown.Content>
        </Dropdown.Root>,
      );

      await user.tab();
      await user.keyboard('{ArrowDown}');
      const people = await screen.findByRole('menuitem', { name: 'People' });

      await waitFor(() => expect(people).toHaveFocus());
      await user.keyboard(forwardKey);
      const search = await screen.findByRole('searchbox', {
        name: 'Search people',
      });

      await waitFor(() => expect(search).toHaveFocus());
      await user.keyboard(backwardKey);
      expect(
        screen.getByRole('dialog', { name: 'Choose person' }),
      ).toBeVisible();
      expect(search).toHaveFocus();
      await user.keyboard('{ArrowDown}');
      expect(
        screen.getByRole('button', { name: 'Ada Lovelace' }),
      ).toHaveFocus();
      await user.keyboard(backwardKey);
      await waitFor(() =>
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
      );
      expect(screen.getByRole('menu', { name: 'Filters' })).toBeVisible();
      await waitFor(() => expect(people).toHaveFocus());
    },
  );

  it('dismisses on Tab and continues to the next control outside the menu', async () => {
    const user = userEvent.setup();

    render(
      <>
        <Dropdown.Root type="menu">
          <Dropdown.Trigger>Record actions</Dropdown.Trigger>
          <Dropdown.Content aria-label="Record actions">
            <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
            <Dropdown.ActionItem>Export</Dropdown.ActionItem>
          </Dropdown.Content>
        </Dropdown.Root>
        <Button>Next control</Button>
      </>,
    );

    await user.tab();
    await user.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus(),
    );
    await user.tab();
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('button', { name: 'Next control' })).toHaveFocus();
  });

  it('keeps popup keyboard activation from activating a parent record row', async () => {
    const user = userEvent.setup();
    const activateRow = vi.fn();
    const duplicate = vi.fn();

    render(
      <div role="row" tabIndex={0} onKeyDown={activateRow}>
        <Dropdown.Root type="menu">
          <Dropdown.Trigger>Record actions</Dropdown.Trigger>
          <Dropdown.Content aria-label="Record actions">
            <Dropdown.ActionItem onClick={duplicate}>
              Duplicate
            </Dropdown.ActionItem>
          </Dropdown.Content>
        </Dropdown.Root>
      </div>,
    );

    await user.click(screen.getByRole('button', { name: 'Record actions' }));
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus(),
    );
    await user.keyboard('{Enter}');
    expect(duplicate).toHaveBeenCalledOnce();
    expect(activateRow).not.toHaveBeenCalled();
  });

  it('opens from a trigger nested in a link without following the link', async () => {
    const user = userEvent.setup();
    const clickEvents: MouseEvent[] = [];
    const recordClick = (event: MouseEvent) => clickEvents.push(event);

    render(
      <a href="#record">
        <Dropdown.Root type="menu">
          <Dropdown.Trigger>Record actions</Dropdown.Trigger>
          <Dropdown.Content aria-label="Record actions">
            <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
          </Dropdown.Content>
        </Dropdown.Root>
      </a>,
    );

    document.addEventListener('click', recordClick, true);

    try {
      await user.click(screen.getByRole('button', { name: 'Record actions' }));
    } finally {
      document.removeEventListener('click', recordClick, true);
    }

    expect(screen.getByRole('menu')).toBeVisible();
    expect(clickEvents).toHaveLength(1);
    expect(clickEvents[0].defaultPrevented).toBe(true);
  });

  it('lets unhandled modifier shortcuts leave the menu and keeps other keys inside', async () => {
    const user = userEvent.setup();
    const documentKeyDown = vi.fn();

    render(
      <Dropdown.Root type="menu">
        <Dropdown.Trigger>Record actions</Dropdown.Trigger>
        <Dropdown.Content aria-label="Record actions">
          <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
          <Dropdown.ActionItem>Delete</Dropdown.ActionItem>
        </Dropdown.Content>
      </Dropdown.Root>,
    );

    await user.click(screen.getByRole('button', { name: 'Record actions' }));
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus(),
    );

    document.addEventListener('keydown', documentKeyDown);

    try {
      await user.keyboard('{ArrowDown}x');
      expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
      expect(documentKeyDown).not.toHaveBeenCalled();

      await user.keyboard('{Control>}k{/Control}');
    } finally {
      document.removeEventListener('keydown', documentKeyDown);
    }

    expect(documentKeyDown).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'k', ctrlKey: true }),
    );
    expect(screen.getByRole('menu')).toBeVisible();
  });

  it('dismisses on an outside click without activating the clicked control', async () => {
    const user = userEvent.setup();
    const clickOutsideControl = vi.fn();

    render(
      <>
        <Dropdown.Root type="menu">
          <Dropdown.Trigger>Record actions</Dropdown.Trigger>
          <Dropdown.Content aria-label="Record actions">
            <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
          </Dropdown.Content>
        </Dropdown.Root>
        <Button onClick={clickOutsideControl}>Outside</Button>
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Record actions' }));
    expect(screen.getByRole('menu')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Outside' }));
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(clickOutsideControl).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Outside' }));
    expect(clickOutsideControl).toHaveBeenCalledOnce();
  });

  it('dismisses on an outside row click without activating the row', async () => {
    const user = userEvent.setup();
    const activateRow = vi.fn();

    render(
      <>
        <Dropdown.Root type="menu">
          <Dropdown.Trigger>Record actions</Dropdown.Trigger>
          <Dropdown.Content aria-label="Record actions">
            <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
          </Dropdown.Content>
        </Dropdown.Root>
        <div role="row" onClick={activateRow} onKeyDown={activateRow}>
          Attachment row
        </div>
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Record actions' }));
    expect(screen.getByRole('menu')).toBeVisible();

    await user.click(screen.getByRole('row'));
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(activateRow).not.toHaveBeenCalled();

    await user.click(screen.getByRole('row'));
    expect(activateRow).toHaveBeenCalledOnce();
  });
});
