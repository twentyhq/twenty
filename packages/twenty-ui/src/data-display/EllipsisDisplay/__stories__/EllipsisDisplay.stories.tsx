import { type Meta, type StoryObj } from '@storybook/react-vite';

import { ComponentDecorator } from '@ui/testing';

import { EllipsisDisplay } from '@ui/data-display/EllipsisDisplay/EllipsisDisplay';

const meta: Meta<typeof EllipsisDisplay> = {
  title: 'UI/Data Display/EllipsisDisplay',
  component: EllipsisDisplay,
  decorators: [ComponentDecorator],
};

export default meta;

type Story = StoryObj<typeof EllipsisDisplay>;

export const Default: Story = {
  args: {
    children: 'A fairly long text that should be truncated with an ellipsis',
    maxWidth: 200,
  },
};
