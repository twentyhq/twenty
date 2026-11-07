import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { Field } from '@ui/primitives/input/Field/Field';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { Input } from '../Input';
import styles from '../Input.module.scss';
import { type InputProps } from '../types/InputProps';

const ControlledInputExample = (props: InputProps) => {
  const [value, setValue] = useState('a');

  return (
    <>
      <Input {...props} value={value} />
      <Button type="button" onClick={() => setValue('ab')}>
        Apply value
      </Button>
    </>
  );
};

const FieldInputExample = (props: InputProps) => {
  const [disabled, setDisabled] = useState(false);

  return (
    <>
      <Field.Root invalid disabled={disabled}>
        <Input {...props} />
      </Field.Root>
      <Button type="button" onClick={() => setDisabled(true)}>
        Disable input
      </Button>
    </>
  );
};

const meta: Meta<typeof Input> = {
  title: 'UI/Input/Input/Interactions',
  component: Input,
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  args: { 'aria-label': 'Name', onValueChange: fn() },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Uncontrolled: Story = {
  args: { defaultValue: 'a' },
  play: async ({ canvasElement, args }) => {
    const input = within(canvasElement).getByRole('textbox', { name: 'Name' });

    await userEvent.type(input, 'b');

    await expect(input).toHaveValue('ab');
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'ab',
      expect.objectContaining({ reason: 'none' }),
    );
  },
};

export const Controlled: Story = {
  render: (args) => <ControlledInputExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Name' });

    await userEvent.type(input, 'b');

    await expect(args.onValueChange).toHaveBeenCalledWith(
      'ab',
      expect.anything(),
    );
    await expect(input).toHaveValue('a');

    await userEvent.click(canvas.getByRole('button', { name: 'Apply value' }));

    await expect(input).toHaveValue('ab');
  },
};

export const Sizes: Story = {
  render: () => (
    <>
      <Input aria-label="Default size" />
      <Input aria-label="Small size" size="sm" />
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const defaultInput = canvas.getByRole('textbox', { name: 'Default size' });
    const smallInput = canvas.getByRole('textbox', { name: 'Small size' });

    await expect(defaultInput).toHaveClass(styles.md);
    await expect(smallInput).toHaveClass(styles.sm);
    await expect(smallInput).not.toHaveClass(styles.md);
    await expect(defaultInput.clientHeight).toBeGreaterThan(
      smallInput.clientHeight,
    );
  },
};

export const FieldStates: Story = {
  render: (args) => <FieldInputExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const input = canvas.getByRole('textbox', { name: 'Name' });

    await expect(input).toHaveAttribute('aria-invalid', 'true');
    await expect(input).toHaveAttribute('data-invalid');
    await expect(input).toBeEnabled();

    await userEvent.click(
      canvas.getByRole('button', { name: 'Disable input' }),
    );

    await expect(input).not.toHaveAttribute('aria-invalid');
    await expect(input).toHaveAttribute('data-invalid');
    await expect(input).toBeDisabled();

    await userEvent.type(input, 'ignored');

    await expect(input).toHaveValue('');
    await expect(args.onValueChange).not.toHaveBeenCalled();
  },
};

export const PlainAppearance: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  render: () => (
    <div>
      <Input variant="plain" aria-label="Plain name" placeholder="Name" />
      <Field.Root invalid>
        <Input variant="plain" aria-label="Invalid name" />
        <Field.Error match>Choose another name</Field.Error>
      </Field.Root>
      <Input variant="plain" aria-label="Disabled name" disabled />
      <Input variant="plain" hasFocusRing={false} aria-label="Header search" />
      <Input aria-label="Framed name" />
    </div>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const plainInput = canvas.getByRole('textbox', { name: 'Plain name' });
    const invalidInput = canvas.getByRole('textbox', { name: 'Invalid name' });
    const disabledInput = canvas.getByRole('textbox', {
      name: 'Disabled name',
    });
    const framedInput = canvas.getByRole('textbox', { name: 'Framed name' });
    const headerInput = canvas.getByRole('textbox', { name: 'Header search' });

    await expect(plainInput).toHaveAttribute('data-variant', 'plain');
    await expect(getComputedStyle(plainInput).borderWidth).toBe('0px');
    await expect(getComputedStyle(plainInput).padding).toBe('0px');
    await expect(getComputedStyle(plainInput).borderRadius).toBe('0px');
    await expect(plainInput.clientHeight).toBeLessThan(
      framedInput.clientHeight,
    );

    await userEvent.tab();
    await expect(plainInput).toHaveFocus();
    await expect(getComputedStyle(plainInput).outlineWidth).toBe('2px');
    await expect(getComputedStyle(plainInput).outlineStyle).toBe('solid');
    const plainFocusOutlineColor = getComputedStyle(plainInput).outlineColor;
    await userEvent.type(plainInput, 'Alice');
    await expect(plainInput).toHaveValue('Alice');

    await expect(invalidInput).toHaveAttribute('aria-invalid', 'true');
    await expect(invalidInput).toHaveAccessibleDescription(
      'Choose another name',
    );
    await expect(getComputedStyle(invalidInput).outlineWidth).toBe('2px');
    await expect(getComputedStyle(invalidInput).outlineColor).not.toBe(
      getComputedStyle(plainInput).outlineColor,
    );
    await expect(disabledInput).toBeDisabled();
    await expect(getComputedStyle(disabledInput).cursor).toBe('not-allowed');

    await userEvent.tab();
    await expect(invalidInput).toHaveFocus();
    await expect(getComputedStyle(invalidInput).outlineColor).not.toBe(
      plainFocusOutlineColor,
    );
    await userEvent.tab();
    await expect(headerInput).toHaveFocus();
    await expect(getComputedStyle(headerInput).outlineStyle).toBe('none');
    await userEvent.type(headerInput, 'Chat');
    await expect(headerInput).toHaveValue('Chat');
  },
};
