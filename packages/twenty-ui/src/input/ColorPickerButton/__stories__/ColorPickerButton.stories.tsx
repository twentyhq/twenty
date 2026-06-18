import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ComponentDecorator } from '@ui/testing';
import { ColorPickerButton } from '@ui/input/ColorPickerButton/ColorPickerButton';

const meta: Meta<typeof ColorPickerButton> = {
  title: 'UI/Input/Button/ColorPickerButton',
  component: ColorPickerButton,
  decorators: [ComponentDecorator],
  args: { colorName: 'green' },
};

export default meta;
type Story = StoryObj<typeof ColorPickerButton>;

export const Default: Story = {
  // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
  parameters: { a11y: { test: 'todo' } },
};

export const Selected: Story = {
  // TODO(a11y): violations inherited from deprecated story; fix during a11y pass
  parameters: { a11y: { test: 'todo' } },
  args: { isSelected: true },
};
