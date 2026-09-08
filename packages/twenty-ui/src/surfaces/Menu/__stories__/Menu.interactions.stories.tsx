import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ReactNode, useId, useState } from 'react';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { Menu } from '../Menu';
import { type MenuPopupProps } from '../types/MenuPopupProps';
import { type MenuRootProps } from '../types/MenuRootProps';

type MenuExampleProps = Omit<MenuRootProps, 'children'> & {
  children?: ReactNode;
  popupProps?: MenuPopupProps;
};

const MenuExample = ({ children, popupProps, ...props }: MenuExampleProps) => {
  const triggerId = useId();

  return (
    <>
      <Menu.Root defaultTriggerId={triggerId} {...props}>
        <Menu.Trigger id={triggerId}>Options</Menu.Trigger>
        <Menu.Popup {...popupProps}>
          {children ?? (
            <>
              <Menu.Item>Duplicate</Menu.Item>
              <Menu.Item>Archive</Menu.Item>
              <Menu.Item>Delete</Menu.Item>
            </>
          )}
        </Menu.Popup>
      </Menu.Root>
      <button type="button">Outside</button>
    </>
  );
};

const meta: Meta<typeof MenuExample> = {
  title: 'UI/Surfaces/Menu/Interactions',
  component: MenuExample,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 260, height: 320 } },
};

export default meta;
type Story = StoryObj<typeof MenuExample>;

export const Keyboard: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Options' });
    await userEvent.tab();
    expect(trigger).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    const menu = await body.findByRole('menu');
    const first = within(menu).getByRole('menuitem', { name: 'Duplicate' });
    const middle = within(menu).getByRole('menuitem', { name: 'Archive' });
    const last = within(menu).getByRole('menuitem', { name: 'Delete' });
    await waitFor(() => expect(first).toHaveFocus());
    expect(first).toHaveAttribute('data-highlighted');
    await step('Navigate, wrap, and jump with Home and End', async () => {
      for (const [key, item] of [
        ['{ArrowDown}', middle],
        ['{ArrowUp}', first],
        ['{ArrowUp}', last],
        ['{ArrowDown}', first],
        ['{End}', last],
        ['{Home}', first],
      ] as const) {
        await userEvent.keyboard(key);
        await waitFor(() => expect(item).toHaveFocus());
      }
    });
    await step('Escape closes and restores trigger focus', async () => {
      await userEvent.keyboard('{Escape}');
      await waitFor(() =>
        expect(body.queryByRole('menu')).not.toBeInTheDocument(),
      );
      await waitFor(() => expect(trigger).toHaveFocus());
    });
  },
};

export const Typeahead: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  render: (args) => (
    <MenuExample {...args}>
      <Menu.Item>Duplicate</Menu.Item>
      <Menu.Item description="Delete old records">Archive</Menu.Item>
      <Menu.Item description="Remove this record">Delete</Menu.Item>
    </MenuExample>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus(),
    );
    await userEvent.keyboard('de');
    await waitFor(() =>
      expect(
        body.getByRole('menuitem', { name: 'Delete Remove this record' }),
      ).toHaveFocus(),
    );
    expect(
      body.getByRole('menuitem', { name: 'Archive Delete old records' }),
    ).not.toHaveFocus();
  },
};

export const ExplicitTypeaheadLabel: Story = {
  render: (args) => (
    <MenuExample {...args}>
      <Menu.Item>Duplicate</Menu.Item>
      <Menu.Item label="Delete" startIcon={<span>Prefix</span>}>
        Remove
      </Menu.Item>
    </MenuExample>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus(),
    );
    await userEvent.keyboard('de');
    await waitFor(() =>
      expect(
        body.getByRole('menuitem', { name: 'Prefix Remove' }),
      ).toHaveFocus(),
    );
  },
};

const onActivate = fn();

export const Activation: Story = {
  render: (args) => (
    <MenuExample {...args}>
      <Menu.Item onClick={onActivate}>Run</Menu.Item>
    </MenuExample>
  ),
  play: async ({ canvasElement, step }) => {
    const body = within(canvasElement.ownerDocument.body);
    onActivate.mockClear();
    await userEvent.tab();
    let activationCount = 0;
    for (const activation of ['Click', 'Enter', 'Space']) {
      await step(`Activate with ${activation}`, async () => {
        await userEvent.keyboard('{ArrowDown}');
        const item = await body.findByRole('menuitem', { name: 'Run' });
        await waitFor(() => expect(item).toHaveFocus());
        if (activation === 'Click') await userEvent.click(item);
        else await userEvent.keyboard(activation === 'Enter' ? '{Enter}' : ' ');
        activationCount += 1;
        expect(onActivate).toHaveBeenCalledTimes(activationCount);
        await waitFor(() =>
          expect(body.queryByRole('menu')).not.toBeInTheDocument(),
        );
        await waitFor(() =>
          expect(
            within(canvasElement).getByRole('button', { name: 'Options' }),
          ).toHaveFocus(),
        );
      });
    }
  },
};

