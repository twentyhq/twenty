import { type Meta, type StoryObj } from '@storybook/react-vite';

import {
  A11Y_DEFER_COLOR_CONTRAST,
  ComponentWithRouterDecorator,
} from '@ui/testing';
import { GithubVersionLink } from '@ui/navigation/GithubVersionLink/GithubVersionLink';

const meta: Meta<typeof GithubVersionLink> = {
  title: 'UI/Navigation/Link/GithubVersionLink',
  component: GithubVersionLink,
  decorators: [ComponentWithRouterDecorator],
};

export default meta;
type Story = StoryObj<typeof GithubVersionLink>;

export const Default: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: { version: '0.1.0' },
};
