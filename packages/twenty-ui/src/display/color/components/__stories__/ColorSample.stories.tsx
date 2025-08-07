import { type Meta, type StoryObj } from '@storybook/react';

import { ComponentDecorator } from '@ui/testing';

import { ColorSample } from '../ColorSample';

const meta: Meta<typeof ColorSample> = {
  title: 'UI/Display/Color/ColorSample',
  component: ColorSample,
  decorators: [ComponentDecorator],
  args: { colorName: 'green' },
  argTypes: {
    as: { control: false },
    theme: { control: false },
  },
};

export default meta;
type Story = StoryObj<typeof ColorSample>;

export const Default: Story = {};

export const Pipeline: Story = {
  args: { variant: 'pipeline' },
};
