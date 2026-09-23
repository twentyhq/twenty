import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Text } from '../Text';
import styles from '../Text.module.scss';

runComponentConformance({
  name: 'Text',
  element: <Text truncate>Body</Text>,
  ownClassName: styles.truncate,
  refInstanceOf: HTMLDivElement,
});
