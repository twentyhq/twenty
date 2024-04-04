import { Meta, StoryObj } from '@storybook/react';

import { ComponentDecorator } from '../../../testing/decorators/ComponentDecorator';
import { Pill } from '../Pill';

const meta: Meta<typeof Pill> = {
  title: 'UI/Display/Pill',
  component: Pill,
  decorators: [ComponentDecorator],
  args: {
    label: 'Soon',
  },
};

export default meta;
type Story = StoryObj<typeof Pill>;

export const Default: Story = {};
