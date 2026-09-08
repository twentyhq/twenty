import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { type ReactNode } from 'react';
import { vi } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import listItemStyles from '@ui/navigation/ListItem/ListItem.module.scss';
import { ThemeProvider } from '@ui/theme-constants/ThemeProvider';

import { Menu } from '../Menu';
import styles from '../Menu.module.scss';
import { type MenuPopupProps } from '../types/MenuPopupProps';
import { type MenuRootProps } from '../types/MenuRootProps';

const MenuRootWrapper = ({ children }: { children: ReactNode }) => (
  <Menu.Root>{children}</Menu.Root>
);
const OpenMenuWrapper = ({ children }: { children: ReactNode }) => (
  <Menu.Root open>{children}</Menu.Root>
);
const MenuPopupWrapper = ({ children }: { children: ReactNode }) => (
  <Menu.Root open>
    <Menu.Popup>{children}</Menu.Popup>
  </Menu.Root>
);
const MenuRadioGroupWrapper = ({ children }: { children: ReactNode }) => (
  <MenuPopupWrapper>
    <Menu.RadioGroup>{children}</Menu.RadioGroup>
  </MenuPopupWrapper>
);
const MenuGroupWrapper = ({ children }: { children: ReactNode }) => (
  <MenuPopupWrapper>
    <Menu.Group>{children}</Menu.Group>
  </MenuPopupWrapper>
);
const MenuSubmenuWrapper = ({ children }: { children: ReactNode }) => (
  <MenuPopupWrapper>
    <Menu.SubmenuRoot>{children}</Menu.SubmenuRoot>
  </MenuPopupWrapper>
);

runComponentConformance({
  name: 'Menu.Trigger',
  element: <Menu.Trigger>Options</Menu.Trigger>,
  refInstanceOf: HTMLButtonElement,
  wrapper: MenuRootWrapper,
  renderPropTagName: 'button',
});
runComponentConformance({
  name: 'Menu.Popup',
  element: <Menu.Popup />,
  refInstanceOf: HTMLDivElement,
  wrapper: OpenMenuWrapper,
  ownClassName: styles.popup,
});
runComponentConformance({
  name: 'Menu.Item',
  element: <Menu.Item>Item</Menu.Item>,
  refInstanceOf: HTMLDivElement,
  wrapper: MenuPopupWrapper,
  ownClassName: listItemStyles.root,
});
runComponentConformance({
  name: 'Menu.CheckboxItem',
  element: <Menu.CheckboxItem>Item</Menu.CheckboxItem>,
  refInstanceOf: HTMLDivElement,
  wrapper: MenuPopupWrapper,
  ownClassName: listItemStyles.root,
});
runComponentConformance({
  name: 'Menu.RadioItem',
  element: <Menu.RadioItem value="a">Item</Menu.RadioItem>,
  refInstanceOf: HTMLDivElement,
  wrapper: MenuRadioGroupWrapper,
  ownClassName: listItemStyles.root,
});
runComponentConformance({
  name: 'Menu.SubmenuTrigger',
  element: <Menu.SubmenuTrigger>More</Menu.SubmenuTrigger>,
  refInstanceOf: HTMLDivElement,
  wrapper: MenuSubmenuWrapper,
  ownClassName: listItemStyles.root,
});
runComponentConformance({
  name: 'Menu.RadioGroup',
  element: <Menu.RadioGroup />,
  refInstanceOf: HTMLDivElement,
  wrapper: MenuPopupWrapper,
  ownClassName: styles.group,
});
runComponentConformance({
  name: 'Menu.Group',
  element: <Menu.Group />,
  refInstanceOf: HTMLDivElement,
  wrapper: MenuPopupWrapper,
  ownClassName: styles.group,
});
runComponentConformance({
  name: 'Menu.GroupLabel',
  element: <Menu.GroupLabel>Group</Menu.GroupLabel>,
  refInstanceOf: HTMLDivElement,
  wrapper: MenuGroupWrapper,
  ownClassName: styles.groupLabel,
});
runComponentConformance({
  name: 'Menu.Separator',
  element: <Menu.Separator />,
  refInstanceOf: HTMLDivElement,
  wrapper: MenuPopupWrapper,
  ownClassName: styles.separator,
});

