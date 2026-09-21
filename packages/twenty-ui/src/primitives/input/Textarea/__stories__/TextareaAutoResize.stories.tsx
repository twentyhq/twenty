import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { ComponentDecorator } from '@ui/testing';

import { Textarea } from '../Textarea';
import { type TextareaProps } from '../types/TextareaProps';

const TextareaResizeExample = ({ style, ...props }: TextareaProps) => {
  const [autoResize, setAutoResize] = useState(true);
  const [rows, setRows] = useState(1);
  const [blockSize, setBlockSize] = useState(style?.blockSize);

  return (
    <>
      <Textarea
        {...props}
        rows={rows}
        autoResize={autoResize}
        style={{ ...style, blockSize }}
      />
      <button type="button" onClick={() => setRows(3)}>
        Show three rows
      </button>
      <button type="button" onClick={() => setAutoResize(false)}>
        Disable auto resize
      </button>
      <button
        type="button"
        onClick={() => {
          setAutoResize(false);
          setBlockSize(120);
        }}
      >
        Set fixed height
      </button>
    </>
  );
};

const meta: Meta<typeof Textarea> = {
  title: 'UI/Input/Textarea/Auto resize',
  component: Textarea,
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: { container: { width: 240 } },
  args: { 'aria-label': 'Notes' },
  render: (args) => <TextareaResizeExample {...args} />,
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const RowsChange: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', { name: 'Notes' });
    const initialHeight = textarea.clientHeight;

    await expect(textarea).toHaveAttribute('data-auto-resize');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Show three rows' }),
    );

    await expect(textarea.clientHeight).toBeGreaterThan(initialHeight);
  },
};

export const DisableAutoResize: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', { name: 'Notes' });

    await expect(textarea.style.blockSize).not.toBe('');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Disable auto resize' }),
    );

    await expect(textarea.style.blockSize).toBe('');
    await expect(textarea).not.toHaveAttribute('data-auto-resize');
  },
};

export const RestoreConsumerHeight: Story = {
  args: { style: { blockSize: 80 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', { name: 'Notes' });

    await expect(textarea.style.blockSize).not.toBe('80px');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Disable auto resize' }),
    );

    await expect(textarea.style.blockSize).toBe('80px');
  },
};

export const ReplaceConsumerHeight: Story = {
  args: { style: { blockSize: 80 } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', { name: 'Notes' });

    await userEvent.click(
      canvas.getByRole('button', { name: 'Set fixed height' }),
    );

    await expect(textarea.style.blockSize).toBe('120px');
  },
};
