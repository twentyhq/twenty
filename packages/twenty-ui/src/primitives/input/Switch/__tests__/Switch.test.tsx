import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Switch } from '../Switch';
import styles from '../Switch.module.scss';

runComponentConformance({
  name: 'Switch',
  element: <Switch aria-label="Notifications" />,
  refInstanceOf: HTMLSpanElement,
  ownClassName: styles.root,
});
