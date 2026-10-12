import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { render, screen } from '@testing-library/react';

import { ColorSample } from '@ui/primitives/data-display';

runComponentConformance({
  name: 'ColorSample',
  element: <ColorSample colorName="blue" />,
  refInstanceOf: HTMLDivElement,
  ownClassName: 'root',
});

it('exposes a named color only when the caller supplies image semantics', () => {
  render(
    <>
      <ColorSample colorName="red" aria-hidden="true" />
      <ColorSample colorName="blue" role="img" aria-label="Brand blue" />
    </>,
  );

  expect(screen.getAllByRole('img')).toHaveLength(1);
  expect(screen.getByRole('img', { name: 'Brand blue' })).toBeVisible();
});

it('preserves the palette border when a custom fill and native styles are supplied', () => {
  render(
    <ColorSample
      colorName="blue"
      color="#123456"
      role="img"
      aria-label="Custom blue"
      style={{ width: 24 }}
    />,
  );

  const swatch = screen.getByRole('img', { name: 'Custom blue' });

  expect(swatch.style.getPropertyValue('--color-sample-color')).toBe('#123456');
  expect(swatch.style.getPropertyValue('--color-sample-border-color')).toBe(
    'var(--t-tag-text-blue)',
  );
  expect(swatch).toHaveStyle({ width: '24px' });
});