export const KeepOpenOnActivation: Story = {
  render: (args) => (
    <MenuExample {...args}>
      <Menu.Item closeOnClick={false} onClick={onActivate}>
        Run
      </Menu.Item>
    </MenuExample>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    onActivate.mockClear();
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    const item = await body.findByRole('menuitem', { name: 'Run' });
    await waitFor(() => expect(item).toHaveFocus());
    await userEvent.keyboard('{Enter}');
    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(body.getByRole('menu')).toBeVisible();
    await userEvent.click(item);
    expect(onActivate).toHaveBeenCalledTimes(2);
    expect(body.getByRole('menu')).toBeVisible();
  },
};

export const OutsideDismissal: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(canvas.getByRole('button', { name: 'Options' }));
    await waitFor(() => expect(body.getByRole('menu')).toBeVisible());
    await userEvent.click(canvas.getByRole('button', { name: 'Outside' }));
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
  },
};

export const NonModalTabbing: Story = {
  args: { modal: false },
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
        within(canvasElement).getByRole('button', { name: 'Outside' }),
      ).toHaveFocus(),
    );
  },
};

export const DisabledItem: Story = {
  render: (args) => (
    <MenuExample {...args}>
      <Menu.Item>Duplicate</Menu.Item>
      <Menu.Item disabled onClick={onActivate}>
        Delete
      </Menu.Item>
    </MenuExample>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    onActivate.mockClear();
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus(),
    );
    await userEvent.keyboard('{ArrowDown}');
    const item = body.getByRole('menuitem', { name: 'Delete' });
    await waitFor(() => expect(item).toHaveFocus());
    expect(item).toHaveAttribute('aria-disabled', 'true');
    expect(item).toHaveAttribute('data-disabled');
    expect(item).toHaveAttribute('data-highlighted');
    await userEvent.keyboard('{Enter}');
    await userEvent.click(item);
    expect(onActivate).not.toHaveBeenCalled();
    expect(body.getByRole('menu')).toBeVisible();
  },
};

const ControlledMenu = (props: MenuExampleProps) => {
  const [open, setOpen] = useState(true);
  return (
    <>
      <MenuExample {...props} open={open} />
      <button type="button" onClick={() => setOpen(false)}>
        Apply closed state
      </button>
    </>
  );
};

export const Controlled: Story = {
  args: { onOpenChange: fn() },
  render: (args) => <ControlledMenu {...args} />,
  play: async ({ canvasElement, args }) => {
    const body = within(canvasElement.ownerDocument.body);
    const menu = await body.findByRole('menu');
    await userEvent.keyboard('{Escape}');
    expect(args.onOpenChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ reason: 'escape-key' }),
    );
    expect(menu).toBeVisible();
    await userEvent.click(
      within(menu).getByRole('menuitem', { name: 'Duplicate' }),
    );
    expect(args.onOpenChange).toHaveBeenCalledWith(
      false,
      expect.objectContaining({ reason: 'item-press' }),
    );
    expect(menu).toBeVisible();
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Apply closed state' }),
    );
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
  },
};

const onCheckedChange = fn();
const onValueChange = fn();

export const UncontrolledSelection: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <MenuExample {...args}>
      <Menu.CheckboxItem onCheckedChange={onCheckedChange}>
        Notifications
      </Menu.CheckboxItem>
      <Menu.CheckboxItem defaultChecked>Pinned</Menu.CheckboxItem>
      <Menu.RadioGroup defaultValue="list" onValueChange={onValueChange}>
        <Menu.RadioItem value="list">List view</Menu.RadioItem>
        <Menu.RadioItem value="board">Board view</Menu.RadioItem>
      </Menu.RadioGroup>
    </MenuExample>
  ),
  play: async ({ canvasElement }) => {
    const menu = await within(canvasElement.ownerDocument.body).findByRole(
      'menu',
    );
    const item = within(menu).getByRole('menuitemcheckbox', {
      name: 'Notifications',
    });
    expect(item).toHaveAttribute('aria-checked', 'false');
    expect(item).toHaveAttribute('data-indicator', 'checkbox');
    expect(item).not.toHaveAttribute('data-selected');
    expect(
      within(menu).getByRole('menuitemcheckbox', { name: 'Pinned' }),
    ).toHaveAttribute('data-selected');
    await userEvent.click(item);
    expect(onCheckedChange).toHaveBeenLastCalledWith(true, expect.anything());
    expect(item).toHaveAttribute('aria-checked', 'true');
    expect(item).toHaveAttribute('data-selected');
    await userEvent.click(item);
    expect(item).toHaveAttribute('aria-checked', 'false');
    expect(item).not.toHaveAttribute('data-selected');
    const first = within(menu).getByRole('menuitemradio', {
      name: 'List view',
    });
    const second = within(menu).getByRole('menuitemradio', {
      name: 'Board view',
    });
    await userEvent.click(second);
    expect(onValueChange).toHaveBeenLastCalledWith('board', expect.anything());
    expect(first).toHaveAttribute('aria-checked', 'false');
    expect(first).not.toHaveAttribute('data-selected');
    expect(second).toHaveAttribute('aria-checked', 'true');
    expect(second).toHaveAttribute('data-selected');
    expect(second).toHaveAttribute('data-indicator', 'check');
    expect(first.querySelector('svg')).not.toBeInTheDocument();
    expect(second.querySelectorAll('svg')).toHaveLength(1);
    expect(menu).toBeVisible();
  },
};

