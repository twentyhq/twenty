import { type Progress as BaseProgress } from '@base-ui/react/progress';
import { render, screen } from '@testing-library/react';
import { createRef } from 'react';
import { describe, expect, expectTypeOf, it, vi } from 'vitest';

import {
  Progress,
  ProgressBar,
  ProgressRing,
  type ProgressRootProps,
} from '@ui/primitives/feedback';

const getRingPercentage = (root: HTMLElement) => {
  const circle = root.querySelector('circle:last-child');
  const circumference = Number(circle?.getAttribute('stroke-dasharray'));
  const offset = Number(circle?.getAttribute('stroke-dashoffset'));

  return 100 * (1 - offset / circumference);
};

const getBarIndicator = (root: HTMLElement) =>
  root.firstElementChild?.firstElementChild;

describe('Progress public contract', () => {
  it('preserves the installed namespace and native callback types', () => {
    expectTypeOf<typeof Progress>().toEqualTypeOf<typeof BaseProgress>();
    expectTypeOf<Progress.Status>().toEqualTypeOf<BaseProgress.Status>();
    expectTypeOf<ProgressRootProps>().toEqualTypeOf<BaseProgress.Root.Props>();

    const onClick: NonNullable<ProgressRootProps['onClick']> = (event) => {
      expectTypeOf(event.preventBaseUIHandler).toEqualTypeOf<() => void>();
    };

    expect(onClick).toBeTypeOf('function');
  });

  it('composes labeled parts with value formatting and refs', () => {
    const rootRef = createRef<HTMLDivElement>();
    const labelRef = createRef<HTMLSpanElement>();
    const valueRef = createRef<HTMLSpanElement>();
    const trackRef = createRef<HTMLDivElement>();
    const indicatorRef = createRef<HTMLDivElement>();

    render(
      <Progress.Root value={25} min={10} max={70} ref={rootRef}>
        <Progress.Label ref={labelRef}>Files imported</Progress.Label>
        <Progress.Value ref={valueRef} />
        <Progress.Track ref={trackRef}>
          <Progress.Indicator ref={indicatorRef} />
        </Progress.Track>
      </Progress.Root>,
    );

    const progress = screen.getByRole('progressbar', {
      name: 'Files imported',
    });
    expect(rootRef.current).toBe(progress);
    expect(labelRef.current).toBe(screen.getByText('Files imported'));
    expect(valueRef.current).toBe(screen.getByText('25%'));
    expect(trackRef.current).toContainElement(indicatorRef.current);
    expect(indicatorRef.current).toHaveStyle({ width: '25%' });
  });

  it('keeps the raw value available in value children and accessible formatting', () => {
    const getAriaValueText = vi.fn(
      (formattedValue: string) => `${formattedValue} files`,
    );

    render(
      <ProgressBar
        value={90}
        min={10}
        max={70}
        format={{ maximumFractionDigits: 0 }}
        locale="en-US"
        getAriaValueText={getAriaValueText}
      >
        <Progress.Label>Files imported</Progress.Label>
        <Progress.Value>
          {(formattedValue, value) => `${formattedValue} of ${value}`}
        </Progress.Value>
      </ProgressBar>,
    );

    expect(
      screen.getByRole('progressbar', { name: 'Files imported' }),
    ).toHaveAttribute('aria-valuetext', '70 files');
    expect(screen.getByText('70 of 90')).toBeInTheDocument();
    expect(getAriaValueText).toHaveBeenCalledWith('70', 90);
  });

  it('preserves upstream indeterminate value content and custom display', () => {
    const valueContent = vi.fn(() => 'Preparing import');
    render(
      <Progress.Root value={null} aria-label="Import">
        <Progress.Value>{valueContent}</Progress.Value>
      </Progress.Root>,
    );

    expect(valueContent).toHaveBeenCalledWith('indeterminate', null);
    expect(screen.getByText('Preparing import')).toHaveAttribute(
      'aria-hidden',
      'true',
    );
    expect(screen.getByRole('progressbar', { name: 'Import' })).toHaveAttribute(
      'aria-valuetext',
      'indeterminate progress',
    );
  });

  it('preserves explicit aria-valuetext and aria-labelledby on both presets', () => {
    render(
      <>
        <span id="progress-name">Import status</span>
        <ProgressBar
          value={25}
          aria-labelledby="progress-name"
          aria-valuetext="One file remaining"
        />
        <ProgressRing
          value={25}
          aria-labelledby="progress-name"
          aria-valuetext="One file remaining"
        />
      </>,
    );

    for (const progress of screen.getAllByRole('progressbar', {
      name: 'Import status',
    })) {
      expect(progress).toHaveAttribute('aria-valuetext', 'One file remaining');
    }
  });
});

