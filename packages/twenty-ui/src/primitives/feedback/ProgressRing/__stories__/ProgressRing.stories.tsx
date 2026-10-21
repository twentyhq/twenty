import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { ProgressRing } from '@ui/primitives/feedback';
import { Button } from '@ui/primitives/input/Button/Button';
import { Text } from '@ui/primitives/typography/Text/Text';
import { ComponentDecorator } from '@ui/testing';

const meta: Meta<typeof ProgressRing> = {
  title: 'UI/Feedback/ProgressRing/ProgressRing',
  component: ProgressRing,
  decorators: [ComponentDecorator],
  args: {
    value: 75,
    'aria-label': 'Import progress',
  },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    className: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof ProgressRing>;

export const Display: Story = {
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 1000, step: 1 } },
  },
  args: {
    value: 600,
    max: 1000,
    'aria-label': 'Importing records',
    'aria-valuetext': '600 of 1,000 records',
    children: '600 / 1,000',
  },
};

export const Small: Story = {
  args: { size: 'sm' },
  play: async ({ canvasElement }) => {
    const progress = within(canvasElement).getByRole('progressbar', {
      name: 'Import progress',
    });
    const { width, height } = progress.getBoundingClientRect();

    await expect(width).toBe(14);
    await expect(height).toBe(14);
    await expect(progress).toHaveAttribute('aria-valuetext', '75%');
  },
};

const WITH_VALUE_ARGS = {
  children: '75 of 100 files',
  'aria-valuetext': '75 of 100 files imported',
};

export const WithValue: Story = {
  args: WITH_VALUE_ARGS,
};

const BOUNDARY_VALUES = [
  { label: 'Below zero', value: -10, expected: 0 },
  { label: 'Above one hundred', value: 120, expected: 100 },
  { label: 'Fractional progress', value: 42.5, expected: 42.5 },
];

export const BoundedValues: Story = {
  render: () => (
    <>
      {BOUNDARY_VALUES.map(({ label, value }) => (
        <ProgressRing key={label} aria-label={label} value={value}>
          {label}
        </ProgressRing>
      ))}
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const { label, expected } of BOUNDARY_VALUES) {
      const progress = canvas.getByRole('progressbar', { name: label });

      await expect(progress).toHaveAttribute('aria-valuenow', String(expected));
      await expect(progress).toHaveAttribute('aria-valuemin', '0');
      await expect(progress).toHaveAttribute('aria-valuemax', '100');
      await expect(progress.tabIndex).toBe(-1);
    }
  },
};

export const CustomRange: Story = {
  args: { value: 70, min: 20, max: 120 },
};

export const Indeterminate: Story = {
  args: { value: null },
};

const INDETERMINATE_VALUES = [
  { label: 'Unknown progress', value: null },
  { label: 'Invalid progress', value: Number.NaN },
  { label: 'Negative infinity', value: Number.NEGATIVE_INFINITY },
  { label: 'Positive infinity', value: Number.POSITIVE_INFINITY },
];

export const IndeterminateValues: Story = {
  render: () => (
    <>
      {INDETERMINATE_VALUES.map(({ label, value }) => (
        <ProgressRing key={label} aria-label={label} value={value} />
      ))}
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    for (const { label } of INDETERMINATE_VALUES) {
      const progress = canvas.getByRole('progressbar', { name: label });

      await expect(progress).not.toHaveAttribute('aria-valuenow');
      await expect(progress).toHaveAttribute('data-indeterminate');
      await expect(progress).toHaveAttribute(
        'aria-valuetext',
        'indeterminate progress',
      );
    }
  },
};

const ControlledProgressRing = () => {
  const [value, setValue] = useState(0);

  return (
    <>
      <ProgressRing
        value={value}
        aria-label="Import progress"
        aria-valuetext={`${value} of 100 files imported`}
      >
        {value} of 100 files
      </ProgressRing>
      <Button onClick={() => setValue(50)}>Report progress</Button>
      <Button onClick={() => setValue(100)}>Complete import</Button>
    </>
  );
};

export const Controlled: Story = {
  render: () => <ControlledProgressRing />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const progress = canvas.getByRole('progressbar', {
      name: 'Import progress',
    });

    await expect(progress).toHaveAttribute('aria-valuenow', '0');
    await expect(progress).toHaveTextContent('0 of 100 files');
    await userEvent.click(
      canvas.getByRole('button', { name: 'Report progress' }),
    );
    await expect(progress).toHaveAttribute('aria-valuenow', '50');
    await expect(progress).toHaveTextContent('50 of 100 files');
    await expect(progress).toHaveAttribute(
      'aria-valuetext',
      '50 of 100 files imported',
    );
    await userEvent.tab();
    await expect(
      canvas.getByRole('button', { name: 'Complete import' }),
    ).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await expect(progress).toHaveAttribute('aria-valuenow', '100');
    await expect(progress).toHaveTextContent('100 of 100 files');
  },
};

export const CatalogDark: Story = {
  args: WITH_VALUE_ARGS,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};

export const RightToLeft: Story = {
  args: {
    ...WITH_VALUE_ARGS,
    dir: 'rtl',
    children: (
      <Text render={<bdi />} dir="ltr">
        75 of 100 files
      </Text>
    ),
  },
  play: async ({ canvasElement }) => {
    const progress = within(canvasElement).getByRole('progressbar', {
      name: 'Import progress',
    });
    const progressBounds = progress.getBoundingClientRect();
    const valueBounds = within(progress)
      .getByText('75 of 100 files')
      .getBoundingClientRect();

    await expect(valueBounds.right).toBeCloseTo(progressBounds.right);
    await expect(valueBounds.left).toBeGreaterThan(progressBounds.left);
  },
};
