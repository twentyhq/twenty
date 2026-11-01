import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, within } from 'storybook/test';

import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { NumberStepper } from '../NumberStepper';
import { type NumberStepperProps } from '../types/NumberStepperProps';
import { ControlledNumberStepperExample } from './ControlledNumberStepperExample';

const meta: Meta<typeof NumberStepper> = {
  title: 'UI/Input/NumberStepper/Interactions',
  component: NumberStepper,
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
type Story = StoryObj<typeof NumberStepper>;

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
  render: (args) => <ControlledNumberStepperExample {...args} />,
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
  render: (args) => <ControlledNumberStepperExample {...args} />,
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
      await expect(getComputedStyle(button).cursor).toBe('default');
      await expect(getComputedStyle(button).opacity).toBe('0.5');
      await userEvent.click(button);
    }
    await expect(input).toHaveValue('1');
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const OutOfRangeDraft: Story = {
  args: { defaultValue: 60, min: 30, max: 90, allowOutOfRange: true },
  render: (args) => <ControlledNumberStepperExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole('textbox', {
      name: 'Quantity',
    });

    await userEvent.tripleClick(input);
    await userEvent.keyboard('6');
    await expect(input).toHaveValue('6');
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      6,
      expect.anything(),
    );
    await userEvent.keyboard('0');
    await expect(input).toHaveValue('60');
    await expect(args.onValueChange).toHaveBeenCalledTimes(2);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      60,
      expect.anything(),
    );
    await userEvent.tab();
    await expect(input).toHaveValue('60');
    await expect(args.onValueChange).toHaveBeenCalledTimes(2);
    await userEvent.click(input);
    await userEvent.tab();
    await expect(args.onValueChange).toHaveBeenCalledTimes(2);
  },
};

export const OutOfRangeStepping: Story = {
  args: { defaultValue: 60, min: 30, max: 90, allowOutOfRange: true },
  render: (args) => <ControlledNumberStepperExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Quantity' });
    const decrease = canvas.getByRole('button', { name: 'Decrease value' });
    const increase = canvas.getByRole('button', { name: 'Increase value' });

    await userEvent.tripleClick(input);
    await userEvent.keyboard('999');
    await expect(input).toHaveValue('999');
    await userEvent.tab();
    await expect(input).toHaveValue('999');
    await expect(args.onValueChange).toHaveBeenCalledTimes(3);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      999,
      expect.anything(),
    );
    await userEvent.click(decrease);
    await expect(input).toHaveValue('90');
    await expect(increase).toBeDisabled();
    await expect(args.onValueChange).toHaveBeenCalledTimes(4);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      90,
      expect.anything(),
    );
    await userEvent.click(input);
    await userEvent.keyboard('{Home}{ArrowDown}');
    await expect(input).toHaveValue('30');
    await expect(decrease).toBeDisabled();
    await expect(args.onValueChange).toHaveBeenCalledTimes(5);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      30,
      expect.anything(),
    );
  },
};

export const OutOfRangeDraftStepping: Story = {
  args: { defaultValue: 60, min: 30, max: 90, allowOutOfRange: true },
  render: (args) => <ControlledNumberStepperExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Quantity' });

    await userEvent.tripleClick(input);
    await userEvent.keyboard('4');
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Increase value' }),
    );
    await expect(input).toHaveValue('30');
    await expect(args.onValueChange).toHaveBeenCalledTimes(2);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      30,
      expect.anything(),
    );
  },
};

export const GroupedInput: Story = {
  args: { defaultValue: 0, max: 20000 },
  render: (args) => <ControlledNumberStepperExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole('textbox', {
      name: 'Quantity',
    });

    await userEvent.tripleClick(input);
    await userEvent.keyboard('12,500');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      12500,
      expect.anything(),
    );
    await userEvent.tab();
    await expect(input).toHaveValue('12,500');
    await userEvent.tripleClick(input);
    await userEvent.paste('1,500');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      1500,
      expect.anything(),
    );
    await userEvent.tab();
    await expect(input).toHaveValue('1500');
  },
};

