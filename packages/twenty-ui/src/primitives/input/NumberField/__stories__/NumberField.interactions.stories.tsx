import { type Meta, type StoryObj } from '@storybook/react-vite';
import { expect, fireEvent, fn, userEvent, within } from 'storybook/test';

import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { NumberField } from '../NumberField';
import { type NumberFieldRootProps } from '../types/NumberFieldRootProps';
import { ControlledNumberFieldInteractionExample } from './ControlledNumberFieldInteractionExample';
import { NumberFieldFormInteractionExample } from './NumberFieldFormInteractionExample';
import { NumberFieldInteractionExample } from './NumberFieldInteractionExample';
import { NumberFieldScrubInteractionExample } from './NumberFieldScrubInteractionExample';

const meta: Meta<typeof NumberField.Root> = {
  title: 'UI/Input/NumberField/Interactions',
  component: NumberField.Root,
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  args: {
    defaultValue: 1,
    locale: 'en-US',
    onValueChange: fn(),
    onValueCommitted: fn(),
  },
  render: (args) => <NumberFieldInteractionExample {...args} />,
};

export default meta;
type Story = StoryObj<typeof NumberField.Root>;

export const LocaleFormatting: Story = {
  args: {
    defaultValue: 1234.5,
    locale: 'de-DE',
    format: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Quantity' });

    await expect(input).toHaveValue('1.234,50');
    await userEvent.clear(input);
    await userEvent.type(input, '12,75');
    await expect(input).toHaveValue('12,75');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      12.75,
      expect.objectContaining({
        reason: 'input-change',
        event: expect.objectContaining({ type: 'input' }),
      }),
    );
    await expect(args.onValueCommitted).not.toHaveBeenCalled();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Finish editing' }),
    );
    await expect(input).toHaveValue('12,75');
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(1);
    await expect(args.onValueCommitted).toHaveBeenCalledWith(
      12.75,
      expect.objectContaining({ reason: 'input-blur' }),
    );
  },
};

export const ControlledEmptyValue: Story = {
  args: { defaultValue: undefined },
  render: (args) => <ControlledNumberFieldInteractionExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Quantity' });
    const finishEditing = canvas.getByRole('button', {
      name: 'Finish editing',
    });

    await expect(input).toHaveValue('');
    await userEvent.click(input);
    await userEvent.click(finishEditing);
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(args.onValueCommitted).not.toHaveBeenCalled();
    await userEvent.type(input, '3');
    await userEvent.clear(input);
    await expect(input).toHaveValue('');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      null,
      expect.objectContaining({ reason: 'input-clear' }),
    );
    await expect(args.onValueCommitted).not.toHaveBeenCalled();
    await userEvent.click(finishEditing);
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(1);
    await expect(args.onValueCommitted).toHaveBeenCalledWith(
      null,
      expect.objectContaining({ reason: 'input-clear' }),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Increase value' }),
    );
    await expect(input).toHaveValue('0');
    await expect(args.onValueCommitted).toHaveBeenLastCalledWith(
      0,
      expect.objectContaining({ reason: 'increment-press' }),
    );
  },
};

export const CanceledControlledChange: Story = {
  args: {
    onValueChange: fn<NonNullable<NumberFieldRootProps['onValueChange']>>(
      (value, details) => {
        if (value === 2) {
          details.cancel();
        }
      },
    ),
  },
  render: (args) => <ControlledNumberFieldInteractionExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole('textbox', {
      name: 'Quantity',
    });

    await userEvent.click(input);
    await userEvent.keyboard('{ArrowUp}');
    await expect(input).toHaveValue('1');
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await expect(args.onValueChange).toHaveBeenCalledWith(
      2,
      expect.objectContaining({ reason: 'keyboard', isCanceled: true }),
    );
    await expect(args.onValueCommitted).not.toHaveBeenCalled();
    await userEvent.keyboard('{ArrowDown}');
    await expect(input).toHaveValue('0');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      0,
      expect.objectContaining({ reason: 'keyboard', direction: -1 }),
    );
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(1);
    await expect(args.onValueCommitted).toHaveBeenCalledWith(
      0,
      expect.objectContaining({ reason: 'keyboard' }),
    );
  },
};

