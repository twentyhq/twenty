import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Status } from '../Status';
import styles from '../Status.module.scss';

runComponentConformance({
  name: 'Status',
  element: <Status color="blue">Label</Status>,
  ownClassName: styles.status,
  refInstanceOf: HTMLSpanElement,
});
