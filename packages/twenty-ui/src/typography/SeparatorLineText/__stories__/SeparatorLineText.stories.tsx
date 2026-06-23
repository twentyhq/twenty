import { type Meta, type StoryObj } from '@storybook/react-vite';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { SeparatorLineText } from '@ui/typography/SeparatorLineText/SeparatorLineText';

const meta: Meta<typeof SeparatorLineText> = {
  title: 'UI/Typography/SeparatorLineText',
  component: SeparatorLineText,
  args: { children: 'Or' },
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof SeparatorLineText>;

export const Default: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
};
