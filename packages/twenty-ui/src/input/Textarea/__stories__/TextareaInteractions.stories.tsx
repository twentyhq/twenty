import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, fn, userEvent, within } from 'storybook/test';

import { Field } from '@ui/input/Field/Field';
import { A11Y_DEFER_COLOR_CONTRAST, ComponentDecorator } from '@ui/testing';

import { Textarea } from '../Textarea';
import styles from '../Textarea.module.scss';
import { type TextareaProps } from '../types/TextareaProps';

const ControlledTextareaExample = (props: TextareaProps) => {
  const [value, setValue] = useState('a');

  return (
    <>
      <Textarea {...props} value={value} />
      <button type="button" onClick={() => setValue('a\nb\nc')}>
        Apply value
      </button>
    </>
  );
};

const meta: Meta<typeof Textarea> = {
  title: 'UI/Input/Textarea/Interactions',
  component: Textarea,
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: { container: { width: 240 } },
  args: { 'aria-label': 'Notes', onValueChange: fn() },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Uncontrolled: Story = {
  args: { defaultValue: 'a' },
  play: async ({ canvasElement, args }) => {
    const textarea = within(canvasElement).getByRole('textbox', {
      name: 'Notes',
    });

    await userEvent.type(textarea, 'b');

    await expect(textarea).toHaveValue('ab');
    await expect(args.onValueChange).toHaveBeenCalledWith(
      'ab',
      expect.objectContaining({ reason: 'none' }),
    );
  },
};

export const Controlled: Story = {
  args: { autoResize: true, rows: 1 },
  render: (args) => <ControlledTextareaExample {...args} />,
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', { name: 'Notes' });
    const initialHeight = textarea.clientHeight;

    await userEvent.type(textarea, '{enter}b{enter}c');

    await expect(args.onValueChange).toHaveBeenCalledWith(
      'a\n',
      expect.anything(),
    );
    await expect(textarea).toHaveValue('a');
    await expect(textarea.clientHeight).toBe(initialHeight);

    await userEvent.click(canvas.getByRole('button', { name: 'Apply value' }));

    await expect(textarea).toHaveValue('a\nb\nc');
    await expect(textarea.clientHeight).toBeGreaterThan(initialHeight);
  },
};

export const RowsAndSize: Story = {
  args: { rows: 5, size: 'sm' },
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByRole('textbox', {
      name: 'Notes',
    });

    await expect(textarea).toHaveAttribute('rows', '5');
    await expect(textarea).toHaveClass(styles.sm);
  },
};

export const WithField: Story = {
  parameters: { a11y: A11Y_DEFER_COLOR_CONTRAST },
  render: () => (
    <Field.Root invalid>
      <Field.Label>Notes</Field.Label>
      <Textarea
        className={(state) => (state.valid === false ? 'invalid' : 'valid')}
      />
    </Field.Root>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', { name: 'Notes' });

    await userEvent.click(canvas.getByText('Notes'));

    await expect(textarea).toHaveFocus();
    await expect(textarea).toHaveAttribute('aria-invalid', 'true');
    await expect(textarea).toHaveAttribute('data-invalid');
    await expect(textarea).toHaveClass(styles.textarea, 'invalid');
    await expect(textarea).not.toHaveClass('valid');
  },
};
