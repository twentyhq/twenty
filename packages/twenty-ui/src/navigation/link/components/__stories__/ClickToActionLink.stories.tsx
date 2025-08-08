import { type Meta, type StoryObj } from '@storybook/react';
import { ClickToActionLink } from '@ui/navigation/link/components/ClickToActionLink';
import { ComponentDecorator } from '@ui/testing';

const meta: Meta<typeof ClickToActionLink> = {
  title: 'UI/navigation/link/ClickToActionLink',
  component: ClickToActionLink,
};

export default meta;
type Story = StoryObj<typeof ClickToActionLink>;

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
