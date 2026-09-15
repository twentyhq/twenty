import { type Meta, type StoryObj } from '@storybook/react-vite';
import { type ReactNode, useId, useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import {
  IconArchive,
  IconCopy,
  IconDownload,
  IconShare,
  IconTrash,
} from '@ui/icon';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  CatalogDecorator,
  type CatalogStory,
  ComponentDecorator,
} from '@ui/testing';

import { Menu } from '../Menu';
import { type MenuRootProps } from '../types/MenuRootProps';

type MenuCatalogContent = 'basic' | 'selection' | 'groups' | 'submenu';
type MenuStoryProps = MenuRootProps & { content?: MenuCatalogContent };

const BASIC_ITEMS = (
  <>
    <Menu.Item startIcon={<IconCopy />} hotkeys={['⌘', 'D']}>
      Duplicate
    </Menu.Item>
    <Menu.Item startIcon={<IconDownload />} description="CSV">
      Export
    </Menu.Item>
    <Menu.Item startIcon={<IconShare />}>Share</Menu.Item>
    <Menu.Separator />
    <Menu.Item startIcon={<IconArchive />} disabled>
      Archive
    </Menu.Item>
    <Menu.Item startIcon={<IconTrash />} color="danger">
      Delete
    </Menu.Item>
  </>
);

const MenuSelectionContent = () => {
  const [notifications, setNotifications] = useState(true);
  const [pinned, setPinned] = useState(false);
  const [view, setView] = useState('list');

  return (
    <>
      <Menu.CheckboxItem
        checked={notifications}
        onCheckedChange={setNotifications}
      >
        Notifications
      </Menu.CheckboxItem>
      <Menu.CheckboxItem checked={pinned} onCheckedChange={setPinned}>
        Pinned
      </Menu.CheckboxItem>
      <Menu.Separator />
      <Menu.RadioGroup value={view} onValueChange={setView}>
        <Menu.RadioItem value="list">List view</Menu.RadioItem>
        <Menu.RadioItem value="board">Board view</Menu.RadioItem>
      </Menu.RadioGroup>
    </>
  );
};

const GROUPED_ITEMS = (
  <>
    <Menu.Group>
      <Menu.GroupLabel>Record</Menu.GroupLabel>
      <Menu.Item startIcon={<IconCopy />}>Duplicate</Menu.Item>
      <Menu.Item startIcon={<IconShare />}>Share</Menu.Item>
    </Menu.Group>
    <Menu.Separator />
    <Menu.Group>
      <Menu.GroupLabel>Manage</Menu.GroupLabel>
      <Menu.Item startIcon={<IconArchive />}>Archive</Menu.Item>
      <Menu.Item startIcon={<IconTrash />} color="danger">
        Delete
      </Menu.Item>
    </Menu.Group>
  </>
);

const MenuSubmenuContent = ({
  container,
  open,
}: {
  container?: HTMLElement | null;
  open?: boolean;
}) => (
  <>
    <Menu.Item startIcon={<IconCopy />}>Duplicate</Menu.Item>
    <Menu.SubmenuRoot defaultOpen open={open}>
      <Menu.SubmenuTrigger startIcon={<IconDownload />}>
        Export
      </Menu.SubmenuTrigger>
      <Menu.Popup container={container}>
        <Menu.Item>CSV file</Menu.Item>
        <Menu.Item>Excel file</Menu.Item>
      </Menu.Popup>
    </Menu.SubmenuRoot>
    <Menu.Item startIcon={<IconShare />}>Share</Menu.Item>
  </>
);

const MENU_STORY_CONTENT: Record<MenuCatalogContent, ReactNode> = {
  basic: BASIC_ITEMS,
  selection: <MenuSelectionContent />,
  groups: GROUPED_ITEMS,
  submenu: <MenuSubmenuContent />,
};

const MenuStory = ({ content = 'basic', ...props }: MenuStoryProps) => {
  const triggerId = useId();

  return (
    <Menu.Root defaultOpen defaultTriggerId={triggerId} {...props}>
      <Menu.Trigger id={triggerId} style={{ alignSelf: 'flex-start' }}>
        Options
      </Menu.Trigger>
      <Menu.Popup>{MENU_STORY_CONTENT[content]}</Menu.Popup>
    </Menu.Root>
  );
};

const meta: Meta<typeof MenuStory> = {
  title: 'UI/Surfaces/Menu',
  component: MenuStory,
};
export default meta;
type Story = StoryObj<typeof MenuStory>;