const SubmenuExample = ({ popupProps, ...props }: MenuExampleProps) => (
  <MenuExample {...props}>
    <Menu.SubmenuRoot>
      <Menu.SubmenuTrigger>More</Menu.SubmenuTrigger>
      <Menu.Popup {...popupProps}>
        <Menu.Item>Export</Menu.Item>
        <Menu.Item>Share</Menu.Item>
      </Menu.Popup>
    </Menu.SubmenuRoot>
  </MenuExample>
);

export const KeyboardSubmenu: Story = {
  render: (args) => <SubmenuExample {...args} />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    const trigger = await body.findByRole('menuitem', { name: 'More' });
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger.querySelector('svg')).toBeInTheDocument();
    await userEvent.keyboard('{ArrowRight}');
    const submenu = await body.findByRole('menu', { name: 'More' });
    expect(trigger).toHaveAttribute('data-popup-open');
    await waitFor(() =>
      expect(submenu).toHaveAttribute('data-side', 'inline-end'),
    );
    expect(submenu).toHaveAttribute('data-align', 'start');
    expect(body.getByRole('menu', { name: 'Options' })).toHaveAttribute(
      'data-side',
      'bottom',
    );
    await waitFor(() =>
      expect(
        within(submenu).getByRole('menuitem', { name: 'Export' }),
      ).toHaveFocus(),
    );
    await userEvent.keyboard('{ArrowLeft}');
    await waitFor(() =>
      expect(
        body.queryByRole('menu', { name: 'More' }),
      ).not.toBeInTheDocument(),
    );
    await waitFor(() => expect(trigger).toHaveFocus());
  },
};

export const HoverSubmenu: Story = {
  parameters: { container: { width: 480, height: 400 } },
  args: { popupProps: { side: 'top', align: 'end' } },
  render: (args) => (
    <div style={{ paddingTop: 160, paddingInlineStart: 160 }}>
      <SubmenuExample {...args} />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Options' }),
    );
    await userEvent.hover(await body.findByRole('menuitem', { name: 'More' }));
    const submenu = await body.findByRole('menu', { name: 'More' });
    await waitFor(() => expect(submenu).toHaveAttribute('data-side', 'top'));
    expect(submenu).toHaveAttribute('data-align', 'end');
  },
};

export const RenderState: Story = {
  args: { defaultOpen: true },
  render: (args) => (
    <MenuExample {...args}>
      <Menu.CheckboxItem
        className={(state) => (state.checked ? 'checked' : 'unchecked')}
        style={(state) => ({ marginTop: state.checked ? 7 : 3 })}
        render={(props, state) => (
          <div {...props} data-render-checked={state.checked} />
        )}
      >
        Notifications
      </Menu.CheckboxItem>
    </MenuExample>
  ),
  play: async ({ canvasElement }) => {
    const item = await within(canvasElement.ownerDocument.body).findByRole(
      'menuitemcheckbox',
      { name: 'Notifications' },
    );
    expect(item).toHaveClass('unchecked');
    expect(item).toHaveAttribute('data-render-checked', 'false');
    await userEvent.click(item);
    expect(item).toHaveClass('checked');
    expect(item).toHaveStyle({ marginTop: '7px' });
    expect(item).toHaveAttribute('data-render-checked', 'true');
  },
};

export const DisabledRoot: Story = {
  args: { disabled: true },
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Options' }),
    );
    expect(
      within(canvasElement.ownerDocument.body).queryByRole('menu'),
    ).not.toBeInTheDocument();
  },
};

export const KeepMounted: Story = {
  args: { defaultOpen: true, popupProps: { keepMounted: true } },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    expect(await body.findByRole('menu')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    expect(body.getByRole('menu', { hidden: true })).not.toBeVisible();
  },
};
