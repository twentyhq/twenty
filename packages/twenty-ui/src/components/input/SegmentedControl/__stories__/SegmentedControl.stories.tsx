import { type Meta, type StoryObj } from '@storybook/react-vite';

import { IconComment, IconHome } from '@ui/icon';
import { DirectionProvider } from '@ui/primitives/layout/DirectionProvider/DirectionProvider';
import { ComponentDecorator } from '@ui/testing';

import { SegmentedControl } from '../SegmentedControl';

const meta: Meta<typeof SegmentedControl> = {
  title: 'Components/Input/SegmentedControl',
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

export const Documentation: Story = {};

export const Dark: Story = {
  globals: { colorScheme: 'dark' },
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
      {
        startIcon: <IconHome />,
        'aria-label': 'Home',
        value: 'home',
      },
      {
        startIcon: <IconComment />,
        'aria-label': 'Chat',
        value: 'chat',
      },
    ],
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
    <DirectionProvider direction="rtl">
      <SegmentedControl {...args} dir="rtl" />
    </DirectionProvider>
  ),
};

export const RightToLeftDocumentation: Story = {
  render: RightToLeft.render,
};
