import { Meta, StoryObj } from '@storybook/react';
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

export const Default: Story = {};
