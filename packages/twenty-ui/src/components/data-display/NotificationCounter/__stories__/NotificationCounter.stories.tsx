import { type Meta, type StoryObj } from '@storybook/react-vite';

import { IconInfoCircle } from '@ui/icon';
import { Tabs } from '@ui/primitives/navigation/Tabs/Tabs';
import { ComponentDecorator } from '@ui/testing';

import { NotificationCounter } from '../NotificationCounter';

const meta = {
  title: 'UI/Navigation/Tabs',
  component: NotificationCounter,
  tags: ['!autodocs'],
  args: { count: 3, variant: 'secondary' },
} satisfies Meta<typeof NotificationCounter>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithIconAndBadge: Story = {
  decorators: [ComponentDecorator],
  parameters: { container: { width: 360 } },
  render: (args) => (
    <Tabs.Root defaultValue="overview">
      <Tabs.List aria-label="Record details">
        <Tabs.Tab
          value="overview"
          startIcon={<IconInfoCircle />}
          badge={<NotificationCounter {...args} />}
        >
          Overview
        </Tabs.Tab>
        <Tabs.Tab value="activity">Activity</Tabs.Tab>
        <Tabs.Tab value="settings">Settings</Tabs.Tab>
      </Tabs.List>
      <Tabs.Panel value="overview" style={{ padding: 'var(--t-spacing-4)' }}>
        Record overview
      </Tabs.Panel>
      <Tabs.Panel value="activity" style={{ padding: 'var(--t-spacing-4)' }}>
        Recent activity
      </Tabs.Panel>
      <Tabs.Panel value="settings" style={{ padding: 'var(--t-spacing-4)' }}>
        Record settings
      </Tabs.Panel>
    </Tabs.Root>
  ),
};
