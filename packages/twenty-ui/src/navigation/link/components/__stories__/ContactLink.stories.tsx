import { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';

import { ComponentDecorator } from 'src/testing/decorators/ComponentDecorator';
import { RouterDecorator } from 'src/testing/decorators/RouterDecorator';

import { ContactLink } from '../ContactLink';

const meta: Meta<typeof ContactLink> = {
  title: 'UI/Navigation/Link/ContactLink',
  component: ContactLink,
  decorators: [ComponentDecorator, RouterDecorator],
  args: {
    className: 'ContactLink',
    href: '/test',
    children: 'Contact Link',
  },
};

export default meta;
type Story = StoryObj<typeof ContactLink>;
const clickJestFn = fn();

export const Email: Story = {
  args: {
    href: `mailto:${'email@example.com'}`,
    children: 'email@example.com',
    onClick: clickJestFn,
  },
};

export const Phone: Story = {
  args: {
    children: '11111111111',
    onClick: clickJestFn,
  },
};
