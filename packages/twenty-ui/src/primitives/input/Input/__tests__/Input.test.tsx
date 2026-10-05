import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';

import { Input } from '../Input';
import styles from '../Input.module.scss';

runComponentConformance({
  name: 'Input',
  element: <Input />,
  refInstanceOf: HTMLInputElement,
  ownClassName: styles.input,
  renderPropTagName: 'input',
});
