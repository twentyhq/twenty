import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { ProgressBar, ProgressRing } from '@ui/primitives/feedback';

afterEach(cleanup);

it('keeps indeterminate progress visible without movement when reduced motion is preferred', () => {
  render(
    <>
      <ProgressBar value={null} aria-label="Bar" style={{ width: 200 }} />
      <ProgressRing value={null} aria-label="Ring" />
    </>,
  );

  expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(
    true,
  );
  const bar = screen.getByRole('progressbar', { name: 'Bar' });
  const ring = screen.getByRole('progressbar', { name: 'Ring' });
  const barIndicator = bar.firstElementChild?.firstElementChild;
  const ringIndicator = ring.querySelector<HTMLElement>('[data-indeterminate]');

  expect(barIndicator?.getBoundingClientRect().width).toBe(50);
  expect(ringIndicator?.getBoundingClientRect().width).toBe(16);
  for (const progress of [bar, ring]) {
    expect(progress).not.toHaveAttribute('aria-valuenow');
    expect(progress.getAnimations({ subtree: true })).toHaveLength(0);
  }
  expect(
    barIndicator && getComputedStyle(barIndicator).transitionDuration,
  ).toBe('0s');
});
