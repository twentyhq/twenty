import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Badge } from '../Badge';
import styles from '../Badge.module.scss';

runComponentConformance({
  name: 'Badge',
  element: <Badge>Soon</Badge>,
  refInstanceOf: HTMLSpanElement,
  ownClassName: styles.badge,
  renderPropTagName: 'button',
});
