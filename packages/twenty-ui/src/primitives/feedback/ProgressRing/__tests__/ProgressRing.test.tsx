import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { ProgressRing } from '@ui/primitives/feedback';

runComponentConformance({
  name: 'ProgressRing',
  element: <ProgressRing value={42} aria-label="Import progress" />,
  refInstanceOf: HTMLDivElement,
});
