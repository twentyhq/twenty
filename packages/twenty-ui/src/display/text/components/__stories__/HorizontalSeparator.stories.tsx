import { type Meta, type StoryObj } from '@storybook/react';
import { ComponentDecorator } from '@ui/testing';

import { HorizontalSeparator } from '../HorizontalSeparator';

const meta: Meta<typeof HorizontalSeparator> = {
  title: 'UI/Display/Text/HorizontalSeparator',
  component: HorizontalSeparator,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof HorizontalSeparator>;

export const Default: Story = {};
