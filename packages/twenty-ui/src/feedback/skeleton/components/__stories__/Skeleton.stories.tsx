import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from '@ui/testing/decorators/ComponentDecorator';

import { Skeleton } from '../Skeleton';

const meta: Meta<typeof Skeleton> = {
  title: 'UI/Feedback/Skeleton/Skeleton',
  component: Skeleton,
  decorators: [ComponentDecorator],
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['rectangular', 'circular', 'text'],
    },
    width: { control: { type: 'text' } },
    height: { control: { type: 'text' } },
    borderRadius: { control: { type: 'text' } },
  },
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Rectangular: Story = {
  args: {
    variant: 'rectangular',
    width: 200,
    height: 40,
  },
};

export const Circular: Story = {
  args: {
    variant: 'circular',
    width: 40,
    height: 40,
  },
};

export const Text: Story = {
  args: {
    variant: 'text',
    width: 200,
  },
};

export const FullWidth: Story = {
  args: {
    variant: 'rectangular',
    height: 24,
  },
};

export const CustomBorderRadius: Story = {
  args: {
    variant: 'rectangular',
    width: 200,
    height: 40,
    borderRadius: 20,
  },
};
