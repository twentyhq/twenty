import { useState } from 'react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';

import {
  Callout,
  Dropdown,
  MenuItem,
  SearchInput,
  Toaster,
  ToastProvider,
} from '@ui/components';
import { Avatar } from '@ui/primitives/data-display/Avatar/Avatar';
import { Button } from '@ui/primitives/input/Button/Button';
import { ResizeHandle } from '@ui/primitives/layout/ResizeHandle/ResizeHandle';
import { ListItem } from '@ui/primitives/navigation/ListItem/ListItem';
import { Menu } from '@ui/primitives/surfaces/Menu/Menu';
import { Text } from '@ui/primitives/typography/Text/Text';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

const meta: Meta = {
  title: 'UI/Accessibility/Label overrides',
  decorators: [ComponentDecorator],
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
};

export default meta;
type Story = StoryObj;

export const CalloutDismissal: Story = {
  render: function CalloutDismissal() {
    const [isSuppliedVisible, setIsSuppliedVisible] = useState(true);
    return (
      <>
        <Callout status="info" title="Default notice" onDismiss={() => {}} />
        {isSuppliedVisible && (
          <Callout
            status="info"
            title="Supplied notice"
            onDismiss={() => setIsSuppliedVisible(false)}
            closeLabel="Dismiss notice"
          />
        )}
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByRole('button', { name: 'Close' })).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Dismiss notice' }),
    );
    expect(canvas.queryByText('Supplied notice')).not.toBeInTheDocument();
    expect(canvas.getByText('Default notice')).toBeVisible();
  },
};

export const ShortcutLabels: Story = {
  render: () => (
    <>
      <ListItem shortcut={[['G'], ['D']]}>Default shortcut</ListItem>
      <ListItem shortcut={[['G'], ['S']]} shortcutJoinLabel="followed by">
        Supplied shortcut
      </ListItem>
      <MenuItem
        text="Legacy shortcut"
        shortcut={[['G'], ['L']]}
        shortcutJoinLabel="next"
      />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    expect(canvas.getByText('then')).toBeVisible();
    expect(canvas.getByText('followed by')).toBeVisible();
    expect(canvas.getByText('next')).toBeVisible();
  },
};

export const NativeNames: Story = {
  render: () => (
    <>
      <Text id="search-label">Find contacts</Text>
      <SearchInput
        value=""
        onValueChange={fn()}
        placeholder="Search everything"
        aria-label="Fallback search"
        aria-labelledby="search-label"
        filterDropdown={(button) => button}
        filterButtonAriaLabel="Filter contacts"
      />
      <Text id="avatar-label">Open profile</Text>
      <Avatar
        render={<button type="button" onClick={fn()} />}
        aria-label="Fallback avatar"
        aria-labelledby="avatar-label"
      />
      <Text id="resize-label">Resize details</Text>
      <ResizeHandle
        aria-label="Fallback resize"
        aria-labelledby="resize-label"
      />
      <Text id="notifications-label">Workspace notifications</Text>
      <ToastProvider>
        <Toaster
          aria-label="Fallback notifications"
          aria-labelledby="notifications-label"
        />
      </ToastProvider>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);

    expect(
      canvas.getByRole('textbox', { name: 'Find contacts' }),
    ).toHaveAttribute('placeholder', 'Search everything');
    expect(
      canvas.getByRole('button', { name: 'Filter contacts' }),
    ).toBeVisible();
    expect(canvas.getByRole('button', { name: 'Open profile' })).toBeVisible();
    expect(
      canvas.getByRole('separator', { name: 'Resize details' }),
    ).toBeVisible();
    expect(
      body.getByRole('region', { name: 'Workspace notifications' }),
    ).toBeInTheDocument();
  },
};

