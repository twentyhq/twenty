import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Banner } from '../Banner';

runComponentConformance({
  name: 'Banner.Action',
  element: <Banner.Action>Retry sync</Banner.Action>,
  refInstanceOf: HTMLButtonElement,
});
