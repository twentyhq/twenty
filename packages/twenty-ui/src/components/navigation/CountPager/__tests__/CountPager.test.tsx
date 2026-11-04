import { vi } from 'vitest';

import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { CountPager } from '../CountPager';
import styles from '../CountPager.module.scss';

runComponentConformance({
  name: 'CountPager',
  element: (
    <CountPager
      index={0}
      count={3}
      positionText="1 of 3"
      previousLabel="Previous item"
      nextLabel="Next item"
      onIndexChange={vi.fn()}
    />
  ),
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.pager,
});
