import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ClickToActionLink } from '@ui/navigation/ClickToActionLink/ClickToActionLink';
import { ComponentDecorator } from '@ui/testing';

const meta: Meta<typeof ClickToActionLink> = {
  title: 'UI/Navigation/ClickToActionLink',
  component: ClickToActionLink,
};

export default meta;
type Story = StoryObj<typeof ClickToActionLink>;

export const Default: Story = {
  // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
  parameters: { a11y: { test: 'todo' } },
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
