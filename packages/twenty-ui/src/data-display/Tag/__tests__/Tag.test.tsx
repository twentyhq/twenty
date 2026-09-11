import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Tag } from '../Tag';
import styles from '../Tag.module.scss';

runComponentConformance({
  name: 'Tag',
  element: <Tag color="blue">Label</Tag>,
  ownClassName: styles.tag,
  refInstanceOf: HTMLSpanElement,
});
