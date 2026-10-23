import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, waitFor, within } from 'storybook/test';

import { Button } from '@ui/primitives/input/Button/Button';
import { type InputVariant } from '@ui/primitives/input/types/InputVariant';
import { ComponentDecorator } from '@ui/testing';

import { Textarea } from '../Textarea';
import { type TextareaProps } from '../types/TextareaProps';

const PlainTextareaResizeExample = ({
  variant: initialVariant = 'default',
  maxRows: initialMaxRows,
  ...props
}: TextareaProps) => {
  const [variant, setVariant] = useState<InputVariant>(initialVariant);
  const [maxRows, setMaxRows] = useState(initialMaxRows);

  return (
    <form>
      <Textarea
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...props}
        variant={variant}
        maxRows={maxRows}
        autoResize
        rows={1}
      />
      <Button type="button" onClick={() => setVariant('plain')}>
        Use plain appearance
      </Button>
      <Button type="button" onClick={() => setVariant('default')}>
        Use default appearance
      </Button>
      <Button type="button" onClick={() => setMaxRows(6)}>
        Expand row limit
      </Button>
    </form>
  );
};

const meta: Meta<typeof Textarea> = {
  title: 'UI/Input/Textarea/Plain',
  component: Textarea,
  tags: ['!autodocs'],
  decorators: [ComponentDecorator],
  parameters: { container: { width: 240 } },
  args: { 'aria-label': 'Notes' },
  render: (args) => <PlainTextareaResizeExample {...args} />,
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const VariantChange: Story = {
  args: { defaultValue: 'First\nSecond', maxRows: 2 },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', { name: 'Notes' });
    const framedHeight = textarea.getBoundingClientRect().height;

    await userEvent.click(
      canvas.getByRole('button', { name: 'Use plain appearance' }),
    );
    await waitFor(() =>
      expect(textarea.getBoundingClientRect().height).toBeLessThan(
        framedHeight,
      ),
    );
    await expect(textarea).toHaveValue('First\nSecond');
    await expect(getComputedStyle(textarea).padding).toBe('0px');
    await expect(getComputedStyle(textarea).borderWidth).toBe('0px');
    await expect(textarea.clientHeight).toBe(
      2 * Number.parseFloat(getComputedStyle(textarea).lineHeight),
    );
    await userEvent.click(
      canvas.getByRole('button', { name: 'Use default appearance' }),
    );
    await waitFor(() =>
      expect(textarea.getBoundingClientRect().height).toBe(framedHeight),
    );
  },
};

export const PlainMaximumRows: Story = {
  args: {
    variant: 'plain',
    defaultValue: 'First\nSecond\nThird\nFourth',
    maxRows: 2,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const textarea = canvas.getByRole('textbox', { name: 'Notes' });
    const lineHeight = Number.parseFloat(getComputedStyle(textarea).lineHeight);

    await expect(textarea.clientHeight).toBe(2 * lineHeight);
    await expect(textarea.scrollHeight).toBeGreaterThan(textarea.clientHeight);
    await userEvent.type(textarea, '{enter}Fifth');
    await expect(textarea.clientHeight).toBe(2 * lineHeight);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Expand row limit' }),
    );
    await waitFor(() =>
      expect(textarea.clientHeight).toBeGreaterThan(2 * lineHeight),
    );
    await expect(textarea.clientHeight).toBeLessThanOrEqual(6 * lineHeight);
  },
};
