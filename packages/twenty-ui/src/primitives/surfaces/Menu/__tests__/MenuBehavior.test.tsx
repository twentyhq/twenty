import { Menu as MenuPrimitive } from '@base-ui/react/menu';
import { act, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createRef, type ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { Menu } from '../Menu';
import { type MenuRootActions } from '../types/MenuRootActions';

const MenuContent = ({ children }: { children: ReactNode }) => (
  <Menu.Portal>
    <Menu.Positioner>
      <Menu.Popup>{children}</Menu.Popup>
    </Menu.Positioner>
  </Menu.Portal>
);

describe('Menu composition', () => {
  it('exposes every part and helper from the installed upstream version', () => {
    expect(Object.keys(Menu).sort()).toEqual(Object.keys(MenuPrimitive).sort());
  });

  it('keeps native handlers and refs on independently rendered anatomy parts', async () => {
    const user = userEvent.setup();
    const portal = createRef<HTMLDivElement>();
    const positioner = createRef<HTMLDivElement>();
    const popup = createRef<HTMLDivElement>();
    const item = createRef<HTMLElement>();
    const renderRef = createRef<HTMLButtonElement>();
    const onPortalClick = vi.fn();
    const onPositionerClick = vi.fn();
    const onPopupClick = vi.fn();
    const onItemClick = vi.fn();
    const onRenderClick = vi.fn();

    render(
      <Menu.Root open>
        <Menu.Portal ref={portal} render={<section />} onClick={onPortalClick}>
          <Menu.Positioner
            ref={positioner}
            render={<section />}
            onClick={onPositionerClick}
          >
            <Menu.Popup
              ref={popup}
              aria-label="Actions"
              render={<section />}
              onClick={onPopupClick}
            >
              <Menu.Item
                ref={item}
                nativeButton
                onClick={onItemClick}
                className={({ highlighted }) =>
                  highlighted ? 'highlighted-item' : 'resting-item'
                }
                style={({ highlighted }) => ({
                  marginTop: highlighted ? 11 : 7,
                })}
                render={
                  <button
                    ref={renderRef}
                    type="button"
                    onClick={onRenderClick}
                    data-native="action"
                  />
                }
              >
                Apply
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>,
    );

    const action = await screen.findByRole('menuitem', { name: 'Apply' });
    expect(item.current).toBe(action);
    expect(renderRef.current).toBe(action);
    expect(action).toHaveAttribute('data-native', 'action');
    expect(action.localName).toBe('button');
    expect(popup.current).toBe(screen.getByRole('menu', { name: 'Actions' }));
    expect(positioner.current).toBe(popup.current?.parentElement);
    expect(portal.current).toBe(positioner.current?.parentElement);
    expect(portal.current?.localName).toBe('section');
    expect(positioner.current?.localName).toBe('section');
    expect(popup.current?.localName).toBe('section');

    await user.hover(action);
    await waitFor(() => expect(action).toHaveClass('highlighted-item'));
    expect(action).toHaveStyle({ marginTop: '11px' });
    await user.click(action);

    for (const handler of [
      onRenderClick,
      onItemClick,
      onPopupClick,
      onPositionerClick,
      onPortalClick,
    ]) {
      expect(handler).toHaveBeenCalledOnce();
    }
  });
});

describe('Menu interaction', () => {
  it('navigates and loops focus while keeping disabled items focusable and inactive', async () => {
    const user = userEvent.setup();
    const onDisabledClick = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <Menu.Root onOpenChange={onOpenChange}>
        <Menu.Trigger>Options</Menu.Trigger>
        <MenuContent>
          <Menu.Item closeOnClick={false}>Alpha</Menu.Item>
          <Menu.Item disabled onClick={onDisabledClick}>
            Disabled
          </Menu.Item>
          <Menu.Item closeOnClick={false}>Bravo</Menu.Item>
        </MenuContent>
      </Menu.Root>,
    );

    const trigger = screen.getByRole('button', { name: 'Options' });
    trigger.focus();
    await user.keyboard('{ArrowDown}');
    const alpha = await screen.findByRole('menuitem', { name: 'Alpha' });
    const disabled = screen.getByRole('menuitem', { name: 'Disabled' });
    const bravo = screen.getByRole('menuitem', { name: 'Bravo' });
    await waitFor(() => expect(alpha).toHaveFocus());
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(disabled).toHaveFocus());
    expect(disabled).toHaveAttribute('aria-disabled', 'true');
    await user.keyboard('{Enter}');
    expect(onDisabledClick).not.toHaveBeenCalled();
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(bravo).toHaveFocus());
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(alpha).toHaveFocus());
    await user.keyboard('{End}');
    await waitFor(() => expect(bravo).toHaveFocus());
    await user.keyboard('{Home}');
    await waitFor(() => expect(alpha).toHaveFocus());
    await user.keyboard('b');
    await waitFor(() => expect(bravo).toHaveFocus());
    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(trigger).toHaveFocus();
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({
        reason: 'escape-key',
        event: expect.any(KeyboardEvent),
        trigger,
      }),
    );
  });

  it('preserves click prevention and cancellable root change details', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const onItemClick = vi.fn();
    const onCheckedChange = vi.fn();
    render(
      <Menu.Root
        onOpenChange={(open, details) => {
          onOpenChange(open, details);
          if (details.reason === 'item-press') {
            details.cancel();
            details.allowPropagation();
          }
        }}
      >
        <Menu.Trigger>Options</Menu.Trigger>
        <MenuContent>
          <Menu.Item onClick={onItemClick}>Keep open</Menu.Item>
          <Menu.CheckboxItem
            onCheckedChange={onCheckedChange}
            onClick={(event) => event.preventBaseUIHandler()}
            render={<div />}
          >
            Prevent selection
          </Menu.CheckboxItem>
        </MenuContent>
      </Menu.Root>,
    );

    await user.click(screen.getByRole('button', { name: 'Options' }));
    await user.click(
      await screen.findByRole('menuitem', { name: 'Keep open' }),
    );
    expect(onItemClick).toHaveBeenCalledOnce();
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(onOpenChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({
        reason: 'item-press',
        event: onItemClick.mock.calls[0]?.[0],
        isCanceled: true,
        isPropagationAllowed: true,
        cancel: expect.any(Function),
        allowPropagation: expect.any(Function),
        preventUnmountOnClose: expect.any(Function),
      }),
    );
    const checkbox = screen.getByRole('menuitemcheckbox', {
      name: 'Prevent selection',
    });
    await user.click(checkbox);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
  });

  it('opens submenus by keyboard and restores focus when returning to the parent', async () => {
    const user = userEvent.setup();
    render(
      <Menu.Root>
        <Menu.Trigger>Options</Menu.Trigger>
        <MenuContent>
          <Menu.SubmenuRoot>
            <Menu.SubmenuTrigger>More</Menu.SubmenuTrigger>
            <MenuContent>
              <Menu.Item>Nested action</Menu.Item>
            </MenuContent>
          </Menu.SubmenuRoot>
          <Menu.Item>Parent action</Menu.Item>
        </MenuContent>
      </Menu.Root>,
    );

    screen.getByRole('button', { name: 'Options' }).focus();
    await user.keyboard('{ArrowDown}');
    const submenuTrigger = await screen.findByRole('menuitem', {
      name: 'More',
    });
    await waitFor(() => expect(submenuTrigger).toHaveFocus());
    await user.keyboard('{ArrowRight}');
    const nestedAction = await screen.findByRole('menuitem', {
      name: 'Nested action',
    });
    await waitFor(() => expect(nestedAction).toHaveFocus());
    expect(screen.getAllByRole('menu')).toHaveLength(2);
    await user.keyboard('{ArrowLeft}');
    await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(1));
    expect(submenuTrigger).toHaveFocus();
    await user.keyboard('{ArrowRight}');
    await screen.findByRole('menuitem', { name: 'Nested action' });
    await user.keyboard('{Escape}');
    await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(1));
    expect(submenuTrigger).toHaveFocus();
  });
});

