import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from 'src/testing/decorators/ComponentDecorator';

import { ActionBar } from '../ActionBar';

const meta: Meta<typeof ActionBar> = {
  title: 'UI/Navigation/ActionBar/ActionBar',
  component: ActionBar,
  decorators: [ComponentDecorator],
  args: { selectedIds: ['TestId'] },
};

export default meta;
type Story = StoryObj<typeof ActionBar>;

export const Default: Story = {};
