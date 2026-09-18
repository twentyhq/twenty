import { expect, userEvent, waitFor, within } from 'storybook/test';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { ColorPickerButton } from '@ui/components/ColorPickerButton/ColorPickerButton';
import { ComponentDecorator } from '@ui/testing';

const meta: Meta<typeof ColorPickerButton> = {
  title: 'UI/Input/Button/ColorPickerButton',
  component: ColorPickerButton,
  decorators: [ComponentDecorator],
  args: { colorName: 'green' },
};

export default meta;
type Story = StoryObj<typeof ColorPickerButton>;

export const Default: Story = {};

export const Selected: Story = {
  args: { isSelected: true },
  play: async ({ canvasElement }) => {
    const button = within(canvasElement).getByRole('button', {
      name: 'Select green color',
    });
    const background = getComputedStyle(button).backgroundColor;
    await expect(button.getBoundingClientRect().width).toBe(32);
    await expect(background).not.toBe('rgba(0, 0, 0, 0)');
    await userEvent.hover(button);
    await waitFor(() => {
      expect(button.getAnimations()).toHaveLength(0);
      expect(getComputedStyle(button).backgroundColor).toBe(background);
    });
  },
};