export const ModifierStepsAndBounds: Story = {
  args: {
    defaultValue: 1.25,
    step: 'any',
    smallStep: 0.25,
    largeStep: 5,
    min: 0,
    max: 20,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Quantity' });

    await userEvent.click(input);
    await userEvent.keyboard('{ArrowUp}');
    await expect(input).toHaveValue('2.25');
    await userEvent.keyboard('{Shift>}{ArrowUp}{/Shift}');
    await expect(input).toHaveValue('7.25');
    await userEvent.keyboard('{Alt>}{ArrowDown}{/Alt}');
    await expect(input).toHaveValue('7');
    await userEvent.keyboard('{End}{ArrowUp}');
    await expect(input).toHaveValue('20');
    await expect(
      canvas.getByRole('button', { name: 'Increase value' }),
    ).toBeDisabled();
    await userEvent.keyboard('{Home}{ArrowDown}');
    await expect(input).toHaveValue('0');
    await expect(
      canvas.getByRole('button', { name: 'Decrease value' }),
    ).toBeDisabled();
    await expect(args.onValueChange).toHaveBeenCalledTimes(5);
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(5);
    await expect(args.onValueChange).toHaveBeenNthCalledWith(
      3,
      7,
      expect.objectContaining({ reason: 'keyboard', direction: -1 }),
    );
  },
};

export const SnapOnStep: Story = {
  args: { defaultValue: 1.1, step: 0.5, snapOnStep: true },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Quantity' });

    await userEvent.click(
      canvas.getByRole('button', { name: 'Increase value' }),
    );
    await expect(input).toHaveValue('1.5');
    await userEvent.click(input);
    await userEvent.keyboard('{ArrowDown}');
    await expect(input).toHaveValue('1');
    await expect(args.onValueCommitted).toHaveBeenNthCalledWith(
      1,
      1.5,
      expect.objectContaining({ reason: 'increment-press' }),
    );
    await expect(args.onValueCommitted).toHaveBeenLastCalledWith(
      1,
      expect.objectContaining({ reason: 'keyboard' }),
    );
  },
};

export const DisabledAndReadOnly: Story = {
  render: (args) => (
    <>
      <NumberFieldInteractionExample
        {...args}
        label="Disabled quantity"
        disabled
      />
      <NumberFieldInteractionExample
        {...args}
        label="Read only quantity"
        readOnly
      />
    </>
  ),
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const disabledInput = canvas.getByRole('textbox', {
      name: 'Disabled quantity',
    });
    const readOnlyInput = canvas.getByRole('textbox', {
      name: 'Read only quantity',
    });

    await expect(disabledInput).toBeDisabled();
    await expect(readOnlyInput).toHaveAttribute('readonly');
    await userEvent.type(disabledInput, '9');
    await userEvent.click(readOnlyInput);
    await expect(readOnlyInput).toHaveFocus();
    await userEvent.keyboard('9{ArrowUp}{Home}{End}');
    for (const button of canvas.getAllByRole('button', { name: /value/ })) {
      await userEvent.click(button);
    }
    await expect(disabledInput).toHaveValue('1');
    await expect(readOnlyInput).toHaveValue('1');
    await expect(args.onValueChange).not.toHaveBeenCalled();
    await expect(args.onValueCommitted).not.toHaveBeenCalled();
  },
};

