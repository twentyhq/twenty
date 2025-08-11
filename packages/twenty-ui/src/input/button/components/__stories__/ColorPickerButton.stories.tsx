import { type Meta, type StoryObj } from '@storybook/react';
import { ComponentDecorator } from '@ui/testing';
import { ColorPickerButton } from '../ColorPickerButton';

const meta: Meta<typeof ColorPickerButton> = {
  title: 'UI/Input/Button/ColorPickerButton',
  component: ColorPickerButton,
  decorators: [ComponentDecorator],
  args: { colorName: 'green' },
};

export default meta;
type Story = StoryObj<typeof ColorPickerButton>;

export const Default: Story = {};

export const Selected: Story = { args: { isSelected: true } };
