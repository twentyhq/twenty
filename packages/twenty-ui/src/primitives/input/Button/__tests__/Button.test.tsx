import { runComponentConformance } from '@test-utilities/conformance/runComponentConformance';
import { Button } from '../Button';
import styles from '../Button.module.scss';

runComponentConformance({
  name: 'Button',
  element: <Button>Save</Button>,
  refInstanceOf: HTMLButtonElement,
  ownClassName: styles.button,
});
