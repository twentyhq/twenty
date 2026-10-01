import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { NumberInput } from '../NumberInput';
import { ControlledNumberInputExample } from './ControlledNumberInputExample';

const meta: Meta<typeof NumberInput> = {
  title: 'UI/Input/NumberInput/Interactions',
  component: NumberInput,
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    'aria-label': 'Quantity',
    defaultValue: 1,
    min: 0,
    max: 2,
    onValueChange: fn(),
  },
};

export default meta;
type Story = StoryObj<typeof NumberInput>;

export const PointerBounds: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Quantity' });
    const decrease = canvas.getByRole('button', { name: 'Decrease value' });
    const increase = canvas.getByRole('button', { name: 'Increase value' });

    await expect(input.getBoundingClientRect().width).toBe(64);
    await expect(input.getBoundingClientRect().height).toBe(24);
    for (const button of [decrease, increase]) {
      await expect(button.getBoundingClientRect().width).toBe(24);
      await expect(button.getBoundingClientRect().height).toBe(24);
    }

    await userEvent.click(increase);
    await expect(input).toHaveValue('2');
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      2,
      expect.anything(),
    );
    await expect(increase).toBeDisabled();
    await userEvent.click(increase);
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);

    await userEvent.click(decrease);
    await userEvent.click(decrease);
    await expect(input).toHaveValue('0');
    await expect(decrease).toBeDisabled();
    await userEvent.click(decrease);
    await expect(args.onValueChange).toHaveBeenCalledTimes(3);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      0,
      expect.anything(),
    );
  },
};

export const KeyboardBounds: Story = {
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole('textbox', {
      name: 'Quantity',
    });

    await userEvent.click(input);
    await userEvent.keyboard('{ArrowUp}{ArrowUp}');
    await expect(input).toHaveValue('2');
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{Home}{ArrowDown}');
    await expect(input).toHaveValue('0');
    await expect(args.onValueChange).toHaveBeenCalledTimes(2);
    await userEvent.keyboard('{End}{ArrowDown}');
    await expect(input).toHaveValue('1');
    await expect(args.onValueChange).toHaveBeenCalledTimes(4);
    await userEvent.tab();
    await expect(args.onValueChange).toHaveBeenCalledTimes(4);
  },
};

export const ControlledDraft: Story = {
  args: { min: -5, max: 5 },
  render: (args) => <ControlledNumberInputExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole('textbox', {
      name: 'Quantity',
    });

    await userEvent.clear(input);
    await expect(input).toHaveValue('');
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      null,
      expect.anything(),
    );
    await userEvent.type(input, '-');
    await expect(input).toHaveValue('-');
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await userEvent.tab();
    await expect(input).toHaveValue('-');
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await userEvent.type(input, '3');
    await expect(input).toHaveValue('-3');
    await expect(args.onValueChange).toHaveBeenCalledTimes(2);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      -3,
      expect.anything(),
    );
    await userEvent.tab();
    await expect(input).toHaveValue('-3');
    await expect(args.onValueChange).toHaveBeenCalledTimes(2);
  },
};

export const BoundedDraft: Story = {
  render: (args) => <ControlledNumberInputExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole('textbox', {
      name: 'Quantity',
    });

    await userEvent.clear(input);
    await userEvent.type(input, '9');
    await expect(input).toHaveValue('9');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      2,
      expect.anything(),
    );
    await userEvent.tab();
    await expect(input).toHaveValue('2');
    await expect(args.onValueChange).toHaveBeenCalledTimes(2);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      2,
      expect.anything(),
    );
    await userEvent.click(input);
    await userEvent.tab();
    await expect(args.onValueChange).toHaveBeenCalledTimes(2);
  },
};

export const FractionalStep: Story = {
  args: { defaultValue: 0.1, step: 0.1 },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Quantity' });

    await userEvent.click(
      canvas.getByRole('button', { name: 'Increase value' }),
    );
    await expect(input).toHaveValue('0.2');
    await userEvent.click(input);
    await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
    await expect(input).toHaveValue('0.3');
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    await expect(input).toHaveValue('0.2');
    await expect(args.onValueChange).toHaveBeenCalledTimes(3);
    await expect(args.onValueChange).toHaveBeenNthCalledWith(
      2,
      0.3,
      expect.anything(),
    );
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Quantity' });

    await expect(input).toBeDisabled();
    for (const button of canvas.getAllByRole('button')) {
      await expect(button).toBeDisabled();
      await userEvent.click(button);
    }
    await userEvent.type(input, '9');
    await expect(input).toHaveValue('1');
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const ReadOnly: Story = {
  args: { readOnly: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Quantity' });

    await expect(input).toHaveAttribute('readonly');
    await userEvent.click(input);
    await expect(input).toHaveFocus();
    await userEvent.keyboard('9{ArrowUp}{Home}{End}');
    for (const button of canvas.getAllByRole('button')) {
      await expect(button).toHaveAttribute('aria-disabled', 'true');
      await userEvent.click(button);
    }
    await expect(input).toHaveValue('1');
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};
