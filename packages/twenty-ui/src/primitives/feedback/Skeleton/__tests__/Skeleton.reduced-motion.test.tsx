import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Skeleton } from '@ui/primitives/feedback';

afterEach(cleanup);

it('disables the shimmer when the browser prefers reduced motion', () => {
  render(<Skeleton data-testid="placeholder" width={120} height={16} />);

  const placeholder = screen.getByTestId('placeholder');
  const highlight = getComputedStyle(placeholder, '::after');

  expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(
    true,
  );
  expect(highlight.display).toBe('none');
  expect(placeholder.getAnimations({ subtree: true })).toHaveLength(0);
  expect(placeholder.getBoundingClientRect().height).toBe(16);
});
