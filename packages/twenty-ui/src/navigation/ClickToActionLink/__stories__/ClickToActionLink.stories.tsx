import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ClickToActionLink } from '@ui/navigation/ClickToActionLink/ClickToActionLink';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

const meta: Meta<typeof ClickToActionLink> = {
  title: 'UI/Navigation/ClickToActionLink',
  component: ClickToActionLink,
};

export default meta;
type Story = StoryObj<typeof ClickToActionLink>;

export const Default: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
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
