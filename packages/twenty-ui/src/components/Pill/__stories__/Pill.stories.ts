import { type Meta, type StoryObj } from '@storybook/react';

import { Pill } from '@ui/components/Pill/Pill';
import { ComponentDecorator } from '../../../testing/decorators/ComponentDecorator';

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