describe('Menu selection', () => {
  it('toggles unchecked items, renders indicators and respects cancelled checkbox changes', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <Menu.Root defaultOpen>
        <MenuContent>
          <Menu.CheckboxItem onCheckedChange={onCheckedChange}>
            Notifications
            <Menu.CheckboxItemIndicator aria-label="Enabled" />
          </Menu.CheckboxItem>
          <Menu.CheckboxItem
            defaultChecked
            onCheckedChange={(checked, details) => {
              onCheckedChange(checked, details);
              details.cancel();
            }}
          >
            Required setting
          </Menu.CheckboxItem>
        </MenuContent>
      </Menu.Root>,
    );

    const notifications = await screen.findByRole('menuitemcheckbox', {
      name: 'Notifications',
    });
    expect(notifications).toHaveAttribute('aria-checked', 'false');
    await user.click(notifications);
    expect(notifications).toHaveAttribute('aria-checked', 'true');
    expect(within(notifications).getByLabelText('Enabled')).toBeInTheDocument();
    expect(onCheckedChange).toHaveBeenLastCalledWith(
      true,
      expect.objectContaining({
        reason: 'item-press',
        event: expect.any(MouseEvent),
        isCanceled: false,
      }),
    );
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.click(notifications);
    expect(notifications).toHaveAttribute('aria-checked', 'false');
    expect(within(notifications).queryByLabelText('Enabled')).toBeNull();
    const requiredSetting = screen.getByRole('menuitemcheckbox', {
      name: 'Required setting',
    });
    await user.click(requiredSetting);
    expect(requiredSetting).toHaveAttribute('aria-checked', 'true');
    expect(onCheckedChange).toHaveBeenLastCalledWith(
      false,
      expect.objectContaining({ isCanceled: true }),
    );
  });

  it('preserves radio values, cancellation and the selected indicator', async () => {
    const user = userEvent.setup();
    const originalValue = { name: 'Original' };
    const nextValue = { name: 'Next' };
    const cancelledValue = { name: 'Cancelled' };
    const onValueChange = vi.fn();
    render(
      <Menu.Root defaultOpen>
        <MenuContent>
          <Menu.RadioGroup
            defaultValue={originalValue}
            onValueChange={(value, details) => {
              onValueChange(value, details);
              if (value === cancelledValue) {
                details.cancel();
              }
            }}
          >
            <Menu.RadioItem value={originalValue}>
              Original
              <Menu.RadioItemIndicator aria-label="Selected" />
            </Menu.RadioItem>
            <Menu.RadioItem value={nextValue}>
              Next
              <Menu.RadioItemIndicator aria-label="Selected" />
            </Menu.RadioItem>
            <Menu.RadioItem value={cancelledValue}>Cancelled</Menu.RadioItem>
          </Menu.RadioGroup>
        </MenuContent>
      </Menu.Root>,
    );

    const original = await screen.findByRole('menuitemradio', {
      name: 'Original',
    });
    const next = screen.getByRole('menuitemradio', { name: 'Next' });
    const cancelled = screen.getByRole('menuitemradio', { name: 'Cancelled' });
    expect(original).toHaveAttribute('aria-checked', 'true');
    await user.click(cancelled);
    expect(original).toHaveAttribute('aria-checked', 'true');
    expect(cancelled).toHaveAttribute('aria-checked', 'false');
    expect(onValueChange).toHaveBeenLastCalledWith(
      cancelledValue,
      expect.objectContaining({ reason: 'item-press', isCanceled: true }),
    );
    await user.click(next);
    expect(original).toHaveAttribute('aria-checked', 'false');
    expect(next).toHaveAttribute('aria-checked', 'true');
    expect(within(next).getByLabelText('Selected')).toBeInTheDocument();
    expect(onValueChange).toHaveBeenLastCalledWith(
      nextValue,
      expect.objectContaining({
        reason: 'item-press',
        event: expect.any(MouseEvent),
        isCanceled: false,
      }),
    );
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('reports changes without mutating controlled checkbox and radio values', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const onValueChange = vi.fn();
    const content = ({
      checked,
      value,
    }: {
      checked: boolean;
      value: string;
    }) => (
      <Menu.Root open>
        <MenuContent>
          <Menu.CheckboxItem
            checked={checked}
            onCheckedChange={onCheckedChange}
          >
            Notifications
          </Menu.CheckboxItem>
          <Menu.RadioGroup value={value} onValueChange={onValueChange}>
            <Menu.RadioItem value="first">First</Menu.RadioItem>
            <Menu.RadioItem value="second">Second</Menu.RadioItem>
          </Menu.RadioGroup>
        </MenuContent>
      </Menu.Root>
    );
    const { rerender } = render(content({ checked: false, value: 'first' }));
    const checkbox = await screen.findByRole('menuitemcheckbox');
    const second = screen.getByRole('menuitemradio', { name: 'Second' });
    await user.click(checkbox);
    await user.click(second);
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.any(Object));
    expect(onValueChange).toHaveBeenCalledWith('second', expect.any(Object));
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
    expect(second).toHaveAttribute('aria-checked', 'false');
    rerender(content({ checked: true, value: 'second' }));
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
    expect(second).toHaveAttribute('aria-checked', 'true');
  });
});

