import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { type InputSize } from '@ui/primitives/input/types/InputSize';
import { ComponentDecorator } from '@ui/testing';

import { Textarea } from '../Textarea';
import { type TextareaProps } from '../types/TextareaProps';

const TextareaResizeExample = ({ style, ...props }: TextareaProps) => {
  const [autoResize, setAutoResize] = useState(true);
  const [rows, setRows] = useState(1);
  const [maxRows, setMaxRows] = useState(props.maxRows);
  const [size, setSize] = useState<InputSize>('md');
  const [width, setWidth] = useState(240);
  const [blockSize, setBlockSize] = useState(style?.blockSize);

  return (
    <form>
      <Textarea
        {...props}
        rows={rows}
        maxRows={maxRows}
        size={size}
        autoResize={autoResize}
        style={{ ...style, blockSize, width }}
      />
      <Button type="button" onClick={() => setMaxRows(2)}>
        Limit rows
      </Button>
      <Button type="button" onClick={() => setMaxRows(6)}>
        Expand row limit
      </Button>
      <Button type="reset">Reset notes</Button>
      <Button type="button" onClick={() => setSize('sm')}>
        Use small size
      </Button>
      <Button type="button" onClick={() => setWidth(120)}>
        Narrow notes
      </Button>
      <Button type="button" onClick={() => setRows(3)}>
        Show three rows
      </Button>
      <Button type="button" onClick={() => setAutoResize(false)}>
        Disable auto resize
      </Button>
      <Button
        type="button"
        onClick={() => {
          setAutoResize(false);
          setBlockSize(120);
        }}
      >
        Set fixed height
      </Button>
    </form>
  );
};

const ReplaceableTextareaResizeExample = () => {
  const [controlKey, setControlKey] = useState(0);
  const [width, setWidth] = useState(240);

  return (
    <form>
      <Textarea
        aria-label="Notes"
        autoResize
        rows={1}
        defaultValue="One line of notes that wraps at a narrower width."
        style={{ width }}
        render={(props) => <textarea key={controlKey} {...props} />}
      />
      <Button
        type="button"
        onClick={() => setControlKey((previousKey) => previousKey + 1)}
      >
        Replace notes control
      </Button>
      <Button type="button" onClick={() => setWidth(120)}>
        Narrow notes
      </Button>
      <Button type="reset">Reset notes</Button>
    </form>
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

export const SizeChange: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', { name: 'Notes' });
    const initialHeight = textarea.clientHeight;
    await userEvent.click(
      canvas.getByRole('button', { name: 'Use small size' }),
    );
    await expect(textarea.clientHeight).toBeLessThan(initialHeight);
  },
};

export const WidthChange: Story = {
  args: { defaultValue: 'One line of notes that wraps at a narrower width.' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', { name: 'Notes' });
    const initialHeight = textarea.clientHeight;
    await userEvent.click(canvas.getByRole('button', { name: 'Narrow notes' }));
    await waitFor(() =>
      expect(textarea.clientHeight).toBeGreaterThan(initialHeight),
    );
  },
};

export const FormReset: Story = {
  args: { defaultValue: 'Initial' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', { name: 'Notes' });
    const initialHeight = textarea.clientHeight;
    await userEvent.type(textarea, '{enter}Second{enter}Third');
    await expect(textarea.clientHeight).toBeGreaterThan(initialHeight);
    await userEvent.click(canvas.getByRole('button', { name: 'Reset notes' }));
    await expect(textarea).toHaveValue('Initial');
    await expect(textarea.clientHeight).toBe(initialHeight);
  },
};

export const MaximumRows: Story = {
  args: { maxRows: 4 },
  play: async ({ canvasElement }) => {
    const textarea = within(canvasElement).getByRole('textbox', {
      name: 'Notes',
    });
    await userEvent.type(
      textarea,
      'one{enter}two{enter}three{enter}four{enter}five{enter}six',
    );
    await expect(textarea.scrollHeight).toBeGreaterThan(textarea.clientHeight);
  },
};

export const MaximumRowsChange: Story = {
  args: { defaultValue: 'First\nSecond\nThird\nFourth' },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', { name: 'Notes' });
    const initialHeight = textarea.clientHeight;
    await userEvent.click(canvas.getByRole('button', { name: 'Limit rows' }));
    await expect(textarea.clientHeight).toBeLessThan(initialHeight);
    await expect(textarea.scrollHeight).toBeGreaterThan(textarea.clientHeight);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Expand row limit' }),
    );
    await expect(textarea.clientHeight).toBe(initialHeight);
  },
};

export const RenderedControlReplacement: Story = {
  render: () => <ReplaceableTextareaResizeExample />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const originalTextarea = canvas.getByRole('textbox', { name: 'Notes' });
    await userEvent.click(
      canvas.getByRole('button', { name: 'Replace notes control' }),
    );
    const textarea = canvas.getByRole('textbox', { name: 'Notes' });
    expect(textarea).not.toBe(originalTextarea);
    expect(originalTextarea).not.toBeInTheDocument();
    const replacementHeight = textarea.clientHeight;
    await userEvent.click(canvas.getByRole('button', { name: 'Narrow notes' }));
    await waitFor(() =>
      expect(textarea.clientHeight).toBeGreaterThan(replacementHeight),
    );
    const narrowedHeight = textarea.clientHeight;
    await userEvent.type(textarea, '{enter}Second{enter}Third');
    expect(textarea.clientHeight).toBeGreaterThan(narrowedHeight);
    await userEvent.click(canvas.getByRole('button', { name: 'Reset notes' }));
    expect(textarea).toHaveValue(
      'One line of notes that wraps at a narrower width.',
    );
    await waitFor(() => expect(textarea.clientHeight).toBe(narrowedHeight));
  },
};
