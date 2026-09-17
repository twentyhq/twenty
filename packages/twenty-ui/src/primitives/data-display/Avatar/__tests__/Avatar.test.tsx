import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Avatar } from '../Avatar';
import styles from '../Avatar.module.scss';

runComponentConformance({
  name: 'Avatar',
  element: <Avatar name="Jane" />,
  ownClassName: styles.root,
  refInstanceOf: HTMLSpanElement,
});
