import { type Meta, type StoryObj } from '@storybook/react-vite';

import { ComponentDecorator } from '@ui/testing';

import { Text } from '@ui/typography/Text/Text';

const meta: Meta<typeof Text> = {
  title: 'UI/Typography/Text',
  component: Text,
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof Text>;

const LONG_TEXT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore';

export const Truncate: Story = {
  args: {
    truncate: true,
    children: LONG_TEXT,
  },
  parameters: {
    container: { width: 160 },
  },
};

export const LineClamp: Story = {
  args: {
    lineClamp: 2,
    children: LONG_TEXT,
  },
  parameters: {
    container: { width: 160 },
  },
};
