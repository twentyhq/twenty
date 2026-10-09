import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { OverflowingList } from '../OverflowingList';

runComponentConformance({
  name: 'OverflowingList',
  element: (
    <OverflowingList>
      {[
        <span key="first">First item</span>,
        <span key="second">Second item</span>,
      ]}
    </OverflowingList>
  ),
  refInstanceOf: HTMLDivElement,
  skip: ['renderProp'],
});