describe('Progress preset agreement', () => {
  it.each([
    {
      value: 10,
      min: 10,
      max: 70,
      percentage: 0,
      normalizedValue: 10,
      status: 'progressing',
    },
    {
      value: 25,
      min: 10,
      max: 70,
      percentage: 25,
      normalizedValue: 25,
      status: 'progressing',
    },
    {
      value: 90,
      min: 10,
      max: 70,
      percentage: 100,
      normalizedValue: 70,
      status: 'complete',
    },
    {
      value: -90,
      min: 10,
      max: 70,
      percentage: 0,
      normalizedValue: 10,
      status: 'progressing',
    },
    {
      value: -20,
      min: -40,
      max: 40,
      percentage: 25,
      normalizedValue: -20,
      status: 'progressing',
    },
    {
      value: 10,
      min: 10,
      max: 10,
      percentage: 0,
      normalizedValue: 10,
      status: 'complete',
    },
  ])(
    'shares geometry, semantic values and status for $value in $min to $max',
    ({ value, min, max, percentage, normalizedValue, status }) => {
      render(
        <>
          <ProgressBar value={value} min={min} max={max} aria-label="Bar" />
          <ProgressRing value={value} min={min} max={max} aria-label="Ring" />
        </>,
      );

      const bar = screen.getByRole('progressbar', { name: 'Bar' });
      const ring = screen.getByRole('progressbar', { name: 'Ring' });
      for (const progress of [bar, ring]) {
        expect(progress).toHaveAttribute('aria-valuemin', String(min));
        expect(progress).toHaveAttribute('aria-valuemax', String(max));
        expect(progress).toHaveAttribute(
          'aria-valuenow',
          String(normalizedValue),
        );
        expect(progress).toHaveAttribute('aria-valuetext', `${percentage}%`);
        expect(progress).toHaveAttribute(`data-${status}`);
      }
      expect(getBarIndicator(bar)).toHaveStyle({ width: `${percentage}%` });
      expect(getRingPercentage(ring)).toBeCloseTo(percentage);
      expect(getBarIndicator(bar)?.hasAttribute('data-minimum-fill')).toBe(
        percentage > 0 && percentage < 100,
      );
      if (percentage === 0) {
        expect(ring.querySelector('circle:last-child')).toHaveAttribute(
          'stroke-linecap',
          'butt',
        );
      }
    },
  );

  it.each([
    null,
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
  ])('preserves upstream indeterminate semantics for %s', (value) => {
    render(
      <>
        <ProgressBar value={value} min={10} max={70} aria-label="Bar" />
        <ProgressRing value={value} min={10} max={70} aria-label="Ring" />
      </>,
    );

    const bar = screen.getByRole('progressbar', { name: 'Bar' });
    const ring = screen.getByRole('progressbar', { name: 'Ring' });
    for (const progress of [bar, ring]) {
      expect(progress).not.toHaveAttribute('aria-valuenow');
      expect(progress).toHaveAttribute('data-indeterminate');
      expect(progress).toHaveAttribute(
        'aria-valuetext',
        'indeterminate progress',
      );
    }
    expect(getBarIndicator(bar)).not.toHaveAttribute('data-minimum-fill');
    expect(getBarIndicator(bar)).not.toHaveStyle({ width: '0%' });
    expect(getRingPercentage(ring)).toBeCloseTo(25);
    expect(ring.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    expect(ring.querySelector('svg')).toHaveAttribute('focusable', 'false');
  });

  it('can disable minimum fill without changing the semantic value', () => {
    render(
      <ProgressBar
        value={11}
        min={10}
        max={70}
        withMinimumFillWidth={false}
        aria-label="Files"
      />,
    );
    const progress = screen.getByRole('progressbar', { name: 'Files' });
    expect(progress).toHaveAttribute('aria-valuenow', '11');
    expect(getBarIndicator(progress)).not.toHaveAttribute('data-minimum-fill');
  });
});
