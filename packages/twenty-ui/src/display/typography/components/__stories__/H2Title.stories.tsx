import { type Meta, type StoryObj } from '@storybook/react';

import { ComponentDecorator } from '@ui/testing/decorators/ComponentDecorator';

import { H2Title } from '../H2Title';

const args = {
  title: 'Sub title',
  description: 'Lorem ipsum dolor sit amet',
};

const meta: Meta<typeof H2Title> = {
  title: 'UI/Display/Typography/Title/H2Title',
  component: H2Title,
  decorators: [ComponentDecorator],
  args: {
    title: args.title,
  },
};

export default meta;

type Story = StoryObj<typeof H2Title>;

export const Default: Story = {
  decorators: [ComponentDecorator],
};

export const WithDescription: Story = {
  args,
  decorators: [ComponentDecorator],
};
