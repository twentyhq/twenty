import { Meta, StoryObj } from '@storybook/react';
import { ActionLink } from '@ui/navigation/link/components/ActionLink';
import { ComponentDecorator } from '@ui/testing';

const meta: Meta<typeof ActionLink> = {
  title: 'UI/navigation/link/ActionLink',
  component: ActionLink,
};

export default meta;
type Story = StoryObj<typeof ActionLink>;

export const Default: Story = {
  args: {
    children: 'Need to reset your password?',
    onClick: () => alert('Action link clicked'),
    target: undefined,
    rel: undefined,
  },
  argTypes: {
    href: { control: false },
    target: { type: 'string' },
    rel: { type: 'string' },
  },
  decorators: [ComponentDecorator],
};
