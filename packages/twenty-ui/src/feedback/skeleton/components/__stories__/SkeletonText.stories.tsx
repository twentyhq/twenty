import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from '@ui/testing/decorators/ComponentDecorator';

import { SkeletonText } from '../SkeletonText';

const meta: Meta<typeof SkeletonText> = {
  title: 'UI/Feedback/Skeleton/SkeletonText',
  component: SkeletonText,
  decorators: [ComponentDecorator],
  argTypes: {
    lines: { control: { type: 'range', min: 1, max: 10, step: 1 } },
    lineHeight: { control: { type: 'number' } },
    lastLineWidth: { control: { type: 'text' } },
  },
};

export default meta;
type Story = StoryObj<typeof SkeletonText>;

export const Default: Story = {
  args: {
    lines: 3,
    lineHeight: 16,
  },
  parameters: {
    container: { width: 300 },
  },
};

export const SingleLine: Story = {
  args: {
    lines: 1,
    lineHeight: 20,
  },
  parameters: {
    container: { width: 200 },
  },
};

export const Paragraph: Story = {
  args: {
    lines: 5,
    lineHeight: 14,
    lastLineWidth: '40%',
  },
  parameters: {
    container: { width: 400 },
  },
};
