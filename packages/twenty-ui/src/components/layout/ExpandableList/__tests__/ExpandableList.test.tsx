import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { ExpandableList } from '../ExpandableList';

runComponentConformance({
  name: 'ExpandableList',
  element: (
    <ExpandableList>
      {[
        <span key="first">First item</span>,
        <span key="second">Second item</span>,
      ]}
    </ExpandableList>
  ),
  refInstanceOf: HTMLDivElement,
  skip: ['renderProp'],
});
