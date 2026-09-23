import { type Meta, type StoryObj } from '@storybook/react-vite';
import { TabButton } from '@ui/components/navigation/TabButton/TabButton';
import {
  IconCheckbox,
  IconChevronDown,
  IconMail,
  IconSearch,
  IconSettings,
  IconUser,
} from '@ui/icon';
import { Avatar } from '@ui/primitives/data-display/Avatar/Avatar';
import { Pill } from '@ui/components/data-display/Pill/Pill';
import { Tabs } from '@ui/primitives/navigation/Tabs/Tabs';
import {
  A11Y_DEFER_COLOR_CONTRAST,
  AVATAR_URL_MOCK,
  CatalogDecorator,
  ComponentDecorator,
  type CatalogStory,
} from '@ui/testing';
import { type ReactNode } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import styles from './TabButton.stories.module.scss';

const TabContainer = ({ children }: { children?: ReactNode }) => {
  return <div className={styles.tabContainer}>{children}</div>;
};

const meta: Meta<typeof TabButton> = {
  title: 'UI/Components/TabButton',
  component: TabButton,
  decorators: [ComponentDecorator],
  args: {
    children: 'Tab Title',
    active: false,
    disabled: false,
    size: 'sm',
  },
  argTypes: {
    startIcon: { control: false },
    endIcon: { control: false },
    badge: { control: 'text' },
    size: {
      control: 'select',
      options: ['sm', 'md'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof TabButton>;

export const Default: Story = {
  args: {
    children: 'General',
    startIcon: <IconSettings />,
  },
  render: (args) => (
    <TabContainer>
      <TabButton {...args} />
    </TabContainer>
  ),
};

export const Active: Story = {
  args: {
    children: 'Active Tab',
    startIcon: <IconUser />,
    active: true,
  },
  render: (args) => (
    <TabContainer>
      <TabButton {...args} />
    </TabContainer>
  ),
};

export const Disabled: Story = {
  args: {
    children: 'Disabled Tab',
    startIcon: <IconCheckbox />,
    disabled: true,
  },
  render: (args) => (
    <TabContainer>
      <TabButton {...args} />
    </TabContainer>
  ),
};

export const WithLogo: Story = {
  args: {
    children: 'Company',
    startIcon: (
      <Avatar src={AVATAR_URL_MOCK} size="md" name="Company" aria-hidden />
    ),
  },
  render: (args) => (
    <TabContainer>
      <TabButton {...args} />
    </TabContainer>
  ),
};

export const WithStringPill: Story = {
  args: {
    children: 'Messages',
    startIcon: <IconMail />,
    badge: <Pill label="12" />,
  },
  render: (args) => (
    <TabContainer>
      <TabButton {...args} />
    </TabContainer>
  ),
};

export const WithBothIcons: Story = {
  args: {
    children: 'Search',
    startIcon: <IconSearch />,
    endIcon: <IconChevronDown />,
  },
  render: (args) => (
    <TabContainer>
      <TabButton {...args} />
    </TabContainer>
  ),
};

export const AsLink: Story = {
  args: {
    children: 'Link Tab',
    startIcon: <IconUser />,
    href: '/profile',
  },
  render: (args) => (
    <TabContainer>
      <TabButton {...args} />
    </TabContainer>
  ),
};

export const SmallContent: Story = {
  args: {
    children: 'Small',
    startIcon: <IconSettings />,
    size: 'sm',
  },
  render: (args) => (
    <TabContainer>
      <TabButton {...args} />
    </TabContainer>
  ),
};

export const MediumContent: Story = {
  args: {
    children: 'Medium',
    startIcon: <IconSettings />,
    size: 'md',
  },
  render: (args) => (
    <TabContainer>
      <TabButton {...args} />
    </TabContainer>
  ),
};

export const Catalog: CatalogStory<Story, typeof TabButton> = {
  args: {
    children: 'Tab title',
    startIcon: <IconCheckbox />,
  },
  argTypes: {
    active: { control: false },
    disabled: { control: false },
    onClick: { control: false },
    href: { control: false },
  },
  render: (args) => (
    <TabContainer>
      <TabButton {...args} />
    </TabContainer>
  ),
  parameters: {
    a11y: A11Y_DEFER_COLOR_CONTRAST,
    pseudo: { hover: ['.hover'], active: ['.active'] },
    catalog: {
      dimensions: [
        {
          name: 'states',
          values: ['default', 'hover', 'active'],
          props: (state: string) =>
            state === 'default' ? {} : { className: state },
        },
        {
          name: 'State',
          values: ['active', 'inactive', 'disabled'],
          labels: (state: string) => state,
          props: (state: string) => ({
            active: state === 'active',
            disabled: state === 'disabled',
          }),
        },
        {
          name: 'Content Size',
          values: ['sm', 'md'],
          labels: (size: string) => size,
          props: (size: string) => ({ size: size as 'sm' | 'md' }),
        },
        {
          name: 'Content',
          values: ['icon', 'logo', 'pill'],
          props: (content: string) => {
            switch (content) {
              case 'icon':
                return { startIcon: <IconSettings /> };
              case 'logo':
                return {
                  startIcon: (
                    <Avatar
                      src={AVATAR_URL_MOCK}
                      size="md"
                      name="Company"
                      aria-hidden
                    />
                  ),
                };
              case 'pill':
                return { startIcon: <IconMail />, badge: <Pill label="5" /> };
              default:
                return {};
            }
          },
        },
      ],
    },
    layout: 'centered',
    viewport: {
      defaultViewport: 'responsive',
    },
  },
  decorators: [CatalogDecorator],
};

export const KeyboardAction: Story = {
  args: { children: 'New Tab', startIcon: <IconUser />, onClick: fn() },
  render: Default.render,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'New Tab' });

    button.focus();
    await userEvent.keyboard('{Enter}');
    expect(args.onClick).toHaveBeenCalledTimes(1);
    expect(button).toHaveAttribute('type', 'button');
  },
};

export const DisabledLink: Story = {
  args: {
    children: 'Unavailable',
    href: '#unavailable',
    disabled: true,
    onClick: fn(),
  },
  render: Default.render,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole('link', { name: 'Unavailable' });

    expect(link).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(link);
    expect(args.onClick).not.toHaveBeenCalled();
    expect(link).not.toHaveAttribute('type');
  },
};

export const MatchingTabContent: Story = {
  args: {
    children: 'Messages',
    startIcon: <IconMail />,
    badge: <Pill label="12" />,
  },
  render: (args) => (
    <>
      <TabContainer>
        <TabButton {...args} active />
      </TabContainer>
      <Tabs.Root defaultValue="messages">
        <Tabs.List aria-label="Content appearance">
          <Tabs.Tab
            value="messages"
            startIcon={args.startIcon}
            badge={args.badge}
          >
            {args.children}
          </Tabs.Tab>
        </Tabs.List>
        <Tabs.Panel value="messages">Messages content</Tabs.Panel>
      </Tabs.Root>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const button = canvas.getByRole('button', { name: 'Messages 12' });
    const tab = canvas.getByRole('tab', { name: 'Messages 12' });

    expect(button.getBoundingClientRect().width).toBe(
      tab.getBoundingClientRect().width,
    );
    expect(button.getBoundingClientRect().height).toBe(
      tab.getBoundingClientRect().height,
    );
    expect(getComputedStyle(button).color).toBe(getComputedStyle(tab).color);
  },
};
