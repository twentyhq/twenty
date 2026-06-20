import { type Meta, type StoryObj } from '@storybook/react-vite';

import { Pill } from '@ui/data-display/Pill/Pill';
import { A11Y_DEFER_COLOR_CONTRAST } from '@ui/testing';
import { ComponentDecorator } from '../../../testing/decorators/ComponentDecorator';

const meta: Meta<typeof Pill> = {
  title: 'UI/Data Display/Pill',
  component: Pill,
  decorators: [ComponentDecorator],
  args: {
    label: 'Soon',
  },
};

export default meta;
type Story = StoryObj<typeof Pill>;

export const Default: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
};
