import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { SearchInput } from '../SearchInput';

runComponentConformance({
  name: 'SearchInput',
  element: <SearchInput aria-label="Search people" />,
  refInstanceOf: HTMLInputElement,
  renderPropTagName: 'input',
});
