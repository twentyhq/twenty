import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { NumberStepper } from '../NumberStepper';
import styles from '../NumberStepper.module.scss';

runComponentConformance({
  name: 'NumberStepper',
  element: <NumberStepper aria-label="Quantity" />,
  refInstanceOf: HTMLInputElement,
  ownClassName: styles.valueInput,
  renderPropTagName: 'input',
});
