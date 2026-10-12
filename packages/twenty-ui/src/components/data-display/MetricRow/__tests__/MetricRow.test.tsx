import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';

import { MetricRow } from '../MetricRow';

runComponentConformance({
  name: 'MetricRow',
  element: (
    <MetricRow value="42 of 100" progress={42}>
      Imported files
    </MetricRow>
  ),
  refInstanceOf: HTMLDivElement,
});

it('names progress from nested label content while keeping the icon decorative', () => {
  const { rerender } = render(
    <MetricRow
      startIcon={<svg role="img" aria-label="Internal artwork" />}
      value={<bdi>42 of 100</bdi>}
      progress={42}
      progressValueText="42 files imported"
    >
      <strong>Imported</strong> files
    </MetricRow>,
  );

  expect(
    screen.getByRole('progressbar', { name: 'Imported files' }),
  ).toHaveAttribute('aria-valuetext', '42 files imported');
  expect(screen.queryByRole('img')).toBeNull();

  rerender(
    <MetricRow value={0} progress={0}>
      <strong>Reviewed</strong> files
    </MetricRow>,
  );

  expect(
    screen.getByRole('progressbar', { name: 'Reviewed files' }),
  ).toHaveAttribute('aria-valuenow', '0');
  expect(screen.getByText('0')).toBeInTheDocument();
});
