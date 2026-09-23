import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { IconComment, IconHome } from '@ui/icon';
import { TextDirectionProvider } from '@ui/primitives/layout/TextDirectionProvider/TextDirectionProvider';
import { Tabs } from '@ui/primitives/navigation/Tabs/Tabs';
import { ComponentDecorator } from '@ui/testing';

import { SegmentedControl } from '../SegmentedControl';

const meta: Meta<typeof SegmentedControl> = {
  title: 'UI/Input/SegmentedControl',
  component: SegmentedControl,
  decorators: [ComponentDecorator],
  args: {
    'aria-label': 'Billing period',
    defaultValue: 'annual',
    options: [
      { label: 'Annual', value: 'annual' },
      { label: 'Monthly', value: 'monthly' },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

export const Default: Story = {};

export const Dark: Story = {
  globals: { colorScheme: 'dark' },
};

export const IconOnlyTabList: Story = {
  render: () => (
    <Tabs.Root defaultValue="home">
      <Tabs.List aria-label="Workspace" activateOnFocus>
        <Tabs.Tab value="home" aria-label="Home" startIcon={<IconHome />} />
        <Tabs.Tab value="chat" aria-label="Chat" startIcon={<IconComment />} />
      </Tabs.List>
      <Tabs.Panel value="home">Home content</Tabs.Panel>
      <Tabs.Panel value="chat">Chat content</Tabs.Panel>
    </Tabs.Root>
  ),
};

export const WithDisabledOption: Story = {
  args: {
    options: [
      { label: 'Annual', value: 'annual' },
      { label: 'Monthly', value: 'monthly' },
      { disabled: true, label: 'Weekly', value: 'weekly' },
    ],
  },
};

export const IconOnly: Story = {
  args: {
    'aria-label': 'Start page',
    defaultValue: 'home',
    options: [
      { startIcon: <IconHome />, 'aria-label': 'Home', value: 'home' },
      { startIcon: <IconComment />, 'aria-label': 'Chat', value: 'chat' },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const home = canvas.getByRole('radio', { name: 'Home' });
    const chat = canvas.getByRole('radio', { name: 'Chat' });

    await expect(home).toBeChecked();
    await expect(chat).not.toBeChecked();
    await expect(canvas.queryByRole('img')).not.toBeInTheDocument();
    await userEvent.click(chat);
    await expect(chat).toBeChecked();
    await expect(home).not.toBeChecked();
  },
};

export const ContentWidth: Story = {
  args: { itemWidth: 'content' },
};

export const EqualWidth: Story = {
  args: { style: { width: 280 } },
};

export const RightToLeft: Story = {
  render: (args) => (
    <TextDirectionProvider direction="rtl">
      <SegmentedControl {...args} dir="rtl" />
    </TextDirectionProvider>
  ),
};
