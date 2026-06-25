import { type Meta, type StoryObj } from '@storybook/react-vite';

import { ComponentDecorator } from '@ui/testing';

import { NumberDisplay } from '@ui/data-display/NumberDisplay/NumberDisplay';

const meta: Meta<typeof NumberDisplay> = {
  title: 'UI/Data Display/NumberDisplay',
  component: NumberDisplay,
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof NumberDisplay>;

export const Default: Story = {
  args: {
    value: 42,
  },
};
