import { type Meta, type StoryObj } from '@storybook/react-vite';
import { useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { ProgressRing } from '@ui/primitives/feedback';
import { Button } from '@ui/primitives/input/Button/Button';
import { ComponentDecorator } from '@ui/testing';
import { isDefined } from '@ui/utilities';

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

export const Default: Story = {};

export const Small: Story = {
  args: { size: 'sm' },
  play: async ({ canvasElement }) => {
    const progress = within(canvasElement).getByRole('progressbar', {
      name: 'Import progress',
    });
    const ring = progress.querySelector('svg');

    await expect(ring).toHaveAttribute('width', '14');
    await expect(ring).toHaveAttribute('height', '14');
    await expect(ring).toHaveAttribute('aria-hidden', 'true');

    const [, indicator] = progress.getElementsByTagName('circle');

    if (!isDefined(indicator)) {
      throw new Error('Progress ring indicator is missing');
    }

    const indicatorStyle = getComputedStyle(indicator);
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    ).matches;

    await expect(indicatorStyle.transitionProperty).toBe(
      prefersReducedMotion ? 'none' : 'stroke-dashoffset',
    );
    await expect(indicatorStyle.transitionDuration).toBe(
      prefersReducedMotion ? '0s' : '0.3s',
    );
  },
};

export const WithValue: Story = {
  args: {
    children: '75 of 100 files',
    'aria-valuetext': '75 of 100 files imported',
  },
};

const BOUNDARY_VALUES = [
  { label: 'Below zero', value: -10, expected: 0 },
  { label: 'Above one hundred', value: 120, expected: 100 },
  { label: 'Invalid value', value: Number.NaN, expected: 0 },
  { label: 'Negative infinity', value: Number.NEGATIVE_INFINITY, expected: 0 },
  {
    label: 'Positive infinity',
    value: Number.POSITIVE_INFINITY,
    expected: 100,
  },
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
    canvas.getByRole('button', { name: 'Complete import' }).focus();
    await userEvent.keyboard('{Enter}');
    await expect(progress).toHaveAttribute('aria-valuenow', '100');
    await expect(progress).toHaveTextContent('100 of 100 files');
  },
};

export const CatalogDark: Story = {
  ...WithValue,
  tags: ['!autodocs'],
  globals: { colorScheme: 'dark' },
};

export const RightToLeft: Story = {
  args: { ...WithValue.args, dir: 'rtl' },
  play: async ({ canvasElement }) => {
    const progress = within(canvasElement).getByRole('progressbar', {
      name: 'Import progress',
    });
    const value = within(progress).getByText('75 of 100 files');
    const [ring] = progress.getElementsByTagName('svg');

    if (!isDefined(ring)) {
      throw new Error('Progress ring is missing');
    }

    await expect(value.getBoundingClientRect().left).toBeGreaterThan(
      ring.getBoundingClientRect().right,
    );
  },
};
