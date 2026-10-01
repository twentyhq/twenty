import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

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
