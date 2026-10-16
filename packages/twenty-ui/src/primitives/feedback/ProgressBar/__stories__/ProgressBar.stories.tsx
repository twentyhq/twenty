import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { type Progress, ProgressRing } from '@ui/primitives/feedback';
import { ProgressBar } from '@ui/primitives/feedback/ProgressBar/ProgressBar';
import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';
import { ComponentDecorator } from '@ui/testing/decorators/ComponentDecorator';

const meta: Meta<typeof ProgressBar> = {
  title: 'UI/Feedback/ProgressBar/ProgressBar',
  component: ProgressBar,
  decorators: [ComponentDecorator],
  args: { value: 75, 'aria-label': 'Import progress' },
  argTypes: {
    className: { control: false },
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
  },
};

export default meta;

type Story = StoryObj<typeof ProgressBar>;

export const Display: Story = {
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 1000, step: 1 } },
  },
  args: {
    value: 600,
    max: 1000,
    'aria-label': 'Importing records',
  },
  render: (args) => (
    <Text style={{ display: 'grid', gap: 8, width: 300 }}>
      <Text>Importing records: {args.value ?? 'preparing'}</Text>
      <ProgressBar {...args} />
    </Text>
  ),
};

export const Small: Story = {
  args: { value: 50, size: 'sm', withBorderRadius: true },
  play: async ({ canvasElement }) => {
    const progress = within(canvasElement).getByRole('progressbar', {
      name: 'Import progress',
    });

    await expect(progress).toHaveAttribute('aria-valuenow', '50');
    await expect(progress).toHaveStyle({ height: '6px' });
  },
};

export const CustomRange: Story = {
  args: { value: 70, min: 20, max: 120, withBorderRadius: true },
};

export const Indeterminate: Story = {
  args: { value: null, withBorderRadius: true },
};

export const WithMinimumFill: Story = {
  args: { value: 1, withMinimumFillWidth: true, withBorderRadius: true },
};

const ControlledProgressBar = () => {
  const [value, setValue] = useState<number | null>(20);
  const [maximum, setMaximum] = useState(120);
  const appearance = (state: Progress.Root.State) => ({
    opacity: state.status === 'complete' ? 0.5 : 1,
  });
  const className = (state: Progress.Root.State) => state.status;

  return (
    <>
      <ProgressBar
        value={value}
        min={20}
        max={maximum}
        aria-label="Import progress"
        className={className}
        style={appearance}
      />
      <ProgressRing
        value={value}
        min={20}
        max={maximum}
        aria-label="Import progress ring"
        className={className}
        style={appearance}
      />
      <Button onClick={() => setValue(70)}>Report progress</Button>
      <Button onClick={() => setMaximum(220)}>Extend import</Button>
      <Button onClick={() => setValue(null)}>Await progress</Button>
      <Button onClick={() => setValue(maximum)}>Complete import</Button>
    </>
  );
};

export const Controlled: Story = {
  render: () => <ControlledProgressBar />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progress = canvas.getByRole('progressbar', {
      name: 'Import progress',
    });

    const ring = canvas.getByRole('progressbar', {
      name: 'Import progress ring',
    });
    const expectSharedProgress = async (percentage: number) => {
      const indicator =
        progress.querySelector<HTMLElement>(':scope > div > div');
      const circle = ring.querySelector('circle:last-child');
      const circumference = Number(circle?.getAttribute('stroke-dasharray'));
      const offset = Number(circle?.getAttribute('stroke-dashoffset'));

      await expect(indicator?.style.width).toBe(`${percentage}%`);
      await expect(100 * (1 - offset / circumference)).toBeCloseTo(percentage);
    };

    await expect(progress).toHaveAttribute('aria-valuenow', '20');
    await expect(progress).toHaveAttribute('aria-valuemin', '20');
    await expect(progress).toHaveAttribute('aria-valuemax', '120');
    await expect(progress).toHaveAttribute('aria-valuetext', '0%');
    await expectSharedProgress(0);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Report progress' }),
    );
    await expect(progress).toHaveAttribute('aria-valuenow', '70');
    await expect(progress).toHaveAttribute('aria-valuetext', '50%');
    await expectSharedProgress(50);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Extend import' }),
    );
    await expect(progress).toHaveAttribute('aria-valuemax', '220');
    await expect(progress).toHaveAttribute('aria-valuetext', '25%');
    await expectSharedProgress(25);
    await userEvent.click(
      canvas.getByRole('button', { name: 'Await progress' }),
    );
    await expect(progress).not.toHaveAttribute('aria-valuenow');
    await expect(progress).toHaveAttribute('data-indeterminate');
    await expect(ring).toHaveClass('indeterminate');
    await expect(ring).not.toHaveAttribute('aria-valuenow');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Complete import' }),
    );
    await expect(progress).toHaveAttribute('aria-valuenow', '220');
    await expect(progress).toHaveAttribute('data-complete');
    await expect(ring).toHaveAttribute('aria-valuenow', '220');
    await expectSharedProgress(100);
    for (const preset of [progress, ring]) {
      await expect(preset).toHaveClass('complete');
      await expect(preset).toHaveStyle({ opacity: '0.5' });
    }
    await expect(
      canvas.getByRole('progressbar', { name: 'Import progress' }),
    ).toBe(progress);
    await expect(
      canvas.getByRole('progressbar', { name: 'Import progress ring' }),
    ).toBe(ring);
  },
};

export const CompactMinimumFill: Story = {
  args: { value: 1, style: { width: 8 }, withMinimumFillWidth: true },
  play: async ({ canvasElement }) => {
    const progress = within(canvasElement).getByRole('progressbar', {
      name: 'Import progress',
    });
    const indicator = progress.firstElementChild?.firstElementChild;

    await expect(progress).toHaveAttribute('aria-valuenow', '1');
    await expect(indicator?.getBoundingClientRect().width).toBe(4);
    await expect(indicator?.getBoundingClientRect().width).toBeLessThan(
      progress.getBoundingClientRect().width,
    );
  },
};
