import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { NumberInput } from '../NumberInput';
import styles from '../NumberInput.module.scss';

runComponentConformance({
  name: 'NumberInput',
  element: <NumberInput aria-label="Quantity" />,
  refInstanceOf: HTMLInputElement,
  ownClassName: styles.input,
  renderPropTagName: 'input',
});
