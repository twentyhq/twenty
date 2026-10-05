import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { ImageInput } from '../ImageInput';

runComponentConformance({
  name: 'ImageInput',
  element: <ImageInput />,
  refInstanceOf: HTMLDivElement,
});
