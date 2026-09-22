import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { IconArchive, IconCopy, IconDownload } from '@ui/icon';
import { Button } from '@ui/primitives/input/Button/Button';
import { ComponentDecorator } from '@ui/testing';

import { Dropdown } from '../Dropdown';
import { DropdownPagesExample } from './DropdownPagesExample';
import { DropdownPanelExample } from './DropdownPanelExample';
import { DropdownPickerExample } from './DropdownPickerExample';

const DropdownMenuExample = () => (
  <Dropdown.Root kind="menu">
    <Dropdown.Trigger render={<Button>Record actions</Button>} />
    <Dropdown.Content aria-label="Record actions" width={240}>
      <Dropdown.Section>
        <Dropdown.ActionItem startIcon={<IconCopy />}>
          Duplicate
        </Dropdown.ActionItem>
        <Dropdown.Submenu>
          <Dropdown.SubmenuTrigger startIcon={<IconDownload />}>
            Export
          </Dropdown.SubmenuTrigger>
          <Dropdown.Content aria-label="Export formats">
            <Dropdown.Section>
              <Dropdown.ActionItem>CSV</Dropdown.ActionItem>
              <Dropdown.ActionItem>Excel</Dropdown.ActionItem>
            </Dropdown.Section>
          </Dropdown.Content>
        </Dropdown.Submenu>
      </Dropdown.Section>
      <Dropdown.Separator />
      <Dropdown.Section>
        <Dropdown.ActionItem startIcon={<IconArchive />}>
          Archive
        </Dropdown.ActionItem>
        <Dropdown.ActionItem
          render={
            <a href="#dropdown-documentation" aria-label="Documentation" />
          }
        >
          Documentation
        </Dropdown.ActionItem>
      </Dropdown.Section>
    </Dropdown.Content>
  </Dropdown.Root>
);

const meta: Meta<typeof DropdownMenuExample> = {
  title: 'UI/Components/Dropdown',
  component: DropdownMenuExample,
  decorators: [ComponentDecorator],
  parameters: { container: { width: 320, height: 340 } },
};

export default meta;

type Story = StoryObj<typeof DropdownMenuExample>;

export const Documentation: Story = {};

export const Menu: Story = {
  parameters: {
    a11y: {
      config: {
        rules: [
          {
            id: 'aria-hidden-focus',
            selector: '[aria-hidden="true"]:not([data-base-ui-focus-guard])',
          },
        ],
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const body = within(canvasElement.ownerDocument.body);
    const trigger = canvas.getByRole('button', { name: 'Record actions' });

    await userEvent.click(trigger);
    await waitFor(() =>
      expect(body.getByRole('menu', { name: 'Record actions' })).toBeVisible(),
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: /Duplicate/ })).toHaveFocus(),
    );
    await userEvent.keyboard('{ArrowDown}{ArrowRight}');
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'CSV' })).toHaveFocus(),
    );
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}');
    const documentation = await body.findByRole('menuitem', {
      name: 'Documentation',
    });

    await waitFor(() => expect(documentation).toHaveFocus());
    await expect(documentation).toHaveAttribute(
      'href',
      '#dropdown-documentation',
    );
    await userEvent.keyboard('{Escape}');
    await waitFor(() =>
      expect(body.queryByRole('menu')).not.toBeInTheDocument(),
    );
    await userEvent.click(trigger);
    await waitFor(() =>
      expect(body.getByRole('menu', { name: 'Record actions' })).toBeVisible(),
    );
  },
};

export const MenuDark: Story = {
  ...Menu,
  globals: { colorScheme: 'dark' },
};

export const Picker: Story = {
  render: () => <DropdownPickerExample />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Choose people' }),
    );
    const search = await body.findByRole('searchbox', {
      name: 'Search people',
    });

    await waitFor(() => expect(search).toHaveFocus());
    await userEvent.type(search, 'Grace');
    await userEvent.keyboard('{ArrowDown}');
    await expect(
      body.getByRole('button', { name: 'Create Grace' }),
    ).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect(
      body.getByRole('button', { name: 'Grace Hopper' }),
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};

export const MultipleSelection: Story = {
  render: () => <DropdownPickerExample multiple />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Choose people' }),
    );
    const ada = await body.findByRole('button', { name: 'Ada Lovelace' });

    await userEvent.click(ada);
    await expect(ada).toHaveAttribute('aria-pressed', 'true');
    await expect(body.getByRole('dialog')).toBeVisible();
  },
};

export const MultipleSelectionDark: Story = {
  ...MultipleSelection,
  globals: { colorScheme: 'dark' },
};

export const Loading: Story = {
  render: () => <DropdownPickerExample loading />,
  play: async ({ canvasElement }) => {
    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Choose people' }),
    );
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('status'),
    ).toHaveTextContent('Loading people');
  },
};

export const Pages: Story = {
  render: () => <DropdownPagesExample />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Filters' }),
    );
    await userEvent.click(
      await body.findByRole('menuitem', { name: 'Person' }),
    );
    const search = await body.findByRole('searchbox', {
      name: 'Search people',
    });

    await waitFor(() => expect(search).toHaveFocus());
    await userEvent.click(
      within(body.getByRole('dialog')).getByRole('button', { name: 'Filters' }),
    );
    await waitFor(() =>
      expect(body.getByRole('menuitem', { name: 'Person' })).toHaveFocus(),
    );
    await userEvent.keyboard('{Enter}');
    await waitFor(() =>
      expect(
        body.getByRole('searchbox', { name: 'Search people' }),
      ).toHaveFocus(),
    );
  },
};

export const PagesDark: Story = {
  ...Pages,
  globals: { colorScheme: 'dark' },
};

export const Panel: Story = {
  render: () => <DropdownPanelExample />,
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);

    await userEvent.click(
      within(canvasElement).getByRole('button', { name: 'Edit view' }),
    );
    const name = await body.findByRole('textbox', { name: 'View name' });

    await waitFor(() => expect(name).toHaveFocus());
    await userEvent.clear(name);
    await userEvent.type(name, 'My team');
    await userEvent.click(body.getByRole('button', { name: 'Save view' }));
    await waitFor(() =>
      expect(body.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  },
};