const MenuExample = ({
  children,
  popupProps,
  ...props
}: MenuRootProps & { children?: ReactNode; popupProps?: MenuPopupProps }) => (
  <>
    <Menu.Root {...props}>
      <Menu.Trigger>Options</Menu.Trigger>
      <Menu.Popup {...popupProps}>
        {children ?? (
          <>
            <Menu.Item>Duplicate</Menu.Item>
            <Menu.Item description="Remove this record" color="danger">
              Delete
            </Menu.Item>
            <Menu.Item>Archive</Menu.Item>
          </>
        )}
      </Menu.Popup>
    </Menu.Root>
    <button type="button">Outside</button>
  </>
);

const SubmenuExample = ({ popupProps }: { popupProps?: MenuPopupProps }) => (
  <MenuExample>
    <Menu.SubmenuRoot>
      <Menu.SubmenuTrigger>More</Menu.SubmenuTrigger>
      <Menu.Popup {...popupProps}>
        <Menu.Item>Export</Menu.Item>
        <Menu.Item>Share</Menu.Item>
      </Menu.Popup>
    </Menu.SubmenuRoot>
  </MenuExample>
);

describe('Menu', () => {
  it('opens a menu in the body and highlights ListItem rows on hover', async () => {
    const user = userEvent.setup();
    const { container } = render(<MenuExample />);
    await user.click(screen.getByRole('button', { name: 'Options' }));
    const menu = await screen.findByRole('menu', { name: 'Options' });
    expect(document.body).toContainElement(menu);
    expect(container).not.toContainElement(menu);
    const item = screen.getByRole('menuitem', { name: 'Duplicate' });
    await user.hover(item);
    await waitFor(() => expect(item).toHaveAttribute('data-highlighted'));
    expect(item).toHaveClass(listItemStyles.root);
  });

  it('opens with ArrowDown, navigates in both directions, loops and supports Home/End', async () => {
    const user = userEvent.setup();
    render(<MenuExample />);
    await user.tab();
    await user.keyboard('{ArrowDown}');
    const items = screen.getAllByRole('menuitem');
    await waitFor(() => expect(items[0]).toHaveFocus());
    expect(items[0]).toHaveAttribute('data-highlighted');
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(items[1]).toHaveFocus());
    await user.keyboard('{ArrowUp}');
    await waitFor(() => expect(items[0]).toHaveFocus());
    await user.keyboard('{ArrowUp}');
    await waitFor(() => expect(items[2]).toHaveFocus());
    await user.keyboard('{ArrowDown}');
    await waitFor(() => expect(items[0]).toHaveFocus());
    await user.keyboard('{End}');
    await waitFor(() => expect(items[2]).toHaveFocus());
    await user.keyboard('{Home}');
    await waitFor(() => expect(items[0]).toHaveFocus());
  });

  it('matches typeahead against the label before its description', async () => {
    const user = userEvent.setup();
    render(<MenuExample />);
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus(),
    );
    await user.keyboard('de');
    await waitFor(() =>
      expect(
        screen.getByRole('menuitem', { name: 'Delete Remove this record' }),
      ).toHaveFocus(),
    );
  });

  it('uses an explicit typeahead label when a slot precedes the text', async () => {
    const user = userEvent.setup();
    render(
      <MenuExample>
        <Menu.Item>Duplicate</Menu.Item>
        <Menu.Item label="Delete" startIcon={<span>Prefix</span>}>
          Remove
        </Menu.Item>
      </MenuExample>,
    );
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus(),
    );
    await user.keyboard('de');
    await waitFor(() =>
      expect(
        screen.getByRole('menuitem', { name: 'Prefix Remove' }),
      ).toHaveFocus(),
    );
  });

  it.each(['click', 'Enter', 'Space'])(
    'activates on %s and closes',
    async (activation) => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <MenuExample>
          <Menu.Item onClick={onClick}>Delete</Menu.Item>
        </MenuExample>,
      );
      await user.tab();
      await user.keyboard('{ArrowDown}');
      const item = screen.getByRole('menuitem');
      await waitFor(() => expect(item).toHaveFocus());
      if (activation === 'click') await user.click(item);
      else await user.keyboard(activation === 'Enter' ? '{Enter}' : ' ');
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    },
  );

  it.each(['click', 'Enter'])(
    'keeps open with closeOnClick=false on %s',
    async (activation) => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <MenuExample>
          <Menu.Item closeOnClick={false} onClick={onClick}>
            Run
          </Menu.Item>
        </MenuExample>,
      );
      await user.tab();
      await user.keyboard('{ArrowDown}');
      await waitFor(() => expect(screen.getByRole('menuitem')).toHaveFocus());
      if (activation === 'click')
        await user.click(screen.getByRole('menuitem'));
      else await user.keyboard('{Enter}');
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(screen.getByRole('menu')).toBeInTheDocument();
    },
  );

  it('closes on Escape and returns focus to the trigger', async () => {
    const user = userEvent.setup();
    render(<MenuExample />);
    await user.tab();
    await user.keyboard('{ArrowDown}{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Options' })).toHaveFocus(),
    );
  });

  it('closes on an outside click', async () => {
    const user = userEvent.setup();
    render(<MenuExample />);
    await user.click(screen.getByRole('button', { name: 'Options' }));
    await screen.findByRole('menu');
    await user.click(screen.getByRole('button', { name: 'Outside' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('keeps disabled items highlightable but blocks click and Enter', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(
      <MenuExample>
        <Menu.Item>Duplicate</Menu.Item>
        <Menu.Item disabled onClick={onClick}>
          Delete
        </Menu.Item>
      </MenuExample>,
    );
    await user.tab();
    await user.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus(),
    );
    await user.keyboard('{ArrowDown}');
    const item = screen.getByRole('menuitem', { name: 'Delete' });
    await waitFor(() => expect(item).toHaveFocus());
    expect(item).toHaveAttribute('aria-disabled', 'true');
    expect(item).toHaveAttribute('data-disabled');
    await waitFor(() => expect(item).toHaveAttribute('data-highlighted'));
    await user.keyboard('{Enter}');
    await user.click(item);
    expect(onClick).not.toHaveBeenCalled();
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it.each(['escape-key', 'item-press'])(
    'reports controlled %s changes and waits for open',
    async (reason) => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const { rerender } = render(
        <MenuExample open onOpenChange={onOpenChange} />,
      );
      if (reason === 'escape-key') await user.keyboard('{Escape}');
      else
        await user.click(screen.getByRole('menuitem', { name: 'Duplicate' }));
      expect(onOpenChange).toHaveBeenCalledWith(
        false,
        expect.objectContaining({ reason }),
      );
      expect(screen.getByRole('menu')).toBeInTheDocument();
      rerender(<MenuExample open={false} onOpenChange={onOpenChange} />);
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    },
  );

  it('supports defaultOpen', () => {
    render(<MenuExample defaultOpen />);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('portals into an explicit container', () => {
    const portalContainer = document.createElement('div');
    document.body.append(portalContainer);
    try {
      const { unmount } = render(
        <MenuExample open popupProps={{ container: portalContainer }} />,
      );
      expect(within(portalContainer).getByRole('menu')).toBeInTheDocument();
      unmount();
    } finally {
      portalContainer.remove();
    }
  });

  it('uses the scoped theme container', () => {
    const { container } = render(
      <ThemeProvider colorScheme="dark" applyToRoot={false}>
        <MenuExample open />
      </ThemeProvider>,
    );
    expect(container).toContainElement(screen.getByRole('menu'));
  });

  it('toggles checkbox semantics and the decorative indicator without closing', async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <MenuExample defaultOpen>
        <Menu.CheckboxItem onCheckedChange={onCheckedChange}>
          Notifications
        </Menu.CheckboxItem>
        <Menu.CheckboxItem defaultChecked>Pinned</Menu.CheckboxItem>
      </MenuExample>,
    );
    const item = screen.getByRole('menuitemcheckbox', {
      name: 'Notifications',
    });
    expect(item).toHaveAttribute('aria-checked', 'false');
    expect(item).toHaveAttribute('data-indicator', 'checkbox');
    expect(item).not.toHaveAttribute('data-selected');
    expect(
      screen.getByRole('menuitemcheckbox', { name: 'Pinned' }),
    ).toHaveAttribute('data-selected');
    await user.click(item);
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
    expect(item).toHaveAttribute('aria-checked', 'true');
    expect(item).toHaveAttribute('data-selected');
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await user.click(item);
    expect(item).toHaveAttribute('aria-checked', 'false');
    expect(item).not.toHaveAttribute('data-selected');
  });

  it('moves the radio selection and renders exactly one check mark', async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <MenuExample defaultOpen>
        <Menu.RadioGroup defaultValue="a" onValueChange={onValueChange}>
          <Menu.RadioItem value="a">Alpha</Menu.RadioItem>
          <Menu.RadioItem value="b">Beta</Menu.RadioItem>
        </Menu.RadioGroup>
      </MenuExample>,
    );
    const first = screen.getByRole('menuitemradio', { name: 'Alpha' });
    const second = screen.getByRole('menuitemradio', { name: 'Beta' });
    expect(first).toHaveAttribute('data-selected');
    await user.click(second);
    expect(onValueChange).toHaveBeenCalledWith('b', expect.anything());
    expect(first).not.toHaveAttribute('data-selected');
    expect(first).toHaveAttribute('aria-checked', 'false');
    expect(second).toHaveAttribute('data-selected');
    expect(second).toHaveAttribute('aria-checked', 'true');
    expect(second).toHaveAttribute('data-indicator', 'check');
    expect(screen.getByRole('menu').querySelectorAll('svg')).toHaveLength(1);
    expect(second.querySelector('svg')).toBeInTheDocument();
  });

  it('labels groups with GroupLabel and exposes a separator', () => {
    render(
      <MenuExample defaultOpen>
        <Menu.Group>
          <Menu.GroupLabel>Actions</Menu.GroupLabel>
          <Menu.Item>Duplicate</Menu.Item>
        </Menu.Group>
        <Menu.Separator />
      </MenuExample>,
    );
    expect(screen.getByRole('group', { name: 'Actions' })).toHaveAttribute(
      'aria-labelledby',
      screen.getByText('Actions').id,
    );
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('opens and closes a submenu with ArrowRight and ArrowLeft using nesting defaults', async () => {
    const user = userEvent.setup();
    render(<SubmenuExample />);
    await user.tab();
    await user.keyboard('{ArrowDown}');
    const trigger = screen.getByRole('menuitem', { name: 'More' });
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(trigger.querySelector('svg')).toHaveClass(
      listItemStyles.submenuIcon,
    );
    await user.keyboard('{ArrowRight}');
    await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(2));
    expect(trigger).toHaveAttribute('data-popup-open');
    const submenu = screen.getByRole('menu', { name: 'More' });
    expect(submenu).toHaveAttribute('data-side', 'inline-end');
    expect(submenu).toHaveAttribute('data-align', 'start');
    expect(screen.getByRole('menu', { name: 'Options' })).toHaveAttribute(
      'data-side',
      'bottom',
    );
    await waitFor(() =>
      expect(screen.getByRole('menuitem', { name: 'Export' })).toHaveFocus(),
    );
    await user.keyboard('{ArrowLeft}');
    await waitFor(() => expect(screen.getAllByRole('menu')).toHaveLength(1));
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('opens a submenu on hover and honors explicit placement', async () => {
    const user = userEvent.setup();
    render(<SubmenuExample popupProps={{ side: 'top', align: 'end' }} />);
    await user.click(screen.getByRole('button', { name: 'Options' }));
    await user.hover(await screen.findByRole('menuitem', { name: 'More' }));
    const submenu = await screen.findByRole('menu', { name: 'More' });
    await waitFor(() => expect(submenu).toHaveAttribute('data-side', 'top'));
    expect(submenu).toHaveAttribute('data-align', 'end');
  });

  it('preserves Base UI state in className, style and composed render functions', async () => {
    const user = userEvent.setup();
    render(
      <MenuExample defaultOpen>
        <Menu.CheckboxItem
          className={(state) => (state.checked ? 'checked' : 'unchecked')}
          style={(state) => ({ marginTop: state.checked ? 7 : 3 })}
          render={(props, state) => (
            <div {...props} data-render-checked={state.checked} />
          )}
        >
          Notifications
        </Menu.CheckboxItem>
      </MenuExample>,
    );
    const item = screen.getByRole('menuitemcheckbox');
    expect(item).toHaveClass(listItemStyles.root, 'unchecked');
    expect(item).toHaveAttribute('data-render-checked', 'false');
    await user.click(item);
    expect(item).toHaveClass(listItemStyles.root, 'checked');
    expect(item).toHaveStyle({ marginTop: '7px' });
    expect(item).toHaveAttribute('data-render-checked', 'true');
  });

  it('does not open when Root is disabled', async () => {
    const user = userEvent.setup();
    render(<MenuExample disabled />);
    await user.click(screen.getByRole('button', { name: 'Options' }));
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('keeps a closed popup mounted and hidden when requested', async () => {
    const user = userEvent.setup();
    render(<MenuExample defaultOpen popupProps={{ keepMounted: true }} />);
    await user.keyboard('{Escape}');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(screen.getByRole('menu', { hidden: true })).not.toBeVisible();
  });
});
