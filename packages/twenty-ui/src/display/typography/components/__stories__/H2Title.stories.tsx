import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from 'src/testing/decorators/ComponentDecorator';

import { H2Title } from '../H2Title';

const meta: Meta<typeof H2Title> = {
  title: 'UI/Display/Typography/Title/H2Title',
  component: H2Title,
  decorators: [ComponentDecorator],
  args: {
    title: 'Sub title',
  },
};

export default meta;

type Story = StoryObj<typeof H2Title>;

export const Default: Story = {};

export const WithDescription: Story = {
  args: {
    description: 'Lorem ipsum dolor sit amet',
  },
};
