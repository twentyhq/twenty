import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from '@ui/testing';

import { HorizontalSeparator } from '@ui/layout/HorizontalSeparator/HorizontalSeparator';

const meta: Meta<typeof HorizontalSeparator> = {
  title: 'UI/Layout/HorizontalSeparator',
  component: HorizontalSeparator,
  decorators: [ComponentDecorator],
};

export default meta;
type Story = StoryObj<typeof HorizontalSeparator>;

export const Default: Story = {};
