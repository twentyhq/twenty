import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { SegmentedControl } from '../SegmentedControl';
import styles from '../SegmentedControl.module.scss';

const OPTIONS = [
  { label: 'Annual', value: 'annual' },
  { label: 'Weekly', value: 'weekly', disabled: true },
  { label: 'Monthly', value: 'monthly' },
];

runComponentConformance({
  name: 'SegmentedControl',
  element: <SegmentedControl aria-label="Billing period" options={OPTIONS} />,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.container,
});
