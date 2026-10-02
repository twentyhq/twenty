import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { type ComponentProps } from 'react';
import { expectTypeOf, it } from 'vitest';

import { MetricRow } from '@ui/components';

runComponentConformance({
  name: 'MetricRow',
  element: (
    <MetricRow value="42 of 100" progress={42}>
      Imported files
    </MetricRow>
  ),
  refInstanceOf: HTMLDivElement,
});

it('requires a text label for the progress accessible name', () => {
  expectTypeOf<ComponentProps<typeof MetricRow>>()
    .pick<'children'>()
    .toEqualTypeOf<{ children: string }>();
});
