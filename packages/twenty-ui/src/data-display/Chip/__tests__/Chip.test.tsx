import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Chip } from '../Chip';
import styles from '../Chip.module.scss';

runComponentConformance({
  name: 'Chip',
  element: <Chip>Label</Chip>,
  ownClassName: styles.chip,
  refInstanceOf: HTMLDivElement,
});
