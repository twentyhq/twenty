import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from 'src/testing/decorators/ComponentDecorator';
import { RouterDecorator } from 'src/testing/decorators/RouterDecorator';

import { GithubVersionLink } from '../GithubVersionLink';

const meta: Meta<typeof GithubVersionLink> = {
  title: 'UI/Navigation/Link/GithubVersionLink',
  component: GithubVersionLink,
  decorators: [ComponentDecorator, RouterDecorator],
};

export default meta;
type Story = StoryObj<typeof GithubVersionLink>;

export const Default: Story = {};