export const MenuShortcutLabels: Story = {
  render: () => (
    <Menu.Root>
      <Menu.Trigger render={<Button>Open shortcuts</Button>} />
      <Menu.Popup aria-label="Shortcuts">
        <Menu.Item shortcut={[['G'], ['D']]}>Default</Menu.Item>
        <Menu.Item shortcut={[['G'], ['A']]} shortcutJoinLabel="followed by">
          Action
        </Menu.Item>
        <Menu.CheckboxItem shortcut={[['G'], ['C']]} shortcutJoinLabel="next">
          Checkbox
        </Menu.CheckboxItem>
        <Menu.RadioGroup value="radio">
          <Menu.RadioItem
            value="radio"
            shortcut={[['G'], ['R']]}
            shortcutJoinLabel="afterwards"
          >
            Radio
          </Menu.RadioItem>
        </Menu.RadioGroup>
        <Menu.SubmenuRoot>
          <Menu.SubmenuTrigger
            shortcut={[['G'], ['S']]}
            shortcutJoinLabel="and"
          >
            Submenu
          </Menu.SubmenuTrigger>
          <Menu.Popup>
            <Menu.Item>Nested action</Menu.Item>
          </Menu.Popup>
        </Menu.SubmenuRoot>
      </Menu.Popup>
    </Menu.Root>
  ),
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Open shortcuts' }),
    );
    const body = within(canvasElement.ownerDocument.body);
    const menu = within(await body.findByRole('menu'));

    for (const label of ['then', 'followed by', 'next', 'afterwards', 'and']) {
      await waitFor(() => expect(menu.getByText(label)).toBeVisible());
    }
  },
};

export const DropdownLabels: Story = {
  render: () => (
    <Dropdown.Root type="menu">
      <Dropdown.Trigger render={<Button>Open labeled dropdown</Button>} />
      <Dropdown.Content aria-label="Label examples">
        <Dropdown.Page id="root">
          <Dropdown.ActionItem page="details">Details</Dropdown.ActionItem>
        </Dropdown.Page>
        <Dropdown.Page id="details" type="picker">
          <Dropdown.Header>
            <Dropdown.Title>Detail choices</Dropdown.Title>
            <Text id="close-dropdown-label">Dismiss choices</Text>
            <Dropdown.Close
              aria-label="Fallback close"
              aria-labelledby="close-dropdown-label"
            />
          </Dropdown.Header>
          <Dropdown.Back />
          <Dropdown.Back>Return to choices</Dropdown.Back>
          <Text id="dropdown-search-label">Find choices</Text>
          <Dropdown.Search
            aria-label="Fallback search"
            aria-labelledby="dropdown-search-label"
            placeholder="Type a choice"
          />
          <Dropdown.Empty>No matching choices</Dropdown.Empty>
          <Dropdown.Loading>Fetching choices</Dropdown.Loading>
          <Dropdown.ActionItem shortcut={[['G'], ['D']]}>
            Default shortcut
          </Dropdown.ActionItem>
          <Dropdown.ActionItem
            shortcut={[['G'], ['A']]}
            shortcutJoinLabel="followed by"
          >
            Action
          </Dropdown.ActionItem>
          <Dropdown.OptionItem
            selected={false}
            shortcut={[['G'], ['O']]}
            shortcutJoinLabel="next"
          >
            Option
          </Dropdown.OptionItem>
          <Dropdown.Submenu>
            <Dropdown.SubmenuTrigger
              shortcut={[['G'], ['S']]}
              shortcutJoinLabel="afterwards"
            >
              Submenu
            </Dropdown.SubmenuTrigger>
            <Dropdown.Content aria-label="Nested choices">
              <Dropdown.ActionItem>Nested action</Dropdown.ActionItem>
            </Dropdown.Content>
          </Dropdown.Submenu>
        </Dropdown.Page>
      </Dropdown.Content>
    </Dropdown.Root>
  ),
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      within(canvasElement).getByRole('button', {
        name: 'Open labeled dropdown',
      }),
    );
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Details' }),
    );
    expect(await body.findByRole('button', { name: 'Back' })).toBeVisible();
    expect(
      body.getByRole('button', { name: 'Return to choices' }),
    ).toBeVisible();
    expect(
      body.getByRole('searchbox', { name: 'Find choices' }),
    ).toHaveAttribute('placeholder', 'Type a choice');
    expect(body.getByText('No matching choices')).toHaveAttribute(
      'role',
      'status',
    );
    expect(body.getByText('Fetching choices')).toHaveAttribute(
      'aria-busy',
      'true',
    );

    for (const label of ['then', 'followed by', 'next', 'afterwards']) {
      expect(body.getByText(label)).toBeVisible();
    }

    await userEvent.click(
      body.getByRole('button', { name: 'Dismiss choices' }),
    );
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};
