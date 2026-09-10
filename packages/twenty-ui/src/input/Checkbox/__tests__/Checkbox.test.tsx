import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Checkbox } from '../Checkbox';
import styles from '../Checkbox.module.scss';

runComponentConformance({
  name: 'Checkbox',
  element: <Checkbox aria-label="Select item" />,
  refInstanceOf: HTMLSpanElement,
  ownClassName: styles.root,
});