export const Default: Story = {
  decorators: [ComponentDecorator],
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    container: { width: 240, height: 320 },
  },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const menu = await body.findByRole('menu', { name: 'Options' });
    expect(menu).toBeVisible();
    expect(canvasElement).not.toContainElement(menu);
    const item = within(menu).getByRole('menuitem', { name: /Duplicate/ });
    await userEvent.hover(item);
    await waitFor(() => expect(item).toHaveAttribute('data-highlighted'));
  },
};
export const Selection: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 240, height: 320 } },
  args: { content: 'selection' },
  play: async ({ canvasElement }) => {
    const menu = await within(canvasElement.ownerDocument.body).findByRole(
      'menu',
    );
    const notifications = within(menu).getByRole('menuitemcheckbox', {
      name: 'Notifications',
    });
    expect(notifications).toHaveAttribute('aria-checked', 'true');
    await userEvent.click(notifications);
    expect(notifications).toHaveAttribute('aria-checked', 'false');
    expect(notifications).not.toHaveAttribute('data-selected');
    await userEvent.click(notifications);
    expect(notifications).toHaveAttribute('data-selected');
    const listView = within(menu).getByRole('menuitemradio', {
      name: 'List view',
    });
    const boardView = within(menu).getByRole('menuitemradio', {
      name: 'Board view',
    });
    await userEvent.click(boardView);
    expect(listView).toHaveAttribute('aria-checked', 'false');
    expect(boardView).toHaveAttribute('aria-checked', 'true');
    expect(boardView).toHaveAttribute('data-selected');
    expect(menu).toBeVisible();
  },
};
export const Groups: Story = {
  ...Default,
  args: { content: 'groups' },
  play: async ({ canvasElement }) => {
    const menu = await within(canvasElement.ownerDocument.body).findByRole(
      'menu',
    );
    for (const label of ['Record', 'Manage']) {
      expect(within(menu).getByRole('group', { name: label })).toHaveAttribute(
        'aria-labelledby',
        within(menu).getByText(label).id,
      );
    }
    expect(within(menu).getByRole('separator')).toBeVisible();
  },
};
export const Submenu: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 240, height: 320 } },
  args: { content: 'submenu' },
  play: async ({ canvasElement }) => {
    const body = within(canvasElement.ownerDocument.body);
    const submenu = await body.findByRole('menu', { name: 'Export' });
    expect(
      within(submenu).getByRole('menuitem', { name: 'CSV file' }),
    ).toBeVisible();
    expect(body.getByRole('menuitem', { name: 'Export' })).toHaveAttribute(
      'aria-haspopup',
      'menu',
    );
  },
};

const MenuCatalogCell = ({ content = 'basic' }: MenuStoryProps) => {
  const [cellElement, setCellElement] = useState<HTMLDivElement | null>(null);
  const triggerId = useId();
  const contentByType: Record<MenuCatalogContent, ReactNode> = {
    ...MENU_STORY_CONTENT,
    submenu: <MenuSubmenuContent container={cellElement} open />,
  };

  return (
    <div
      ref={setCellElement}
      data-menu-catalog=""
      style={{ position: 'relative', width: 220, height: 230 }}
    >
      <Menu.Root open triggerId={triggerId} modal={false}>
        <Menu.Trigger id={triggerId} aria-label={`${content} options`}>
          Options
        </Menu.Trigger>
        <Menu.Popup container={cellElement} side="bottom" align="start">
          {contentByType[content]}
        </Menu.Popup>
      </Menu.Root>
    </div>
  );
};

export const Catalog: CatalogStory<Story, typeof MenuStory> = {
  render: (args) => <MenuCatalogCell {...args} />,
  decorators: [CatalogDecorator],
  parameters: {
    a11y: {
      ...A11Y_DEFER_COLOR_CONTRAST,
      config: {
        rules: [
          ...A11Y_DEFER_COLOR_CONTRAST.config.rules,
          {
            id: 'aria-hidden-focus',
            // Simultaneously open non-modal menus keep Base UI's focus sentinels active.
            // Limit this exception to catalog sentinels; menu content stays audited.
            selector:
              '[aria-hidden="true"]:not([data-menu-catalog] [data-base-ui-focus-guard])',
          },
        ],
      },
    },
    catalog: {
      dimensions: [
        { name: 'menu', values: ['menu'], labels: () => '', props: () => ({}) },
        {
          name: 'content',
          values: [
            'basic',
            'selection',
            'groups',
            'submenu',
          ] satisfies MenuCatalogContent[],
          props: (content: MenuCatalogContent) => ({ content }),
        },
      ],
      options: { elementContainer: { style: { width: 220, height: 230 } } },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    for (const content of ['basic', 'selection', 'groups', 'submenu']) {
      expect(
        await canvas.findByRole('menu', { name: `${content} options` }),
      ).toBeVisible();
    }
    expect(await canvas.findByRole('menu', { name: 'Export' })).toBeVisible();
  },
};
export const CatalogDark: CatalogStory<Story, typeof MenuStory> = {
  ...Catalog,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};
