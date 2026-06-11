import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from '@ui/testing';

import { SeparatorLineText } from '../SeparatorLineText';

const meta: Meta<typeof SeparatorLineText> = {
  title: 'UI/Display/Text/SeparatorLineText',
  component: SeparatorLineText,
  args: { children: 'Or' },
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof SeparatorLineText>;

export const Default: Story = {
  // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
  parameters: { a11y: { test: 'todo' } },
};
