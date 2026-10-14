import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { ProgressBar, ProgressRing } from '@ui/primitives/feedback';
import { ThemeProvider } from '@ui/theme';
import '@ui/theme/theme-light.css';
import { isDefined } from '@ui/utilities/utils/isDefined';

afterEach(cleanup);

it.each([
  {
    name: 'bar',
    component: (
      <ProgressBar value={null} aria-label="Bar" style={{ width: 200 }} />
    ),
    indicatorWidth: 50,
    indicatorSelector: ':scope > div > div',
  },
  {
    name: 'ring',
    component: <ProgressRing value={null} aria-label="Ring" />,
    indicatorWidth: 16,
    indicatorSelector: ':scope > div',
  },
])(
  'keeps the indeterminate $name visible without movement when reduced motion is preferred',
  ({ component, indicatorWidth, indicatorSelector }) => {
    render(<ThemeProvider colorScheme="light">{component}</ThemeProvider>);

    expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(
      true,
    );
    const progress = screen.getByRole('progressbar');
    const indicator = progress.querySelector<HTMLElement>(indicatorSelector);
    if (!isDefined(indicator)) {
      throw new Error('Indeterminate progress indicator is missing');
    }

    expect(
      getComputedStyle(progress)
        .getPropertyValue('--t-animation-duration-normal')
        .trim(),
    ).toBe('0.3');
    expect(indicator.getBoundingClientRect().width).toBe(indicatorWidth);
    expect(indicator.getBoundingClientRect().height).toBeGreaterThan(0);
    expect(progress).not.toHaveAttribute('aria-valuenow');
    expect(getComputedStyle(indicator).animationName).toBe('none');
    expect(progress.getAnimations({ subtree: true })).toHaveLength(0);
    for (const element of [indicator, ...progress.querySelectorAll('circle')]) {
      expect(getComputedStyle(element).transitionDuration).toBe('0s');
    }
  },
);
