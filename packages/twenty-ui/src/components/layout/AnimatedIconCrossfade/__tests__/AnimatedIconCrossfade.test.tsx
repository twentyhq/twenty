import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { AnimatedIconCrossfade } from '../AnimatedIconCrossfade';

runComponentConformance({
  name: 'AnimatedIconCrossfade',
  element: (
    <AnimatedIconCrossfade
      isActive={false}
      activeIcon={<svg />}
      inactiveIcon={<svg />}
    />
  ),
  refInstanceOf: HTMLSpanElement,
  renderPropTagName: 'div',
});

it('keeps both custom nodes mounted and decorative when the active state changes', () => {
  const activeIcon = <svg role="img" aria-label="Active artwork" />;
  const inactiveIcon = <svg role="img" aria-label="Inactive artwork" />;
  const { rerender } = render(
    <AnimatedIconCrossfade
      isActive={false}
      activeIcon={activeIcon}
      inactiveIcon={inactiveIcon}
      role="img"
      aria-label="Editing inactive"
    />,
  );
  const activeNode = screen.getByLabelText('Active artwork');
  const inactiveNode = screen.getByLabelText('Inactive artwork');

  rerender(
    <AnimatedIconCrossfade
      isActive={true}
      activeIcon={activeIcon}
      inactiveIcon={inactiveIcon}
      role="img"
      aria-label="Editing active"
    />,
  );

  expect(screen.getByLabelText('Active artwork')).toBe(activeNode);
  expect(screen.getByLabelText('Inactive artwork')).toBe(inactiveNode);
  expect(screen.getAllByRole('img')).toEqual([
    screen.getByRole('img', { name: 'Editing active' }),
  ]);
});
