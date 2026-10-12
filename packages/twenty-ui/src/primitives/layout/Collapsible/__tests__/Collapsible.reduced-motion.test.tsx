import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it } from 'vitest';

import { Collapsible } from '../Collapsible';

afterEach(cleanup);

it('disables height and width transitions including custom timing when reduced motion is preferred', () => {
  render(
    <Collapsible.Root defaultOpen>
      <Collapsible.Panel
        data-testid="height-panel"
        style={{ transitionDuration: '1.2s, 0.8s' }}
      >
        Height content
      </Collapsible.Panel>
      <Collapsible.Panel data-testid="width-panel" dimension="width">
        Width content
      </Collapsible.Panel>
    </Collapsible.Root>,
  );

  expect(window.matchMedia('(prefers-reduced-motion: reduce)').matches).toBe(
    true,
  );
  for (const panel of [
    screen.getByTestId('height-panel'),
    screen.getByTestId('width-panel'),
  ]) {
    expect(getComputedStyle(panel).transitionDuration).toBe('0s');
    expect(panel.getBoundingClientRect().height).toBeGreaterThan(0);
    expect(panel.getAnimations()).toHaveLength(0);
  }
});
