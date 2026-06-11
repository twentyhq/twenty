import { type Meta, type StoryObj } from '@storybook/react-vite';

import { ComponentWithRouterDecorator } from '@ui/testing';
import { GithubVersionLink } from '../GithubVersionLink';

const meta: Meta<typeof GithubVersionLink> = {
  title: 'UI/Navigation/Link/GithubVersionLink',
  component: GithubVersionLink,
  decorators: [ComponentWithRouterDecorator],
};

export default meta;
type Story = StoryObj<typeof GithubVersionLink>;

export const Default: Story = {
  // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
  parameters: { a11y: { test: 'todo' } },
};