export const UneditedPrecision: Story = {
  args: {
    defaultValue: 0.1 + 0.2,
    onValueChange: fn<NonNullable<NumberStepperProps['onValueChange']>>(
      (_nextValue, eventDetails) => eventDetails.cancel(),
    ),
    onValueCommitted: fn(),
  },
  render: (args) => <ControlledNumberStepperExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Quantity' });
    const increase = canvas.getByRole('button', { name: 'Increase value' });
    const pointerInteraction = userEvent.setup();

    await expect(input).toHaveValue('0.3');
    await userEvent.click(input);
    await userEvent.tab();
    await expect(input).toHaveValue('0.3');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(args.onValueCommitted).not.toHaveBeenCalled();

    await pointerInteraction.pointer({
      target: increase,
      keys: '[MouseLeft>]',
    });
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      1.3,
      expect.objectContaining({
        reason: 'increment-press',
        isCanceled: true,
        event: expect.objectContaining({ type: 'pointerdown' }),
      }),
    );
    await expect(args.onValueCommitted).not.toHaveBeenCalled();
    await pointerInteraction.pointer({
      target: increase,
      keys: '[/MouseLeft]',
    });
    await expect(input).toHaveValue('0.3');
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(1);
    await expect(args.onValueCommitted).toHaveBeenLastCalledWith(
      0.1 + 0.2,
      expect.objectContaining({
        reason: 'increment-press',
        event: expect.objectContaining({ type: 'pointerup' }),
      }),
    );
    await expect(args.onValueCommitted).not.toHaveBeenCalledWith(
      0.3,
      expect.anything(),
    );
    await userEvent.tab();
    await expect(input).toHaveValue('0.3');
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(1);
  },
};

export const UneditedUncontrolledPrecision: Story = {
  ...UneditedPrecision,
  render: (args) => <NumberStepper {...args} />,
};

export const CanceledChange: Story = {
  args: {
    onValueChange: fn<NonNullable<NumberStepperProps['onValueChange']>>(
      (nextValue, eventDetails) => {
        if (nextValue === 2) {
          eventDetails.cancel();
        }
      },
    ),
    onValueCommitted: fn(),
  },
  render: (args) => <ControlledNumberStepperExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Quantity' });
    const increase = canvas.getByRole('button', { name: 'Increase value' });
    const pointerInteraction = userEvent.setup();

    await pointerInteraction.pointer({
      target: increase,
      keys: '[MouseLeft>]',
    });
    await expect(input).toHaveValue('1');
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      2,
      expect.objectContaining({
        reason: 'increment-press',
        isCanceled: true,
        direction: 1,
        event: expect.objectContaining({ type: 'pointerdown' }),
      }),
    );
    await expect(args.onValueCommitted).not.toHaveBeenCalled();
    await pointerInteraction.pointer({
      target: increase,
      keys: '[/MouseLeft]',
    });
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(1);
    await expect(args.onValueCommitted).toHaveBeenLastCalledWith(
      1,
      expect.objectContaining({
        reason: 'increment-press',
        event: expect.objectContaining({ type: 'pointerup' }),
      }),
    );
    await userEvent.tab();
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(1);
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowUp}');
    await expect(input).toHaveValue('1');
    await expect(args.onValueChange).toHaveBeenCalledTimes(2);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      2,
      expect.objectContaining({
        reason: 'keyboard',
        isCanceled: true,
        event: expect.objectContaining({ type: 'keydown', key: 'ArrowUp' }),
      }),
    );
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(1);
    await userEvent.keyboard('{ArrowDown}');
    await expect(input).toHaveValue('0');
    await expect(args.onValueChange).toHaveBeenCalledTimes(3);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      0,
      expect.objectContaining({
        reason: 'keyboard',
        isCanceled: false,
        event: expect.objectContaining({ type: 'keydown', key: 'ArrowDown' }),
      }),
    );
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(2);
    await expect(args.onValueCommitted).toHaveBeenLastCalledWith(
      0,
      expect.objectContaining({
        reason: 'keyboard',
        event: expect.objectContaining({ type: 'keydown', key: 'ArrowDown' }),
      }),
    );
    await userEvent.tab();
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(2);

    await userEvent.tripleClick(input);
    await userEvent.keyboard('2');
    await expect(input).toHaveValue('2');
    await expect(args.onValueChange).toHaveBeenCalledTimes(4);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      2,
      expect.objectContaining({
        reason: 'input-change',
        isCanceled: true,
        event: expect.objectContaining({ type: 'input' }),
      }),
    );
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(2);
    await userEvent.tab();
    await expect(args.onValueChange).toHaveBeenCalledTimes(5);
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      2,
      expect.objectContaining({
        reason: 'input-blur',
        isCanceled: true,
        event: expect.objectContaining({ type: 'focusout' }),
      }),
    );
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(2);
    await expect(args.onValueCommitted).not.toHaveBeenCalledWith(
      2,
      expect.anything(),
    );
  },
};

export const CanceledUncontrolledChange: Story = {
  ...CanceledChange,
  render: (args) => <NumberStepper {...args} />,
};

export const ValueCommit: Story = {
  args: { onValueCommitted: fn() },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole('textbox', {
      name: 'Quantity',
    });

    await userEvent.clear(input);
    await userEvent.type(input, '2');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      2,
      expect.objectContaining({ reason: 'input-change' }),
    );
    await expect(args.onValueCommitted).not.toHaveBeenCalled();
    await userEvent.tab();
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(1);
    await expect(args.onValueCommitted).toHaveBeenCalledWith(
      2,
      expect.objectContaining({ reason: 'input-blur' }),
    );
  },
};
