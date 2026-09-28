import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { LightIconButton } from '@ui/components/input/LightIconButton/LightIconButton';
import { IconDotsVertical } from '@ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';
import { TextDirectionProvider } from '@ui/primitives/layout/TextDirectionProvider/TextDirectionProvider';

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
        <TextDirectionProvider direction={direction}>
          <Dropdown.Root type="menu">
            <Dropdown.Trigger>Filters</Dropdown.Trigger>
            <Dropdown.Content aria-label="Filters">
              <Dropdown.Submenu type="picker">
                <Dropdown.SubmenuTrigger>People</Dropdown.SubmenuTrigger>
                <Dropdown.Content aria-label="Choose person">
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
          </Dropdown.Root>
        </TextDirectionProvider>,
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
    expect(clickEvents[0]?.defaultPrevented).toBe(true);
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

describe('Dropdown popup name', () => {
  it('names a menu after its icon trigger without matching the menu by label text', async () => {
    const user = userEvent.setup();

    render(
      <Dropdown.Root type="menu">
        <Dropdown.Trigger
          render={
            <LightIconButton aria-label="More options">
              <IconDotsVertical />
            </LightIconButton>
          }
        />
        <Dropdown.Content>
          <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
        </Dropdown.Content>
      </Dropdown.Root>,
    );

    await user.click(screen.getByRole('button', { name: 'More options' }));

    expect(screen.getByRole('menu', { name: 'More options' })).toBeVisible();
    expect(screen.getAllByLabelText('More options')).toHaveLength(1);
  });

  it.each(['picker', 'panel'] as const)(
    'names a %s after its trigger',
    async (type) => {
      const user = userEvent.setup();

      render(
        <Dropdown.Root type={type}>
          <Dropdown.Trigger render={<Button>Choose person</Button>} />
          <Dropdown.Content>
            <Dropdown.ActionItem>Invite person</Dropdown.ActionItem>
          </Dropdown.Content>
        </Dropdown.Root>,
      );

      await user.click(screen.getByRole('button', { name: 'Choose person' }));

      expect(
        screen.getByRole('dialog', { name: 'Choose person' }),
      ).toBeVisible();
    },
  );

  it('names a submenu after its submenu trigger', async () => {
    const user = userEvent.setup();

    render(
      <Dropdown.Root type="menu">
        <Dropdown.Trigger>Record actions</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Submenu>
            <Dropdown.SubmenuTrigger>Export</Dropdown.SubmenuTrigger>
            <Dropdown.Content>
              <Dropdown.ActionItem>CSV</Dropdown.ActionItem>
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

    expect(await screen.findByRole('menu', { name: 'Export' })).toBeVisible();
    expect(screen.getByRole('menu', { name: 'Record actions' })).toBeVisible();
  });

  it('leaves a popup without a trigger unnamed until it passes a label', async () => {
    const { rerender } = render(
      <Dropdown.Root type="menu" open>
        <Dropdown.Content>
          <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
        </Dropdown.Content>
      </Dropdown.Root>,
    );

    const menu = await screen.findByRole('menu');

    expect(menu).not.toHaveAttribute('aria-labelledby');
    expect(menu).toHaveAccessibleName('');

    rerender(
      <Dropdown.Root type="menu" open>
        <Dropdown.Content aria-label="Record actions">
          <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
        </Dropdown.Content>
      </Dropdown.Root>,
    );

    expect(menu).toHaveAccessibleName('Record actions');
  });

  it('prefers an explicit label over the trigger name', async () => {
    const user = userEvent.setup();

    render(
      <Dropdown.Root type="picker">
        <Dropdown.Trigger>Currency</Dropdown.Trigger>
        <Dropdown.Content aria-label="Choose a currency">
          <Dropdown.OptionItem selected>Euro</Dropdown.OptionItem>
        </Dropdown.Content>
      </Dropdown.Root>,
    );

    await user.click(screen.getByRole('button', { name: 'Currency' }));

    expect(
      screen.getByRole('dialog', { name: 'Choose a currency' }),
    ).toBeVisible();
  });

  it('prefers a title while it is rendered and falls back to the trigger name', async () => {
    const user = userEvent.setup();
    const SortPicker = ({ hasTitle }: { hasTitle: boolean }) => (
      <Dropdown.Root type="picker">
        <Dropdown.Trigger>Sort</Dropdown.Trigger>
        <Dropdown.Content>
          {hasTitle && (
            <Dropdown.Header>
              <Dropdown.Title>Sort records by</Dropdown.Title>
            </Dropdown.Header>
          )}
          <Dropdown.OptionItem selected={false}>Name</Dropdown.OptionItem>
        </Dropdown.Content>
      </Dropdown.Root>
    );
    const { rerender } = render(<SortPicker hasTitle />);

    await user.click(screen.getByRole('button', { name: 'Sort' }));

    expect(
      screen.getByRole('dialog', { name: 'Sort records by' }),
    ).toBeVisible();

    rerender(<SortPicker hasTitle={false} />);

    expect(screen.getByRole('dialog', { name: 'Sort' })).toBeVisible();
  });
});

describe('Dropdown open changes', () => {
  it('reports why the menu opens and closes', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <>
        <Dropdown.Root type="menu" onOpenChange={onOpenChange}>
          <Dropdown.Trigger>Record actions</Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
          </Dropdown.Content>
        </Dropdown.Root>
        <Button>Outside</Button>
      </>,
    );

    const trigger = screen.getByRole('button', { name: 'Record actions' });

    await user.click(trigger);
    expect(onOpenChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ reason: 'trigger-press' }),
    );

    await user.click(screen.getByRole('menuitem', { name: 'Duplicate' }));
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({
        reason: 'item-press',
        event: expect.any(MouseEvent),
      }),
    );
    await waitFor(() => expect(trigger).toHaveFocus());

    await user.keyboard('{ArrowDown}');
    expect(onOpenChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ reason: 'list-navigation' }),
    );
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus(),
    );

    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'escape-key' }),
    );
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );

    await user.click(trigger);
    await user.click(screen.getByRole('button', { name: 'Outside' }));
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({
        reason: expect.stringMatching(/^(focus-out|outside-press)$/),
      }),
    );
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
  });

  it('reports submenu keyboard changes and closes the whole tree after a selection', async () => {
    const user = userEvent.setup();
    const onRootOpenChange = vi.fn();
    const onSubmenuOpenChange = vi.fn();

    render(
      <Dropdown.Root type="menu" onOpenChange={onRootOpenChange}>
        <Dropdown.Trigger>Record actions</Dropdown.Trigger>
        <Dropdown.Content>
          <Dropdown.Submenu onOpenChange={onSubmenuOpenChange}>
            <Dropdown.SubmenuTrigger>Export</Dropdown.SubmenuTrigger>
            <Dropdown.Content>
              <Dropdown.ActionItem>CSV</Dropdown.ActionItem>
            </Dropdown.Content>
          </Dropdown.Submenu>
        </Dropdown.Content>
      </Dropdown.Root>,
    );

    await user.tab();
    await user.keyboard('{ArrowDown}');
    const exportTrigger = await screen.findByRole('menuitem', {
      name: 'Export',
    });

    await waitFor(() => expect(exportTrigger).toHaveFocus());
    await user.keyboard('{ArrowRight}');
    expect(onSubmenuOpenChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({ reason: 'list-navigation' }),
    );
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'CSV' })).toHaveFocus(),
    );

    await user.keyboard('{ArrowLeft}');
    expect(onSubmenuOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'list-navigation' }),
    );
    await waitFor(() => expect(exportTrigger).toHaveFocus());

    await user.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'CSV' })).toHaveFocus(),
    );
    await user.keyboard('{Escape}');
    expect(onSubmenuOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'escape-key' }),
    );
    await waitFor(() => expect(exportTrigger).toHaveFocus());
    expect(screen.getByRole('menu', { name: 'Record actions' })).toBeVisible();

    await user.keyboard('{ArrowRight}');
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'CSV' })).toHaveFocus(),
    );
    await user.keyboard('{Enter}');
    expect(onSubmenuOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'item-press' }),
    );
    expect(onRootOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ reason: 'item-press' }),
    );
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
  });

  it('keeps the popup open when a change is canceled and lets the outside click through', async () => {
    const user = userEvent.setup();
    const clickOutsideControl = vi.fn();

    render(
      <>
        <Dropdown.Root
          type="menu"
          onOpenChange={(open, eventDetails) => {
            if (!open && eventDetails.reason !== 'escape-key') {
              eventDetails.cancel();
            }
          }}
        >
          <Dropdown.Trigger>Record actions</Dropdown.Trigger>
          <Dropdown.Content>
            <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
          </Dropdown.Content>
        </Dropdown.Root>
        <Button onClick={clickOutsideControl}>Outside</Button>
      </>,
    );

    await user.click(screen.getByRole('button', { name: 'Record actions' }));
    await user.click(screen.getByRole('menuitem', { name: 'Duplicate' }));
    expect(screen.getByRole('menu')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Outside' }));
    expect(clickOutsideControl).toHaveBeenCalledOnce();
    expect(screen.getByRole('menu')).toBeVisible();

    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
  });
});

