import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Field } from '@ui/input/Field/Field';
import { ComponentDecorator } from '@ui/testing';

import { Input } from '../Input';
import styles from '../Input.module.scss';
import { type InputProps } from '../types/InputProps';

const ControlledInputExample = (props: InputProps) => {
  const [value, setValue] = useState('a');

  return (
    <>
      <Input {...props} value={value} />
      <button type="button" onClick={() => setValue('ab')}>
        Apply value
      </button>
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
      <button type="button" onClick={() => setDisabled(true)}>
        Disable input
      </button>
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
