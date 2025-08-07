import { type Meta, type StoryObj } from '@storybook/react';

import { ComponentDecorator } from '@ui/testing/decorators/ComponentDecorator';

import { Checkmark } from '../Checkmark';

const meta: Meta<typeof Checkmark> = {
  title: 'UI/Display/Checkmark',
  component: Checkmark,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof Checkmark>;

export const Default: Story = { args: {} };

export const WithCustomStyles: Story = {
  args: { style: { backgroundColor: 'red', height: 40, width: 40 } },
};