export const NativeFormRefsAndComposition: Story = {
  args: {
    defaultValue: undefined,
    locale: 'de-DE',
    step: 'any',
    min: 0,
    required: true,
  },
  render: (args) => <NumberFieldFormInteractionExample {...args} />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Quantity' });
    const form = canvas.getByRole<HTMLFormElement>('form', {
      name: 'Quantity form',
    });

    await expect(input).toBeRequired();
    await expect(input).toHaveAccessibleDescription(
      'Enter the amount to save.',
    );
    await expect(form.checkValidity()).toBe(false);
    await userEvent.click(canvas.getByText('Quantity', { selector: 'label' }));
    await expect(input).toHaveFocus();
    await userEvent.type(input, '12,5');
    await expect(form.checkValidity()).toBe(true);
    await expect(input).toHaveAttribute('data-quantity', '12.5');
    await expect(
      canvas.getByRole('group', { name: 'Quantity controls' }).parentElement,
    ).toHaveAttribute('data-quantity', '12.5');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Save quantity' }),
    );
    await expect(canvas.getByLabelText('Saved quantity')).toHaveTextContent(
      '12.5',
    );
    await expect([...new FormData(form).entries()]).toEqual([
      ['quantity', '12.5'],
    ]);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Inspect refs and focus' }),
    );
    await expect(canvas.getByLabelText('Ref targets')).toHaveTextContent(
      'DIV/text/number/true',
    );
    await expect(input).toHaveFocus();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Increase value' }),
    );
    await expect(input).toHaveValue('13,5');
    await expect(
      canvas.getByRole('group', { name: 'Quantity controls' }).tagName,
    ).toBe('SECTION');
  },
};

export const Scrubbing: Story = {
  args: { defaultValue: 10, min: 0, max: 20 },
  render: (args) => <NumberFieldScrubInteractionExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const scrubArea = canvas.getByLabelText('Scrub quantity');
    const input = canvas.getByRole('textbox', { name: 'Quantity' });

    await fireEvent.pointerDown(scrubArea, {
      pointerType: 'touch',
      pointerId: 1,
      button: 0,
    });
    await expect(scrubArea).toHaveAttribute('data-scrubbing', 'true');
    await expect(
      within(document.body).queryByLabelText('Quantity scrub cursor'),
    ).not.toBeInTheDocument();
    await fireEvent.pointerMove(scrubArea, {
      pointerType: 'touch',
      pointerId: 1,
      movementX: 4,
    });
    await expect(input).toHaveValue('14');
    await expect(args.onValueChange).toHaveBeenLastCalledWith(
      14,
      expect.objectContaining({ reason: 'scrub', direction: 1 }),
    );
    await expect(args.onValueCommitted).not.toHaveBeenCalled();
    await fireEvent.pointerMove(scrubArea, {
      pointerType: 'touch',
      pointerId: 1,
      movementX: 30,
    });
    await expect(input).toHaveValue('20');
    await fireEvent.pointerUp(scrubArea, {
      pointerType: 'touch',
      pointerId: 1,
    });
    await expect(scrubArea).toHaveAttribute('data-scrubbing', 'false');
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(1);
    await expect(args.onValueCommitted).toHaveBeenCalledWith(
      20,
      expect.objectContaining({
        reason: 'scrub',
        event: expect.objectContaining({ type: 'pointerup' }),
      }),
    );
    await fireEvent.pointerUp(scrubArea, {
      pointerType: 'touch',
      pointerId: 1,
    });
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(1);
  },
};

export const WheelScrubbing: Story = {
  args: { defaultValue: 10, allowWheelScrub: true, smallStep: 0.25 },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole('textbox', {
      name: 'Quantity',
    });

    await userEvent.click(input);
    await userEvent.hover(input);
    await fireEvent.wheel(input, { deltaY: -1, altKey: true });
    await expect(input).toHaveValue('10.25');
    await expect(args.onValueChange).toHaveBeenCalledTimes(1);
    await expect(args.onValueChange).toHaveBeenCalledWith(
      10.25,
      expect.objectContaining({ reason: 'wheel', direction: 1 }),
    );
    await expect(args.onValueCommitted).toHaveBeenCalledTimes(1);
    await expect(args.onValueCommitted).toHaveBeenCalledWith(
      10.25,
      expect.objectContaining({ reason: 'wheel' }),
    );
  },
};
