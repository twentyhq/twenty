import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from 'src/testing/decorators/ComponentDecorator';
import { RouterDecorator } from 'src/testing/decorators/RouterDecorator';

import { Breadcrumb } from '../Breadcrumb';

const meta: Meta<typeof Breadcrumb> = {
  title: 'UI/Navigation/Breadcrumb/Breadcrumb',
  component: Breadcrumb,
  decorators: [ComponentDecorator, RouterDecorator],
  args: {
    links: [
      { children: 'Objects', href: '/link-1' },
      { children: 'Companies', href: '/link-2' },
      { children: 'New' },
    ],
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

export const Default: Story = {};