describe('Dropdown without a trigger', () => {
  const RecordContextMenu = () => {
    const [point, setPoint] = useState({ x: 0, y: 0 });
    const [open, setOpen] = useState(false);

    return (
      <>
        {['Ada Lovelace', 'Grace Hopper'].map((name) => (
          <div
            key={name}
            role="row"
            onContextMenu={(event) => {
              event.preventDefault();
              setPoint({ x: event.clientX, y: event.clientY });
              setOpen(true);
            }}
          >
            {name}
          </div>
        ))}
        <Button>Outside</Button>
        <Dropdown.Root type="menu" open={open} onOpenChange={setOpen}>
          <Dropdown.Content
            aria-label="Record actions"
            anchor={{
              getBoundingClientRect: () => new DOMRect(point.x, point.y, 0, 0),
            }}
          >
            <Dropdown.ActionItem>Duplicate</Dropdown.ActionItem>
          </Dropdown.Content>
        </Dropdown.Root>
      </>
    );
  };

  it('opens at the pointer, follows a second right-click, and closes on Escape or an outside press', async () => {
    const user = userEvent.setup();

    render(<RecordContextMenu />);

    const adaRow = screen.getByRole('row', { name: 'Ada Lovelace' });
    const graceRow = screen.getByRole('row', { name: 'Grace Hopper' });

    await user.pointer({
      keys: '[MouseRight]',
      target: adaRow,
      coords: { clientX: 120, clientY: 80 },
    });
    const menu = await screen.findByRole('menu', { name: 'Record actions' });

    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus(),
    );
    expect(menu.parentElement).toHaveStyle({
      transform: 'translate(120px, 80px)',
    });

    await user.pointer({
      keys: '[MouseRight]',
      target: graceRow,
      coords: { clientX: 240, clientY: 160 },
    });
    await waitFor(() =>
      expect(menu.parentElement).toHaveStyle({
        transform: 'translate(240px, 160px)',
      }),
    );
    expect(screen.getAllByRole('menu')).toHaveLength(1);

    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(document.body).toHaveFocus();

    await user.pointer({ keys: '[MouseRight]', target: adaRow });
    expect(await screen.findByRole('menu')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Outside' }));
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
  });
});
