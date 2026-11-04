import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { LabeledSeparator } from '../LabeledSeparator';

runComponentConformance({
  name: 'LabeledSeparator',
  element: <LabeledSeparator>Or</LabeledSeparator>,
  refInstanceOf: HTMLDivElement,
});
