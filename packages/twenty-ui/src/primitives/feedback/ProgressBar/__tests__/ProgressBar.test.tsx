import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { ProgressBar } from '@ui/primitives/feedback';

runComponentConformance({
  name: 'ProgressBar',
  element: <ProgressBar value={42} aria-label="Import progress" />,
  refInstanceOf: HTMLDivElement,
});
