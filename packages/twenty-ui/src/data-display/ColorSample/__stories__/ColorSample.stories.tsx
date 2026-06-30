import { type Meta, type StoryObj } from '@storybook/react-vite';

import { ComponentDecorator } from '@ui/testing';

import { ColorSample } from '@ui/data-display/ColorSample/ColorSample';

const meta: Meta<typeof ColorSample> = {
  title: 'UI/Data Display/ColorSample',
  component: ColorSample,
  decorators: [ComponentDecorator],
  args: { colorName: 'green' },
};

export default meta;
type Story = StoryObj<typeof ColorSample>;

export const Default: Story = {};

export const Pipeline: Story = {
  args: { variant: 'pipeline' },
};

export const Circle: Story = {
  args: { variant: 'circle' },
};
