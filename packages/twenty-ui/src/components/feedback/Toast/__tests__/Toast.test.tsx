import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Toast } from '../Toast';
import styles from '../Toast.module.scss';

runComponentConformance({
  name: 'Toast',
  element: <Toast progress={100}>Changes saved</Toast>,
  refInstanceOf: HTMLDivElement,
  ownClassName: styles.root,
});