it('preserves detached trigger payloads, handle methods and root actions', async () => {
  const user = userEvent.setup();
  const handle = Menu.createHandle<{ recordId: string }>();
  const actions = createRef<MenuRootActions>();
  const onOpenChange = vi.fn();
  render(
    <>
      <Menu.Trigger
        handle={handle}
        id="record-actions"
        payload={{ recordId: 'record-one' }}
      >
        Record actions
      </Menu.Trigger>
      <Menu.Root
        handle={handle}
        actionsRef={actions}
        onOpenChange={onOpenChange}
      >
        {({ payload }) => (
          <MenuContent>
            <Menu.Item>{payload?.recordId}</Menu.Item>
          </MenuContent>
        )}
      </Menu.Root>
    </>,
  );

  await user.click(screen.getByRole('button', { name: 'Record actions' }));
  expect(await screen.findByRole('menu')).toHaveTextContent('record-one');
  expect(handle.isOpen).toBe(true);
  act(() => actions.current?.close());
  await waitFor(() =>
    expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
  );
  expect(handle.isOpen).toBe(false);
  expect(onOpenChange).toHaveBeenLastCalledWith(
    false,
    expect.objectContaining({ reason: 'imperative-action' }),
  );
  act(() => handle.open('record-actions'));
  expect(await screen.findByRole('menu')).toHaveTextContent('record-one');
  act(() => handle.close());
  await waitFor(() =>
    expect(screen.queryByRole('menu')).not.toBeInTheDocument(),
  );
});
