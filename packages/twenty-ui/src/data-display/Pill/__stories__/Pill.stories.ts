import { type Meta, type StoryObj } from '@storybook/react-vite';

import { Pill } from '@ui/data-display/Pill/Pill';
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
  // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
  parameters: { a11y: { test: 'todo' } },
};
