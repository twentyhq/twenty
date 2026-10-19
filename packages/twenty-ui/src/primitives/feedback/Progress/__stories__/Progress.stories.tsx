import { isNull } from '@sniptt/guards';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Progress } from '@ui/primitives/feedback/Progress/Progress';
import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';
import { ComponentDecorator } from '@ui/testing/decorators/ComponentDecorator';

const meta = {
  title: 'UI/Feedback/Progress',
  component: Progress.Root,
  decorators: [ComponentDecorator],
  args: { value: 70, min: 20, max: 120 },
  parameters: { container: { width: 320 } },
  render: (args) => (
    <Progress.Root
      {...args}
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        alignItems: 'center',
        gap: 8,
        width: '100%',
      }}
    >
      <Progress.Label render={<Text />}>Importing records</Progress.Label>
      <Progress.Value render={<Text />} />
      <Progress.Track
        style={{
          gridColumn: '1 / -1',
          height: 8,
          background: 'var(--t-background-tertiary)',
        }}
      >
        <Progress.Indicator
          style={{
            height: '100%',
            background: 'var(--t-font-color-primary)',
          }}
        />
      </Progress.Track>
    </Progress.Root>
  ),
} satisfies Meta<typeof Progress.Root>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Display: Story = {};

export const LabelAndValue: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progress = canvas.getByRole('progressbar', {
      name: 'Importing records',
    });

    await expect(progress).toHaveAttribute('aria-valuenow', '70');
    await expect(progress).toHaveAttribute('aria-valuemin', '20');
    await expect(progress).toHaveAttribute('aria-valuemax', '120');
    await expect(progress).toHaveAttribute('aria-valuetext', '50%');
    await expect(canvas.getByText('50%')).toBeVisible();
  },
};

const ControlledProgress = () => {
  const [value, setValue] = useState<number | null>(null);

  return (
    <>
      <Progress.Root value={value} max={1000} format={{ style: 'decimal' }}>
        <Progress.Label>Importing records</Progress.Label>
        <Progress.Value>
          {(formattedValue) =>
            isNull(value) ? 'Preparing import' : formattedValue
          }
        </Progress.Value>
      </Progress.Root>
      <Button onClick={() => setValue(600)}>Report records</Button>
      <Button onClick={() => setValue(1000)}>Complete import</Button>
    </>
  );
};

export const Controlled: Story = {
  render: () => <ControlledProgress />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progress = canvas.getByRole('progressbar', {
      name: 'Importing records',
    });

    await expect(progress).not.toHaveAttribute('aria-valuenow');
    await expect(canvas.getByText('Preparing import')).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Report records' }),
    );
    await expect(progress).toHaveAttribute('aria-valuenow', '600');
    await expect(canvas.getByText('600')).toBeVisible();
    await userEvent.click(
      canvas.getByRole('button', { name: 'Complete import' }),
    );
    await expect(progress).toHaveAttribute('aria-valuenow', '1000');
    await expect(progress).toHaveAttribute('data-complete');
  },
};
